from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from backend.app.api.dependencies import get_current_user, require_any_role
from backend.app.core.permissions import Role
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.common import StandardResponse
from backend.app.schemas.document import DocumentReviewUpdate, DocumentVerifyResponse
from backend.app.services.document_service import document_service

router = APIRouter(prefix="/documents", tags=["Case Documents"])


@router.get("", response_model=StandardResponse[List[Dict[str, Any]]])
def list_documents(
    case_id: Optional[str] = Query(None, description="Filter by Case UUID or Case Number"),
    limit: int = Query(100, ge=1, le=500),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[List[Dict[str, Any]]]:
    """
    Lists statutory case documents accessible to the authenticated user.
    """
    docs = document_service.list_documents(current_user=current_user, case_id=case_id, limit=limit)
    return StandardResponse(success=True, data=docs)


@router.get("/{document_id}", response_model=StandardResponse[Dict[str, Any]])
def get_document_details(
    document_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[Dict[str, Any]]:
    """
    Retrieves metadata and verification status for a single case document.
    """
    doc = document_service.get_document(document_id, current_user)
    return StandardResponse(success=True, data=doc)


@router.post("", response_model=StandardResponse[Dict[str, Any]], status_code=201)
async def upload_document(
    file: UploadFile = File(..., description="Binary document file to be uploaded and sealed"),
    case_id: str = Form(..., description="UUID or Case Number of parent case"),
    document_type: str = Form("Other", description="FIR, Panchnama, Statement, Medical, Forensic, ChargeSheet, Other"),
    issuing_authority: Optional[str] = Form("Bhopal Police", description="Issuing Police Station or Agency"),
    current_user: AuthenticatedUser = Depends(
        require_any_role([Role.INSPECTOR, Role.LEGAL_OFFICER, Role.FORENSIC_OFFICER, Role.ADMIN])
    )
) -> StandardResponse[Dict[str, Any]]:
    """
    Uploads and cryptographically hashes a new case document:
    - Reads raw binary stream
    - Computes SHA-256 seal server-side
    - Deposits into private Supabase Storage
    - Records immutable document metadata and audit log
    """
    file_bytes = await file.read()
    created = document_service.create_document(
        case_id=case_id,
        file_bytes=file_bytes,
        original_filename=file.filename or "document.pdf",
        document_type=document_type,
        current_user=current_user,
        issuing_authority=issuing_authority
    )
    return StandardResponse(success=True, data=created)


@router.get("/{document_id}/download", response_model=StandardResponse[Dict[str, str]])
def get_document_download_url(
    document_id: str,
    expires_in: int = Query(60, ge=10, le=3600),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[Dict[str, str]]:
    """
    Generates a short-lived signed URL to securely download a private document.
    """
    url = document_service.get_document_download_url(document_id, current_user, expires_in=expires_in)
    return StandardResponse(success=True, data={"signed_url": url, "expires_in_seconds": str(expires_in)})


@router.patch("/{document_id}/review-status", response_model=StandardResponse[Dict[str, Any]])
def update_document_review_status(
    document_id: str,
    update_data: DocumentReviewUpdate,
    current_user: AuthenticatedUser = Depends(require_any_role([Role.LEGAL_OFFICER, Role.ADMIN]))
) -> StandardResponse[Dict[str, Any]]:
    """
    Updates legal review status ('Scrutiny Cleared', 'Correction Requested', 'Pending Review').
    Restricted to Legal Officers and Administrators.
    """
    updated = document_service.update_document_review_status(document_id, update_data, current_user)
    return StandardResponse(success=True, data=updated)


@router.post("/{document_id}/verify", response_model=StandardResponse[DocumentVerifyResponse])
def verify_document_integrity(
    document_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[DocumentVerifyResponse]:
    """
    Performs server-side cryptographic SHA-256 verification on stored document bytes.
    """
    result = document_service.verify_document_integrity(document_id, current_user)
    return StandardResponse(success=True, data=result)
