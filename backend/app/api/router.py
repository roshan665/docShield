from fastapi import APIRouter
from backend.app.api.routes import health, auth, evidence, custody, audit, forensic, legal, cases, documents, profiles

api_router = APIRouter()

# Register route modules under /api/v1
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(cases.router)
api_router.include_router(documents.router)
api_router.include_router(evidence.router)
api_router.include_router(custody.router)
api_router.include_router(audit.router)
api_router.include_router(forensic.router)
api_router.include_router(legal.router)
api_router.include_router(profiles.router)

