# DocShield Technical Documentation Suite (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Authoritative Source of Truth Statement

> [!IMPORTANT]
> **Definitive Technical Source of Truth**:
> This documentation suite (`docs/`) constitutes the **sole, authoritative, and current technical specification** for the **DocShield** platform (Problem Statement: SIH 26190).
> 
> All legacy or previous versions of the project documentation are deprecated and must NOT be used as reference.
> If any conflict arises between legacy artifacts and this documentation set, **the specifications defined herein strictly prevail**.

---

## 2. Product Scope Definition

- **Current Active Implementation Scope**:
  - Focuses 100% on the **Police Inspector / Investigating Officer (IO) Experience**.
  - Includes: Case Management, Document Intake, Synchronous SHA-256 Hash Generation, Tamper Detection, Physical & Digital Evidence Cataloging, Immutable Chain of Custody (CoC), Forensic Science Laboratory (FSL) Tracking, Charge Sheet Staging (Sec 173 CrPC / 193 BNSS), Court Appearance Docketing, Case Dossier Export, and Case-Scoped Audit Logs.
  - UI Design: **Lightweight Police SaaS Theme, Horizontal Top Navigation Bar, Absolutely NO Left Sidebar**.
- **Future Conceptual Scope (Post-SIH)**:
  - System Administration, User Provisioning, Station Master Configuration, Global Audit Telemetry, Multi-Tenant Departmental Partitioning, and External CCTNS/ICJS Sync.
  - **Explicitly marked as: FUTURE — NOT CURRENT IMPLEMENTATION**.

---

## 3. Master Documentation Index & Summary of Documents

| File Name | Document Title | Primary Purpose & Contents |
| :--- | :--- | :--- |
| [01_PRODUCT_OVERVIEW.md](file:///d:/msi/love_you/docs/01_PRODUCT_OVERVIEW.md) | **Product Overview** | Vision, problem statement (SIH 26190), core tenets, user profiles, glossary, and journey. |
| [02_REQUIREMENTS.md](file:///d:/msi/love_you/docs/02_REQUIREMENTS.md) | **Requirements Specification** | Complete indexed requirement matrices (`FR`, `NFR`, `SEC`, `INT`, `AUD`, `PERF`, `USA`). |
| [03_INSPECTOR_WORKFLOW.md](file:///d:/msi/love_you/docs/03_INSPECTOR_WORKFLOW.md) | **Inspector Workflow** | 12-stage step-by-step lifecycle of an investigation from login to dossier export. |
| [04_INFORMATION_ARCHITECTURE.md](file:///d:/msi/love_you/docs/04_INFORMATION_ARCHITECTURE.md)| **Information Architecture** | Complete sitemap, routing topology, case-centric relational hopping, and breadcrumbs. |
| [05_UI_UX_SPECIFICATION.md](file:///d:/msi/love_you/docs/05_UI_UX_SPECIFICATION.md) | **UI/UX Specification** | Light police SaaS visual language, horizontal top navbar, screens, modals, and states. |
| [06_DESIGN_SYSTEM.md](file:///d:/msi/love_you/docs/06_DESIGN_SYSTEM.md) | **Design System** | Design tokens, color palette, typography, harmonic spacing, buttons, pills, and inputs. |
| [07_SYSTEM_ARCHITECTURE.md](file:///d:/msi/love_you/docs/07_SYSTEM_ARCHITECTURE.md) | **System Architecture** | Multi-tier architectural topology, sequence diagrams, and cryptographic pipelines. |
| [08_BACKEND_ARCHITECTURE.md](file:///d:/msi/love_you/docs/08_BACKEND_ARCHITECTURE.md) | **Backend Architecture** | Layered design, domain module boundaries (`auth`, `cases`, `documents`, `integrity`, etc.). |
| [09_API_SPECIFICATION.md](file:///d:/msi/love_you/docs/09_API_SPECIFICATION.md) | **API Specification** | Full REST API contracts, query parameters, payloads, responses, errors, and audit hooks. |
| [10_DATABASE_SCHEMA.md](file:///d:/msi/love_you/docs/10_DATABASE_SCHEMA.md) | **Database Schema** | Complete relational model, Mermaid ER diagram, PostgreSQL DDL definitions, indexes, and FKs. |
| [11_RBAC.md](file:///d:/msi/love_you/docs/11_RBAC.md) | **Role-Based Access Control** | Inspector capabilities vs limitations; strict isolation from future Admin controls. |
| [12_DOCUMENT_MANAGEMENT.md](file:///d:/msi/love_you/docs/12_DOCUMENT_MANAGEMENT.md) | **Document Management** | 8-stage document lifecycle, supported legal document types, and metadata schema. |
| [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md) | **Document Integrity** | SHA-256 cryptographic engine, tamper detection, and deterministic percentage formula. |
| [14_EVIDENCE_MANAGEMENT.md](file:///d:/msi/love_you/docs/14_EVIDENCE_MANAGEMENT.md) | **Evidence Management** | Seizure logging, tagging (`EV-BH-YYYY-XXXX`), digital payload attachment, and status states. |
| [15_CHAIN_OF_CUSTODY.md](file:///d:/msi/love_you/docs/15_CHAIN_OF_CUSTODY.md) | **Chain of Custody** | Unbroken custody tracking complying with Section 65B/63 evidence law; transfer workflows. |
| [16_AUDIT_LOGGING.md](file:///d:/msi/love_you/docs/16_AUDIT_LOGGING.md) | **Audit Logging** | Append-only security logging for all 14 sensitive actions; DB-level immutability rules. |
| [17_FILE_STORAGE.md](file:///d:/msi/love_you/docs/17_FILE_STORAGE.md) | **File Storage Architecture** | Provider-agnostic storage abstraction, deterministic key naming, and AES-256 at rest. |
| [18_SECURITY_ARCHITECTURE.md](file:///d:/msi/love_you/docs/18_SECURITY_ARCHITECTURE.md) | **Security Architecture** | Defense-in-depth model: JWT, TLS 1.3, CSP, magic byte validation, and OWASP defenses. |
| [19_NOTIFICATION_SYSTEM.md](file:///d:/msi/love_you/docs/19_NOTIFICATION_SYSTEM.md) | **Notification System** | Operational alert triggers, statutory deadline warnings, and top-nav notification tray. |
| [20_REPORTING.md](file:///d:/msi/love_you/docs/20_REPORTING.md) | **Reporting & Dossiers** | Case-centric certified dossier generation, PDF exports, and print stylesheets. |
| [21_ERROR_HANDLING.md](file:///d:/msi/love_you/docs/21_ERROR_HANDLING.md) | **Error Handling** | RFC 7807 Problem Details error envelopes, canonical error codes, and client handling. |
| [22_TESTING_STRATEGY.md](file:///d:/msi/love_you/docs/22_TESTING_STRATEGY.md) | **Testing Strategy** | 11-dimension testing framework, tamper simulation test, and CI automation pipelines. |
| [23_DEPLOYMENT.md](file:///d:/msi/love_you/docs/23_DEPLOYMENT.md) | **Deployment Architecture** | Docker Compose topology, reverse proxy, environment secrets, and backup protocols. |
| [24_PROJECT_STRUCTURE.md](file:///d:/msi/love_you/docs/24_PROJECT_STRUCTURE.md) | **Project Structure** | Clean monorepo directory layout (`frontend/`, `backend/`, `database/`, `docs/`, `scripts/`, `tests/`).|
| [25_IMPLEMENTATION_ROADMAP.md](file:///d:/msi/love_you/docs/25_IMPLEMENTATION_ROADMAP.md)| **Implementation Roadmap** | 12-phase sequential engineering roadmap for building and presenting the platform. |

---

## 4. Recommended Reading & Implementation Order

### For Frontend Engineers:
1. [01_PRODUCT_OVERVIEW.md](file:///d:/msi/love_you/docs/01_PRODUCT_OVERVIEW.md) (Context & Principles)
2. [04_INFORMATION_ARCHITECTURE.md](file:///d:/msi/love_you/docs/04_INFORMATION_ARCHITECTURE.md) (Navigation & Sitemap)
3. [05_UI_UX_SPECIFICATION.md](file:///d:/msi/love_you/docs/05_UI_UX_SPECIFICATION.md) (Screen Layouts & UI Hierarchy)
4. [06_DESIGN_SYSTEM.md](file:///d:/msi/love_you/docs/06_DESIGN_SYSTEM.md) (Tokens, Colors, Spacing, Components)
5. [09_API_SPECIFICATION.md](file:///d:/msi/love_you/docs/09_API_SPECIFICATION.md) (Endpoint Contracts & Payloads)

### For Backend & Database Engineers:
1. [07_SYSTEM_ARCHITECTURE.md](file:///d:/msi/love_you/docs/07_SYSTEM_ARCHITECTURE.md) (Overall Architecture & Data Flows)
2. [08_BACKEND_ARCHITECTURE.md](file:///d:/msi/love_you/docs/08_BACKEND_ARCHITECTURE.md) (Layered Architecture & Domain Modules)
3. [10_DATABASE_SCHEMA.md](file:///d:/msi/love_you/docs/10_DATABASE_SCHEMA.md) (Relational Models & DDL Constraints)
4. [09_API_SPECIFICATION.md](file:///d:/msi/love_you/docs/09_API_SPECIFICATION.md) (REST API Routes & Status Codes)
5. [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md) (SHA-256 Hashing Engine & Formula)
6. [15_CHAIN_OF_CUSTODY.md](file:///d:/msi/love_you/docs/15_CHAIN_OF_CUSTODY.md) & [16_AUDIT_LOGGING.md](file:///d:/msi/love_you/docs/16_AUDIT_LOGGING.md) (Append-Only Ledgers)

### For DevOps & QA Engineers:
1. [22_TESTING_STRATEGY.md](file:///d:/msi/love_you/docs/22_TESTING_STRATEGY.md) (Test Dimensions & Tamper Scenarios)
2. [23_DEPLOYMENT.md](file:///d:/msi/love_you/docs/23_DEPLOYMENT.md) (Docker Compose, Ports, Environment Variables)
3. [24_PROJECT_STRUCTURE.md](file:///d:/msi/love_you/docs/24_PROJECT_STRUCTURE.md) (Codebase File Layout)
4. [25_IMPLEMENTATION_ROADMAP.md](file:///d:/msi/love_you/docs/25_IMPLEMENTATION_ROADMAP.md) (12 Engineering Execution Phases)
