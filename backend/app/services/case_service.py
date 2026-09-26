from datetime import datetime, timezone
import random
from typing import Any, Dict, List, Optional
from backend.app.core.permissions import Role
from backend.app.repositories.case_repository import CaseRepository
from backend.app.repositories.audit_log_repository import AuditLogRepository
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.case import CaseCreate, CaseUpdate, CaseResponse
from backend.app.utils.errors import ForbiddenException, NotFoundException, ValidationException


class CaseService:
    """
    Business service enforcing authorization, jurisdictional filtering,
    and audit trail compliance for Investigation Cases.
    """
    def __init__(
        self,
        case_repo: Optional[CaseRepository] = None,
        audit_repo: Optional[AuditLogRepository] = None
    ):
        self.case_repo = case_repo or CaseRepository()
        self.audit_repo = audit_repo or AuditLogRepository()

    def list_cases(
        self,
        current_user: AuthenticatedUser,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Lists cases filtered by user authorization and statutory jurisdiction.
        """
        raw_cases = self.case_repo.list_cases(status=status, limit=limit)
        
        # Scoped filtering based on role
        if current_user.role in (Role.ADMIN, Role.LEGAL_OFFICER, Role.FORENSIC_OFFICER):
            return raw_cases

        # For Inspectors: show assigned cases or general active jurisdiction
        filtered = []
        for c in raw_cases:
            if self.case_repo.user_has_case_access(str(c.get("id")), current_user.id, current_user.role):
                filtered.append(c)
        return filtered

    def get_case(self, case_identifier: str, current_user: AuthenticatedUser) -> Dict[str, Any]:
        """
        Retrieves a single case by UUID or Case Number.
        """
        case = self.case_repo.get_case(case_identifier)
        if not case:
            raise NotFoundException(f"Investigation Case '{case_identifier}' was not found.")

        case_id = str(case.get("id"))
        if not self.case_repo.user_has_case_access(case_id, current_user.id, current_user.role):
            raise ForbiddenException("Access denied. You do not have jurisdiction over this investigation case.")

        return case

    def create_case(self, payload: CaseCreate, current_user: AuthenticatedUser) -> Dict[str, Any]:
        """
        Creates and registers a new investigation case.
        Only Inspectors and Administrators are authorized to initialize case dockets.
        """
        if current_user.role not in (Role.INSPECTOR, Role.ADMIN):
            raise ForbiddenException("Only Police Inspectors and Administrators can register new investigation cases.")

        year_str = datetime.now(timezone.utc).strftime("%Y")
        case_number = payload.case_number or f"#{year_str}-{random.randint(1800, 1999)}"

        db_payload = {
            "case_number": case_number,
            "title": payload.title,
            "section_ipc_bns": payload.section_ipc_bns,
            "status": payload.status or "Active",
            "priority": payload.priority or "Normal",
            "complainant_name": payload.complainant_name or "Direct Police Cognizance",
            "police_station": payload.police_station or "Bhopal Central Police Station",
            "summary": payload.summary or "Preliminary investigation initialized under IO purview.",
            "investigating_officer_id": payload.investigating_officer_id or current_user.id
        }

        created = self.case_repo.create_case(db_payload)

        try:
            self.audit_repo.append_log(
                action="CASE_REGISTERED",
                module="Cases",
                entity_type="Case",
                entity_id=str(created.get("id")),
                case_id=str(created.get("id")),
                user_id=current_user.id,
                role=current_user.role.value,
                result="Success",
                description=f"Case {case_number} registered under {payload.section_ipc_bns}.",
                event_payload={"case_number": case_number, "title": payload.title}
            )
        except Exception as audit_err:
            print(f"Case creation audit notice: {audit_err}")

        return created

    def update_case(
        self,
        case_identifier: str,
        payload: CaseUpdate,
        current_user: AuthenticatedUser
    ) -> Dict[str, Any]:
        """
        Updates case details or assignments.
        """
        case = self.get_case(case_identifier, current_user)
        case_id = str(case["id"])

        if current_user.role not in (Role.ADMIN, Role.INSPECTOR):
            raise ForbiddenException("You do not have permission to modify this investigation case.")

        update_dict = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
        if not update_dict:
            return case

        update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
        updated = self.case_repo.update_case(case_id, update_dict)

        try:
            self.audit_repo.append_log(
                action="CASE_METADATA_UPDATED",
                module="Cases",
                entity_type="Case",
                entity_id=case_id,
                case_id=case_id,
                user_id=current_user.id,
                role=current_user.role.value,
                result="Success",
                description=f"Case {case.get('case_number')} updated with modified fields: {list(update_dict.keys())}",
                event_payload={"updated_fields": list(update_dict.keys())}
            )
        except Exception as audit_err:
            print(f"Case update audit notice: {audit_err}")

        return updated or case


case_service = CaseService()
