import random
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from backend.app.core.permissions import Role
from backend.app.repositories.audit_log_repository import AuditLogRepository
from backend.app.repositories.case_repository import CaseRepository
from backend.app.repositories.evidence_repository import EvidenceRepository
from backend.app.repositories.evidence_version_repository import EvidenceVersionRepository
from backend.app.repositories.forensic_repository import ForensicRepository
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.forensic import (
    ForensicReportCreate,
    ForensicReportResponse,
    ForensicReportStatusUpdate
)
from backend.app.services.base import BaseService
from backend.app.utils.errors import (
    AppException,
    ForbiddenException,
    NotFoundException,
    ValidationException
)


class ForensicService(BaseService):
    """
    Core Domain Service for Forensic Examination Workflow:
    - Enforces Case -> Evidence -> Evidence Version relational integrity
    - Prevents cross-case evidence association
    - Cryptographically binds trusted evidence SHA-256 hash (never trusts client hash)
    - Enforces state machine transitions for report lifecycle
    - Automates audit trail logging
    """
    VALID_STATUSES = {"Draft", "Under Examination", "Pending Review", "Finalized"}

    STATUS_TRANSITIONS = {
        "Draft": {"Under Examination", "Pending Review"},
        "Under Examination": {"Pending Review", "Draft"},
        "Pending Review": {"Finalized", "Under Examination", "Draft"},
        "Finalized": set()  # Terminal state
    }

    def __init__(
        self,
        forensic_repo: Optional[ForensicRepository] = None,
        case_repo: Optional[CaseRepository] = None,
        evidence_repo: Optional[EvidenceRepository] = None,
        version_repo: Optional[EvidenceVersionRepository] = None,
        audit_repo: Optional[AuditLogRepository] = None
    ):
        self.forensic_repo = forensic_repo or ForensicRepository()
        self.case_repo = case_repo or CaseRepository()
        self.evidence_repo = evidence_repo or EvidenceRepository()
        self.version_repo = version_repo or EvidenceVersionRepository()
        self.audit_repo = audit_repo or AuditLogRepository()

    def create_report(
        self,
        payload: ForensicReportCreate,
        current_user: AuthenticatedUser
    ) -> ForensicReportResponse:
        """
        Creates and registers a new forensic examination report:
        1. Role check: only Forensic Officer and Admin may author reports.
        2. Validates Case existence and user jurisdiction.
        3. Validates Evidence existence.
        4. Cross-Module Integrity Check: Enforces that Evidence strictly belongs to the specified Case!
        5. Retrieves trusted evidence SHA-256 hash from server database (ignoring client hash).
        6. Inserts forensic report and records audit log.
        """
        if current_user.role not in (Role.FORENSIC_OFFICER, Role.ADMIN):
            raise ForbiddenException("Only Forensic Examiners and Administrators may draft forensic reports.")

        # 1. Validate Case
        case = self.case_repo.get_case(payload.case_id)
        if not case:
            raise NotFoundException(f"Investigation Case '{payload.case_id}' does not exist.")
        case_uuid = str(case["id"])

        if not self.case_repo.user_has_case_access(case_uuid, current_user.id, current_user.role):
            raise ForbiddenException("Access denied. You do not have jurisdiction over this case docket.")

        # 2. Validate Evidence
        evidence = self.evidence_repo.get_by_id(payload.evidence_id)
        if not evidence:
            evidence = self.evidence_repo.get_by_tag(payload.evidence_id)
        if not evidence:
            raise NotFoundException(f"Evidence exhibit '{payload.evidence_id}' does not exist.")
        evidence_uuid = str(evidence["id"])

        # 3. Cross-Module Data Integrity: Evidence MUST belong to the specified Case!
        if str(evidence.get("case_id")) != case_uuid:
            raise ValidationException(
                f"Cross-case integrity violation: Evidence '{payload.evidence_id}' belongs to a different investigation case, not '{payload.case_id}'."
            )

        # 4. Bind Trusted Hash directly from Database (never trust client hash)
        trusted_hash = evidence.get("sha256_hash") or "UNINITIALIZED_LEGACY"

        # 5. Generate Report Identifier
        year_str = datetime.now(timezone.utc).strftime("%Y")
        report_number = payload.report_number or f"FR-{year_str}-{random.randint(100, 999)}"

        insert_payload = {
            "report_number": report_number,
            "case_id": case_uuid,
            "evidence_id": evidence_uuid,
            "examiner_id": current_user.id,
            "report_type": payload.report_type,
            "status": "Draft",
            "laboratory_division": payload.laboratory_division or "Regional Forensic Science Laboratory, Bhopal",
            "examination_details": payload.examination_details,
            "findings_summary": payload.findings_summary,
            "conclusive_opinion": payload.conclusive_opinion,
            "statutory_certificate": payload.statutory_certificate or "Form IV Section 45 IEA / Sec 39 BSA",
            "hash_signature": trusted_hash
        }

        created = self.forensic_repo.create_report(insert_payload)

        # 6. Audit Trail
        try:
            self.audit_repo.append_log(
                action="FORENSIC_REPORT_DRAFTED",
                module="Forensic",
                entity_type="ForensicReport",
                entity_id=str(created.get("id")),
                case_id=case_uuid,
                evidence_id=evidence_uuid,
                user_id=current_user.id,
                role=current_user.role.value,
                result="Success",
                description=f"Forensic Report {report_number} drafted for exhibit {evidence.get('evidence_tag')} ({payload.report_type}).",
                event_payload={
                    "report_number": report_number,
                    "discipline": payload.report_type,
                    "trusted_evidence_hash": trusted_hash
                }
            )
        except Exception as audit_err:
            print(f"Forensic report audit notice: {audit_err}")

        return self._to_response(created)

    def update_status(
        self,
        report_id: str,
        update_data: ForensicReportStatusUpdate,
        current_user: AuthenticatedUser
    ) -> ForensicReportResponse:
        """
        Updates forensic report status according to state machine rules:
        - Prevents arbitrary status jumps
        - Blocks mutations on 'Finalized' terminal state
        - Records timestamp upon finalization
        - Logs audit trail entry
        """
        if current_user.role not in (Role.FORENSIC_OFFICER, Role.ADMIN):
            raise ForbiddenException("Only Forensic Examiners and Administrators may modify forensic report status.")

        report = self.forensic_repo.get_report(report_id)
        if not report:
            raise NotFoundException(f"Forensic Report '{report_id}' was not found.")

        current_status = report.get("status", "Draft")
        target_status = update_data.status.strip()

        if target_status not in self.VALID_STATUSES:
            raise ValidationException(f"Invalid status '{target_status}'. Must be one of {sorted(self.VALID_STATUSES)}.")

        # Check terminal state
        if current_status == "Finalized":
            raise AppException(
                status_code=400,
                code="TERMINAL_STATE_LOCKED",
                message="Forensic Report is in 'Finalized' state. Finalized statutory reports are legally sealed and cannot be modified."
            )

        # Check allowed transition
        allowed = self.STATUS_TRANSITIONS.get(current_status, set())
        if target_status not in allowed and target_status != current_status:
            raise ValidationException(
                f"Illegal state transition from '{current_status}' to '{target_status}'. Permitted transitions: {sorted(allowed)}."
            )

        finalized_at = datetime.now(timezone.utc).isoformat() if target_status == "Finalized" else None
        updated = self.forensic_repo.update_report_status(
            report_id=str(report["id"]),
            new_status=target_status,
            finalized_at=finalized_at
        )

        try:
            self.audit_repo.append_log(
                action="FORENSIC_REPORT_STATUS_UPDATED",
                module="Forensic",
                entity_type="ForensicReport",
                entity_id=str(report["id"]),
                case_id=str(report["case_id"]),
                evidence_id=str(report["evidence_id"]),
                user_id=current_user.id,
                role=current_user.role.value,
                result="Success",
                description=f"Report {report.get('report_number')} transition: {current_status} -> {target_status}.",
                event_payload={
                    "previous_status": current_status,
                    "new_status": target_status,
                    "finalized_at": finalized_at
                }
            )
        except Exception as audit_err:
            print(f"Forensic status audit notice: {audit_err}")

        return self._to_response(updated or report)

    def get_report(self, report_id: str, current_user: AuthenticatedUser) -> ForensicReportResponse:
        """
        Retrieves a single forensic report.
        """
        report = self.forensic_repo.get_report(report_id)
        if not report:
            raise NotFoundException(f"Forensic Report '{report_id}' was not found.")

        case_uuid = str(report["case_id"])
        if not self.case_repo.user_has_case_access(case_uuid, current_user.id, current_user.role):
            raise ForbiddenException("Access denied. You do not have jurisdiction over this report's case.")

        return self._to_response(report)

    def list_reports(
        self,
        current_user: AuthenticatedUser,
        case_id: Optional[str] = None,
        evidence_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[ForensicReportResponse]:
        """
        Lists reports with user role jurisdiction checks.
        """
        if case_id:
            case = self.case_repo.get_case(case_id)
            if case and not self.case_repo.user_has_case_access(str(case["id"]), current_user.id, current_user.role):
                raise ForbiddenException("Access denied to this case's forensic reports.")
            case_id = str(case["id"]) if case else case_id

        reports = self.forensic_repo.list_reports(case_id=case_id, evidence_id=evidence_id, status=status, limit=limit)
        return [self._to_response(r) for r in reports]

    def _to_response(self, record: Dict[str, Any]) -> ForensicReportResponse:
        return ForensicReportResponse(
            id=str(record["id"]),
            report_number=record["report_number"],
            case_id=str(record["case_id"]),
            evidence_id=str(record["evidence_id"]),
            examiner_id=str(record["examiner_id"]),
            report_type=record["report_type"],
            status=record.get("status", "Draft"),
            laboratory_division=record.get("laboratory_division", "RFSL Bhopal"),
            examination_details=record.get("examination_details"),
            findings_summary=record.get("findings_summary"),
            conclusive_opinion=record.get("conclusive_opinion", ""),
            statutory_certificate=record.get("statutory_certificate"),
            hash_signature=record.get("hash_signature"),
            finalized_at=record.get("finalized_at"),
            created_at=record.get("created_at") or datetime.now(timezone.utc)
        )


forensic_service = ForensicService()
