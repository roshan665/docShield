# 09. API Specification — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Global API Conventions

- **Base URL**: `/api/v1`
- **Transport**: HTTPS (TLS 1.3 / 1.2)
- **Content Type**: `application/json` (except multipart file uploads)
- **Standard Response Envelope**:
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": {
      "timestamp": "2026-09-23T10:45:00Z",
      "requestId": "req_8f1a9c4b"
    }
  }
  ```
- **Authentication**: `Authorization: Bearer <JWT_ACCESS_TOKEN>` on all protected endpoints.
- **Role Enforcement**: `POLICE_INSPECTOR`.

---

## 2. Authentication Endpoints

### 2.1 Login Inspector
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/login`
- **Purpose**: Authenticate an Inspector via official badge credentials.
- **Auth**: None (Public).
- **Request Body**:
  ```json
  {
    "badgeNumber": "INSP-BH-104",
    "password": "<officer-password>"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "expiresIn": 900,
      "user": {
        "id": "usr_9918",
        "name": "A. Sharma",
        "rank": "Police Inspector",
        "badgeNumber": "INSP-BH-104",
        "station": "Bhopal Central Police Station"
      }
    }
  }
  ```
- **Audit Behavior**: Emits `AUTH_LOGIN` with client IP and user-agent.

### 2.2 Current User Profile
- **Method**: `GET`
- **Endpoint**: `/api/v1/auth/me`
- **Purpose**: Retrieve profile data for the active Inspector session.
- **Auth**: Bearer JWT (`POLICE_INSPECTOR`).
- **Success Response (200 OK)**: Returns user profile, station metadata, and active permissions.

### 2.3 Logout Inspector
- **Method**: `POST`
- **Endpoint**: `/api/v1/auth/logout`
- **Purpose**: Invalidate current refresh token and terminate session.
- **Auth**: Bearer JWT (`POLICE_INSPECTOR`).
- **Success Response (200 OK)**: `{ "success": true, "message": "Session terminated successfully." }`.
- **Audit Behavior**: Emits `AUTH_LOGOUT`.

---

## 3. Dashboard Endpoints

### 3.1 Get Dashboard Statistics
- **Method**: `GET`
- **Endpoint**: `/api/v1/dashboard/stats`
- **Purpose**: Retrieve the 5 primary metrics for the Inspector dashboard.
- **Auth**: Bearer JWT (`POLICE_INSPECTOR`).
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "activeCases": 14,
      "totalDocuments": 128,
      "pendingVerificationDocuments": 2,
      "evidenceItems": 42,
      "evidenceInTransit": 6,
      "chargeSheetsStaged": 3,
      "urgentChargeSheetDeadlines": 1,
      "integrity": {
        "verifiedDocuments": 126,
        "failedDocuments": 0,
        "totalUploadedDocuments": 128,
        "integrityPercentage": 98.44
      }
    }
  }
  ```
  *(Note: `integrityPercentage` is calculated strictly as `(126 / 128) * 100`).*

### 3.2 Get Dashboard Recent Activity
- **Method**: `GET`
- **Endpoint**: `/api/v1/dashboard/activity?limit=10`
- **Purpose**: Retrieve real-time case and forensic activity stream.
- **Success Response (200 OK)**: Array of recent audit/case events with timestamps and actor details.

---

## 4. Case Management Endpoints

### 4.1 List Assigned Cases
- **Method**: `GET`
- **Endpoint**: `/api/v1/cases`
- **Query Parameters**:
  - `status`: `all` | `active` | `under_review` | `charge_sheeted` | `closed`
  - `section`: string (e.g., `IPC 302`)
  - `search`: string (Case No, keyword, complainant)
  - `page`: integer (default 1)
  - `limit`: integer (default 10)
  - `sort`: `last_updated` | `assigned_date` | `case_number`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "case_01J8F3",
        "caseNumber": "CR-2026-BH-0042",
        "legalSection": "IPC 302 / BNS 103(1)",
        "status": "ACTIVE",
        "incidentDate": "2026-09-22T21:30:00Z",
        "registrationDate": "2026-09-23T01:15:00Z",
        "station": "Bhopal Central PS",
        "complainant": "Rajesh Verma",
        "documentsCount": 14,
        "evidenceCount": 5,
        "lastUpdated": "2026-09-23T05:15:00Z"
      }
    ],
    "meta": { "total": 14, "page": 1, "limit": 10 }
  }
  ```

### 4.2 Create New Case
- **Method**: `POST`
- **Endpoint**: `/api/v1/cases`
- **Purpose**: Create a new investigation case.
- **Request Body**:
  ```json
  {
    "caseNumber": "CR-2026-BH-0042",
    "legalSection": "IPC 302 / BNS 103(1)",
    "incidentDate": "2026-09-22T21:30:00Z",
    "incidentLocation": "M.P. Nagar Zone 1, Bhopal",
    "complainantName": "Rajesh Verma",
    "description": "Reported altercation leading to fatal physical injury."
  }
  ```
- **Validation**: `caseNumber` must be unique; `legalSection` and `incidentDate` are mandatory.
- **Success Response (201 Created)**: Returns created case record.
- **Audit Behavior**: Emits `CASE_CREATE` with case ID and metadata.

### 4.3 Get Case Detail
- **Method**: `GET`
- **Endpoint**: `/api/v1/cases/:id`
- **Purpose**: Retrieve full relational details for an individual case.
- **Success Response (200 OK)**: Returns case profile, primary IO, station info, and nested summary counters for each tab.

### 4.4 Update Case Status
- **Method**: `PATCH`
- **Endpoint**: `/api/v1/cases/:id/status`
- **Request Body**:
  ```json
  {
    "status": "UNDER_REVIEW",
    "notes": "Preliminary investigation completed; awaiting ballistic analysis report."
  }
  ```
- **Audit Behavior**: Emits `CASE_STATUS_UPDATE` with previous status, new status, and IO justification.

---

## 5. Document Management Endpoints

### 5.1 Upload Document to Case
- **Method**: `POST`
- **Endpoint**: `/api/v1/cases/:id/documents`
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: Binary file stream (max 50 MB, PDF/Image/MP4)
  - `title`: string (e.g., `Panchnama of Crime Scene`)
  - `documentType`: `FIR` | `WITNESS_STATEMENT` | `PANCHNAMA` | `MEDICAL_REPORT` | `FORENSIC_REPORT` | `CCTV_MEDIA` | `CHARGE_SHEET` | `COURT_FILING` | `OTHER`
  - `referenceNumber`: string (optional legal dispatch memo number)
- **Synchronous Processing**: Backend computes SHA-256 digest on incoming stream before saving.
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "doc_9921",
      "caseId": "case_01J8F3",
      "title": "Panchnama of Crime Scene",
      "documentType": "PANCHNAMA",
      "filename": "Panchnama_Crime_Scene_01.pdf",
      "fileSize": 2451200,
      "sha256Hash": "a8f5c2d3e4b5a6c7d8e9f0123456789abcdef0123456789abcdef0123456789a",
      "integrityStatus": "VERIFIED",
      "uploadedAt": "2026-09-23T05:30:00Z"
    }
  }
  ```
- **Audit Behavior**: Emits `DOC_UPLOAD` capturing filename, file size, and calculated SHA-256 digest.

### 5.2 List Case Documents
- **Method**: `GET`
- **Endpoint**: `/api/v1/cases/:id/documents`
- **Query Parameters**: `type`, `integrityStatus`
- **Success Response (200 OK)**: Returns list of documents with their hashes and current integrity statuses.

### 5.3 Download / View Document Stream
- **Method**: `GET`
- **Endpoint**: `/api/v1/documents/:id/download`
- **Purpose**: Securely stream the encrypted file payload for authorized in-browser inspection.
- **Headers Returned**: `Content-Type`, `Content-Disposition: inline; filename="..."`.

---

## 6. Document Integrity Endpoints

### 6.1 Verify Single Document Integrity
- **Method**: `POST`
- **Endpoint**: `/api/v1/documents/:id/verify`
- **Purpose**: Recalculate SHA-256 on the stored physical file bytes and compare with the baseline hash.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "documentId": "doc_9921",
      "status": "VERIFIED",
      "baselineHash": "a8f5c2d3e4b5a6c7...",
      "recomputedHash": "a8f5c2d3e4b5a6c7...",
      "match": true,
      "verifiedAt": "2026-09-23T06:45:00Z"
    }
  }
  ```
- **Tampering Detected (200 OK with Status: FAILED)**:
  ```json
  {
    "success": true,
    "data": {
      "documentId": "doc_9921",
      "status": "INTEGRITY_FAILED",
      "baselineHash": "a8f5c2d3e4b5a6c7...",
      "recomputedHash": "ff0042a1b2c3d4e5...",
      "match": false,
      "verifiedAt": "2026-09-23T06:45:00Z"
    }
  }
  ```
- **Audit Behavior**: Emits `INTEGRITY_VERIFY_SUCCESS` or `ALERT_INTEGRITY_FAILED`.

### 6.2 Batch Verify All Case Documents
- **Method**: `POST`
- **Endpoint**: `/api/v1/cases/:id/verify-all`
- **Purpose**: Re-verify every document attached to a case in one atomic pass.

---

## 7. Evidence & Chain of Custody Endpoints

### 7.1 Log Seized Evidence
- **Method**: `POST`
- **Endpoint**: `/api/v1/cases/:id/evidence`
- **Request Body**:
  ```json
  {
    "evidenceTag": "EV-BH-2026-0089",
    "itemName": "Country-made 0.315 Pistol with 1 Spent Cartridge",
    "category": "FIREARM",
    "seizureDate": "2026-09-22T22:15:00Z",
    "seizureLocation": "Alleyway behind Sector B Market, Bhopal",
    "witnesses": "Suresh Patil, Amit Kushwaha",
    "initialLocation": "Station Malkhana Vault"
  }
  ```
- **Success Response (201 Created)**: Returns created evidence item and commits initial Chain of Custody entry.
- **Audit Behavior**: Emits `EVIDENCE_LOG`.

### 7.2 List Case Evidence
- **Method**: `GET`
- **Endpoint**: `/api/v1/cases/:id/evidence`
- **Success Response (200 OK)**: Returns evidence items, current holders, and statuses (`IN_CUSTODY`, `IN_TRANSIT`, `AT_LAB`, `IN_COURT`).

### 7.3 Transfer Evidence Custody
- **Method**: `POST`
- **Endpoint**: `/api/v1/evidence/:id/transfer`
- **Request Body**:
  ```json
  {
    "receivedBy": "HC R. Verma (Malkhana In-Charge)",
    "receiverBadge": "HC-BH-442",
    "destination": "Station Malkhana Vault Room 2",
    "transferReason": "Safe custodial deposit pending FSL dispatch",
    "dispatchMemoRef": "MEMO/BH/2026/089"
  }
  ```
- **Success Response (200 OK)**: Returns updated custody state and logs entry into `chain_of_custody_events`.
- **Audit Behavior**: Emits `CUSTODY_TRANSFER`.

### 7.4 Get Evidence Custody Timeline
- **Method**: `GET`
- **Endpoint**: `/api/v1/evidence/:id/custody`
- **Purpose**: Retrieve the chronological Chain of Custody provenance log for legal submission.

---

## 8. Forensics, Charge Sheets & Court Filings

### 8.1 Log Forensic Requisition / Attach Report
- **Method**: `POST`
- **Endpoint**: `/api/v1/cases/:id/forensics`
- **Form Fields**: `evidenceId`, `labName`, `fslDocketNumber`, `testRequested`, `reportFile` (optional PDF).

### 8.2 Stage Final Report / Charge Sheet
- **Method**: `POST`
- **Endpoint**: `/api/v1/cases/:id/charge-sheet`
- **Request Body**: `accusedList`, `chargesFramed`, `statutoryDeadlineDate`, `summaryOfEvidence`.

### 8.3 Log Court Hearing / Filing
- **Method**: `POST`
- **Endpoint**: `/api/v1/cases/:id/court-filings`
- **Request Body**: `courtName`, `magistrateName`, `filingDate`, `nextHearingDate`, `hearingPurpose`.

---

## 9. Audit Logs & Case Dossier Export

### 9.1 List Case Audit Logs
- **Method**: `GET`
- **Endpoint**: `/api/v1/cases/:id/audit-logs`
- **Query Parameters**: `actionType`, `page`, `limit`
- **Success Response (200 OK)**: Chronological list of all system actions recorded for the case.

### 9.2 Export Case Verification Dossier
- **Method**: `GET`
- **Endpoint**: `/api/v1/cases/:id/report/dossier`
- **Purpose**: Generate and stream a certified PDF summary dossier with SHA-256 integrity proofs.

---

## 10. Document Cross-References
- System Architecture: [07_SYSTEM_ARCHITECTURE.md](file:///d:/msi/love_you/docs/07_SYSTEM_ARCHITECTURE.md)
- Backend Architecture: [08_BACKEND_ARCHITECTURE.md](file:///d:/msi/love_you/docs/08_BACKEND_ARCHITECTURE.md)
- Database Schema: [10_DATABASE_SCHEMA.md](file:///d:/msi/love_you/docs/10_DATABASE_SCHEMA.md)
- Cryptographic Integrity: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
- Error Handling Framework: [21_ERROR_HANDLING.md](file:///d:/msi/love_you/docs/21_ERROR_HANDLING.md)
