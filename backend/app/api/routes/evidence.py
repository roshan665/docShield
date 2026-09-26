import json
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from backend.app.api.dependencies import get_current_user, require_any_role
from backend.app.core.permissions import Role
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.common import StandardResponse
from backend.app.schemas.evidence import (
    EvidenceDetailResponse,
    EvidenceSummary,
    EvidenceVersionListResponse,
    EvidenceVersionResponse,
    IntegrityVerificationResponse
)
from backend.app.services.evidence_service import evidence_service
from backend.app.utils.errors import NotFoundException

router = APIRouter(prefix="/evidence", tags=["Evidence & Integrity Versioning"])


@router.get("", response_model=StandardResponse[List[Dict[str, Any]]])
def list_evidence(
    case_id: Optional[str] = Query(None, description="Filter by Case UUID or Case Number"),
    limit: int = Query(100, ge=1, le=500),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[List[Dict[str, Any]]]:
    """
    Lists evidence exhibits accessible to the authenticated user.
    """
    items = evidence_service.list_evidence(current_user=current_user, case_id=case_id, limit=limit)
    return StandardResponse(success=True, data=items)


@router.post("", response_model=StandardResponse[EvidenceDetailResponse], status_code=201)
async def create_evidence(
    file: UploadFile = File(..., description="Binary exhibit file to be cryptographically hashed and secured"),
    case_id: str = Form(..., description="UUID or Case Number of the parent investigation case"),
    description: str = Form(..., description="Statutory description of the seized exhibit"),
    evidence_type: str = Form("Physical", description="Physical, Digital, Firearm, Biological, etc."),
    seal_number: Optional[str] = Form(None, description="Official tamper-evident police seal number"),
    current_location: Optional[str] = Form("Station Malkhana Vault Room #2", description="Vault locker location"),
    seizure_memo_ref: Optional[str] = Form(None, description="Panchnama seizure memo reference"),
    condition_notes: Optional[str] = Form(None, description="Physical state upon seizure"),
    evidence_tag: Optional[str] = Form(None, description="Statutory tag (auto-generated if omitted)"),
    client_hash: Optional[str] = Form(None, description="Untrusted client-provided hash (strictly ignored)"),
    current_user: AuthenticatedUser = Depends(
        require_any_role([Role.INSPECTOR, Role.FORENSIC_OFFICER, Role.ADMIN])
    )
) -> StandardResponse[EvidenceDetailResponse]:
    """
    Ingests and seals a new evidence exhibit:
    - Reads raw file bytes directly from upload stream
    - Calculates authoritative SHA-256 server-side
    - Deposits file into private Supabase Storage
    - Generates immutable Version 1 snapshot
    - Links to parent investigation case
    - Appends Genesis block to Chain of Custody and Audit Trail
    """
    file_bytes = await file.read()
    evidence_record = evidence_service.create_evidence(
        case_id=case_id,
        description=description,
        file_bytes=file_bytes,
        original_filename=file.filename or "exhibit_file.bin",
        mime_type=file.content_type or "application/octet-stream",
        current_user=current_user,
        evidence_type=evidence_type,
        seal_number=seal_number,
        current_location=current_location,
        seizure_memo_ref=seizure_memo_ref,
        condition_notes=condition_notes,
        evidence_tag=evidence_tag,
        client_provided_hash=client_hash
    )
    return StandardResponse(success=True, data=evidence_record)


@router.post("/{evidence_id}/versions", response_model=StandardResponse[EvidenceVersionResponse], status_code=201)
async def upload_evidence_version(
    evidence_id: str,
    file: UploadFile = File(..., description="Replacement or updated evidence file"),
    change_reason: str = Form(..., description="Statutory forensic reason for version submission"),
    metadata: Optional[str] = Form(None, description="Optional diagnostic JSON metadata"),
    current_user: AuthenticatedUser = Depends(
        require_any_role([Role.INSPECTOR, Role.FORENSIC_OFFICER, Role.ADMIN])
    )
) -> StandardResponse[EvidenceVersionResponse]:
    """
    Uploads a new immutable version snapshot for an existing exhibit:
    - Validates that new bytes differ from the active version (rejects byte duplicates)
    - Computes new authoritative SHA-256 digest
    - Stores file under deterministic versioned path
    - Preserves historical version ledgers permanently
    - Logs custody and audit update events
    """
    file_bytes = await file.read()
    parsed_metadata = {}
    if metadata:
        try:
            parsed_metadata = json.loads(metadata)
        except Exception:
            parsed_metadata = {"raw": metadata}

    new_version = evidence_service.create_evidence_version(
        evidence_id=evidence_id,
        file_bytes=file_bytes,
        original_filename=file.filename or "version_file.bin",
        change_reason=change_reason,
        current_user=current_user,
        mime_type=file.content_type or "application/octet-stream",
        metadata=parsed_metadata
    )
    return StandardResponse(success=True, data=new_version)


@router.get("/{evidence_id}", response_model=StandardResponse[EvidenceSummary])
def get_evidence_details(
    evidence_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[EvidenceSummary]:
    """
    Returns active evidence details along with its historical cryptographic version ledger.
    """
    summary = evidence_service.get_evidence_with_versions(evidence_id)
    if not summary:
        raise NotFoundException(f"Evidence record '{evidence_id}' was not found.")
    return StandardResponse(success=True, data=summary)


@router.get("/{evidence_id}/versions", response_model=EvidenceVersionListResponse)
def get_evidence_versions(
    evidence_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> EvidenceVersionListResponse:
    """
    Retrieves the complete immutable version history for a specific evidence item.
    """
    versions = evidence_service.get_version_history(evidence_id)
    return EvidenceVersionListResponse(
        success=True,
        evidence_id=evidence_id,
        total_versions=len(versions),
        data=versions
    )


@router.get("/{evidence_id}/versions/{version_id_or_number}", response_model=StandardResponse[EvidenceVersionResponse])
def get_evidence_version(
    evidence_id: str,
    version_id_or_number: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[EvidenceVersionResponse]:
    """
    Retrieves a specific historical version snapshot by UUID or version sequence number.
    """
    version = evidence_service.get_evidence_version(evidence_id, version_id_or_number)
    return StandardResponse(success=True, data=version)


@router.post("/{evidence_id}/verify-integrity", response_model=StandardResponse[IntegrityVerificationResponse])
def verify_current_evidence_integrity(
    evidence_id: str,
    current_user: AuthenticatedUser = Depends(
        require_any_role([Role.INSPECTOR, Role.FORENSIC_OFFICER, Role.LEGAL_OFFICER, Role.ADMIN])
    )
) -> StandardResponse[IntegrityVerificationResponse]:
    """
    Performs server-side cryptographic SHA-256 byte verification on the active evidence version:
    - Downloads actual raw bytes from private Supabase Storage
    - Computes live SHA-256 digest
    - Constant-time comparison against recorded trusted seal
    - Detects tampering and triggers security violation audit if mismatched
    """
    result = evidence_service.verify_evidence_integrity(
        evidence_id=evidence_id,
        current_user=current_user
    )
    return StandardResponse(success=True, data=result)


@router.post("/{evidence_id}/versions/{version_id_or_number}/verify", response_model=StandardResponse[IntegrityVerificationResponse])
def verify_specific_version_integrity(
    evidence_id: str,
    version_id_or_number: str,
    current_user: AuthenticatedUser = Depends(
        require_any_role([Role.INSPECTOR, Role.FORENSIC_OFFICER, Role.LEGAL_OFFICER, Role.ADMIN])
    )
) -> StandardResponse[IntegrityVerificationResponse]:
    """
    Performs server-side cryptographic SHA-256 byte verification on a specific historical version snapshot:
    - Downloads version-specific file bytes from private storage
    - Verifies byte hash matches historical ledger record
    """
    result = evidence_service.verify_evidence_integrity(
        evidence_id=evidence_id,
        current_user=current_user,
        version_id_or_number=version_id_or_number
    )
    return StandardResponse(success=True, data=result)


@router.get("/{evidence_id}/download", response_model=StandardResponse[Dict[str, str]])
def get_evidence_download_url(
    evidence_id: str,
    version: Optional[str] = Query(None, description="Specific historical version number or UUID"),
    expires_in: int = Query(60, ge=10, le=3600),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[Dict[str, str]]:
    """
    Generates a short-lived signed URL for authorized evidence file download.
    """
    url = evidence_service.get_evidence_download_url(
        evidence_id=evidence_id,
        current_user=current_user,
        version_id_or_number=version,
        expires_in=expires_in
    )
    return StandardResponse(success=True, data={"signed_url": url, "expires_in_seconds": str(expires_in)})


@router.patch("/{evidence_id}", response_model=StandardResponse[Dict[str, Any]])
def update_evidence(
    evidence_id: str,
    payload: Dict[str, Any],
    current_user: AuthenticatedUser = Depends(
        require_any_role([Role.INSPECTOR, Role.FORENSIC_OFFICER, Role.ADMIN])
    )
) -> StandardResponse[Dict[str, Any]]:
    """
    Updates evidence status, vault location, or examination status.
    """
    updated = evidence_service.update_evidence(evidence_id, payload, current_user)
    return StandardResponse(success=True, data=updated)

