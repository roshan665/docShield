# 02. Requirements Specification — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Overview & Requirement Classification

This document establishes the authoritative technical requirements for the **DocShield** platform, strictly constrained to the **Inspector Scope** (SIH 26190). Every requirement is indexed with an immutable tracking ID for automated compliance and test mapping.

```
┌─────────────────────────────────────────────────────────────┐
│                    DOCSHIELD REQUIREMENTS                   │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Functional  │  Security    │  Integrity   │   Audit        │
│  (FR-xxx)    │  (SEC-xxx)   │  (INT-xxx)   │   (AUD-xxx)    │
├──────────────┼──────────────┼──────────────┼────────────────┤
│  Performance │  Usability   │ Availability │ Non-Functional │
│  (PERF-xxx)  │  (USA-xxx)   │ (AVAIL-xxx)  │ (NFR-xxx)      │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

---

## 2. Functional Requirements (FR)

### 2.1 Case Management
- **FR-001**: The system shall permit an authenticated Inspector to view a paginated list of all investigation cases assigned to them or their jurisdictional station.
- **FR-002**: The system shall allow the creation of a new case containing: Crime No./Case No., Legal Section (IPC / BNS), Incident Date, Registration Date, Station Name, Investigating Officer ID, and Case Description.
- **FR-003**: The system shall automatically generate a unique, non-repeating Case Identifier using the standard format: `CR-{YEAR}-{STATION_CODE}-{SEQUENCE_NUM}`.
- **FR-004**: The system shall allow an Inspector to search cases by Case Number, Section, Complainant Name, Accused Name, or Incident Keywords.
- **FR-005**: The system shall allow an Inspector to filter cases by Status (`Active`, `Under Review`, `Charge-Sheeted`, `Closed`) and sort by `Assigned Date`, `Last Updated`, or `Urgency`.
- **FR-006**: The system shall provide a dedicated Case Detail view displaying tabbed, case-centric relationships for FIR, Documents, Evidence, Forensics, Charge Sheets, Court Filings, and Chain of Custody.
- **FR-007**: The system shall allow updating a case's operational status with mandatory justification notes, which are permanently appended to the case log.

### 2.2 Document Management & Ingestion
- **FR-008**: The system shall allow an Inspector to upload investigation documents associated with a specific case.
- **FR-009**: The system shall classify documents into defined legal types: `FIR`, `Witness Statement`, `Panchnama / Seizure Memo`, `Medical / Post-Mortem Report`, `Forensic Lab Report`, `CCTV / Media Footage`, `Charge Sheet`, `Court Filing`, and `General Diary / Other`.
- **FR-010**: The system shall record document metadata including: Original Filename, Document Title, Document Type, Upload Timestamp, Uploading Officer, File Size, MIME Type, and Associated Case ID.
- **FR-011**: The system shall permit document versioning: an updated file creates a new version record while preserving the previous version, its cryptographic hash, and its audit history.
- **FR-012**: The system shall support secure in-browser viewing and streaming download of authorized documents for the Inspector.

### 2.3 Evidence & Seizure Management
- **FR-013**: The system shall permit an Inspector to log seized evidence items (Physical or Digital) tied strictly to a Case ID.
- **FR-014**: The system shall capture evidence metadata: Evidence Tag / Seizure ID, Item Name, Category (`Weapon`, `Narcotics`, `Electronic Device`, `Documentary Evidence`, `Biological Sample`, `Currency / Valuables`), Seizure Date, Seizure Location, Seizing Officer, and Witness Details.
- **FR-015**: For digital evidence (e.g., pen drives, smartphone dumps, CCTV footage), the system shall support file payload attachment with mandatory automatic SHA-256 hash calculation.
- **FR-016**: For physical evidence, the system shall track current physical custody status: `In Station Malkhana`, `In Transit`, `At Forensic Lab`, `Produced in Court`, `Disposed / Released`.

### 2.4 Chain of Custody (CoC) Tracking
- **FR-017**: The system shall record an immutable Chain of Custody event every time an evidence item changes physical or digital possession.
- **FR-018**: Each Chain of Custody record shall capture: Transfer Timestamp, Dispatched By (Officer ID), Received By (Officer / Custodian Name & ID), Transfer Reason (`Lab Analysis`, `Court Production`, `Safekeeping`, `Re-examination`), Source Location, and Destination Location.
- **FR-019**: The system shall provide an unbroken chronological timeline of custody transfers on both the Case Detail view and the Evidence Detail view.
- **FR-020**: The system shall alert the Inspector when an evidence item has been marked `In Transit` beyond a configurable threshold without recipient confirmation.

### 2.5 Forensics, Charge Sheets & Court Filings
- **FR-021**: The system shall provide a dedicated Forensic Reports management tab within each case to log Forensic Lab dispatch dates, FSL docket numbers, report receipt dates, and test summaries.
- **FR-022**: The system shall support uploading official FSL reports with mandatory cryptographic anchoring.
- **FR-023**: The system shall permit staging and reviewing the Final Report / Charge Sheet (Section 173 CrPC / Sec 193 BNSS), recording Accused names, Charges Framed, and Filing Deadlines (e.g., 60-day or 90-day statutory remand limits).
- **FR-024**: The system shall allow recording Court Filing details: Court Name, Presiding Magistrate, Filing Date, Next Hearing Date, and Hearing Outcomes/Bail Status.

### 2.6 Dashboard & Reporting
- **FR-025**: The system shall provide a top-level Inspector Dashboard featuring real-time stat cards: `My Active Cases`, `Total Documents`, `Evidence Items`, `Charge Sheets Staged`, and `Integrity Verified %`.
- **FR-026**: The system shall display Recent / Assigned Cases, Quick Actions (`Add Case`, `Upload Document`, `Log Evidence`, `Run Integrity Check`), and a stream of Recent Activity.
- **FR-027**: The system shall generate a case-centric PDF/Printable Summary Dossier containing the complete case profile, document inventory, evidence ledger, custody timeline, and cryptographic verification certificate.

---

## 3. Data Integrity Requirements (INT)

- **INT-001**: Upon completion of any file upload, the backend shall synchronously generate a standard SHA-256 cryptographic digest before committing the file to permanent storage.
- **INT-002**: The baseline cryptographic hash, file size, and creation timestamp shall be stored in an immutable `document_integrity_records` table.
- **INT-003**: The system shall provide an on-demand "Verify Integrity" action executable by the Inspector for any single document or in batch for all documents in a case.
- **INT-004**: During verification, the system shall read the raw stored file byte stream, recalculate its SHA-256 digest, and compare it bit-by-bit against the baseline recorded digest.
- **INT-005**: If the recalculation matches, the document status shall update to `Verified`. If a mismatch is detected, the status shall immediately flip to `Integrity Failed`, generating a high-priority alert.
- **INT-006**: The platform-wide and case-level **Integrity Verified Percentage** shall be calculated strictly via the deterministic formula:
  $$\text{Integrity \%} = \left( \frac{\text{Count of Active Documents with Status 'VERIFIED'}}{\text{Total Active Uploaded Documents}} \right) \times 100$$
  The system is strictly prohibited from displaying mocked, hardcoded, or arbitrary percentages.

---

## 4. Security Requirements (SEC)

- **SEC-001**: All Inspector sessions shall be authenticated via stateless JSON Web Tokens (JWT) with cryptographic signatures (HMAC-SHA256 or RS256).
- **SEC-002**: Access tokens shall expire within 15 minutes; refresh tokens shall be stored in secure, `HttpOnly`, `SameSite=Strict` cookies with automatic rotation.
- **SEC-003**: Passwords must be hashed using `bcrypt` (work factor >= 12) or `Argon2id`.
- **SEC-004**: All traffic between client and server must be encrypted in transit via TLS 1.3 (minimum TLS 1.2).
- **SEC-005**: Files stored on the filesystem or object store must be encrypted at rest using AES-256.
- **SEC-006**: The system shall enforce strict input sanitization and MIME-type validation using file byte inspection (magic numbers), rejecting executable file formats (`.exe`, `.sh`, `.bat`, `.cmd`).
- **SEC-007**: Role-Based Access Control (RBAC) must enforce that an Inspector can only access cases assigned to their precinct/jurisdiction.

---

## 5. Auditability Requirements (AUD)

- **AUD-001**: The system shall log every state-changing and access-sensitive operation into an append-only `audit_logs` table.
- **AUD-002**: Audit records must capture: `id`, `actor_id`, `actor_name`, `action_type` (`LOGIN`, `LOGOUT`, `CASE_CREATE`, `DOC_UPLOAD`, `DOC_VERIFY`, `EVIDENCE_LOG`, `CUSTODY_TRANSFER`, etc.), `resource_type`, `resource_id`, `case_id`, `timestamp`, `ip_address`, and `user_agent`.
- **AUD-003**: Audit records shall be strictly immutable: `UPDATE` and `DELETE` operations on the `audit_logs` table are forbidden at the database engine level via trigger/rule or user privileges.
- **AUD-004**: The system shall allow an Inspector to view and search the audit trail strictly for their authorized cases.

---

## 6. Performance Requirements (PERF)

- **PERF-001**: The Inspector Dashboard and Cases list must load and render initial paint in less than **1.0 second** under normal network conditions.
- **PERF-002**: Cryptographic hashing of uploaded files up to 25 MB must complete in less than **500 milliseconds**.
- **PERF-003**: Integrity verification checks for a single document must return a response in less than **300 milliseconds**.
- **PERF-004**: Search queries across 10,000 cases must return results within **200 milliseconds** through proper database index utilization.

---

## 7. Availability & Reliability Requirements (AVAIL)

- **AVAIL-001**: The system shall target 99.9% uptime during operational police shifts.
- **AVAIL-002**: File storage operations must feature atomic commits: if database metadata insertion fails, the uploaded file chunk must be safely cleaned up to prevent orphaned files.
- **AVAIL-003**: The database must support automated point-in-time recovery (PITR) and daily automated snapshots.

---

## 8. Usability & UI Requirements (USA)

- **USA-001**: The application layout shall employ a **horizontal top navigation bar** without any left sidebar, maximizing horizontal reading space for legal tables and case files.
- **USA-002**: The color palette must follow a clean police/legal SaaS aesthetic: white and light-blue surfaces with navy/slate brand typography.
- **USA-003**: All tables must support instant client-side or server-side filtering, column sorting, and pagination with clear page count indicators.
- **USA-004**: All forms must provide inline validation errors, clear label hierarchy, and keyboard navigation (Tab-accessible).
- **USA-005**: Destructive or high-impact actions (e.g., status changes, custody handovers) must require an explicit confirmation modal.

---

## 9. Non-Functional Requirements Summary (NFR)

- **NFR-001**: Modular codebase decoupling UI presentation, API endpoints, business services, and database persistence.
- **NFR-002**: Cross-browser compatibility across Google Chrome 110+, Mozilla Firefox 110+, Microsoft Edge 110+, and Safari 16+.
- **NFR-003**: Zero hardcoded credentials or environment-specific connection strings in source control.

---

## 10. Document Cross-References
- Product Vision: [01_PRODUCT_OVERVIEW.md](file:///d:/msi/love_you/docs/01_PRODUCT_OVERVIEW.md)
- Inspector Interaction Flows: [03_INSPECTOR_WORKFLOW.md](file:///d:/msi/love_you/docs/03_INSPECTOR_WORKFLOW.md)
- System Architecture: [07_SYSTEM_ARCHITECTURE.md](file:///d:/msi/love_you/docs/07_SYSTEM_ARCHITECTURE.md)
- Database Design: [10_DATABASE_SCHEMA.md](file:///d:/msi/love_you/docs/10_DATABASE_SCHEMA.md)
- Integrity Protocols: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
