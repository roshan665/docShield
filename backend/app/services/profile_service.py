from typing import Any, Dict, List, Optional
from backend.app.core.permissions import Role
from backend.app.repositories.audit_log_repository import AuditLogRepository
from backend.app.repositories.profile_repository import ProfileRepository
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.profile import ProfileUpdate
from backend.app.utils.errors import ForbiddenException, NotFoundException


class ProfileService:
    """
    Business service for user profile management.
    Restricted to Administrators.
    """
    def __init__(
        self,
        profile_repo: Optional[ProfileRepository] = None,
        audit_repo: Optional[AuditLogRepository] = None
    ):
        self.profile_repo = profile_repo or ProfileRepository()
        self.audit_repo = audit_repo or AuditLogRepository()

    def list_profiles(self, current_user: AuthenticatedUser) -> List[Dict[str, Any]]:
        """
        Lists all system user profiles. Admin only.
        """
        if current_user.role != Role.ADMIN:
            raise ForbiddenException("Only Administrators can access user directory management.")
        return self.profile_repo.list_profiles()

    def update_profile(
        self,
        user_id: str,
        payload: ProfileUpdate,
        current_user: AuthenticatedUser
    ) -> Dict[str, Any]:
        """
        Updates a user profile. Admin only.
        """
        if current_user.role != Role.ADMIN:
            raise ForbiddenException("Only Administrators can update user profiles or roles.")

        existing = self.profile_repo.get_profile_by_id(user_id)
        if not existing:
            raise NotFoundException(f"User profile '{user_id}' was not found.")

        update_dict = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
        if not update_dict:
            return existing

        updated = self.profile_repo.update_profile(user_id, update_dict)

        try:
            self.audit_repo.append_log(
                action="PROFILE_UPDATED",
                module="Users",
                entity_type="Profile",
                entity_id=user_id,
                user_id=current_user.id,
                role=current_user.role.value,
                result="Success",
                description=f"Admin updated profile for user '{existing.get('full_name')}'",
                event_payload={"updated_fields": list(update_dict.keys())}
            )
        except Exception as audit_err:
            print(f"Profile audit notice: {audit_err}")

        return updated or existing


profile_service = ProfileService()
