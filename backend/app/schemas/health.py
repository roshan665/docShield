from datetime import datetime, timezone
from pydantic import BaseModel, Field


class HealthData(BaseModel):
    status: str = Field(default="healthy", description="Operational status of backend service")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    version: str = Field(..., description="API Version")
    environment: str = Field(..., description="Runtime environment")
    supabase_connected: bool = Field(..., description="Whether Supabase credentials are configured")


class HealthResponse(BaseModel):
    success: bool = True
    data: HealthData
