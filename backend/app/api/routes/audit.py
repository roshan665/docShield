from typing import Optional
from fastapi import APIRouter, Depends, Query
from backend.app.api.dependencies import get_current_user
from backend.app.schemas.audit import AuditLogListResponse
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.common import StandardResponse
from backend.app.services.audit_service import audit_service

router = APIRouter(prefix="/audit-logs", tags=["Audit Trail"])


@router.get("", response_model=StandardResponse[AuditLogListResponse])
def list_system_audit_logs(
    module: Optional[str] = Query(None, description="Filter by module: Cases, Evidence, Forensic, ChargeSheets, etc."),
    case_id: Optional[str] = Query(None, description="Filter by Case UUID"),
    evidence_id: Optional[str] = Query(None, description="Filter by Evidence UUID"),
    result: Optional[str] = Query(None, description="Filter by result: Success, Warning, Failure"),
    limit: int = Query(100, ge=1, le=500, description="Max records to return"),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[AuditLogListResponse]:
    """
    Retrieves the immutable audit trail log:
    - Enforces jurisdiction validation
    - Append-only log with tamper-evident cryptographic record seals
    """
    logs = audit_service.list_logs(
        current_user=current_user,
        module=module,
        case_id=case_id,
        evidence_id=evidence_id,
        result=result,
        limit=limit
    )
    return StandardResponse(success=True, data=logs)
