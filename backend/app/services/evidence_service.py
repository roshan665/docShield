import uuid
import random
from datetime import datetime, timezone
from typing import BinaryIO, Dict, List, Optional, Union, Any

from backend.app.core.crypto import (
    calculate_sha256,
    verify_sha256,
    is_valid_sha256_hash,
    generate_evidence_storage_path,
    sanitize_filename
)
from backend.app.core.permissions import Role
from backend.app.integrations.supabase.storage import StorageIntegration, storage_integration
from backend.app.repositories.audit_log_repository import AuditLogRepository
from backend.app.repositories.case_repository import CaseRepository
from backend.app.repositories.custody_repository import CustodyRepository
from backend.app.repositories.evidence_repository import EvidenceRepository
from backend.app.repositories.evidence_version_repository import EvidenceVersionRepository
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.evidence import (
    EvidenceDetailResponse,
    EvidenceSummary,
    EvidenceVersionResponse,
    IntegrityVerificationResponse
)
from backend.app.services.base import BaseService
from backend.app.utils.errors import (
    AppException,
    ForbiddenException,
    NotFoundException,
    ValidationException
)


class EvidenceService(BaseService):
    """
    Core Domain Service for Evidence Lifecycle Management:
    - Server-side authoritative SHA-256 byte hashing
    - Multi-version immutable preservation
    - Private Supabase Storage management
    - Byte-level cryptographic integrity verification & tamper detection
    - Automated Chain of Custody & Audit Trail integration
    """
    MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB statutory threshold
    BUCKET_NAME = "evidence-vault"

    def __init__(
        self,
        evidence_repo: Optional[EvidenceRepository] = None,
        version_repo: Optional[EvidenceVersionRepository] = None,
        case_repo: Optional[CaseRepository] = None,
        custody_repo: Optional[CustodyRepository] = None,
        audit_repo: Optional[AuditLogRepository] = None,
        storage: Optional[StorageIntegration] = None
    ):
        self.evidence_repo = evidence_repo or EvidenceRepository()
        self.version_repo = version_repo or EvidenceVersionRepository()
        self.case_repo = case_repo or CaseRepository()
        self.custody_repo = custody_repo or CustodyRepository()
        self.audit_repo = audit_repo or AuditLogRepository()
        self.storage = storage or storage_integration

    @staticmethod
    def calculate_file_hash(data: Union[bytes, BinaryIO]) -> str:
        """
        Authoritative SHA-256 byte calculation.
        """
        return calculate_sha256(data)

    @staticmethod
    def verify_file_integrity(data: Union[bytes, BinaryIO], recorded_hash: str) -> bool:
        """
        Validates raw file bytes against the recorded SHA-256 hash using constant-time comparison.
        """
        return verify_sha256(data, recorded_hash)

    def get_version_history(self, evidence_id: str) -> List[EvidenceVersionResponse]:
        """
        Retrieves the complete immutable version history for an evidence item.
        """
        records = self.version_repo.list_versions_for_evidence(evidence_id)
        return [
            EvidenceVersionResponse(
                id=str(r["id"]),
                evidence_id=str(r["evidence_id"]),
                version_number=r["version_number"],
                storage_path=r["storage_path"],
                original_filename=r["original_filename"],
                mime_type=r.get("mime_type", "application/octet-stream"),
                file_size_bytes=r["file_size_bytes"],
                sha256_hash=r["sha256_hash"],
                change_reason=r.get("change_reason", ""),
                metadata=r.get("metadata", {}),
                created_by=str(r["created_by"]) if r.get("created_by") else None,
                created_at=r["created_at"]
            )
            for r in records
        ]

    def get_evidence_version(self, evidence_id: str, version_id_or_number: Union[str, int]) -> Optional[EvidenceVersionResponse]:
        """
        Retrieves a specific immutable version record by UUID or sequential version number.
        """
        evidence = self.evidence_repo.get_by_id(evidence_id)
        if not evidence:
            evidence = self.evidence_repo.get_by_tag(evidence_id)
        if not evidence:
            raise NotFoundException(f"Evidence with ID or tag '{evidence_id}' does not exist.")

        ev_uuid = str(evidence["id"])
        record = None

        if isinstance(version_id_or_number, int) or (isinstance(version_id_or_number, str) and version_id_or_number.isdigit()):
            record = self.version_repo.get_version_by_number(ev_uuid, int(version_id_or_number))
        else:
            record = self.version_repo.get_by_id(str(version_id_or_number))

        if not record or str(record.get("evidence_id")) != ev_uuid:
            raise NotFoundException(f"Version '{version_id_or_number}' not found for evidence '{evidence_id}'.")

        return EvidenceVersionResponse(
            id=str(record["id"]),
            evidence_id=str(record["evidence_id"]),
            version_number=record["version_number"],
            storage_path=record["storage_path"],
            original_filename=record["original_filename"],
            mime_type=record.get("mime_type", "application/octet-stream"),
            file_size_bytes=record["file_size_bytes"],
            sha256_hash=record["sha256_hash"],
            change_reason=record.get("change_reason", ""),
            metadata=record.get("metadata", {}),
            created_by=str(record["created_by"]) if record.get("created_by") else None,
            created_at=record["created_at"]
        )

    def record_version_snapshot(
        self,
        evidence_id: str,
        case_id: str,
        filename: str,
        file_bytes: bytes,
        change_reason: str,
        officer_id: Optional[str] = None,
        mime_type: str = "application/octet-stream"
    ) -> EvidenceVersionResponse:
        """
        Records an immutable version snapshot directly into the repository.
        Preserves backward compatibility for unit testing and internal snapshots.
        """
        evidence = self.evidence_repo.get_by_id(evidence_id)
        if not evidence:
            raise NotFoundException(f"Evidence with ID '{evidence_id}' does not exist.")

        computed_hash = self.calculate_file_hash(file_bytes)
        file_size = len(file_bytes)

        latest_version_record = self.version_repo.get_latest_version(evidence_id)
        next_version_num = (latest_version_record["version_number"] + 1) if latest_version_record else 1

        storage_path = generate_evidence_storage_path(
            case_id=case_id,
            evidence_id=evidence_id,
            version_number=next_version_num,
            filename=filename
        )

        version_payload = {
            "evidence_id": evidence_id,
            "version_number": next_version_num,
            "storage_path": storage_path,
            "original_filename": filename,
            "mime_type": mime_type,
            "file_size_bytes": file_size,
            "sha256_hash": computed_hash,
            "change_reason": change_reason,
            "created_by": officer_id
        }

        saved_record = self.version_repo.create_version(version_payload)

        self.evidence_repo.update_current_version_metadata(
            evidence_id=evidence_id,
            current_version=next_version_num,
            storage_path=storage_path,
            sha256_hash=computed_hash,
            file_size_bytes=file_size,
            mime_type=mime_type
        )

        return EvidenceVersionResponse(
            id=str(saved_record["id"]),
            evidence_id=str(saved_record["evidence_id"]),
            version_number=saved_record["version_number"],
            storage_path=saved_record["storage_path"],
            original_filename=saved_record["original_filename"],
            mime_type=saved_record.get("mime_type", mime_type),
            file_size_bytes=saved_record["file_size_bytes"],
            sha256_hash=saved_record["sha256_hash"],
            change_reason=saved_record.get("change_reason", change_reason),
            metadata=saved_record.get("metadata", {}),
            created_by=str(saved_record["created_by"]) if saved_record.get("created_by") else None,
            created_at=saved_record["created_at"]
        )

    def get_evidence_with_versions(self, evidence_id: str) -> Optional[EvidenceSummary]:
        """
        Loads the active evidence record along with its historical version chain.
        """
        evidence = self.evidence_repo.get_by_id(evidence_id)
        if not evidence:
            evidence = self.evidence_repo.get_by_tag(evidence_id)
        if not evidence:
            return None

        ev_uuid = str(evidence["id"])
        versions = self.get_version_history(ev_uuid)
        return EvidenceSummary(
            id=ev_uuid,
            evidence_tag=evidence["evidence_tag"],
            case_id=str(evidence["case_id"]),
            evidence_type=evidence.get("evidence_type", "Physical"),
            description=evidence.get("description", ""),
            seal_number=evidence.get("seal_number", ""),
            current_location=evidence.get("current_location", ""),
            current_version=evidence.get("current_version", 1),
            storage_path=evidence.get("storage_path"),
            sha256_hash=evidence.get("sha256_hash"),
            verification_status=evidence.get("verification_status", "Verified"),
            status=evidence.get("status", "Secured"),
            versions=versions
        )

    def create_evidence(
        self,
        case_id: str,
        description: str,
        file_bytes: bytes,
        original_filename: str,
        current_user: AuthenticatedUser,
        evidence_type: str = "Physical",
        mime_type: str = "application/octet-stream",
        seal_number: Optional[str] = None,
        current_location: Optional[str] = None,
        seizure_memo_ref: Optional[str] = None,
        condition_notes: Optional[str] = None,
        evidence_tag: Optional[str] = None,
        client_provided_hash: Optional[str] = None  # Completely ignored for integrity
    ) -> EvidenceDetailResponse:
        """
        Authoritative Evidence Ingestion Workflow:
        1. Validates user RBAC role (Inspector, Forensic Officer, Admin).
        2. Validates case existence and user jurisdiction.
        3. Validates uploaded file bytes (non-empty, <= 50MB).
        4. Calculates cryptographic SHA-256 digest from actual raw bytes.
        5. Generates safe server-controlled storage path.
        6. Uploads file to private Supabase Storage.
        7. Creates primary `evidence` record in database.
        8. Creates immutable Version 1 snapshot in `evidence_versions`.
        9. Creates Step 1 Genesis record in `chain_of_custody_transfers`.
        10. Records immutable audit entry in `audit_logs`.
        Includes transactional compensation to clean up storage if database insertion fails.
        """
        # Step 1: Validate Role
        if current_user.role not in (Role.INSPECTOR, Role.FORENSIC_OFFICER, Role.ADMIN):
            raise ForbiddenException("Only Police Inspectors, Forensic Examiners, and Administrators may register evidence exhibits.")

        # Step 2: Validate Case
        case = self.case_repo.get_case(case_id)
        if not case:
            raise NotFoundException(f"Investigation Case '{case_id}' does not exist in registry.")

        case_uuid = str(case["id"])
        if not self.case_repo.user_has_case_access(case_uuid, current_user.id, current_user.role):
            raise ForbiddenException(f"You do not have jurisdiction to register evidence in Case '{case_id}'.")

        # Step 3: Validate File
        if not file_bytes or len(file_bytes) == 0:
            raise ValidationException("Evidence file payload cannot be empty. Physical exhibit seizure requires digital attachment.")
        if len(file_bytes) > self.MAX_FILE_SIZE_BYTES:
            raise ValidationException(f"File size ({len(file_bytes)} bytes) exceeds the statutory 50 MB threshold.")

        # Step 4: Calculate Authoritative SHA-256 Digest (Ignoring any client-supplied hash)
        server_hash = self.calculate_file_hash(file_bytes)
        file_size = len(file_bytes)
        safe_filename = sanitize_filename(original_filename)

        # Step 5: Generate IDs & Paths
        evidence_id = str(uuid.uuid4())
        year_str = datetime.now(timezone.utc).strftime("%Y")
        tag = evidence_tag or f"EV-{year_str}-{random.randint(1000, 9999)}"
        seal = seal_number or f"SEAL-MP-{random.randint(1000, 9999)}"
        loc = current_location or "Station Malkhana Vault Room #2"
        memo = seizure_memo_ref or f"PANCH-{year_str}-{random.randint(100, 999)}"

        storage_path = generate_evidence_storage_path(
            case_id=case_uuid,
            evidence_id=evidence_id,
            version_number=1,
            filename=safe_filename
        )

        # Step 6: Upload to Private Storage
        self.storage.upload_file_bytes(
            bucket=self.BUCKET_NAME,
            path=storage_path,
            file_bytes=file_bytes,
            content_type=mime_type
        )

        created_in_db = False
        try:
            # Step 7: Create Evidence Record
            evidence_payload = {
                "id": evidence_id,
                "evidence_tag": tag,
                "case_id": case_uuid,
                "evidence_type": evidence_type,
                "description": description,
                "seizure_memo_ref": memo,
                "seal_number": seal,
                "condition_notes": condition_notes or "Seized in sealed condition per Section 100 CrPC / 105 BNSS.",
                "collected_by": current_user.id,
                "current_custodian_id": current_user.id,
                "current_location": loc,
                "verification_status": "Verified",
                "examination_status": "Pending Examination",
                "sha256_hash": server_hash,
                "current_version": 1,
                "storage_path": storage_path,
                "mime_type": mime_type,
                "file_size_bytes": file_size,
                "status": "Secured"
            }
            ev_data = self.evidence_repo.create_evidence(evidence_payload)
            created_in_db = True

            # Step 8: Create Immutable Version 1 Snapshot
            version_payload = {
                "evidence_id": evidence_id,
                "version_number": 1,
                "storage_path": storage_path,
                "original_filename": safe_filename,
                "mime_type": mime_type,
                "file_size_bytes": file_size,
                "sha256_hash": server_hash,
                "created_by": current_user.id,
                "change_reason": "Initial Exhibit Seizure Deposition"
            }
            self.version_repo.create_version(version_payload)

            # Step 9: Create Chain of Custody Genesis Block (Step 1)
            try:
                self.custody_repo.append_transfer(
                    evidence_id=evidence_id,
                    to_custodian_id=current_user.id,
                    to_location=loc,
                    from_location="Crime Scene / Seizure Site",
                    transfer_reason="Initial Seizure & Deposition under Section 100 CrPC / 105 BNSS",
                    seal_intact=True,
                    authority_memo_ref=memo,
                    created_by=current_user.id
                )
            except Exception as custody_err:
                print(f"Custody Genesis log notice: {custody_err}")

            # Step 10: Create Audit Log Entry
            try:
                self.audit_repo.append_log(
                    action="EVIDENCE_CREATED",
                    module="Evidence",
                    entity_type="Evidence",
                    entity_id=evidence_id,
                    case_id=case_uuid,
                    evidence_id=evidence_id,
                    user_id=current_user.id,
                    role=current_user.role.value,
                    result="Success",
                    description=f"Seized exhibit {tag} registered with cryptographic SHA-256 seal ({server_hash[:16]}...).",
                    event_payload={
                        "evidence_tag": tag,
                        "sha256_hash": server_hash,
                        "storage_path": storage_path,
                        "file_size_bytes": file_size
                    }
                )
            except Exception as audit_err:
                print(f"Audit log append notice: {audit_err}")

            return EvidenceDetailResponse(
                id=evidence_id,
                evidence_tag=tag,
                case_id=case_uuid,
                evidence_type=evidence_type,
                description=description,
                seal_number=seal,
                current_location=loc,
                current_version=1,
                storage_path=storage_path,
                sha256_hash=server_hash,
                file_size_bytes=file_size,
                mime_type=mime_type,
                verification_status="Verified",
                examination_status="Pending Examination",
                status="Secured",
                created_at=datetime.now(timezone.utc)
            )

        except Exception as e:
            # Transactional Compensation: Delete uploaded file from private storage
            self.storage.delete_file(bucket=self.BUCKET_NAME, path=storage_path)
            if created_in_db:
                self.evidence_repo.delete_evidence(evidence_id)
            raise AppException(
                status_code=500,
                code="EVIDENCE_CREATION_FAILED",
                message=f"Failed to deposit evidence exhibit: {str(e)}"
            )

    def create_evidence_version(
        self,
        evidence_id: str,
        file_bytes: bytes,
        original_filename: str,
        change_reason: str,
        current_user: AuthenticatedUser,
        mime_type: str = "application/octet-stream",
        metadata: Optional[Dict[str, Any]] = None
    ) -> EvidenceVersionResponse:
        """
        Evidence Version Replacement Workflow:
        1. Validates user RBAC role (Inspector, Forensic Officer, Admin).
        2. Resolves existing evidence record.
        3. Validates uploaded file bytes (non-empty, <= 50MB).
        4. Calculates new authoritative SHA-256 digest from raw bytes.
        5. Detects duplicate uploads: if new SHA-256 is identical to the current active
           version's SHA-256, rejects with 409 Conflict to preserve forensic chain integrity.
        6. Determines next sequential version number.
        7. Generates safe deterministic storage path.
        8. Uploads new file to private Supabase Storage.
        9. Appends immutable snapshot to `evidence_versions`.
        10. Updates current pointer and metadata in `evidence`.
        11. Appends version update block to `chain_of_custody_transfers`.
        12. Records immutable audit entry in `audit_logs`.
        """
        # Step 1: Validate Role
        if current_user.role not in (Role.INSPECTOR, Role.FORENSIC_OFFICER, Role.ADMIN):
            raise ForbiddenException("Only Police Inspectors, Forensic Examiners, and Administrators may upload evidence versions.")

        # Step 2: Resolve Evidence
        evidence = self.evidence_repo.get_by_id(evidence_id)
        if not evidence:
            evidence = self.evidence_repo.get_by_tag(evidence_id)
        if not evidence:
            raise NotFoundException(f"Evidence with ID or tag '{evidence_id}' does not exist.")

        ev_uuid = str(evidence["id"])
        case_uuid = str(evidence["case_id"])

        if not self.case_repo.user_has_case_access(case_uuid, current_user.id, current_user.role):
            raise ForbiddenException("Access denied. You do not have jurisdiction over this evidence exhibit.")

        # Step 3: Validate File
        if not file_bytes or len(file_bytes) == 0:
            raise ValidationException("Version replacement file payload cannot be empty.")
        if len(file_bytes) > self.MAX_FILE_SIZE_BYTES:
            raise ValidationException(f"File size ({len(file_bytes)} bytes) exceeds the statutory 50 MB threshold.")
        if not change_reason or not change_reason.strip():
            raise ValidationException("A formal change reason or forensic justification is required when submitting a new version.")

        # Step 4: Calculate Authoritative SHA-256 Digest
        server_hash = self.calculate_file_hash(file_bytes)
        file_size = len(file_bytes)
        safe_filename = sanitize_filename(original_filename)

        # Step 5: Duplicate Detection Handling
        current_hash = evidence.get("sha256_hash")
        if current_hash and server_hash.lower() == current_hash.lower():
            raise AppException(
                status_code=409,
                code="IDENTICAL_VERSION_REJECTED",
                message=(
                    f"Uploaded file is byte-for-byte identical to the current active evidence version "
                    f"(SHA-256: {server_hash}). Duplicate version creation rejected to preserve forensic integrity."
                )
            )

        # Step 6: Determine Next Sequential Version
        latest_version_record = self.version_repo.get_latest_version(ev_uuid)
        next_ver_num = (latest_version_record["version_number"] + 1) if latest_version_record else (evidence.get("current_version", 1) + 1)

        # Step 7: Generate Deterministic Storage Path
        storage_path = generate_evidence_storage_path(
            case_id=case_uuid,
            evidence_id=ev_uuid,
            version_number=next_ver_num,
            filename=safe_filename
        )

        # Step 8: Upload to Private Storage
        self.storage.upload_file_bytes(
            bucket=self.BUCKET_NAME,
            path=storage_path,
            file_bytes=file_bytes,
            content_type=mime_type
        )

        try:
            # Step 9: Append to Immutable Version Ledger
            version_payload = {
                "evidence_id": ev_uuid,
                "version_number": next_ver_num,
                "storage_path": storage_path,
                "original_filename": safe_filename,
                "mime_type": mime_type,
                "file_size_bytes": file_size,
                "sha256_hash": server_hash,
                "change_reason": change_reason.strip(),
                "created_by": current_user.id,
                "metadata": metadata or {}
            }
            version_record = self.version_repo.create_version(version_payload)

            # Step 10: Update Current Active Evidence Metadata
            self.evidence_repo.update_current_version_metadata(
                evidence_id=ev_uuid,
                current_version=next_ver_num,
                storage_path=storage_path,
                sha256_hash=server_hash,
                file_size_bytes=file_size,
                mime_type=mime_type
            )
            self.evidence_repo.update_verification_status(ev_uuid, "Verified")

            # Step 11: Append to Chain of Custody
            try:
                self.custody_repo.append_transfer(
                    evidence_id=ev_uuid,
                    to_custodian_id=current_user.id,
                    to_location=evidence.get("current_location", "Station Malkhana Vault Room #2"),
                    from_location=evidence.get("current_location", "Station Malkhana Vault Room #2"),
                    transfer_reason=f"Evidence Version Increment to v{next_ver_num}: {change_reason.strip()}",
                    seal_intact=True,
                    created_by=current_user.id
                )
            except Exception as custody_err:
                print(f"Custody version log notice: {custody_err}")

            # Step 12: Record Immutable Audit Log Entry
            try:
                self.audit_repo.append_log(
                    action="EVIDENCE_VERSION_CREATED",
                    module="Evidence",
                    entity_type="Evidence",
                    entity_id=ev_uuid,
                    case_id=case_uuid,
                    evidence_id=ev_uuid,
                    user_id=current_user.id,
                    role=current_user.role.value,
                    result="Success",
                    description=f"Evidence {evidence['evidence_tag']} updated to v{next_ver_num}. Reason: {change_reason.strip()}.",
                    event_payload={
                        "previous_version": evidence.get("current_version", 1),
                        "new_version": next_ver_num,
                        "previous_hash": current_hash,
                        "new_hash": server_hash,
                        "storage_path": storage_path
                    }
                )
            except Exception as audit_err:
                print(f"Audit version log notice: {audit_err}")

            return EvidenceVersionResponse(
                id=str(version_record["id"]),
                evidence_id=str(version_record["evidence_id"]),
                version_number=version_record["version_number"],
                storage_path=version_record["storage_path"],
                original_filename=version_record["original_filename"],
                mime_type=version_record.get("mime_type", mime_type),
                file_size_bytes=version_record["file_size_bytes"],
                sha256_hash=version_record["sha256_hash"],
                change_reason=version_record.get("change_reason", change_reason),
                metadata=version_record.get("metadata", {}),
                created_by=str(version_record["created_by"]) if version_record.get("created_by") else None,
                created_at=version_record["created_at"]
            )

        except Exception as e:
            # Transactional compensation: delete uploaded version file
            self.storage.delete_file(bucket=self.BUCKET_NAME, path=storage_path)
            raise AppException(
                status_code=500,
                code="VERSION_CREATION_FAILED",
                message=f"Failed to record evidence version snapshot: {str(e)}"
            )

    def verify_evidence_integrity(
        self,
        evidence_id: str,
        current_user: AuthenticatedUser,
        version_id_or_number: Optional[Union[str, int]] = None
    ) -> IntegrityVerificationResponse:
        """
        Cryptographic Integrity & Tamper Detection Engine:
        1. Authenticates user and enforces access permissions.
        2. Identifies evidence and target historical snapshot.
        3. Retrieves the trusted stored hash from database.
        4. Downloads actual binary file bytes from private Supabase Storage.
        5. Computes authoritative SHA-256 over raw downloaded bytes.
        6. Compares calculated digest with trusted recorded hash using constant-time comparison.
        7. If MATCH: marks status as 'Verified', logs successful audit event.
        8. If MISMATCH (Tamper Detection!):
           - Preserves original trusted hash (never overwrites or 'repairs').
           - Updates database verification_status to 'Tampered'.
           - Records high-severity Security Audit violation event.
           - Returns structured MISMATCH response without exposing private storage secrets.
        """
        # Step 1: Resolve Evidence
        evidence = self.evidence_repo.get_by_id(evidence_id)
        if not evidence:
            evidence = self.evidence_repo.get_by_tag(evidence_id)
        if not evidence:
            raise NotFoundException(f"Evidence with ID or tag '{evidence_id}' does not exist.")

        ev_uuid = str(evidence["id"])
        case_uuid = str(evidence["case_id"])

        if not self.case_repo.user_has_case_access(case_uuid, current_user.id, current_user.role):
            raise ForbiddenException("Access denied. You do not have jurisdiction over this evidence exhibit.")

        # Step 2: Determine Target Snapshot & Trusted Hash
        version_record = None
        target_version_number = evidence.get("current_version", 1)
        storage_path = evidence.get("storage_path")
        trusted_hash = evidence.get("sha256_hash")
        version_id = None

        if version_id_or_number is not None:
            if isinstance(version_id_or_number, int) or (isinstance(version_id_or_number, str) and version_id_or_number.isdigit()):
                version_record = self.version_repo.get_version_by_number(ev_uuid, int(version_id_or_number))
            else:
                version_record = self.version_repo.get_by_id(str(version_id_or_number))

            if not version_record or str(version_record.get("evidence_id")) != ev_uuid:
                raise NotFoundException(f"Version '{version_id_or_number}' not found for evidence '{evidence_id}'.")

            version_id = str(version_record["id"])
            target_version_number = version_record["version_number"]
            storage_path = version_record["storage_path"]
            trusted_hash = version_record["sha256_hash"]

        # Step 3: Handle Legacy Uninitialized Records
        if not trusted_hash or not is_valid_sha256_hash(trusted_hash) or not storage_path:
            return IntegrityVerificationResponse(
                evidence_id=ev_uuid,
                evidence_tag=evidence["evidence_tag"],
                version_id=version_id,
                version_number=target_version_number,
                stored_hash=trusted_hash or "UNINITIALIZED_LEGACY",
                calculated_hash="N/A",
                integrity_status="UNINITIALIZED_LEGACY",
                is_match=False,
                verified_by=current_user.email,
                details="Legacy exhibit record lacks a verified cryptographic SHA-256 seal baseline or storage reference. Requires formal reconciliation."
            )

        # Step 4: Download Actual File Bytes from Private Storage
        try:
            stored_bytes = self.storage.download_file_bytes(bucket=self.BUCKET_NAME, path=storage_path)
        except Exception as dl_err:
            # File missing in storage is an integrity violation!
            self.evidence_repo.update_verification_status(ev_uuid, "Tampered")
            try:
                self.audit_repo.append_log(
                    action="EVIDENCE_STORAGE_MISSING",
                    module="Security",
                    entity_type="Evidence",
                    entity_id=ev_uuid,
                    case_id=case_uuid,
                    evidence_id=ev_uuid,
                    user_id=current_user.id,
                    role=current_user.role.value,
                    result="Failure",
                    description=f"SECURITY ALERT: Stored evidence file missing from private vault for {evidence['evidence_tag']}: {str(dl_err)}."
                )
            except Exception:
                pass

            return IntegrityVerificationResponse(
                evidence_id=ev_uuid,
                evidence_tag=evidence["evidence_tag"],
                version_id=version_id,
                version_number=target_version_number,
                stored_hash=trusted_hash,
                calculated_hash="FILE_NOT_FOUND",
                integrity_status="MISMATCH",
                is_match=False,
                verified_by=current_user.email,
                details=f"INTEGRITY FAILURE: Evidence file is missing from private storage vault ({str(dl_err)})."
            )

        # Step 5: Calculate Actual SHA-256 Digest from Downloaded Bytes
        calculated_hash = self.calculate_file_hash(stored_bytes)

        # Step 6: Constant-Time Comparison
        is_match = verify_sha256(stored_bytes, trusted_hash)

        if is_match:
            # Step 7A: Integrity MATCH
            self.evidence_repo.update_verification_status(ev_uuid, "Verified")
            try:
                self.audit_repo.append_log(
                    action="EVIDENCE_INTEGRITY_VERIFIED",
                    module="Evidence",
                    entity_type="Evidence",
                    entity_id=ev_uuid,
                    case_id=case_uuid,
                    evidence_id=ev_uuid,
                    user_id=current_user.id,
                    role=current_user.role.value,
                    result="Success",
                    description=f"Cryptographic SHA-256 verification MATCH for {evidence['evidence_tag']} v{target_version_number}.",
                    event_payload={
                        "version_number": target_version_number,
                        "stored_hash": trusted_hash,
                        "calculated_hash": calculated_hash,
                        "status": "VERIFIED"
                    }
                )
            except Exception as e:
                print(f"Audit verified log notice: {e}")

            return IntegrityVerificationResponse(
                evidence_id=ev_uuid,
                evidence_tag=evidence["evidence_tag"],
                version_id=version_id,
                version_number=target_version_number,
                stored_hash=trusted_hash,
                calculated_hash=calculated_hash,
                integrity_status="VERIFIED",
                is_match=True,
                verified_by=current_user.email,
                details="Authoritative cryptographic SHA-256 matches stored bytes perfectly. Integrity check PASSED."
            )
        else:
            # Step 7B: TAMPER DETECTED!
            # Preserve trusted hash, mark status as 'Tampered', log high-priority security audit
            self.evidence_repo.update_verification_status(ev_uuid, "Tampered")
            try:
                self.audit_repo.append_log(
                    action="EVIDENCE_INTEGRITY_MISMATCH",
                    module="Security",
                    entity_type="Evidence",
                    entity_id=ev_uuid,
                    case_id=case_uuid,
                    evidence_id=ev_uuid,
                    user_id=current_user.id,
                    role=current_user.role.value,
                    result="Failure",
                    description=(
                        f"CRITICAL SECURITY ALERT: Cryptographic SHA-256 MISMATCH detected for {evidence['evidence_tag']} "
                        f"v{target_version_number}. Stored trusted seal: {trusted_hash}, Computed actual bytes hash: {calculated_hash}."
                    ),
                    event_payload={
                        "version_number": target_version_number,
                        "stored_trusted_hash": trusted_hash,
                        "computed_bytes_hash": calculated_hash,
                        "status": "MISMATCH"
                    }
                )
            except Exception as e:
                print(f"Audit tamper log notice: {e}")

            return IntegrityVerificationResponse(
                evidence_id=ev_uuid,
                evidence_tag=evidence["evidence_tag"],
                version_id=version_id,
                version_number=target_version_number,
                stored_hash=trusted_hash,
                calculated_hash=calculated_hash,
                integrity_status="MISMATCH",
                is_match=False,
                verified_by=current_user.email,
                details=(
                    f"TAMPER EXCEPTION: Stored file bytes do NOT match recorded cryptographic SHA-256 seal. "
                    f"Expected: {trusted_hash}, Actual: {calculated_hash}."
                )
            )

    def list_evidence(
        self,
        current_user: AuthenticatedUser,
        case_id: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Lists evidence exhibits accessible to the user.
        """
        resolved_case_id = None
        if case_id and case_id != "All":
            case = self.case_repo.get_case(case_id)
            if not case:
                raise NotFoundException(f"Case '{case_id}' was not found.")
            resolved_case_id = str(case["id"])
            if not self.case_repo.user_has_case_access(resolved_case_id, current_user.id, current_user.role):
                raise ForbiddenException("Access denied. You do not have jurisdiction over this case's evidence.")

        return self.evidence_repo.list_evidence(case_id=resolved_case_id, limit=limit)

    def update_evidence(
        self,
        evidence_id: str,
        payload: Dict[str, Any],
        current_user: AuthenticatedUser
    ) -> Dict[str, Any]:
        """
        Updates evidence status, location, or notes.
        """
        evidence = self.evidence_repo.get_by_id(evidence_id) or self.evidence_repo.get_by_tag(evidence_id)
        if not evidence:
            raise NotFoundException(f"Evidence '{evidence_id}' was not found.")

        case_id = str(evidence.get("case_id"))
        if not self.case_repo.user_has_case_access(case_id, current_user.id, current_user.role):
            raise ForbiddenException("Access denied. You do not have permission to modify this evidence.")

        allowed_fields = {"status", "current_location", "condition_notes", "examination_status"}
        safe_payload = {k: v for k, v in payload.items() if k in allowed_fields and v is not None}
        safe_payload["updated_at"] = datetime.now(timezone.utc).isoformat()

        updated = self.evidence_repo.update_evidence(str(evidence["id"]), safe_payload)

        try:
            self.audit_repo.append_log(
                action="EVIDENCE_STATUS_UPDATED",
                module="Evidence",
                entity_type="Evidence",
                entity_id=str(evidence["id"]),
                case_id=case_id,
                user_id=current_user.id,
                role=current_user.role.value,
                result="Success",
                description=f"Evidence {evidence.get('evidence_tag')} updated: {list(safe_payload.keys())}",
                event_payload={"updates": safe_payload}
            )
        except Exception as audit_err:
            print(f"Evidence update audit notice: {audit_err}")

        return updated or evidence

    def get_evidence_download_url(
        self,
        evidence_id: str,
        current_user: AuthenticatedUser,
        version_id_or_number: Optional[str] = None,
        expires_in: int = 60
    ) -> str:
        """
        Generates a short-lived authorized download signed URL for active or historical evidence version.
        """
        evidence = self.evidence_repo.get_by_id(evidence_id) or self.evidence_repo.get_by_tag(evidence_id)
        if not evidence:
            raise NotFoundException(f"Evidence '{evidence_id}' was not found.")

        case_id = str(evidence.get("case_id"))
        if not self.case_repo.user_has_case_access(case_id, current_user.id, current_user.role):
            raise ForbiddenException("Access denied to this evidence file.")

        storage_path = evidence.get("storage_path")
        if version_id_or_number:
            ver = self.get_evidence_version(str(evidence["id"]), version_id_or_number)
            storage_path = ver.storage_path

        if not storage_path:
            raise NotFoundException("Storage path for evidence exhibit not found.")

        url = self.storage.create_signed_url(bucket=self.BUCKET_NAME, path=storage_path, expires_in=expires_in)

        try:
            self.audit_repo.append_log(
                action="EVIDENCE_FILE_DOWNLOADED",
                module="Evidence",
                entity_type="Evidence",
                entity_id=str(evidence["id"]),
                case_id=case_id,
                user_id=current_user.id,
                role=current_user.role.value,
                result="Success",
                description=f"Signed URL generated for exhibit {evidence.get('evidence_tag')}",
                event_payload={"expires_in": expires_in}
            )
        except Exception as audit_err:
            print(f"Evidence download audit notice: {audit_err}")

        return url


evidence_service = EvidenceService()

