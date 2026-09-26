from fastapi import APIRouter, Depends
from backend.app.api.dependencies import get_current_user, require_role
from backend.app.core.permissions import Role
from backend.app.schemas.auth import AuthenticatedUser, UserProfileResponse
from backend.app.schemas.common import StandardResponse

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> UserProfileResponse:
    """
    Returns the authenticated user's verified identity and role from the server-side context.
    """
    return UserProfileResponse(success=True, data=current_user)


@router.get("/probe/inspector", response_model=StandardResponse[str])
def probe_inspector_role(
    current_user: AuthenticatedUser = Depends(require_role(Role.INSPECTOR))
) -> StandardResponse[str]:
    """
    Verification probe for Police Inspector RBAC authorization.
    """
    return StandardResponse(
        success=True,
        data=f"Inspector authorization verified for badge: {current_user.profile.badge_id}"
    )


@router.get("/probe/admin", response_model=StandardResponse[str])
def probe_admin_role(
    current_user: AuthenticatedUser = Depends(require_role(Role.ADMIN))
) -> StandardResponse[str]:
    """
    Verification probe for System Administrator RBAC authorization.
    """
    return StandardResponse(
        success=True,
        data=f"Administrator oversight verified for user: {current_user.profile.full_name}"
    )
