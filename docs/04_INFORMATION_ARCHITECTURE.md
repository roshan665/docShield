# 04. Information Architecture — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Architectural Topology Overview

DocShield uses a **horizontal, case-anchored topology**. Rather than burying the investigator inside deep hierarchical menus or using vertical sidebars, the system organizes information into:

1. **Global High-Level Hubs** accessible via the constant horizontal top navbar.
2. **Contextual Case-Centric Workspaces** accessible when drilling into any specific Case ID (`/cases/:id`).

All records displayed across standalone navigation hubs (e.g., Documents, Evidence, Forensics) maintain active relational links directly back to their parent Case.

```
DocShield Top Navigation
│
├── Dashboard (/)
│     ├── Stat Cards (Active Cases, Documents, Evidence, Charge Sheets, Integrity %)
│     ├── Recent / Assigned Cases
│     ├── Document Integrity Overview
│     ├── Quick Action Triggers
│     └── Real-Time Activity Feed
│
├── Cases (/cases)
│     ├── Cases Data Grid (Filters: All, Active, Under Review, Closed)
│     ├── Case Search & Section Filter
│     ├── + Add New Case Modal
│     └── Case Detail View (/cases/:id)
│           ├── Tab 1: Overview (Crime Details, Summary, Parties, Metadata)
│           ├── Tab 2: FIR (Registered First Information Report & Baseline Hash)
│           ├── Tab 3: Documents (Witness Statements, Panchnamas, Medical Memos)
│           ├── Tab 4: Evidence (Seized Physical/Digital Articles & Statuses)
│           ├── Tab 5: Forensics (FSL Requisitions, Test Results, Ballistics/DNA)
│           ├── Tab 6: Charge Sheet (Sec 173 CrPC Staging, Accused Lists)
│           ├── Tab 7: Court Filings (Court Appearance Dockets, Hearing Dates)
│           ├── Tab 8: Chain of Custody (Chronological Custody Timeline)
│           └── Tab 9: Audit Log (Case-Scoped Transactional Trail)
│
├── Documents (/documents)
│     ├── Cross-Case Investigation Document Ledger
│     ├── Filters by Type (FIR, Statement, Panchnama, Medical, Forensic, Other)
│     ├── Integrity Status Badges (Verified, Pending, Failed)
│     └── Run Batch Integrity Audit
│
├── Evidence (/evidence)
│     ├── Cross-Case Seized Articles Inventory
│     ├── Filter by Category (Weapon, Digital, Narcotics, Bio, Currency)
│     ├── Current Custody Holder & Location Tracker
│     └── Quick Custody Transfer Drawer
│
├── Forensic Reports (/forensics)
│     ├── Centralized FSL Requisition Tracker
│     ├── Report Ingestion & Hash Anchoring
│     └── Forensic Expert Conclusions Ledger
│
├── Charge Sheets (/charge-sheets)
│     ├── Final Police Reports under CrPC 173 / BNSS 193
│     ├── Statutory Deadline Countdown (60/90 Days)
│     └── Ready for Court Submission Pipeline
│
├── Court Filings (/court-filings)
│     ├── Active Judicial Dockets & Hearing Schedules
│     ├── Remand & Bail Order Archives
│     └── Public Prosecutor Brief Exporter
│
├── Chain of Custody (/chain-of-custody)
│     ├── Master Custody Ledger for all physical and digital evidence
│     ├── Handover Timeline & Pending In-Transit Acceptances
│     └── Section 65B/63 Indian Evidence Act Provenance Ledger
│
└── Audit Logs (/audit-logs)
      ├── Immutable System Activity Stream (Inspector-Scoped)
      ├── Filter by Action Type (Login, Upload, Verify, Transfer, Case Create)
      └── Timestamp, IP, and Digital Signature Traceability
```

---

## 2. Navigation & Routing Model

### 2.1 Top-Level Horizontal Navigation
The persistent top navigation bar provides immediate access to all core product areas. The active view is highlighted with a clean, high-contrast navy indicator pill.

| Route Path | View Title | Scope & Purpose |
| :--- | :--- | :--- |
| `/` or `/dashboard` | **Dashboard** | Operational mission control; KPIs, integrity gauge, recent cases. |
| `/cases` | **Cases** | Directory of all assigned investigations with search, filter, and creation. |
| `/cases/:id` | **Case Detail** | The primary investigative cockpit containing all 9 tabbed modules for a case. |
| `/documents` | **Documents** | Master document inventory across cases with cryptographic verification controls. |
| `/evidence` | **Evidence** | Physical and digital evidence catalog, custody statuses, and transfer links. |
| `/forensics` | **Forensic Reports** | FSL testing pipeline, chemical/ballistic reports, and expert summaries. |
| `/charge-sheets` | **Charge Sheets** | Statutory charge sheet preparation, accused particulars, and deadline alerts. |
| `/court-filings` | **Court Filings** | Court schedules, judicial filing dates, and magistrate hearing outcomes. |
| `/chain-of-custody`| **Chain of Custody** | Global custody transfer history and proof-of-possession timelines. |
| `/audit-logs` | **Audit Logs** | Case-related event timeline ensuring complete procedural transparency. |

---

## 3. Case-Centric Relational Navigation

The central design principle of DocShield is **Case Centrality**. Although high-level menus allow cross-case querying, every primary record directly links back to its parent Case:

```
                                  ┌──────────────────┐
                                  │   CASE RECORD    │
                                  │ (CR-2026-BH-0042)│
                                  └─────────┬────────┘
                                            │
        ┌───────────────┬───────────────────┼───────────────────┬───────────────┐
        ▼               ▼                   ▼                   ▼               ▼
┌──────────────┐ ┌──────────────┐   ┌──────────────┐    ┌──────────────┐ ┌──────────────┐
│     FIR      │ │  Documents   │   │   Evidence   │    │  Forensics   │ │ Charge Sheet │
│ (Form 154)   │ │ (Statements) │   │ (Seizures)   │    │ (FSL Memos)  │ │ (Sec 173)    │
└──────────────┘ └──────┬───────┘   └───────┬──────┘    └──────────────┘ └──────┬───────┘
                        │                   │                                   │
                        ▼                   ▼                                   ▼
                ┌──────────────┐    ┌──────────────┐                    ┌──────────────┐
                │ Cryptographic│    │   Chain of   │                    │    Court     │
                │ Hash Records │    │   Custody    │                    │   Filings    │
                └──────────────┘    └──────────────┘                    └──────────────┘
```

### 3.1 Seamless Contextual Hopping
1. **From Evidence to Case**: Clicking the Case Number tag on any evidence row immediately navigates to `/cases/:id?tab=evidence`.
2. **From Custody Event to Evidence**: Clicking an Evidence ID in the Chain of Custody view opens the Evidence Detail drawer displaying its entire possession history.
3. **From Document to Integrity Proof**: Clicking the `Verified` badge on any document row displays an inspection popover showing the SHA-256 baseline digest, time of verification, and match confirmation.

---

## 4. Breadcrumb & State Hierarchy

DocShield implements an unambiguous, standardized breadcrumb pattern located immediately beneath the horizontal navbar:

- **Dashboard**: `Dashboard`
- **Cases List**: `Dashboard > Cases`
- **Case Detail**: `Dashboard > Cases > CR-2026-BH-0042`
- **Case Tab**: `Dashboard > Cases > CR-2026-BH-0042 > Evidence`
- **Cross-Case Document**: `Dashboard > Documents`
- **Cross-Case Custody**: `Dashboard > Chain of Custody > EV-BH-2026-0089`

---

## 5. Screen Hierarchy & Relationship Matrix

| Screen Component | Parent View | Key Child Entities / Modals | Primary Action |
| :--- | :--- | :--- | :--- |
| **Dashboard** | Root | Stat Cards, Quick Actions, Activity Feed | Triage daily operational workload |
| **Cases Table** | `/cases` | Case Search, Filter Pill Group, Add Case Modal | Filter, sort, and launch new cases |
| **Case Detail** | `/cases/:id` | 9 Sub-tabs (Overview to Audit) | Comprehensive case management |
| **Document List** | Case Detail / Docs | Document Viewer Modal, Upload Modal, Hash Details | Verify cryptographic integrity |
| **Evidence Ledger** | Case Detail / Evid | Evidence Card, Transfer Custody Modal, QR Label | Initiate custody handover |
| **Forensic View** | Case Detail / Foren| FSL Requisition Form, Report Upload Modal | Monitor scientific evidence |
| **Charge Sheet** | Case Detail / CS | Accused Grid, Offense Section Picker, PDF Preview | Stage final police report |
| **Court Docket** | Case Detail / Court| Hearing Scheduler, Order Ingestion Form | Log judicial outcomes |
| **Custody Timeline**| Case Detail / CoC | Transfer Verification Modal, Custodian Sign-off | Guarantee legal provenance |
| **Audit Stream** | Case Detail / Audit| Audit Entry Detail Drawer, Export Audit Log | Review non-repudiation trails |

---

## 6. Document Cross-References
- Product Vision: [01_PRODUCT_OVERVIEW.md](file:///d:/msi/love_you/docs/01_PRODUCT_OVERVIEW.md)
- Inspector User Journey: [03_INSPECTOR_WORKFLOW.md](file:///d:/msi/love_you/docs/03_INSPECTOR_WORKFLOW.md)
- UI/UX Specifications: [05_UI_UX_SPECIFICATION.md](file:///d:/msi/love_you/docs/05_UI_UX_SPECIFICATION.md)
- Database ER Schema: [10_DATABASE_SCHEMA.md](file:///d:/msi/love_you/docs/10_DATABASE_SCHEMA.md)
- API Specification: [09_API_SPECIFICATION.md](file:///d:/msi/love_you/docs/09_API_SPECIFICATION.md)
