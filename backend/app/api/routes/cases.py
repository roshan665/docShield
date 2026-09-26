from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from backend.app.api.dependencies import get_current_user, require_any_role
from backend.app.core.permissions import Role
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.case import CaseCreate, CaseUpdate
from backend.app.schemas.common import StandardResponse
from backend.app.services.case_service import case_service

router = APIRouter(prefix="/cases", tags=["Investigation Cases"])


@router.get("", response_model=StandardResponse[List[Dict[str, Any]]])
def list_cases(
    status: Optional[str] = Query(None, description="Filter by status (Active, Under Review, Closed)"),
    limit: int = Query(100, ge=1, le=500),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[List[Dict[str, Any]]]:
    """
    Lists investigation cases according to authenticated user role and jurisdiction.
    """
    cases = case_service.list_cases(current_user=current_user, status=status, limit=limit)
    return StandardResponse(success=True, data=cases)


@router.get("/{case_identifier}", response_model=StandardResponse[Dict[str, Any]])
def get_case_details(
    case_identifier: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[Dict[str, Any]]:
    """
    Retrieves a single investigation case by UUID or Case Number.
    """
    case = case_service.get_case(case_identifier, current_user)
    return StandardResponse(success=True, data=case)


@router.post("", response_model=StandardResponse[Dict[str, Any]], status_code=201)
def create_case(
    payload: CaseCreate,
    current_user: AuthenticatedUser = Depends(require_any_role([Role.INSPECTOR, Role.ADMIN]))
) -> StandardResponse[Dict[str, Any]]:
    """
    Registers a new statutory investigation docket.
    Only Police Inspectors and Administrators are authorized.
    """
    created = case_service.create_case(payload, current_user)
    return StandardResponse(success=True, data=created)


@router.patch("/{case_identifier}", response_model=StandardResponse[Dict[str, Any]])
def update_case(
    case_identifier: str,
    payload: CaseUpdate,
    current_user: AuthenticatedUser = Depends(require_any_role([Role.INSPECTOR, Role.ADMIN]))
) -> StandardResponse[Dict[str, Any]]:
    """
    Updates investigation case metadata, status, or officer assignments.
    """
    updated = case_service.update_case(case_identifier, payload, current_user)
    return StandardResponse(success=True, data=updated)
