from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from backend.app.api.dependencies import get_current_user, require_any_role
from backend.app.core.permissions import Role
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.common import StandardResponse
from backend.app.schemas.legal import (
    ChargeSheetCreate,
    ChargeSheetResponse,
    ChargeSheetStatusUpdate,
    CourtFilingCreate,
    CourtFilingResponse,
    CourtFilingStatusUpdate
)
from backend.app.services.legal_service import legal_service

router = APIRouter(tags=["Legal & Judicial Prosecution Workflows"])


# =============================================================================
# CHARGE SHEETS ENDPOINTS
# =============================================================================

@router.post("/charge-sheets", response_model=StandardResponse[ChargeSheetResponse], status_code=201)
def create_charge_sheet(
    payload: ChargeSheetCreate,
    current_user: AuthenticatedUser = Depends(
        require_any_role([Role.INSPECTOR, Role.ADMIN])
    )
) -> StandardResponse[ChargeSheetResponse]:
    """
    Submits a statutory final form charge sheet under Section 173 CrPC:
    - Validates parent Case existence and user jurisdiction
    - Investigating Officer bound from authenticated context
    - Appends accused persons list
    - Emits audit log
    """
    cs = legal_service.create_charge_sheet(payload=payload, current_user=current_user)
    return StandardResponse(success=True, data=cs)


@router.get("/charge-sheets", response_model=StandardResponse[List[ChargeSheetResponse]])
def list_charge_sheets(
    case_id: Optional[str] = Query(None, description="Filter by case UUID or number"),
    status: Optional[str] = Query(None, description="Filter by status: Draft, Submitted, Accepted, Returned"),
    limit: int = Query(100, ge=1, le=500),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[List[ChargeSheetResponse]]:
    """
    Lists statutory charge sheets.
    """
    sheets = legal_service.list_charge_sheets(
        current_user=current_user,
        case_id=case_id,
        status=status,
        limit=limit
    )
    return StandardResponse(success=True, data=sheets)


@router.get("/charge-sheets/{charge_sheet_id}", response_model=StandardResponse[ChargeSheetResponse])
def get_charge_sheet(
    charge_sheet_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[ChargeSheetResponse]:
    """
    Retrieves full details of a specific statutory charge sheet.
    """
    cs = legal_service.get_charge_sheet(cs_identifier=charge_sheet_id, current_user=current_user)
    return StandardResponse(success=True, data=cs)


@router.patch("/charge-sheets/{charge_sheet_id}/status", response_model=StandardResponse[ChargeSheetResponse])
def update_charge_sheet_status(
    charge_sheet_id: str,
    update_data: ChargeSheetStatusUpdate,
    current_user: AuthenticatedUser = Depends(
        require_any_role([Role.LEGAL_OFFICER, Role.INSPECTOR, Role.ADMIN])
    )
) -> StandardResponse[ChargeSheetResponse]:
    """
    Updates charge sheet scrutiny status:
    - Legal Officer scrutiny and remarks
    - Validates state transitions (Draft -> Under Review -> Submitted -> Accepted / Returned)
    - Accepted judicial state is permanently locked
    - Emits audit log
    """
    updated = legal_service.update_charge_sheet_status(
        cs_identifier=charge_sheet_id,
        update_data=update_data,
        current_user=current_user
    )
    return StandardResponse(success=True, data=updated)


# =============================================================================
# COURT FILINGS ENDPOINTS
# =============================================================================

@router.post("/court-filings", response_model=StandardResponse[CourtFilingResponse], status_code=201)
def create_court_filing(
    payload: CourtFilingCreate,
    current_user: AuthenticatedUser = Depends(
        require_any_role([Role.LEGAL_OFFICER, Role.INSPECTOR, Role.ADMIN])
    )
) -> StandardResponse[CourtFilingResponse]:
    """
    Submits a judicial filing to the designated court:
    - Validates Case existence
    - Sets filing date and hearing schedule
    - Emits audit log
    """
    filing = legal_service.create_court_filing(payload=payload, current_user=current_user)
    return StandardResponse(success=True, data=filing)


@router.get("/court-filings", response_model=StandardResponse[List[CourtFilingResponse]])
def list_court_filings(
    case_id: Optional[str] = Query(None, description="Filter by case UUID or number"),
    filing_type: Optional[str] = Query(None, description="Filter by filing type"),
    status: Optional[str] = Query(None, description="Filter by status: Filed, Disposed"),
    limit: int = Query(100, ge=1, le=500),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[List[CourtFilingResponse]]:
    """
    Lists formal judicial court filings.
    """
    filings = legal_service.list_court_filings(
        current_user=current_user,
        case_id=case_id,
        filing_type=filing_type,
        status=status,
        limit=limit
    )
    return StandardResponse(success=True, data=filings)


@router.get("/court-filings/{filing_id}", response_model=StandardResponse[CourtFilingResponse])
def get_court_filing(
    filing_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[CourtFilingResponse]:
    """
    Retrieves details of a specific court filing.
    """
    filing = legal_service.get_court_filing(filing_identifier=filing_id, current_user=current_user)
    return StandardResponse(success=True, data=filing)


@router.patch("/court-filings/{filing_id}/status", response_model=StandardResponse[CourtFilingResponse])
def update_court_filing_status(
    filing_id: str,
    update_data: CourtFilingStatusUpdate,
    current_user: AuthenticatedUser = Depends(
        require_any_role([Role.LEGAL_OFFICER, Role.ADMIN])
    )
) -> StandardResponse[CourtFilingResponse]:
    """
    Updates court filing status and hearing dates:
    - Enforces state transitions (Filed -> Disposed)
    - Disposed filings are locked
    - Emits audit log
    """
    updated = legal_service.update_court_filing_status(
        filing_identifier=filing_id,
        update_data=update_data,
        current_user=current_user
    )
    return StandardResponse(success=True, data=updated)
