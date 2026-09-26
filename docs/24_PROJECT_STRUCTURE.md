# 24. Project Structure & Codebase Organization — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Monorepo Structural Philosophy

DocShield organizes its codebase into a **clean, modular, single-repository structure**. The project separates presentation, API backend, database schema definitions, automated test suites, and technical documentation into distinct top-level directories.

Unnecessary, deeply nested, or redundant directories are strictly prohibited.

```
docshield/
│
├── frontend/                  # Inspector Single-Page Web Application
├── backend/                   # Node.js / Express API & Cryptographic Engine
├── database/                  # Schema Migrations, DDL, and Seed Scripts
├── docs/                      # Authoritative Technical Documentation (Source of Truth)
├── scripts/                   # Operational, Build, and Seeding Utilities
├── tests/                     # Cross-Cutting End-to-End & Tamper Simulation Suites
│
├── .env.example               # Standardized Environment Variable Template
├── docker-compose.yml         # Container Orchestration Specification
├── README.md                  # Master Repository Overview
└── .gitignore                 # Version Control Ignore Rules
```

---

## 2. Directory Responsibilities & Breakdown

### 2.1 `frontend/` (Inspector Presentation Layer)
Hosts the complete single-page client interface built without left sidebars, using the light police SaaS design language.

```
frontend/
├── public/                    # Static assets, official police emblems, favicons
├── src/
│   ├── assets/                # Icons, SVG vectors, typography files
│   ├── components/            # Reusable UI component library
│   │   ├── common/            # Buttons, Inputs, Modals, Status Badges, Tables
│   │   └── layout/            # Horizontal Top Navbar, Breadcrumbs, Page Container
│   ├── features/              # Case-Centric Domain Views
│   │   ├── dashboard/         # Stat cards, recent cases, live activity feed
│   │   ├── cases/             # Cases grid, Case Detail cockpit & 9 sub-tabs
│   │   ├── documents/         # Cross-case document ledger & verification modals
│   │   ├── evidence/          # Seizure catalog & custody transfer drawers
│   │   ├── forensics/         # FSL requisition & test report views
│   │   ├── chargeSheets/      # CrPC 173 staging & deadline countdown
│   │   ├── courtFilings/      # Court dockets & magistrate order archives
│   │   ├── chainOfCustody/    # Global custody timeline & certificate views
│   │   └── audit/             # Searchable forensic audit stream
│   ├── services/              # API Client HTTP connectors (Fetch / Axios)
│   ├── context/               # Auth state & active Inspector session context
│   ├── hooks/                 # Reusable React/Vue hooks (useCase, useIntegrity)
│   ├── styles/                # Vanilla CSS tokens, reset, typography, themes
│   ├── App.jsx / App.tsx      # Main application router and shell
│   └── main.jsx / main.tsx    # Application entry point
├── package.json
└── vite.config.js             # Modern lightweight bundler config
```

---

### 2.2 `backend/` (Domain Services & Crypto Engine)
Houses the business logic, REST controllers, SHA-256 integrity calculator, and relational data access.

```
backend/
├── src/
│   ├── config/                # Environment, DB connections, storage configs
│   ├── common/                # Shared utilities, crypto helpers, custom error classes
│   │   ├── errors/            # RFC 7807 Problem Details error definitions
│   │   ├── middleware/        # Auth, RBAC, Rate-limit, and Validation interceptors
│   │   └── storage/           # Local disk and S3 storage driver implementations
│   ├── modules/               # Domain-Driven Functional Modules
│   │   ├── auth/              # Inspector login, token verification, logout
│   │   ├── cases/             # Case CRUD, status updates, case overview aggregation
│   │   ├── documents/         # Document intake, versioning, streaming downloads
│   │   ├── integrity/         # Synchronous SHA-256 hasher, verify engine, % calculator
│   │   ├── evidence/          # Seizure logging, tagging, status state machine
│   │   ├── chainOfCustody/    # Immutable custody transfer logging & timeline queries
│   │   ├── forensics/         # FSL requisitions and scientific report attachments
│   │   ├── chargeSheets/      # Sec 173 CrPC draft staging & deadline alerts
│   │   ├── courtFilings/      # Judicial docket logging & hearing tracking
│   │   ├── audit/             # Append-only forensic security audit engine
│   │   └── notifications/     # In-app alerts, deadline triggers, integrity warnings
│   ├── server.js / app.ts     # Express/Node server bootstrap and middleware pipeline
│   └── index.js               # Application launcher
├── package.json
└── tsconfig.json              # TypeScript compilation rules (if applicable)
```

---

### 2.3 `database/` (Data Model & Schema Migrations)
Maintains pure, version-controlled SQL DDL scripts, ensuring identical relational databases across all environments.

```
database/
├── migrations/                # Chronological SQL migration files
│   ├── 001_create_roles_and_users.sql
│   ├── 002_create_cases_and_assignments.sql
│   ├── 003_create_documents_and_integrity.sql
│   ├── 004_create_evidence_and_custody.sql
│   ├── 005_create_forensics_charges_courts.sql
│   └── 006_create_audit_and_notifications.sql
├── seeds/                     # Baseline seeding data
│   ├── 01_police_stations.sql # Bhopal Central PS, Indore PS
│   ├── 02_inspector_users.sql # Seed Inspector A. Sharma account
│   └── 03_sample_cases.sql    # Prototype cases, evidence, and documents
└── schema.sql                 # Complete monolithic schema definition
```

---

### 2.4 `docs/` (Authoritative Documentation Suite)
Contains the authoritative 25 technical specification documents plus master `README.md`.

---

### 2.5 `scripts/` (DevOps & Operational Tools)
- `setup.sh` / `setup.bat`: One-click environment bootstrap.
- `seed.sh`: Populates test cases, documents, and custody events.
- `verify-integrity-cli.js`: Standalone CLI tool to verify file hashes directly from server terminal.

---

### 2.6 `tests/` (Verification & Quality Assurance)
- `unit/`: Unit tests for hash streaming, math formulas, and validators.
- `integration/`: API endpoint tests using mock databases.
- `tamper/`: Specialized test harness simulating bit-level file alterations and confirming `Integrity Failed` triggers.
- `e2e/`: Browser-automated Playwright test scenarios.

---

## 3. Document Cross-References
- System Architecture: [07_SYSTEM_ARCHITECTURE.md](file:///d:/msi/love_you/docs/07_SYSTEM_ARCHITECTURE.md)
- Backend Architecture: [08_BACKEND_ARCHITECTURE.md](file:///d:/msi/love_you/docs/08_BACKEND_ARCHITECTURE.md)
- Database Schema: [10_DATABASE_SCHEMA.md](file:///d:/msi/love_you/docs/10_DATABASE_SCHEMA.md)
- Deployment Guide: [23_DEPLOYMENT.md](file:///d:/msi/love_you/docs/23_DEPLOYMENT.md)
- Implementation Roadmap: [25_IMPLEMENTATION_ROADMAP.md](file:///d:/msi/love_you/docs/25_IMPLEMENTATION_ROADMAP.md)
