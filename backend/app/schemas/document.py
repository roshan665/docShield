from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DocumentCreate(BaseModel):
    case_id: str = Field(..., description="UUID or Case Number")
    document_name: str
    document_type: str = Field(default="Other", description="FIR, Panchnama, Statement, Medical, Forensic, ChargeSheet, Other")
    file_size_bytes: int = Field(default=0, ge=0)
    file_format: Optional[str] = "pdf"
    issuing_authority: Optional[str] = "Bhopal Police"


class DocumentReviewUpdate(BaseModel):
    legal_review_status: str = Field(..., description="Pending Review, Scrutiny Cleared, Correction Requested")
    scrutiny_notes: Optional[str] = None


class DocumentResponse(BaseModel):
    id: str
    case_id: str
    document_name: str
    document_type: str
    storage_bucket: str = "case-documents"
    storage_path: Optional[str] = None
    file_size_bytes: int = 0
    file_format: Optional[str] = "pdf"
    sha256_hash: str
    verification_status: str = "Verified"
    legal_review_status: str = "Pending Review"
    issuing_authority: Optional[str] = "Bhopal Police"
    uploaded_by: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    cases: Optional[Dict[str, Any]] = None
    uploader: Optional[Dict[str, Any]] = None


class DocumentVerifyResponse(BaseModel):
    document_id: str
    document_name: str
    is_match: bool
    stored_hash: str
    calculated_hash: str
    integrity_status: str
    verified_at: str
