from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    badge_id: Optional[str] = None
    department: Optional[str] = None
    is_active: Optional[bool] = None


class ProfileResponse(BaseModel):
    id: str
    full_name: Optional[str] = None
    role: str
    badge_id: Optional[str] = None
    department: Optional[str] = None
    is_active: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
