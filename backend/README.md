# DocShield FastAPI Backend

The authoritative business logic and security gateway for DocShield. Built with **FastAPI**, **Pydantic v2**, and **Python 3.12+**, connected to **Supabase** (PostgreSQL, Storage, and Auth).

---

## 1. Architecture Overview

```
Frontend (React 18 / Vite)
          │  HTTPS / Bearer JWT
          ▼
FastAPI Backend (app/main.py)
   ├── core/           # Configuration, Security, RBAC definitions
   ├── api/            # Versioned API routes & dependencies
   ├── schemas/        # Pydantic request/response validation
   ├── services/       # Authoritative business logic & workflows
   ├── repositories/   # Supabase database access layer
   ├── integrations/   # Supabase client & Storage abstraction
   └── utils/          # Standardized error handling
          │
          ▼
Supabase Platform
   ├── PostgreSQL (10 Tables, RLS, Append-Only Triggers)
   ├── Supabase Storage (Private Buckets: 60s Signed URLs)
   └── Supabase Auth (Identity Provider)
```

---

## 2. Environment Setup

### Prerequisites
- Python 3.12+ (or Astral `uv`)
- Supabase Project URL & Anon Key

### Virtual Environment & Dependencies

Using `uv` (recommended):
```bash
# Create virtual environment
uv venv backend/.venv --python 3.12

# Activate virtual environment
# Windows (PowerShell):
backend\.venv\Scripts\Activate.ps1
# Linux / macOS:
source backend/.venv/bin/activate

# Install dependencies
uv pip install -r backend/requirements.txt
```

Or using standard `pip`:
```bash
python -m venv backend/.venv
backend\.venv\Scripts\activate
pip install -r backend/requirements.txt
```

---

## 3. Environment Variables Configuration

Copy `backend/.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

| Variable | Description | Example |
| :--- | :--- | :--- |
| `ENVIRONMENT` | Runtime environment (`development` / `production`) | `development` |
| `HOST` | Server host binding | `0.0.0.0` |
| `PORT` | Server listening port | `8000` |
| `API_V1_PREFIX` | Base path for v1 endpoints | `/api/v1` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `http://localhost:5173` |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origins | `http://localhost:5173,http://127.0.0.1:5173` |
| `SUPABASE_URL` | Supabase project URL | `https://your-id.supabase.co` |
| `SUPABASE_ANON_KEY` | Public publishable anon key | `eyJhbGciOi...` |
| `SUPABASE_JWT_SECRET` | *Optional (server-side only)* JWT secret | `your-jwt-secret` |
| `SUPABASE_SERVICE_ROLE_KEY` | *Optional (server-side only)* Service role key | `your-service-role-key` |

> [!CAUTION]
> Never commit `backend/.env` or expose service-role keys to the client.

---

## 4. Running FastAPI Locally

From the project root:
```bash
# Using uvicorn with hot reload
backend\.venv\Scripts\uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **Health Endpoint:** `http://localhost:8000/api/v1/health`
- **Interactive Swagger Docs:** `http://localhost:8000/api/v1/docs`
- **ReDoc Documentation:** `http://localhost:8000/api/v1/redoc`

---

## 5. Authentication & RBAC Architecture

### Authentication
- Protected endpoints require an `Authorization: Bearer <Supabase_JWT>` header.
- The `get_current_user` dependency:
  1. Validates the JWT token against Supabase Auth.
  2. Resolves the caller's verified profile directly from the PostgreSQL `profiles` table.
  3. Rejects requests with missing, expired, or malformed tokens with HTTP 401.

### Role-Based Access Control (RBAC)
DocShield enforces 4 statutory roles:
1. `admin` — System Administrator (full supervisory oversight)
2. `inspector` — Police Inspector (investigation, case, evidence logging)
3. `legal_officer` — Public Prosecutor (charge sheets, legal scrutiny, court filings)
4. `forensic_officer` — Forensic Science Lab Examiner (evidence examination, FSL reports)

RBAC is enforced using reusable route dependencies:
```python
from backend.app.api.dependencies import require_role
from backend.app.core.permissions import Role

@router.get("/protected")
def protected_route(user = Depends(require_role(Role.INSPECTOR))):
    return {"message": "Authorized"}
```

---

## 6. Running Tests

Execute the comprehensive test suite with `pytest`:
```bash
backend\.venv\Scripts\pytest backend/tests -v
```

Tests cover:
- Health check endpoints
- Configuration parsing & CORS assembly
- Missing & invalid authentication rejection (HTTP 401)
- Authenticated user dependency resolution
- Strict RBAC role enforcement & access denial (HTTP 403)
