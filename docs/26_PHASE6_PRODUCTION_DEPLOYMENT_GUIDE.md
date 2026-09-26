# 26. Production Deployment & Security Architecture Guide — DocShield

```yaml
Status: PRODUCTION-READY
Version: 1.0.0
Architecture: Frontend (React/Vite) -> FastAPI (Python) -> Supabase (PostgreSQL + Auth + Private Storage)
Audit Status: VERIFIED
```

---

## 1. System Architecture Overview

DocShield implements a secure, defense-in-depth architecture where the client browser never directly queries database tables or private storage buckets for security-critical business logic:

```
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND PRESENTATION LAYER                 │
│         React 18 + Vite (Frozen UI, Hash-Routed)            │
│         Single centralized API client: src/services/apiClient│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / HTTPS
                               │ Authorization: Bearer <Supabase JWT>
┌──────────────────────────────▼──────────────────────────────┐
│                    FASTAPI APPLICATION CORE                 │
│   • Auth & RBAC Dependencies: Token validation & profile bind│
│   • Business Domain Services:                                │
│       - EvidenceService: Authoritative byte-level SHA-256    │
│       - CustodyService: Append-only cryptographic hash chain │
│       - AuditService: Immutable sealed audit ledger         │
│       - ForensicService: Case -> Exhibit relationship guard  │
│       - LegalService: Charge Sheet & Court Filing workflows  │
│       - CaseService: Jurisdictional scoping & docket management│
│       - DocumentService: Statutory document vault & scrutiny │
│   • Repository Layer: Typed queries with RLS compliance     │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / PostgREST / S3 API
┌──────────────────────────────▼──────────────────────────────┐
│                  SUPABASE MANAGED CLOUD INFRA               │
│   ├── PostgreSQL (Foreign keys, CHECK constraints, RLS)     │
│   ├── Private Storage Buckets:                              │
│   │     • evidence-vault (Private, versioned snapshots)     │
│   │     • case-documents (Private, statutory documents)     │
│   │     • forensic-reports (Private)                        │
│   │     • court-filings (Private)                           │
│   └── GoTrue Authentication (JWT issuer & session lifecycle)│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Environment Variables Configuration

### Root `.env` (Frontend & QA Suite)
```bash
# Supabase Public Configuration (Safe for Client)
VITE_SUPABASE_URL=https://hxngowwgazezfabrbfhf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# FastAPI Backend URL
VITE_API_URL=http://localhost:8000/api/v1
```

### Backend `.env` (`backend/.env`)
```bash
# Application Configuration
PROJECT_NAME="DocShield Backend"
VERSION="1.0.0"
DEBUG=False
API_V1_PREFIX="/api/v1"
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

# Supabase Integration
SUPABASE_URL=https://hxngowwgazezfabrbfhf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Security & Storage Thresholds
MAX_FILE_SIZE_BYTES=52428800  # 50 MB statutory threshold
SIGNED_URL_EXPIRY_SECONDS=60  # Short-lived authorized URLs
```

> [!CAUTION]
> The `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to `backend/.env` and must **never** be exposed in the frontend or committed to source control. `.gitignore` strictly protects `.env` files.

---

## 3. Four-Role RBAC Model

| Role | Scope | Permitted Endpoints | Blocked Endpoints |
|---|---|---|---|
| **`admin`** | System-wide oversight | `/api/v1/profiles`, `/api/v1/cases`, `/api/v1/evidence`, `/api/v1/audit-logs`, all workflows | None |
| **`inspector`** | Police investigation | Case creation, Exhibit seizure, Custody transfer, Document upload | Admin directory, Legal filings modification |
| **`legal_officer`** | Prosecution & scrutiny | Charge Sheets, Court Filings, Legal scrutiny, Case & exhibit review | FIR Case creation, Exhibit seizure |
| **`forensic_officer`** | Scientific examination | Evidence versioning, Forensic report drafting/finalization, Integrity verification, Custody ledger | Charge Sheets, Court Filings, FIR Case registration |

---

## 4. Evidence Cryptographic Integrity Model

1. **Ingestion & Versioning**:
   - File is streamed to `POST /api/v1/evidence`.
   - Raw bytes are read server-side into memory buffer.
   - Synchronous SHA-256 computation: `hashlib.sha256(file_bytes).hexdigest().lower()`.
   - File is deposited into private Supabase Storage bucket `evidence-vault` under a deterministic path: `{case_id}/{evidence_id}/v{version_number}_{sanitized_filename}`.
   - Version 1 snapshot is persisted to `evidence_versions`.
   - Primary `evidence` metadata is updated with authoritative hash, location, and seal.
   - Genesis custody block (`GENESIS-BLOCK`) and audit log entry are recorded in the same sequence.

2. **Tamper Detection**:
   - Authorized officer triggers `POST /api/v1/evidence/{evidence_id}/verify-integrity`.
   - Backend streams actual raw bytes from `evidence-vault`.
   - Backend recalculates SHA-256 live and executes constant-time string comparison: `hmac.compare_digest(stored_hash, calculated_hash)`.
   - **Match**: Returns `is_match=True`, `integrity_status="VERIFIED"`.
   - **Mismatch**: Updates database record to `status="Tampered"`, emits a `SecurityViolation` alert to `audit_logs`, and returns `is_match=False`, `integrity_status="MISMATCH"`.

---

## 5. Chain of Custody & Audit Trail Architecture

- **Chain of Custody (`chain_of_custody_transfers`)**:
  - Strictly **append-only**.
  - No update (`PATCH`/`PUT`) or delete (`DELETE`) APIs exist. Explicit security guards throw `SECURITY VIOLATION` if modification is attempted.
  - Every transfer step computes a SHA-256 block hash incorporating `evidence_id`, `step_number`, `action`, `previous_block_hash`, and ISO-8601 timestamp.
  - Actor identity is bound directly to the authenticated JWT session.

- **Audit Logging (`audit_logs`)**:
  - Strictly **append-only**.
  - All sensitive mutations (case creation, evidence seizure, version replacement, integrity check, custody transfer, report state transition, charge sheet scrutiny) automatically invoke `audit_repo.append_log()`.
  - Every entry is sealed with a computed cryptographic record hash.
  - Passwords, bearer tokens, and confidential file contents are never stored in audit payloads.

---

## 6. Testing Instructions

### Running Backend Pytest Suite
```bash
# Execute full backend test suite (71 comprehensive unit & integration tests)
.\backend\.venv\Scripts\pytest.exe backend/tests
```

### Running Frontend Production QA Audit
```bash
# Execute full 60-check production validation suite
node --env-file=.env test-production-qa.js
```

### Running Frontend Production Build
```bash
# Verify Vite bundling and asset compression
npm run build
```

---

## 7. Starting the Production Services

### 1. Launch FastAPI Backend
```bash
cd backend
.\.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 2. Launch / Preview Frontend
```bash
npm run preview
# or serve dist/ directory using Nginx / Caddy
```
