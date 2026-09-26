from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class CustodyTransferRequest(BaseModel):
    to_location: str = Field(..., description="Destination vault or laboratory location")
    transfer_reason: str = Field(..., description="Official statutory reason for custody handover")
    from_location: Optional[str] = Field(None, description="Current location (defaults to active location)")
    to_custodian_id: Optional[str] = Field(None, description="Recipient officer profile UUID (defaults to current user)")
    authority_memo_ref: Optional[str] = Field(None, description="Supervisory order / memo reference")
    seal_intact: bool = Field(True, description="Verification that tamper-evident seal is intact")


class CustodyBlockResponse(BaseModel):
    id: str = Field(..., description="Custody block UUID")
    evidence_id: str = Field(..., description="Associated exhibit UUID")
    step_number: int = Field(..., description="Sequential custody step number")
    from_location: str
    to_location: str
    transfer_reason: str
    seal_intact: bool
    previous_block_hash: Optional[str] = None
    block_hash: str = Field(..., description="Cryptographic block hash")
    from_custodian_id: Optional[str] = None
    to_custodian_id: str
    transfer_timestamp: Optional[datetime] = None
    created_at: Optional[datetime] = None


class CustodyTimelineResponse(BaseModel):
    evidence_id: str
    evidence_tag: Optional[str] = None
    total_steps: int
    is_unbroken_chain: bool = True
    timeline: List[CustodyBlockResponse]
