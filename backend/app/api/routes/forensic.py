from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from backend.app.api.dependencies import get_current_user, require_any_role
from backend.app.core.permissions import Role
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.common import StandardResponse
from backend.app.schemas.forensic import (
    ForensicReportCreate,
    ForensicReportResponse,
    ForensicReportStatusUpdate
)
from backend.app.services.forensic_service import forensic_service

router = APIRouter(prefix="/forensic-reports", tags=["Forensic Reports Workflow"])


@router.post("", response_model=StandardResponse[ForensicReportResponse], status_code=201)
def create_forensic_report(
    payload: ForensicReportCreate,
    current_user: AuthenticatedUser = Depends(
        require_any_role([Role.FORENSIC_OFFICER, Role.ADMIN])
    )
) -> StandardResponse[ForensicReportResponse]:
    """
    Registers a new scientific examination report:
    - Strictly validates Case -> Evidence relationship (prevents cross-case linkage)
    - Automatically binds server-side trusted evidence SHA-256 seal
    - Author identity bound to authenticated examiner
    - Emits audit event
    """
    report = forensic_service.create_report(payload=payload, current_user=current_user)
    return StandardResponse(success=True, data=report)


@router.get("", response_model=StandardResponse[List[ForensicReportResponse]])
def list_forensic_reports(
    case_id: Optional[str] = Query(None, description="Filter by case UUID or number"),
    evidence_id: Optional[str] = Query(None, description="Filter by evidence UUID"),
    status: Optional[str] = Query(None, description="Filter by report status"),
    limit: int = Query(100, ge=1, le=500),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[List[ForensicReportResponse]]:
    """
    Lists forensic reports filtered by case or exhibit.
    """
    reports = forensic_service.list_reports(
        current_user=current_user,
        case_id=case_id,
        evidence_id=evidence_id,
        status=status,
        limit=limit
    )
    return StandardResponse(success=True, data=reports)


@router.get("/{report_id}", response_model=StandardResponse[ForensicReportResponse])
def get_forensic_report(
    report_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[ForensicReportResponse]:
    """
    Retrieves details of a specific forensic examination report.
    """
    report = forensic_service.get_report(report_id=report_id, current_user=current_user)
    return StandardResponse(success=True, data=report)


@router.patch("/{report_id}/status", response_model=StandardResponse[ForensicReportResponse])
def update_forensic_report_status(
    report_id: str,
    update_data: ForensicReportStatusUpdate,
    current_user: AuthenticatedUser = Depends(
        require_any_role([Role.FORENSIC_OFFICER, Role.ADMIN])
    )
) -> StandardResponse[ForensicReportResponse]:
    """
    Transitions forensic report status through statutory review pipeline:
    - Enforces state transition rules (Draft -> Under Examination -> Pending Review -> Finalized)
    - Locks finalized reports permanently
    - Emits audit log
    """
    updated = forensic_service.update_status(
        report_id=report_id,
        update_data=update_data,
        current_user=current_user
    )
    return StandardResponse(success=True, data=updated)
