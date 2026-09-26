from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AuditLogResponse(BaseModel):
    id: str = Field(..., description="Audit record UUID")
    timestamp: datetime = Field(..., description="Immutable event timestamp")
    user_id: Optional[str] = None
    role: str = Field(default="System", description="System role of actor")
    action: str = Field(..., description="Action identifier (e.g. EVIDENCE_CREATED)")
    module: str = Field(..., description="Audit module category")
    entity_type: str
    entity_id: Optional[str] = None
    case_id: Optional[str] = None
    evidence_id: Optional[str] = None
    result: str = Field(default="Success", description="'Success', 'Warning', 'Failure'")
    description: str
    record_hash: str = Field(..., description="Cryptographic record seal")
    event_payload: Dict[str, Any] = Field(default_factory=dict)


class AuditLogListResponse(BaseModel):
    total: int
    data: List[AuditLogResponse]
