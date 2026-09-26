from typing import List, Callable
from fastapi import Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.app.core.permissions import Role
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.services.auth_service import auth_service, AuthService
from backend.app.utils.errors import UnauthorizedException, ForbiddenException

# Reusable HTTP Bearer scheme
security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> AuthenticatedUser:
    """
    Extracts Bearer token from the HTTP Authorization header,
    validates it against Supabase Auth, and resolves the verified user profile.
    """
    if not credentials or not credentials.credentials:
        raise UnauthorizedException("Authentication required. Please provide a valid Bearer token.")

    token = credentials.credentials
    try:
        return auth_service.authenticate_token(token)
    except (UnauthorizedException, ForbiddenException):
        raise
    except Exception as exc:
        raise UnauthorizedException(f"Invalid or expired authentication token: {str(exc)}")



def require_role(required_role: Role) -> Callable[[AuthenticatedUser], AuthenticatedUser]:
    """
    Dependency factory that enforces a specific DocShield system role.
    Admin role is granted administrative oversight where appropriate.
    """
    def role_dependency(
        current_user: AuthenticatedUser = Depends(get_current_user)
    ) -> AuthenticatedUser:
        if current_user.role != required_role and current_user.role != Role.ADMIN:
            raise ForbiddenException(
                message=f"Access denied. This endpoint requires the '{required_role.value}' role. Your role is '{current_user.role.value}'."
            )
        return current_user

    return role_dependency


def require_any_role(allowed_roles: List[Role]) -> Callable[[AuthenticatedUser], AuthenticatedUser]:
    """
    Dependency factory that permits any role from an allowed set.
    """
    def roles_dependency(
        current_user: AuthenticatedUser = Depends(get_current_user)
    ) -> AuthenticatedUser:
        if current_user.role not in allowed_roles and current_user.role != Role.ADMIN:
            allowed_names = [r.value for r in allowed_roles]
            raise ForbiddenException(
                message=f"Access denied. Requires one of {allowed_names}. Your role is '{current_user.role.value}'."
            )
        return current_user

    return roles_dependency


require_admin = require_role(Role.ADMIN)

