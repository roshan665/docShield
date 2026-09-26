from fastapi import APIRouter
from backend.app.core.config import settings
from backend.app.schemas.health import HealthResponse, HealthData

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """
    Health check endpoint indicating that the FastAPI backend is online and running.
    """
    return HealthResponse(
        success=True,
        data=HealthData(
            status="healthy",
            version=settings.VERSION,
            environment=settings.ENVIRONMENT,
            supabase_connected=settings.is_supabase_configured
        )
    )
