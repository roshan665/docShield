from typing import Any, Optional
from fastapi import status


class AppException(Exception):
    """Base exception for application errors with structured error payloads."""
    def __init__(
        self,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        code: str = "INTERNAL_ERROR",
        message: str = "An unexpected error occurred.",
        details: Optional[Any] = None
    ):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details
        super().__init__(self.message)


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Authentication required.", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message=message,
            details=details
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "Insufficient permissions for this operation.", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
            message=message,
            details=details
        )


class NotFoundException(AppException):
    def __init__(self, message: str = "Requested resource not found.", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            message=message,
            details=details
        )


class ConflictException(AppException):
    def __init__(self, message: str = "Resource conflict detected.", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="CONFLICT",
            message=message,
            details=details
        )


class ValidationException(AppException):
    def __init__(self, message: str = "Validation failed.", details: Optional[Any] = None):
        super().__init__(
            status_code=422,
            code="VALIDATION_ERROR",
            message=message,
            details=details
        )



class InternalServerException(AppException):
    def __init__(self, message: str = "Internal server error.", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="INTERNAL_SERVER_ERROR",
            message=message,
            details=details
        )

