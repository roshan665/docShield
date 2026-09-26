from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from backend.app.core.permissions import Role


class UserProfile(BaseModel):
    id: str = Field(..., description="Unique profile UUID (matches auth.users.id)")
    email: Optional[str] = Field(None, description="Official email address")
    full_name: str = Field(..., description="Officer or Administrator full legal name")
    badge_id: Optional[str] = Field(None, description="Official statutory badge identifier")
    role: Role = Field(..., description="Assigned system role with RBAC scope")
    police_station: Optional[str] = Field(None, description="Jurisdictional police station or laboratory unit")
    phone_number: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None


class AuthenticatedUser(BaseModel):
    id: str = Field(..., description="Supabase Auth UID")
    email: Optional[str] = None
    role: Role = Field(..., description="Enforced system role derived from database profile")
    profile: UserProfile = Field(..., description="Complete user profile details")


class UserProfileResponse(BaseModel):
    success: bool = True
    data: AuthenticatedUser
