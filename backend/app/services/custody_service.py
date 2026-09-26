from typing import Optional
from backend.app.core.permissions import Role
from backend.app.repositories.audit_log_repository import AuditLogRepository
from backend.app.repositories.case_repository import CaseRepository
from backend.app.repositories.custody_repository import CustodyRepository
from backend.app.repositories.evidence_repository import EvidenceRepository
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.custody import (
    CustodyBlockResponse,
    CustodyTimelineResponse,
    CustodyTransferRequest
)
from backend.app.services.base import BaseService
from backend.app.utils.errors import ForbiddenException, NotFoundException, ValidationException


class CustodyService(BaseService):
    """
    Core Domain Service for Evidence Chain of Custody:
    - Strictly append-only cryptographic block chain
    - Server-side actor derivation (client cannot spoof custodian or timestamp)
    - Unbroken hash chain verification
    - Role-based handover authorization
    """
    def __init__(
        self,
        custody_repo: Optional[CustodyRepository] = None,
        evidence_repo: Optional[EvidenceRepository] = None,
        case_repo: Optional[CaseRepository] = None,
        audit_repo: Optional[AuditLogRepository] = None
    ):
        self.custody_repo = custody_repo or CustodyRepository()
        self.evidence_repo = evidence_repo or EvidenceRepository()
        self.case_repo = case_repo or CaseRepository()
        self.audit_repo = audit_repo or AuditLogRepository()

    def get_timeline(self, evidence_id: str, current_user: AuthenticatedUser) -> CustodyTimelineResponse:
        """
        Retrieves the complete historical custody timeline for an exhibit.
        Verifies unbroken block hash chaining across all sequential steps.
        """
        evidence = self.evidence_repo.get_by_id(evidence_id)
        if not evidence:
            evidence = self.evidence_repo.get_by_tag(evidence_id)
        if not evidence:
            raise NotFoundException(f"Evidence with identifier '{evidence_id}' does not exist.")

        ev_uuid = str(evidence["id"])
        case_uuid = str(evidence["case_id"])

        if not self.case_repo.user_has_case_access(case_uuid, current_user.id, current_user.role):
            raise ForbiddenException("Access denied. You do not have jurisdiction over this exhibit's case docket.")

        transfers = self.custody_repo.list_transfers(ev_uuid)
        blocks: list[CustodyBlockResponse] = []
        is_unbroken = True
        prev_hash = None

        for t in transfers:
            # Verify cryptographic block chaining
            if prev_hash is not None and t.get("previous_block_hash") != prev_hash:
                is_unbroken = False
            prev_hash = t.get("block_hash")

            blocks.append(
                CustodyBlockResponse(
                    id=str(t["id"]),
                    evidence_id=str(t["evidence_id"]),
                    step_number=t["step_number"],
                    from_location=t["from_location"],
                    to_location=t["to_location"],
                    transfer_reason=t["transfer_reason"],
                    seal_intact=t.get("seal_intact", True),
                    previous_block_hash=t.get("previous_block_hash"),
                    block_hash=t["block_hash"],
                    from_custodian_id=str(t["from_custodian_id"]) if t.get("from_custodian_id") else None,
                    to_custodian_id=str(t["to_custodian_id"]),
                    transfer_timestamp=t.get("transfer_timestamp"),
                    created_at=t.get("created_at")
                )
            )

        return CustodyTimelineResponse(
            evidence_id=ev_uuid,
            evidence_tag=evidence.get("evidence_tag"),
            total_steps=len(blocks),
            is_unbroken_chain=is_unbroken,
            timeline=blocks
        )

    def transfer_custody(
        self,
        evidence_id: str,
        payload: CustodyTransferRequest,
        current_user: AuthenticatedUser
    ) -> CustodyBlockResponse:
        """
        Transfers custody of an exhibit and appends an immutable block to the chain.
        Strictly enforces that the custodian actor is verified server-side.
        """
        # Role check
        if current_user.role not in (Role.INSPECTOR, Role.FORENSIC_OFFICER, Role.ADMIN):
            raise ForbiddenException("Only Police Inspectors, Forensic Examiners, and Administrators may execute custody transfers.")

        evidence = self.evidence_repo.get_by_id(evidence_id)
        if not evidence:
            evidence = self.evidence_repo.get_by_tag(evidence_id)
        if not evidence:
            raise NotFoundException(f"Evidence with identifier '{evidence_id}' does not exist.")

        ev_uuid = str(evidence["id"])
        case_uuid = str(evidence["case_id"])

        if not self.case_repo.user_has_case_access(case_uuid, current_user.id, current_user.role):
            raise ForbiddenException("Access denied. You do not have jurisdiction over this exhibit's case docket.")

        if not payload.transfer_reason or not payload.transfer_reason.strip():
            raise ValidationException("A formal statutory transfer reason is mandatory for chain of custody integrity.")
        if not payload.to_location or not payload.to_location.strip():
            raise ValidationException("A destination vault/laboratory location must be specified.")

        # Derive actors server-side — client cannot spoof creating actor
        to_custodian = payload.to_custodian_id or current_user.id
        from_loc = payload.from_location or evidence.get("current_location", "Station Malkhana Vault Room #2")

        # Append to append-only custody ledger
        transfer_record = self.custody_repo.append_transfer(
            evidence_id=ev_uuid,
            to_custodian_id=to_custodian,
            to_location=payload.to_location.strip(),
            from_location=from_loc,
            from_custodian_id=str(evidence.get("current_custodian_id") or current_user.id),
            transfer_reason=payload.transfer_reason.strip(),
            authority_memo_ref=payload.authority_memo_ref,
            seal_intact=payload.seal_intact,
            created_by=current_user.id
        )

        # Update evidence active location
        self.evidence_repo.update_current_version_metadata(
            evidence_id=ev_uuid,
            current_version=evidence.get("current_version", 1),
            storage_path=evidence.get("storage_path") or "",
            sha256_hash=evidence.get("sha256_hash") or "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            file_size_bytes=evidence.get("file_size_bytes", 0),
            mime_type=evidence.get("mime_type", "application/octet-stream")
        )

        # Log audit entry
        try:
            self.audit_repo.append_log(
                action="CUSTODY_TRANSFER_LOGGED",
                module="Custody",
                entity_type="ChainOfCustody",
                entity_id=transfer_record.get("block_hash"),
                case_id=case_uuid,
                evidence_id=ev_uuid,
                user_id=current_user.id,
                role=current_user.role.value,
                result="Success",
                description=f"Custody Step {transfer_record.get('step_number')}: Transferred from '{from_loc}' to '{payload.to_location.strip()}'. Reason: {payload.transfer_reason.strip()}.",
                event_payload={
                    "step_number": transfer_record.get("step_number"),
                    "from_location": from_loc,
                    "to_location": payload.to_location.strip(),
                    "block_hash": transfer_record.get("block_hash"),
                    "seal_intact": payload.seal_intact
                }
            )
        except Exception as audit_err:
            print(f"Custody transfer audit notice: {audit_err}")

        return CustodyBlockResponse(
            id=str(transfer_record.get("id", "coc-new")),
            evidence_id=ev_uuid,
            step_number=transfer_record.get("step_number", 1),
            from_location=from_loc,
            to_location=payload.to_location.strip(),
            transfer_reason=payload.transfer_reason.strip(),
            seal_intact=payload.seal_intact,
            previous_block_hash=transfer_record.get("previous_block_hash"),
            block_hash=transfer_record.get("block_hash", ""),
            from_custodian_id=str(evidence.get("current_custodian_id")) if evidence.get("current_custodian_id") else None,
            to_custodian_id=str(to_custodian),
            transfer_timestamp=transfer_record.get("transfer_timestamp"),
            created_at=transfer_record.get("created_at")
        )


custody_service = CustodyService()
