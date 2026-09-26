# 03. Inspector Workflow — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Overview of the Investigation Lifecycle

The DocShield workflow mirrors the statutory journey of a police investigation under the Code of Criminal Procedure (CrPC) and Bharatiya Nagarik Suraksha Sanhita (BNSS). The system transitions an Investigating Officer (Inspector) through an unbroken, traceable pipeline:

```
[ 1. Login & Auth ]
        │
        ▼
[ 2. Dashboard Triage ]
        │
        ▼
[ 3. Case Ingestion / Assignment ] ───> [ 4. Case Opening & Inspection ]
                                                      │
        ┌─────────────────────────────────────────────┴─────────────────────────────────────────────┐
        ▼                                             ▼                                             ▼
[ 5. Document Intake ]                       [ 6. Evidence & CoC ]                         [ 7. Forensic Tracking ]
  • FIR, Statements                            • Seizure Logging                             • FSL Dispatch
  • Panchnama Memos                            • Tagging & Custody Handover                  • Lab Result Intake
  • SHA-256 Hashing                            • Verification Proofs                         • Ballistics / DNA / Viscera
        │                                             │                                             │
        └─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                                      │
                                                      ▼
                                       [ 8. Integrity Auditing ]
                                         • Real-time Hash Recalculation
                                         • Tamper Alert Monitoring
                                                      │
                                                      ▼
                                       [ 9. Charge Sheet Staging ]
                                         • Sec 173 CrPC / Sec 193 BNSS
                                         • Statutory Deadline Tracking
                                                      │
                                                      ▼
                                       [ 10. Court Filing & Hearing ]
                                         • Judicial Docket Entry
                                         • Bail / Remand Records
                                                      │
                                                      ▼
                                       [ 11. Certified Dossier Export ]
                                         • Evidence Certificates
                                         • Hash Non-Repudiation Printout
                                                      │
                                                      ▼
                                       [ 12. Secure Logout & Session End ]
```

---

## 2. Stage-by-Stage Workflow Details

### Stage 1: Authentication & Identity Establishment
1. **Inspector Access**: The Inspector accesses the DocShield application URL via a modern web browser.
2. **Credential Submission**: Enters official Police Badge / ID number and password.
3. **Session Issuance**: Upon successful verification, the backend issues an ephemeral JWT access token (15-min lifespan) paired with an encrypted, rotating HTTP-only refresh cookie.
4. **Audit Logging**: An immutable `AUTH_LOGIN` event is recorded with timestamp, IP address, and browser fingerprint.
5. **Redirection**: Inspector is directed to `/dashboard`.

---

### Stage 2: Dashboard Review & Daily Triage
1. **KPI Assessment**: The Inspector observes 5 primary metric cards:
   - **My Active Cases**: Currently open investigations assigned to the officer.
   - **Documents**: Total uploaded investigation documents across assigned cases.
   - **Evidence Items**: Count of logged physical and digital seizure articles.
   - **Charge Sheets**: Cases pending final charge sheet staging or nearing filing deadlines.
   - **Integrity Verified %**: Mathematically calculated percentage of active documents possessing verified SHA-256 cryptographic match.
2. **Action Item Review**: Inspector inspects the "Pending Actions" and "Recent Activity" feeds for flagged integrity alerts, incoming evidence transfers, or urgent court hearing reminders.
3. **Quick Navigation**: Inspector uses the top navigation or Quick Action buttons (`Add New Case`, `Upload Document`, `Log Evidence`) to transition directly into workstreams.

---

### Stage 3: Case Creation & Assignment Intake
1. **Initiation**: Inspector clicks `+ Add New Case` on the Cases view or Dashboard.
2. **Metadata Entry**: A standardized modal prompts for:
   - Crime No. / Case Reference (e.g., `CR-2026-BH-0104`).
   - Legal Section (e.g., `IPC 302 / BNS 103(1) - Murder`).
   - Incident Date & Time.
   - Registration Date & Time.
   - Police Station Jurisdiction (pre-filled to Inspector's precinct, e.g., `Bhopal Central PS`).
   - Brief Incident Summary / Complainant Details.
3. **Validation & Creation**: The backend validates uniqueness, auto-assigns the creating Inspector as Primary IO, and commits the case to the database with status `Active`.
4. **Audit Logging**: An audit event `CASE_CREATE` is appended.

---

### Stage 4: Case Opening & Detail Inspection
1. **Navigation**: Inspector clicks on a case row in the Cases table (`/cases/:id`).
2. **Overview Pane**: The Case Detail view displays:
   - Header with Case No, Status badge (`Active`), Station, Primary IO, and Last Updated date.
   - Primary Tabs: **Overview**, **FIR**, **Documents**, **Evidence**, **Forensics**, **Charge Sheet**, **Court Filings**, **Chain of Custody**, and **Audit Log**.
3. **Contextual Awareness**: All actions executed within these tabs are automatically scoped to this specific Case ID.

---

### Stage 5: Document Intake & Cryptographic Hashing
1. **Document Selection**: Under the **Documents** tab, Inspector clicks `+ Upload Document`.
2. **Classification**: Inspector selects document type:
   - `FIR` (Foundational police document)
   - `Witness Statement` (Depositions recorded under Sec 161 CrPC / 180 BNSS)
   - `Panchnama / Seizure Memo` (Contemporaneous on-site seizure memos)
   - `Medical / Post-Mortem Report`
   - `CCTV / Media Extraction`
   - `General Investigation Report`
3. **File Ingestion**: Inspector uploads the PDF, image, or media file (max 50 MB per document).
4. **Automated Cryptographic Hashing**:
   - The backend ingests the byte stream into memory.
   - Computes deterministic SHA-256 digest: `e.g., a8f5c2d...89b1`.
   - Stores the encrypted file payload in the secure storage layer.
   - Inserts record into `documents` and baseline digest into `document_integrity_records`.
   - Initial status is marked `Verified` (as baseline is established).
5. **Audit Trail**: Logs `DOC_UPLOAD` with file digest and user ID.

---

### Stage 6: Evidence Registration & Chain of Custody (CoC)
1. **Evidence Registration**: Under the **Evidence** tab, Inspector clicks `+ Log Evidence`.
2. **Metadata Recording**:
   - Evidence Tag / Barcode ID (e.g., `EV-BH-2026-0089`).
   - Category (`Firearm`, `Blunt Weapon`, `Mobile Device`, `Blood Swab`, `Hard Drive`).
   - Seizure Date, Time, and Exact Geographic Location.
   - Witness Names who signed the seizure Panchnama.
   - Attached digital image/dump of the evidence item.
3. **Initial Custody Establishment**:
   - Current Holder is set to the seizing Inspector.
   - Location is set to `Investigating Officer Locker / Desk`.
4. **Custody Transfer Execution**:
   - When evidence must be moved (e.g., dispatched to Forensic Lab or deposited in the Station Malkhana), Inspector selects `Transfer Custody`.
   - Specifies: `Released By` (Self), `Received By` (e.g., Head Constable Malkhana In-Charge / FSL Courier), `Transfer Purpose` (e.g., `Safe Custodial Storage`), and `Destination`.
   - Status updates from `In Custody` to `In Transit` or `In Station Malkhana`.
   - An immutable record is committed to `chain_of_custody_events`.

---

### Stage 7: Forensic Science Laboratory (FSL) Tracking
1. **Dispatch Logging**: Under the **Forensics** tab, Inspector logs the requisition number sent to State FSL.
2. **Requisition Status**: Status tracked as `Requisitioned`, `Sample Received at FSL`, or `Analysis Completed`.
3. **Report Ingestion**: Once FSL delivers the official report (Ballistics, Toxicology, DNA, or Cyber Forensics):
   - Inspector uploads the official FSL PDF.
   - Enters Lab Docket No., Chemical Examiner / Forensic Expert Name, and Key Conclusion.
   - Automated SHA-256 digest is generated immediately.
   - Report is permanently linked to the Case and the relevant Evidence Seizure Tag.

---

### Stage 8: Document Integrity Verification & Tamper Detection
1. **Inspector Verification Trigger**:
   - Inspector can click `Verify Integrity` on any individual document row.
   - Or click `Verify All Case Documents` on the Case Detail header.
2. **Verification Execution**:
   - Backend fetches the stored file payload from storage.
   - Recalculates SHA-256 digest over the current byte stream.
   - Compares the newly computed digest with the stored baseline digest in `document_integrity_records`.
3. **State Transition**:
   - **Match**: Document remains in `Verified` status; `last_verified_at` timestamp is updated.
   - **Mismatch**: Status immediately transitions to `Integrity Failed` in high-contrast red badge; an urgent notification is broadcast, and an `INTEGRITY_TAMPER_ALERT` audit entry is created.
4. **Dashboard Impact**: The platform's overall `Integrity Verified %` dynamically recalculates to reflect the newly verified/failed ratio.

---

### Stage 9: Final Report & Charge Sheet Staging
1. **Preparation**: As statutory filing deadlines approach (60/90 days from arrest), Inspector opens the **Charge Sheet** tab.
2. **Staging Final Details**:
   - Enters Accused Particulars (Name, Arrest Date, Bail Status).
   - Offenses Charged (Sections of IPC/BNS).
   - Summary of Evidence gathered (referencing attached witness depositions, FSL reports, and seizure memos).
3. **Document Attachment**: Uploads finalized, signed Form 173 CrPC / Form 193 BNSS PDF.
4. **Cryptographic Sealing**: The Charge Sheet document is hashed and locked. Status transitions to `Charge-Sheeted`.

---

### Stage 10: Court Filing & Judicial Tracking
1. **Filing Record**: Under **Court Filings**, Inspector records:
   - Designated Judicial Court (e.g., `Chief Judicial Magistrate, Bhopal`).
   - Filing / C.C. Number.
   - Presiding Judge Name.
   - Date of Presentation in Court.
2. **Hearing Schedule**: Logs next hearing date, judicial remand orders, or bail hearing outcomes.
3. **Court Attendance Pack**: Inspector generates verified case files ready for prosecutor brief.

---

### Stage 11: Certified Dossier Export & Reporting
1. **Export Initiation**: Inspector clicks `Generate Case Dossier` from the Case Detail view.
2. **Report Generation**:
   - System compiles an official PDF document containing:
     - Case Title, Section, Incident Summary.
     - Document Inventory with recorded SHA-256 hash digests and verification timestamps.
     - Evidence Ledger and complete unbroken Chain of Custody ledger.
     - Forensic test summaries.
     - Legal certificate of electronic records compliance.
3. **Use in Court**: Printed or digitally signed for presentation under legal evidentiary requirements.

---

### Stage 12: Notifications & Session Termination
1. **Notification Review**: Inspector reviews in-app bell notification popover for:
   - Completed background verification jobs.
   - Custody transfer acceptance confirmations.
   - Upcoming statutory charge-sheet deadlines (e.g., `7 days remaining for Case CR-2026-BH-0042`).
2. **Logout**: Inspector clicks profile dropdown in the top navigation bar and selects `Logout`.
3. **Session Invalidation**: Access token is discarded on client; refresh cookie is revoked; `AUTH_LOGOUT` audit record is committed.

---

## 3. Document Cross-References
- Product Overview: [01_PRODUCT_OVERVIEW.md](file:///d:/msi/love_you/docs/01_PRODUCT_OVERVIEW.md)
- Information Architecture: [04_INFORMATION_ARCHITECTURE.md](file:///d:/msi/love_you/docs/04_INFORMATION_ARCHITECTURE.md)
- UI/UX Specifications: [05_UI_UX_SPECIFICATION.md](file:///d:/msi/love_you/docs/05_UI_UX_SPECIFICATION.md)
- Cryptographic Integrity Engine: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
- Evidence & Custody: [14_EVIDENCE_MANAGEMENT.md](file:///d:/msi/love_you/docs/14_EVIDENCE_MANAGEMENT.md) & [15_CHAIN_OF_CUSTODY.md](file:///d:/msi/love_you/docs/15_CHAIN_OF_CUSTODY.md)
