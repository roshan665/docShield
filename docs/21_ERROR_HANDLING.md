# 21. Error Handling Architecture — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Architectural Philosophy & Error Standardization

In a mission-critical legal application, vague errors such as `"Something went wrong"` or raw unhandled database stack traces are unacceptable. Errors must be **deterministic, machine-readable, secure, and aligned with RFC 7807 (Problem Details for HTTP APIs)**.

DocShield guarantees that:
1. Internal implementation details (stack traces, raw SQL queries, file system directory structures) are never leaked to the client in production.
2. Every error payload returns a structured, unambiguous machine code, localized human message, and unique correlation request ID.
3. Security-critical errors (such as cryptographic integrity mismatches or authorization violations) trigger synchronous audit log entries.

---

## 2. Standardized Error Response Format (RFC 7807)

Every non-2xx HTTP response from the DocShield API conforms to the following JSON structure:

```json
{
  "type": "https://docshield.police.gov.in/errors/INTEGRITY_MISMATCH",
  "title": "Document Cryptographic Integrity Mismatch",
  "status": 409,
  "detail": "The SHA-256 hash recomputed from stored file bytes does not match the baseline hash recorded at upload.",
  "instance": "/api/v1/documents/doc_9921/verify",
  "code": "ERR_INTEGRITY_MISMATCH",
  "meta": {
    "timestamp": "2026-09-23T07:45:12Z",
    "requestId": "req_8f1a9c4b",
    "caseId": "case_01J8F3",
    "documentId": "doc_9921"
  }
}
```

---

## 3. Error Categories & Canonical Response Codes

### 3.1 Authentication Errors (HTTP 401)
- **`ERR_AUTH_MISSING_TOKEN`**: Authorization header is missing or does not contain `Bearer <token>`.
- **`ERR_AUTH_EXPIRED_TOKEN`**: JWT access token has expired. Client must call `/api/v1/auth/refresh`.
- **`ERR_AUTH_INVALID_TOKEN`**: JWT signature verification failed or token is malformed.
- **`ERR_AUTH_INVALID_CREDENTIALS`**: Badge number or password does not match station records.

### 3.2 Authorization & Boundary Errors (HTTP 403)
- **`ERR_FORBIDDEN_ROLE`**: User role is not authorized for the requested endpoint (e.g., non-inspector accessing inspector resources).
- **`ERR_JURISDICTION_DENIED`**: Inspector attempted to access a case belonging to a different police station precinct without cross-jurisdiction authorization.
- **`ERR_RECORD_IMMUTABLE`**: Attempted to edit or delete an append-only audit log or locked charge sheet.

### 3.3 Validation Errors (HTTP 422 Unprocessable Entity)
When request payload fails schema validation, the error returns detailed field pointers:
```json
{
  "type": "https://docshield.police.gov.in/errors/VALIDATION_FAILED",
  "title": "Validation Error",
  "status": 422,
  "code": "ERR_VALIDATION_FAILED",
  "detail": "The submitted case payload contains 2 invalid fields.",
  "errors": [
    { "field": "caseNumber", "message": "Case number must match format CR-YYYY-STATION-XXXX" },
    { "field": "incidentDate", "message": "Incident date cannot be in the future" }
  ]
}
```

### 3.4 File & Storage Errors (HTTP 400 / 413 / 415)
- **`ERR_FILE_TOO_LARGE` (HTTP 413)**: Uploaded file exceeds the 50 MB threshold.
- **`ERR_FILE_TYPE_PROHIBITED` (HTTP 415)**: Uploaded file type is prohibited (e.g., executable format or disguised MIME type).
- **`ERR_STORAGE_UNAVAILABLE` (HTTP 503)**: Storage volume or S3 driver failed to write file chunks.

### 3.5 Cryptographic Integrity Errors (HTTP 409 / 500)
- **`ERR_INTEGRITY_MISMATCH` (HTTP 409)**: Hash verification failed. Recomputed hash differs from pristine baseline.
- **`ERR_HASHING_STREAM_FAILED` (HTTP 500)**: Crypto stream failed to compute SHA-256 digest during ingestion.

### 3.6 Database & Concurrency Errors (HTTP 409 / 500)
- **`ERR_DUPLICATE_KEY` (HTTP 409)**: Unique constraint violated (e.g., Case Number `CR-2026-BH-0042` or Evidence Tag `EV-BH-2026-0089` already exists).
- **`ERR_DATABASE_DEADLOCK` (HTTP 500)**: Transaction collision during concurrent custody transfers; handled via automatic retries.

---

## 4. Frontend Error Handling & UI Notification

The frontend client intercepts all API error responses and routes them into the appropriate UI state:
1. **Form Validation Errors (422)**: Rendered inline directly beneath the offending input fields with red helper text.
2. **Session Expiry (401)**: Automatically attempts silent token refresh; if refresh fails, saves draft form state in session storage and redirects to login with an informational notice.
3. **Critical Integrity Errors (409)**: Triggers an immediate persistent warning banner and pushes an alert into the top navigation notification tray.
4. **General Server Errors (500)**: Displays a non-intrusive toast: *"Unable to complete request. Error reference: req_8f1a9c4b. Please contact station technical support."*

---

## 5. Document Cross-References
- System Architecture: [07_SYSTEM_ARCHITECTURE.md](file:///d:/msi/love_you/docs/07_SYSTEM_ARCHITECTURE.md)
- Backend Architecture: [08_BACKEND_ARCHITECTURE.md](file:///d:/msi/love_you/docs/08_BACKEND_ARCHITECTURE.md)
- API Specification: [09_API_SPECIFICATION.md](file:///d:/msi/love_you/docs/09_API_SPECIFICATION.md)
- Cryptographic Integrity: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
- Audit Logging: [16_AUDIT_LOGGING.md](file:///d:/msi/love_you/docs/16_AUDIT_LOGGING.md)
