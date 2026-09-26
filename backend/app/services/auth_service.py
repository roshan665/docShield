from typing import Optional
from backend.app.core.permissions import normalize_role, Role
from backend.app.integrations.supabase.client import get_supabase_client, get_authenticated_supabase_client
from backend.app.repositories.profile_repository import ProfileRepository
from backend.app.schemas.auth import AuthenticatedUser, UserProfile
from backend.app.services.base import BaseService
from backend.app.utils.errors import UnauthorizedException, ForbiddenException


class AuthService(BaseService):
    """
    Authoritative authentication service.
    Validates Supabase JWT tokens, extracts authenticated user claims,
    and loads the verified database profile to enforce server-side RBAC.
    """

    def __init__(self, profile_repo: Optional[ProfileRepository] = None):
        self.profile_repo = profile_repo or ProfileRepository()

    def authenticate_token(self, token: str) -> AuthenticatedUser:
        """
        Validates an incoming Bearer JWT against Supabase Auth.
        Loads the corresponding profile from PostgreSQL.
        Raises UnauthorizedException or ForbiddenException on failure.
        """
        if not token:
            raise UnauthorizedException("Authorization token is missing.")

        client = get_supabase_client()
        try:
            user_response = client.auth.get_user(token)
            if not user_response or not user_response.user:
                raise UnauthorizedException("Invalid or expired session token.")
            auth_user = user_response.user
        except Exception as e:
            raise UnauthorizedException(f"Token validation failed: {str(e)}")

        user_id = str(auth_user.id)
        email = auth_user.email

        # Retrieve authoritative profile from database using client with forwarded token to respect RLS
        authed_client = get_authenticated_supabase_client(token)
        repo = ProfileRepository(client=authed_client)
        profile_data = repo.get_profile_by_id(user_id)

        # Fallback to standard client if RLS profile lookup is empty during initial migration
        if not profile_data:
            profile_data = self.profile_repo.get_profile_by_id(user_id)

        if not profile_data:
            raise ForbiddenException(
                message=f"User '{user_id}' does not have an active profile registered in DocShield."
            )

        if not profile_data.get("is_active", True):
            raise ForbiddenException("User account has been suspended or deactivated.")

        try:
            role = normalize_role(profile_data.get("role", ""))
        except ValueError as err:
            raise ForbiddenException(f"Unauthorized system role: {str(err)}")

        user_profile = UserProfile(
            id=profile_data["id"],
            email=profile_data.get("email") or email,
            full_name=profile_data.get("full_name", "Officer"),
            badge_id=profile_data.get("badge_id"),
            role=role,
            police_station=profile_data.get("police_station"),
            phone_number=profile_data.get("phone_number"),
            is_active=profile_data.get("is_active", True),
            created_at=profile_data.get("created_at")
        )

        return AuthenticatedUser(
            id=user_id,
            email=email,
            role=role,
            profile=user_profile
        )


auth_service = AuthService()
