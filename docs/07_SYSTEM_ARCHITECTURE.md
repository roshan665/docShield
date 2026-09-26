# 07. System Architecture — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. High-Level Architecture Overview

DocShield is structured as a **modular, multi-tier legal-grade web platform**. The architecture enforces strict separation of concerns, deterministic cryptographic integrity processing, append-only audit tracking, and high-performance relational persistence.

```mermaid
graph TB
    subgraph Client Tier ["Client Tier (Browser)"]
        UI["Inspector Web App<br/>(Light Police SaaS UI)"]
        State["State / Token Manager<br/>(JWT + Session Cache)"]
    end

    subgraph Gateway ["API & Security Gateway"]
        Proxy["Reverse Proxy / TLS 1.3"]
        CORS["CORS & Rate Limiting"]
        AuthMiddleware["Auth & RBAC Middleware<br/>(Inspector Scope Validator)"]
    end

    subgraph Service Tier ["Backend Application Services (Domain Logic)"]
        CaseService["Case Management Service"]
        DocService["Document & Versioning Service"]
        IntegrityEngine["Cryptographic Integrity Engine<br/>(SHA-256 Hasher & Verifier)"]
        EvidenceService["Evidence & Custody Service"]
        ForensicService["Forensic Tracking Service"]
        LegalService["Charge Sheet & Court Service"]
        AuditService["Immutable Audit Service"]
        NotifService["Notification Service"]
    end

    subgraph Persistence Tier ["Storage & Persistence Tier"]
        DB[(Relational DB<br/>PostgreSQL / SQLite<br/>Cases, Metadata, Hashes, Logs)]
        FileStore[("Encrypted File Storage<br/>(Local Volume / S3-Compatible)<br/>AES-256 Storage")]
    end

    UI --> Proxy
    Proxy --> CORS --> AuthMiddleware
    AuthMiddleware --> CaseService
    AuthMiddleware --> DocService
    AuthMiddleware --> EvidenceService
    AuthMiddleware --> ForensicService
    AuthMiddleware --> LegalService
    AuthMiddleware --> AuditService
    AuthMiddleware --> NotifService

    DocService --> IntegrityEngine
    IntegrityEngine --> FileStore
    IntegrityEngine --> DB
    
    CaseService --> DB
    DocService --> DB
    EvidenceService --> DB
    ForensicService --> DB
    LegalService --> DB
    AuditService --> DB
    NotifService --> DB
```

---

## 2. Core Architectural Components

### 2.1 Presentation Tier (Frontend)
- **Role**: Delivers the single-page Inspector application.
- **Characteristics**:
  - Horizontal top navigation layout with zero left sidebar.
  - Light-theme legal dashboard aesthetic.
  - Client-side route guard enforcing authenticated Inspector session.
  - Optimistic UI updates paired with resilient server-side cryptographic sync.
  - Native browser streaming for PDF viewing and cryptographic hash inspection.

### 2.2 Security & Gateway Tier
- **TLS Termination**: All incoming connections terminate on TLS 1.3/1.2.
- **Authentication Filter**: Verifies the cryptographically signed JWT bearer token on every protected API call.
- **RBAC Validator**: Enforces Inspector role boundaries (`POLICE_INSPECTOR`), preventing unauthorized access to external station data or administrative primitives.
- **Rate Limiting**: Protects against brute-force attempts on authentication and heavy verification endpoints.

### 2.3 Application & Domain Service Tier
- **Case Service**: Orchestrates case lifecycle, station indexing, and multi-faceted case aggregation.
- **Document & Versioning Service**: Coordinates file streams, validates MIME magic bytes, and tracks document lineage.
- **Cryptographic Integrity Engine**: Core independent component executing raw byte streaming, SHA-256 digest computation, and verification diff comparisons.
- **Evidence & Chain of Custody Service**: Manages physical/digital property records, custody transfers, and location tracking.
- **Audit Service**: Append-only event sink that records every state change, access, and cryptographic verification event synchronously.

### 2.4 Data Persistence & File Storage Tier
- **Relational Database**: Stores structured business entities, relational constraints, foreign keys, and indexes for fast queries.
- **File Storage Abstraction**: Secure disk volume or S3-compatible object store. Files are stored using deterministic hashed paths and encrypted with AES-256 at rest.

---

## 3. Critical Data Flow Pipelines

### 3.1 Document Upload, Cryptographic Hashing & Ingestion Pipeline

When an Inspector uploads a document (e.g., an FIR or Panchnama memo), the system processes the file through an atomic cryptographic pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor Inspector as Police Inspector
    participant UI as Web Frontend
    participant API as API Controller
    participant Engine as Integrity Engine
    participant Storage as File Storage Layer
    participant DB as Relational Database
    participant Audit as Audit Logger

    Inspector->>UI: Selects file & enters metadata (Type: Panchnama)
    UI->>API: POST /api/v1/cases/:id/documents (Multipart payload)
    API->>API: Validate file type (magic bytes) & size (<50MB)
    API->>Engine: Stream byte buffer for hash calculation
    Engine->>Engine: Compute SHA-256 digest (e.g., a8f5c2...89b1)
    Engine->>Storage: Persist encrypted byte payload to disk/S3
    Storage-->>Engine: Confirm storage key (cases/42/docs/doc_99.enc)
    Engine->>DB: INSERT into documents & document_integrity_records
    DB-->>API: Confirm database commit
    API->>Audit: Synchronously record DOC_UPLOAD with Hash
    Audit->>DB: INSERT into audit_logs (append-only)
    API-->>UI: 201 Created (Document details + SHA-256 Certificate)
    UI-->>Inspector: Render document row with [Verified] status badge
```

---

### 3.2 Document Integrity Verification Pipeline

The verification pipeline allows on-demand or batch re-verification of any document against its baseline cryptographic record:

```mermaid
sequenceDiagram
    autonumber
    actor Inspector as Police Inspector
    participant UI as Web Frontend
    participant API as API Controller
    participant Engine as Integrity Engine
    participant Storage as File Storage Layer
    participant DB as Relational Database
    participant Audit as Audit Logger

    Inspector->>UI: Clicks "Verify Integrity"
    UI->>API: POST /api/v1/documents/:id/verify
    API->>DB: Query stored baseline hash & storage key
    DB-->>API: Return baseline_hash (a8f5c2...89b1) & storage_key
    API->>Storage: Stream stored file bytes
    Storage-->>Engine: Raw byte stream
    Engine->>Engine: Recompute SHA-256 digest on current bytes
    Engine->>Engine: Compare: recomputed_hash === baseline_hash
    alt Hash Matches (100% Intact)
        Engine->>DB: UPDATE document_integrity_records (status: VERIFIED, last_verified_at: NOW)
        API->>Audit: Log AUDIT_VERIFY_SUCCESS
        API-->>UI: 200 OK (Status: VERIFIED, Hash Match Confirmed)
        UI-->>Inspector: Display Green [Verified] Badge
    else Hash Mismatch (Tampering Detected)
        Engine->>DB: UPDATE document_integrity_records (status: FAILED, last_verified_at: NOW)
        API->>Audit: Log HIGH PRIORITY ALERT: INTEGRITY_MISMATCH
        API-->>UI: 200 OK (Status: INTEGRITY_FAILED, Discrepancy details)
        UI-->>Inspector: Display Red [Integrity Failed] Alert & Banner
    end
```

---

### 3.3 Evidence Custody Transfer Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Inspector as Releasing Officer (IO)
    participant UI as Web Frontend
    participant API as Evidence API
    participant DB as Relational Database
    participant Audit as Audit Logger

    Inspector->>UI: Submits Custody Transfer Form (Target: Station Malkhana)
    UI->>API: POST /api/v1/evidence/:id/transfer
    API->>DB: Verify evidence exists & current holder
    API->>DB: INSERT into chain_of_custody_events (released_by, received_by, reason)
    API->>DB: UPDATE evidence (current_holder, custody_status, current_location)
    API->>Audit: Log CUSTODY_TRANSFER event
    DB-->>API: Transaction Committed
    API-->>UI: 200 OK (Updated Evidence Record)
    UI-->>Inspector: Render updated custody status in timeline
```

---

## 4. Key Architectural Decisions (ADRs)

1. **Deterministic SHA-256 for Evidentiary Standard**:
   - *Rationale*: SHA-256 is globally recognized by courts, NIST, and Indian IT Act/BSA standards for digital non-repudiation.
2. **Synchronous Cryptographic Baseline Anchoring**:
   - *Rationale*: The hash must be generated *before* returning an upload success confirmation to ensure no unhashed window exists.
3. **Derived Integrity Metrics**:
   - *Rationale*: To maintain absolute judicial credibility, dashboard percentages are strictly derived from live verification state counters (`verified / total * 100`).
4. **Append-Only Immutability**:
   - *Rationale*: The `audit_logs` and `chain_of_custody_events` tables reject `UPDATE` and `DELETE` commands, guaranteeing forensic chain integrity.

---

## 5. Document Cross-References
- Product Vision: [01_PRODUCT_OVERVIEW.md](file:///d:/msi/love_you/docs/01_PRODUCT_OVERVIEW.md)
- Backend Architecture: [08_BACKEND_ARCHITECTURE.md](file:///d:/msi/love_you/docs/08_BACKEND_ARCHITECTURE.md)
- API Specification: [09_API_SPECIFICATION.md](file:///d:/msi/love_you/docs/09_API_SPECIFICATION.md)
- Database Schema: [10_DATABASE_SCHEMA.md](file:///d:/msi/love_you/docs/10_DATABASE_SCHEMA.md)
- Integrity Protocols: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
- Audit Architecture: [16_AUDIT_LOGGING.md](file:///d:/msi/love_you/docs/16_AUDIT_LOGGING.md)
