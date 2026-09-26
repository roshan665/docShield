from typing import Any, Dict, List, Optional
from backend.app.core.permissions import Role
from backend.app.repositories.audit_log_repository import AuditLogRepository
from backend.app.repositories.case_repository import CaseRepository
from backend.app.schemas.audit import AuditLogListResponse, AuditLogResponse
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.services.base import BaseService
from backend.app.utils.errors import ForbiddenException


class AuditService(BaseService):
    """
    Centralized Domain Service for System Audit Logging:
    - Append-only immutable log enforcement
    - Server-side user identity binding (client cannot spoof actor, role, or timestamp)
    - Multi-role audit trail querying with data isolation
    """
    def __init__(
        self,
        audit_repo: Optional[AuditLogRepository] = None,
        case_repo: Optional[CaseRepository] = None
    ):
        self.audit_repo = audit_repo or AuditLogRepository()
        self.case_repo = case_repo or CaseRepository()

    def list_logs(
        self,
        current_user: AuthenticatedUser,
        module: Optional[str] = None,
        case_id: Optional[str] = None,
        evidence_id: Optional[str] = None,
        result: Optional[str] = None,
        limit: int = 100
    ) -> AuditLogListResponse:
        """
        Retrieves audit trail records with server-side jurisdiction validation.
        """
        if case_id:
            case = self.case_repo.get_case(case_id)
            if case and not self.case_repo.user_has_case_access(str(case["id"]), current_user.id, current_user.role):
                raise ForbiddenException("Access denied. You do not have jurisdiction over this case audit trail.")

        raw_logs = self.audit_repo.list_logs(
            module=module,
            case_id=case_id,
            evidence_id=evidence_id,
            result=result,
            limit=limit
        )

        entries = [
            AuditLogResponse(
                id=str(log["id"]),
                timestamp=log["timestamp"],
                user_id=str(log["user_id"]) if log.get("user_id") else None,
                role=log.get("role", "System"),
                action=log["action"],
                module=log["module"],
                entity_type=log["entity_type"],
                entity_id=str(log["entity_id"]) if log.get("entity_id") else None,
                case_id=str(log["case_id"]) if log.get("case_id") else None,
                evidence_id=str(log["evidence_id"]) if log.get("evidence_id") else None,
                result=log.get("result", "Success"),
                description=log["description"],
                record_hash=log["record_hash"],
                event_payload=log.get("event_payload") or {}
            )
            for log in raw_logs
        ]

        return AuditLogListResponse(total=len(entries), data=entries)

    def log_event(
        self,
        current_user: AuthenticatedUser,
        action: str,
        module: str,
        entity_type: str,
        description: str,
        result: str = "Success",
        entity_id: Optional[str] = None,
        case_id: Optional[str] = None,
        evidence_id: Optional[str] = None,
        event_payload: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates an immutable audit entry bound directly to the authenticated user.
        """
        return self.audit_repo.append_log(
            action=action,
            module=module,
            entity_type=entity_type,
            description=description,
            result=result,
            user_id=current_user.id,
            role=current_user.role.value,
            entity_id=entity_id,
            case_id=case_id,
            evidence_id=evidence_id,
            event_payload=event_payload,
            ip_address=ip_address,
            user_agent=user_agent
        )


audit_service = AuditService()
