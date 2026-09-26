from typing import Generic, Optional, TypeVar, Any
from pydantic import BaseModel, Field

T = TypeVar("T")


class ErrorDetail(BaseModel):
    code: str = Field(..., description="Machine-readable error identifier")
    message: str = Field(..., description="Human-readable error description")
    details: Optional[Any] = Field(None, description="Optional diagnostic context")


class ErrorResponse(BaseModel):
    success: bool = Field(default=False)
    error: ErrorDetail


class StandardResponse(BaseModel, Generic[T]):
    success: bool = Field(default=True)
    data: T
    message: Optional[str] = None
