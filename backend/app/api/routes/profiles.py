from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from backend.app.api.dependencies import require_admin
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.common import StandardResponse
from backend.app.schemas.profile import ProfileUpdate
from backend.app.services.profile_service import profile_service

router = APIRouter(prefix="/profiles", tags=["User Profiles & Directory Management"])


@router.get("", response_model=StandardResponse[List[Dict[str, Any]]])
def list_profiles(
    current_user: AuthenticatedUser = Depends(require_admin)
) -> StandardResponse[List[Dict[str, Any]]]:
    """
    Lists all user profiles. Admin only.
    """
    profiles = profile_service.list_profiles(current_user)
    return StandardResponse(success=True, data=profiles)


@router.patch("/{user_id}", response_model=StandardResponse[Dict[str, Any]])
def update_profile(
    user_id: str,
    payload: ProfileUpdate,
    current_user: AuthenticatedUser = Depends(require_admin)
) -> StandardResponse[Dict[str, Any]]:
    """
    Updates profile details, role, or active status. Admin only.
    """
    updated = profile_service.update_profile(user_id, payload, current_user)
    return StandardResponse(success=True, data=updated)
