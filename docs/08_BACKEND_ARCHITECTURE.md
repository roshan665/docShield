# 08. Backend Architecture — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Architectural Principles & Responsibilities

The DocShield backend is structured around a **Domain-Driven, Layered Architecture** designed to be framework-agnostic (easily implementable using Express.js/Node.js, FastAPI/Python, or Go). 

The backend is responsible for:
1. **Request Intake & Normalization**: Parsing, validating, and sanitizing incoming client HTTP requests.
2. **Authentication & Identity Enforcement**: Verifying JWT tokens, checking session validity, and injecting the authenticated Inspector context into request pipelines.
3. **Authorization & Boundary Control**: Restricting data queries strictly to the Inspector's jurisdictional cases.
4. **Cryptographic Processing**: Computing synchronous SHA-256 byte hashes, running byte-stream comparisons, and issuing verification certificates.
5. **Relational Persistence**: Managing transactional consistency across Case, Document, Evidence, and Custody records.
6. **Immutable Event Auditing**: Appending permanent forensic records for all operations before committing responses.
7. **Secure File Streaming**: Handling multipart streaming uploads, byte-level file validation, and controlled downloads.

---

## 2. Layered Application Structure

The codebase is organized into four distinct horizontal layers to prevent cross-cutting leaks:

```
┌────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                   │
│         HTTP Routers, Controllers, Serializers         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    MIDDLEWARE LAYER                    │
│   Auth, RateLimit, Validator, ErrorHandler, AuditHook  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                   DOMAIN SERVICE LAYER                 │
│  CaseService, DocService, IntegrityEngine, CustodySvc  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│               DATA & PERSISTENCE LAYER                 │
│      Repositories, Query Builders, Storage Driver      │
└────────────────────────────────────────────────────────┘
```

### 2.1 Controllers (Presentation Layer)
- Accepts incoming HTTP payloads.
- Delegates business execution to Domain Services.
- Transforms domain entities into standard JSON response formats (`{ success: true, data: {...} }`).
- Never communicates directly with the database or file storage.

### 2.2 Middleware Layer
- **`authMiddleware`**: Decodes JWT, validates signature, ensures user status is active.
- **`rbacMiddleware`**: Verifies role is `POLICE_INSPECTOR`.
- **`validationMiddleware`**: Validates request parameters and JSON bodies against schema contracts (e.g., Zod / Joi / Pydantic).
- **`fileUploadMiddleware`**: Inspects multipart boundary streams, enforces file size limits, and checks magic numbers.
- **`errorHandlingMiddleware`**: Intercepts unhandled errors, formats RFC 7807 problem details, and suppresses stack traces in production.

### 2.3 Domain Services (Business Logic Layer)
- Encapsulates all operational rules of the investigation platform.
- Manages transactional boundaries (e.g., inserting a document record and an integrity record inside the same DB transaction).
- Coordinates with the `IntegrityEngine` for cryptographic hashing.
- Emits events to the `AuditService`.

### 2.4 Repositories & Data Access Layer
- Executes typed SQL queries or ORM commands against the relational database.
- Implements strict indexing and relationship preloading to prevent N+1 query overhead.
- Protects append-only tables from modification.

---

## 3. Recommended Module Boundaries

The backend domain is partitioned into 12 self-contained modules:

```
src/
├── modules/
│   ├── auth/              # Inspector login, token refresh, logout, password change
│   ├── users/             # Inspector profile, station assignment metadata
│   ├── cases/             # Case CRUD, status transitions, case-level metrics
│   ├── documents/         # Document intake, versioning, file streaming
│   ├── evidence/          # Physical & digital evidence logging, seizure records
│   ├── forensics/         # Forensic lab requisitions, test results attachment
│   ├── chargeSheets/      # Sec 173 CrPC / Sec 193 BNSS staging & deadlines
│   ├── courtFilings/      # Court dockets, hearing logs, magistrate outcomes
│   ├── chainOfCustody/    # Custody transfer logs, provenance timeline
│   ├── integrity/         # Cryptographic engine, SHA-256 calculation & diffing
│   ├── audit/             # Append-only security logging engine
│   └── notifications/     # In-app alerts, deadline triggers, integrity warnings
├── common/
│   ├── errors/            # Custom application error classes
│   ├── middleware/        # Global request pipeline interceptors
│   ├── storage/           # Disk / S3 storage abstraction interface
│   └── utils/             # Crypto helpers, date formatters, hash utils
└── config/                # Environment variables, database configs
```

---

## 4. Module Responsibilities & Interfaces

### 4.1 `auth/` & `users/`
- Validates inspector credentials.
- Manages session lifetime and issue access/refresh token pairs.
- Exposes `GET /api/v1/auth/me` to provide the frontend with the active officer profile (`Inspector A. Sharma`, `Bhopal Central PS`).

### 4.2 `cases/`
- Enforces Case Number format: `CR-{YEAR}-{STATION_CODE}-{SEQUENCE}`.
- Manages case state transitions: `Active` ➔ `Under Review` ➔ `Charge-Sheeted` ➔ `Closed`.
- Compiles the aggregated Case Overview payload (combining document counts, evidence tallies, and custody status).

### 4.3 `documents/` & `integrity/`
- Intercepts file upload streams.
- Hands the byte stream to `IntegrityEngine.computeHash(stream)`.
- Persists file to storage using the key: `cases/{case_id}/docs/{doc_id}_{timestamp}.enc`.
- Commits initial baseline record to `document_integrity_records`.
- Exposes `verifyDocument(docId)` and `verifyCaseBatch(caseId)`:
  - Fetches stored file bytes.
  - Re-computes SHA-256.
  - Updates integrity status to `VERIFIED` or `FAILED`.
  - Calculates live `Integrity Verified %`.

### 4.4 `evidence/` & `chainOfCustody/`
- Registers physical and digital articles seized during investigations.
- Ensures every evidence item begins with an initial possession record assigned to the seizing Inspector.
- Enforces atomic custody transfers:
  ```typescript
  async transferCustody(evidenceId, releaseOfficer, receiveOfficer, reason, destination) {
    return await db.transaction(async (trx) => {
      await trx.insert(chain_of_custody_events).values({...});
      await trx.update(evidence).set({ current_holder, current_location, custody_status });
    });
  }
  ```

### 4.5 `audit/`
- Exposes a single unified interface: `auditLogger.log(event)`.
- Automatically enriches every log entry with: `actorId`, `ipAddress`, `userAgent`, `timestamp`.
- Database write occurs synchronously within the request lifecycle to guarantee non-repudiation.

---

## 5. Security & Validation Pipelines

```
Incoming Request
       │
       ▼
[ Rate Limiter ]  ───> 429 Too Many Requests if rate exceeded
       │
       ▼
[ CORS / Security Headers ] ───> Sets Helmet / CSP / Strict-Transport-Security
       │
       ▼
[ JWT Authenticator ] ───> 401 Unauthorized if invalid/expired
       │
       ▼
[ RBAC Authorization ] ───> 403 Forbidden if not Inspector or wrong precinct
       │
       ▼
[ Schema Validator ] ───> 422 Unprocessable Entity if payload schema invalid
       │
       ▼
[ Domain Controller ]
```

---

## 6. Document Cross-References
- System Architecture: [07_SYSTEM_ARCHITECTURE.md](file:///d:/msi/love_you/docs/07_SYSTEM_ARCHITECTURE.md)
- API Specification: [09_API_SPECIFICATION.md](file:///d:/msi/love_you/docs/09_API_SPECIFICATION.md)
- Database Schema: [10_DATABASE_SCHEMA.md](file:///d:/msi/love_you/docs/10_DATABASE_SCHEMA.md)
- Cryptographic Integrity: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
- Error Handling Framework: [21_ERROR_HANDLING.md](file:///d:/msi/love_you/docs/21_ERROR_HANDLING.md)
