import os
import sys
from pathlib import Path

# Ensure both repository root and backend directory are always in sys.path
_current_file = Path(__file__).resolve()
_backend_dir = _current_file.parent.parent  # backend/
_repo_root = _backend_dir.parent            # repo root

for _p in [str(_repo_root), str(_backend_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

import logging
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.core.config import settings
from backend.app.api.router import api_router
from backend.app.utils.errors import AppException

# Setup centralized logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("docshield.api")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Authoritative FastAPI Backend for DocShield Evidence Integrity Platform",
    docs_url=f"{settings.API_V1_PREFIX}/docs" if not settings.is_production else None,
    redoc_url=f"{settings.API_V1_PREFIX}/redoc" if not settings.is_production else None,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json" if not settings.is_production else None,
)

# Configure CORS for Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Sanitize validation details to avoid leaking internal structures
    sanitized_errors = []
    for err in exc.errors():
        sanitized_errors.append({
            "field": ".".join(str(loc) for loc in err.get("loc", [])),
            "message": err.get("msg")
        })
    return JSONResponse(
        status_code=422,
        content={

            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request payload validation failed.",
                "details": sanitized_errors
            }
        }
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": "HTTP_ERROR",
                "message": str(exc.detail),
                "details": None
            }
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An internal server error occurred.",
                "details": None
            }
        }
    )


# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# Optional: Serve SPA frontend if SERVE_STATIC_FRONTEND is enabled (unified single-service deployment)
_dist_dir = _repo_root / "dist"
if settings.SERVE_STATIC_FRONTEND and _dist_dir.exists() and (_dist_dir / "index.html").exists():
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    _assets_dir = _dist_dir / "assets"
    if _assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = _dist_dir / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(_dist_dir / "index.html")


@app.get("/", tags=["Root"])
def root():
    if settings.SERVE_STATIC_FRONTEND and _dist_dir.exists() and (_dist_dir / "index.html").exists():
        from fastapi.responses import FileResponse
        return FileResponse(_dist_dir / "index.html")
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "api_v1": f"{settings.API_V1_PREFIX}/health",
        "documentation": f"{settings.API_V1_PREFIX}/docs"
    }
