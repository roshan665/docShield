# 22. Testing Strategy & Quality Assurance — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Quality Assurance Philosophy

Because DocShield handles electronic judicial exhibits and police investigation records, software defects cannot simply be considered minor glitches—they could jeopardize a criminal trial or violate evidentiary admissibility standards.

The testing strategy enforces **multi-layered, automated verification across 11 critical testing dimensions**.

```
┌────────────────────────────────────────────────────────┐
│               1. END-TO-END WORKFLOW SUITE             │
│   Complete Inspector Flow: Case -> Doc -> CoC -> Dossier│
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│         2. INTEGRATION & API CONTRACT TESTING          │
│   REST Endpoints, DB Transactions, File Upload Streams │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│      3. DOMAIN SECURITY & CRYPTOGRAPHIC VERIFICATION   │
│   Tamper Simulation, Hash Collisions, RBAC Enforcement │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│           4. UNIT & PURE LOGIC TEST SUITE              │
│   Crypto Stream, Integrity Formulas, Input Validators  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Testing Dimensions & Coverage Matrix

| Testing Dimension | Scope & Objective | Primary Tooling |
| :--- | :--- | :--- |
| **1. Unit Testing** | Pure functions, cryptographic hash computation, validation rules, math formulas. | Jest / Vitest / PyTest |
| **2. Integration Testing** | Multi-table database transactions, storage driver writes, event emitters. | Supertest / Testcontainers |
| **3. API Testing** | Contract verification for all `/api/v1` routes, headers, status codes, RFC 7807 payloads. | Postman / Newman / Supertest |
| **4. Frontend Testing** | Component rendering, modal states, form validation feedback, tab navigation. | Testing Library / Playwright |
| **5. RBAC Testing** | Ensuring `POLICE_INSPECTOR` cannot access unauthorized precincts or Admin functions. | Automated API Auth Suites |
| **6. Security Testing** | OWASP Top 10 checks: SQL injection, XSS escaping, rate-limit enforcement, CORS. | OWASP ZAP / Custom Scripts |
| **7. File Upload Testing** | Magic byte spoofing detection, 50MB limits, boundary stream handling. | Multipart stream mock tests |
| **8. Integrity Testing** | Simulating bit-level file alterations and verifying that `Integrity Failed` triggers. | Dedicated Forensic Test Harness |
| **9. Chain of Custody Testing**| Ensuring uninterrupted handover logs and sequential custodian validations. | State-Machine Verification Suites |
| **10. Audit Testing** | Verifying append-only database rules (`UPDATE`/`DELETE` blocked) and synchronous logging.| SQL Trigger Verification Suites |
| **11. End-to-End Testing** | Automated browser execution of full Inspector investigation journey. | Playwright / Cypress |

---

## 3. Critical Test Scenarios & Execution Specifications

### Scenario 1: The Cryptographic Tamper Simulation Test
- **Objective**: Prove that unauthorized modification of a stored file causes an instant `Integrity Failed` detection.
- **Steps**:
  1. Upload a legitimate 5 MB PDF (`Panchnama_Scene.pdf`) via `POST /api/v1/cases/:id/documents`.
  2. Verify that the baseline SHA-256 digest is generated and status is `VERIFIED`.
  3. Bypass the application and directly alter 1 single byte in the physical file on disk/storage.
  4. Invoke `POST /api/v1/documents/:id/verify`.
  5. Assert that the recomputed hash differs from the baseline hash.
  6. Assert that document status transitions to `INTEGRITY_FAILED`.
  7. Assert that an `INTEGRITY_TAMPER_ALERT` audit entry is committed.
  8. Assert that the dashboard `Integrity Verified %` drops accordingly.

### Scenario 2: Integrity Verified % Mathematical Precision Test
- **Objective**: Ensure dashboard percentage strictly matches active verified counts with zero mocking.
- **Steps**:
  1. Pre-seed database with 10 documents: 8 `VERIFIED`, 2 `PENDING_VERIFICATION`, 0 `INTEGRITY_FAILED`.
  2. Call `GET /api/v1/dashboard/stats`.
  3. Assert `integrityPercentage === 80.00`.
  4. Simulate 1 document failing verification (`INTEGRITY_FAILED`).
  5. Call `GET /api/v1/dashboard/stats` again.
  6. Assert `integrityPercentage === 80.00` (8/10 verified) and `failedDocuments === 1`.
  7. Verify all pending documents, re-assert exact percentage: $90.00\%$.

### Scenario 3: Chain of Custody Handover Immutability Test
- **Objective**: Ensure custody history is unbroken and tamper-evident.
- **Steps**:
  1. Seize evidence `EV-BH-2026-0089` (Seizing Officer: `Insp. Sharma`).
  2. Transfer custody to `HC Verma (Malkhana)`.
  3. Transfer custody from `HC Verma` to `Ct. Manoj (FSL Courier)`.
  4. Query `GET /api/v1/evidence/:id/custody`.
  5. Assert that 3 sequential, unbroken timeline milestones exist with exact timestamps.
  6. Attempt to execute an SQL `UPDATE chain_of_custody_events SET received_by_name = 'Hacker'`.
  7. Assert that database trigger throws `DocShield Security Policy Violation: Modification of custody records is prohibited`.

### Scenario 4: Malicious File Upload & Magic Byte Defense
- **Objective**: Verify that renamed executable binaries are rejected immediately.
- **Steps**:
  1. Create a dummy Windows executable (`payload.exe`).
  2. Rename file to `legitimate_witness_deposition.pdf`.
  3. Attempt upload to `POST /api/v1/cases/:id/documents`.
  4. Assert response is `HTTP 415 Unsupported Media Type` with error code `ERR_FILE_TYPE_PROHIBITED`.
  5. Assert zero bytes are committed to permanent storage.

### Scenario 5: RBAC Boundary & Non-Jurisdiction Test
- **Objective**: Prevent officers from viewing cases outside their precinct.
- **Steps**:
  1. Authenticate as Inspector of `Bhopal Central PS` (`PS-BH-01`).
  2. Attempt `GET /api/v1/cases/case_indore_042` (belonging to `Indore Central PS` / `PS-IND-01`).
  3. Assert response is `HTTP 403 Forbidden` with error code `ERR_JURISDICTION_DENIED`.

---

## 4. Continuous Integration (CI) Test Pipeline

In the CI automation pipeline (e.g., GitHub Actions):
```yaml
# Conceptual CI Pipeline
stages:
  - lint-and-typecheck:
      run: npm run lint && npm run type-check
  - unit-and-crypto-tests:
      run: npm run test:unit
  - integration-and-tamper-tests:
      run: npm run test:integration
  - api-e2e-headless:
      run: npx playwright test
```

---

## 5. Document Cross-References
- Requirements: [02_REQUIREMENTS.md](file:///d:/msi/love_you/docs/02_REQUIREMENTS.md)
- Backend Architecture: [08_BACKEND_ARCHITECTURE.md](file:///d:/msi/love_you/docs/08_BACKEND_ARCHITECTURE.md)
- API Specification: [09_API_SPECIFICATION.md](file:///d:/msi/love_you/docs/09_API_SPECIFICATION.md)
- Cryptographic Integrity: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
- Security Architecture: [18_SECURITY_ARCHITECTURE.md](file:///d:/msi/love_you/docs/18_SECURITY_ARCHITECTURE.md)
