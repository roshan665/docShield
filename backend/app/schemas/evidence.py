from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator
from backend.app.core.crypto import is_valid_sha256_hash


class EvidenceVersionBase(BaseModel):
    version_number: int = Field(..., ge=1, description="Positive version sequence number")
    storage_path: str = Field(..., description="Relative path in evidence-vault storage bucket")
    original_filename: str = Field(..., description="Original client exhibit filename")
    mime_type: str = Field(default="application/octet-stream", description="Detected MIME type")
    file_size_bytes: int = Field(..., ge=0, description="Exact file size in bytes")
    sha256_hash: str = Field(..., description="Authoritative 64-character SHA-256 hexadecimal digest")
    change_reason: str = Field(default="Initial Exhibit Seizure Deposition", description="Forensic audit reason")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Diagnostic/forensic metadata")

    @field_validator("sha256_hash")
    @classmethod
    def validate_hash_format(cls, v: str) -> str:
        if not is_valid_sha256_hash(v):
            raise ValueError(f"Invalid SHA-256 hash format '{v}'. Must be exactly 64 hexadecimal characters.")
        return v.lower()


class EvidenceVersionCreate(EvidenceVersionBase):
    evidence_id: str = Field(..., description="Parent evidence UUID")
    created_by: Optional[str] = Field(None, description="Authenticated officer UUID")


class EvidenceVersionResponse(EvidenceVersionBase):
    id: str = Field(..., description="Unique version record UUID")
    evidence_id: str = Field(..., description="Parent evidence UUID")
    created_by: Optional[str] = None
    created_at: datetime


class EvidenceSummary(BaseModel):
    id: str = Field(..., description="Evidence UUID")
    evidence_tag: str = Field(..., description="Unique statutory exhibit tag (e.g. EV-2024-001)")
    case_id: str = Field(..., description="Parent case UUID")
    evidence_type: str = Field(..., description="Physical, Digital, Firearm, Biological, etc.")
    description: str
    seal_number: str
    current_location: str
    current_version: int = Field(default=1, ge=1)
    storage_path: Optional[str] = None
    sha256_hash: Optional[str] = None
    verification_status: str = Field(default="Verified")
    status: str = Field(default="Secured")
    versions: List[EvidenceVersionResponse] = Field(default_factory=list)


class EvidenceVersionListResponse(BaseModel):
    success: bool = True
    evidence_id: str
    total_versions: int
    data: List[EvidenceVersionResponse]


class IntegrityVerificationResponse(BaseModel):
    evidence_id: str = Field(..., description="Evidence UUID")
    evidence_tag: Optional[str] = Field(None, description="Statutory exhibit tag")
    version_id: Optional[str] = Field(None, description="Version UUID if specific version verified")
    version_number: Optional[int] = Field(None, description="Version sequence number")
    stored_hash: str = Field(..., description="Authoritative trusted SHA-256 hash recorded in ledger")
    calculated_hash: str = Field(..., description="Calculated SHA-256 hash from actual downloaded storage bytes")
    integrity_status: str = Field(..., description="'VERIFIED' on match, or 'MISMATCH' on tampering")
    is_match: bool = Field(..., description="True if byte-level hash matches recorded trusted hash")
    verified_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Timestamp of cryptographic verification")
    verified_by: Optional[str] = Field(None, description="Officer ID or badge of verifier")
    details: str = Field(..., description="Cryptographic diagnosis and custody note")


class EvidenceDetailResponse(BaseModel):
    id: str = Field(..., description="Evidence UUID")
    evidence_tag: str = Field(..., description="Statutory exhibit tag")
    case_id: str = Field(..., description="Parent case UUID")
    evidence_type: str = Field(..., description="Physical, Digital, Firearm, Biological, etc.")
    description: str
    seal_number: str
    current_location: str
    current_version: int = Field(default=1, ge=1)
    storage_path: Optional[str] = None
    sha256_hash: Optional[str] = None
    file_size_bytes: int = Field(default=0, ge=0)
    mime_type: str = Field(default="application/octet-stream")
    verification_status: str = Field(default="Verified")
    examination_status: str = Field(default="Pending Examination")
    status: str = Field(default="Secured")
    created_at: Optional[datetime] = None
