from fastapi import APIRouter, Depends
from backend.app.api.dependencies import get_current_user, require_any_role
from backend.app.core.permissions import Role
from backend.app.schemas.auth import AuthenticatedUser
from backend.app.schemas.common import StandardResponse
from backend.app.schemas.custody import (
    CustodyBlockResponse,
    CustodyTimelineResponse,
    CustodyTransferRequest
)
from backend.app.services.custody_service import custody_service

router = APIRouter(prefix="/evidence", tags=["Chain of Custody"])


@router.get("/{evidence_id}/custody", response_model=StandardResponse[CustodyTimelineResponse])
def get_evidence_custody_timeline(
    evidence_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> StandardResponse[CustodyTimelineResponse]:
    """
    Retrieves the chronological, append-only chain of custody timeline for an exhibit.
    Verifies unbroken cryptographic block hash chaining.
    """
    timeline = custody_service.get_timeline(evidence_id=evidence_id, current_user=current_user)
    return StandardResponse(success=True, data=timeline)


@router.post("/{evidence_id}/custody/transfer", response_model=StandardResponse[CustodyBlockResponse], status_code=201)
def transfer_evidence_custody(
    evidence_id: str,
    payload: CustodyTransferRequest,
    current_user: AuthenticatedUser = Depends(
        require_any_role([Role.INSPECTOR, Role.FORENSIC_OFFICER, Role.ADMIN])
    )
) -> StandardResponse[CustodyBlockResponse]:
    """
    Logs an immutable custody transfer handover block:
    - Derives custodian actor identity from authenticated backend JWT
    - Generates sequential step number and chained block hash
    - Updates active exhibit location and custodian
    - Emits audit log entry
    """
    block = custody_service.transfer_custody(
        evidence_id=evidence_id,
        payload=payload,
        current_user=current_user
    )
    return StandardResponse(success=True, data=block)
