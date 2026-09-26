# 25. Implementation Roadmap — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Roadmap Architecture & Execution Philosophy

The DocShield implementation is structured as an **Inspector-First, 12-Phase Sequential Engineering Roadmap**. Each phase delivers a complete, testable increment of the system, culminating in a presentation-ready digital evidence management platform for **Smart India Hackathon (SIH 26190)**.

```
[ Phase 1: Foundation ]
           │
           ▼
[ Phase 2: Auth & RBAC ]
           │
           ▼
[ Phase 3: Inspector Dashboard ]
           │
           ▼
[ Phase 4: Cases Management ]
           │
           ▼
[ Phase 5: Documents & Files ]
           │
           ▼
[ Phase 6: Evidence Seizures ]
           │
           ▼
[ Phase 7: Cryptographic Integrity ]
           │
           ▼
[ Phase 8: Chain of Custody ]
           │
           ▼
[ Phase 9: Forensics / Charge Sheets / Court ]
           │
           ▼
[ Phase 10: Audit & Notifications ]
           │
           ▼
[ Phase 11: Quality Assurance & Testing ]
           │
           ▼
[ Phase 12: Deployment & Packaging ]
           │
═══════════╪══════════════════════════════════════════════════
           ▼
[ FUTURE PHASES: Post-SIH Admin & Enterprise Integrations ]
```

---

## 2. Phase-by-Phase Implementation Plan

### Phase 1: Engineering Foundation & Monorepo Setup
- Initialize repository structure (`frontend/`, `backend/`, `database/`, `docs/`, `scripts/`, `tests/`).
- Configure root Docker Compose and environment variable templates (`.env.example`).
- Set up PostgreSQL relational database and execute initial migration scripts (`001_create_roles_and_users.sql`).
- Establish code formatting, linting, and Git pre-commit hooks.

### Phase 2: Authentication & RBAC Engine
- Implement user password hashing (`bcrypt`) and credential validation.
- Implement stateless JWT issuance (15-min access token + rotating `HttpOnly` refresh token).
- Build authentication middleware (`authMiddleware`, `requireInspectorRole`).
- Seed baseline Inspector accounts: `Insp. A. Sharma` (`INSP-BH-104`) at `Bhopal Central PS`.
- Build client-side Login screen and persistent session state manager.

### Phase 3: Inspector Dashboard Core
- Implement horizontal top navigation bar (Shield logo, top links, search bar, notification bell, inspector profile badge; **zero left sidebar**).
- Build Dashboard stats endpoint (`GET /api/v1/dashboard/stats`).
- Render the 5 primary KPI cards:
  - `My Active Cases`
  - `Documents`
  - `Evidence Items`
  - `Charge Sheets`
  - `Integrity Verified %` (dynamically calculated from DB verification rows).
- Construct the Quick Actions action bar and recent cases summary table.

### Phase 4: Case Management Module
- Implement Case DDL schema, relationships, and indexes.
- Build REST APIs: `GET /api/v1/cases`, `POST /api/v1/cases`, `GET /api/v1/cases/:id`, `PATCH /api/v1/cases/:id/status`.
- Implement Cases view with status pills (`Active`, `Under Review`, `Charge-Sheeted`, `Closed`), search bar, and section dropdown.
- Construct the `+ Add New Case` modal dialog with input validation.
- Build the comprehensive Case Detail cockpit with horizontal tabs (`Overview`, `FIR`, `Documents`, `Evidence`, `Forensics`, `Charge Sheet`, `Court Filings`, `Chain of Custody`, `Audit Log`).

### Phase 5: Document Ingestion & Storage Architecture
- Implement file storage driver (Local encrypted volume or S3-compatible).
- Build streaming multipart file ingestion middleware with magic byte inspection and 50 MB size limits.
- Build REST APIs: `POST /api/v1/cases/:id/documents`, `GET /api/v1/cases/:id/documents`, `GET /api/v1/documents/:id/download`.
- Build the Document Upload modal with classification tags (`FIR`, `Witness Statement`, `Panchnama`, `Medical Report`, `CCTV Media`).
- Support in-browser document streaming and PDF viewing.

### Phase 6: Evidence Seizure & Property Management
- Implement `evidence` relational schema and unique barcode/tag generator (`EV-BH-2026-XXXX`).
- Build REST APIs: `POST /api/v1/cases/:id/evidence`, `GET /api/v1/cases/:id/evidence`.
- Construct Evidence tab with category cards (Firearm, Weapon, Electronic, Narcotics, Biological, Document).
- Implement initial custody assignment to the seizing Inspector.

### Phase 7: Cryptographic Integrity Engine
- Build the synchronous SHA-256 byte streaming calculation routine.
- Store baseline digests in `document_integrity_records`.
- Implement on-demand re-verification endpoint: `POST /api/v1/documents/:id/verify`.
- Implement batch case verification: `POST /api/v1/cases/:id/verify-all`.
- Wire up the dynamic `Integrity Verified %` formula:
  $$\text{Integrity \%} = \frac{\text{Verified Documents}}{\text{Total Uploaded Documents}} \times 100$$
- Integrate the high-contrast `[ Verified ]` (Green) and `[ Integrity Failed ]` (Red) UI badges.

### Phase 8: Chain of Custody (CoC) Ledger
- Implement append-only `chain_of_custody_events` schema with database immutability trigger.
- Build Custody Transfer API: `POST /api/v1/evidence/:id/transfer`.
- Build interactive "Transfer Custody" modal (capturing Releasing Officer, Recipient, Badge, Purpose, and Destination).
- Construct the chronological visual custody timeline on both the Case Detail view and the Evidence detail drawer.

### Phase 9: Forensics, Charge Sheets & Court Filings
- **Forensics**: FSL requisition tracking and scientific lab report attachment.
- **Charge Sheets**: Staging Final Reports under Sec 173 CrPC / Sec 193 BNSS, accused grid, and statutory 60/90-day deadline countdown rings.
- **Court Filings**: Hearing logs, magistrate order archiving, and judicial appearance dockets.

### Phase 10: Forensic Audit Logging & In-App Notifications
- Implement append-only `audit_logs` service recording all 14 security-sensitive actions.
- Build Case-scoped Audit Log tab displaying searchable event history, actor badges, IP addresses, and hash diffs.
- Implement the notification service and top navigation bell tray with unread counters and critical integrity toast alerts.

### Phase 11: End-to-End Testing & Forensic Verification
- Execute automated unit test suites for crypto hashing and mathematical integrity calculations.
- Run integration API suites covering all `/api/v1` routes.
- Execute the **Cryptographic Tamper Simulation Test**: artificially altering 1 file byte and confirming instant `Integrity Failed` detection and audit logging.
- Perform end-to-end user journey tests across the complete Inspector workflow.

### Phase 12: Production Packaging & SIH Demo Preparation
- Optimize frontend production bundle (Vite build) and verify sub-second load times.
- Configure clean Docker Compose production deployment stack.
- Generate high-quality mock data: realistic Bhopal Police cases, panchnamas, ballistic reports, and CCTV captures.
- Validate that all PDF dossier exports and printable views render cleanly.

---

## 3. Future Phases: Enterprise Administration & Scaling (POST-SIH)

> [!NOTE]
> **Conceptual Future Scope**: The following features are strictly reserved for post-hackathon enterprise scaling and will **not** be included in the active Inspector prototype:
- **Phase 13: System Administration & RBAC Management**:
  - Dynamic user provisioning, password resets, and role creation.
  - Police station master configuration (precinct boundaries, jurisdictional pin codes).
- **Phase 14: Enterprise Multi-Tenancy & National Portal Sync**:
  - Bi-directional sync with National CCTNS / ICJS databases.
  - Direct integration with State FSL digital portals and eCourts.
- **Phase 15: Hardware Malkhana Barcode Scanners & Smart Lockers**:
  - Physical warehouse RFID / 2D barcode scanner integration.
  - IoT biometric evidence locker integration.

---

## 4. Document Cross-References
- Product Overview: [01_PRODUCT_OVERVIEW.md](file:///d:/msi/love_you/docs/01_PRODUCT_OVERVIEW.md)
- Requirements Specification: [02_REQUIREMENTS.md](file:///d:/msi/love_you/docs/02_REQUIREMENTS.md)
- System Architecture: [07_SYSTEM_ARCHITECTURE.md](file:///d:/msi/love_you/docs/07_SYSTEM_ARCHITECTURE.md)
- Testing Strategy: [22_TESTING_STRATEGY.md](file:///d:/msi/love_you/docs/22_TESTING_STRATEGY.md)
- Deployment Architecture: [23_DEPLOYMENT.md](file:///d:/msi/love_you/docs/23_DEPLOYMENT.md)
