# 01. Product Overview — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Executive Summary

**DocShield** is a specialized, tamper-evident digital case, document, and evidence management platform developed for the **Smart India Hackathon (Problem Statement: SIH 26190)**. Designed specifically for Indian Law Enforcement agencies, DocShield addresses the critical challenge of securing digital investigation records, verifying chain of custody, and guaranteeing mathematical non-repudiation for case files submitted to prosecution and judicial courts.

In modern police investigations, critical artifacts—ranging from First Information Reports (FIRs), witness statements, seizure memos (Panchnamas), and CCTV extractions to forensic ballistics/DNA reports and final charge sheets—are vulnerable to accidental corruption, unauthorized modifications, chain-of-custody disputes, and procedural integrity challenges in court. 

DocShield resolves these vulnerabilities by providing an **Inspector-centric, single-pane investigation operating system** anchored on cryptographic hash generation, automated tamper detection, tamper-evident chain of custody tracking, and immutable audit logs.

---

## 2. Problem Statement & Operational Context (SIH 26190)

### 2.1 The Traditional Investigation Pitfalls
1. **Procedural Vulnerability in Chain of Custody**: Physical and digital evidence items are routinely challenged under Sections 65B/63 of the Indian Evidence Act (Bharatiya Sakshya Adhiniyam, BSA) due to missing handover logs or untracked handling.
2. **Post-Filing Document Alteration Suspicions**: Allegations of back-dated tampering or unauthorized substitution of case diary pages and witness depositions.
3. **Fragmented Repository Silos**: FIRs reside in police station databases, physical seizure items in the Malkhana (evidence vault), forensic reports in State/Central FSL mailboxes, and charge sheets on court dispatch dockets, making cohesive tracking impossible.
4. **Arbitrary Statuses Without Mathematical Backing**: Many existing digital systems display arbitrary "safety" scores without verifiable cryptographic proofs.

### 2.2 The DocShield Solution
DocShield bridges physical police workflows with cryptographic certainty. When an Inspector registers or updates an artifact, the platform executes a deterministic cryptographic hashing routine (SHA-256 baseline), anchors the digest, time-stamps the action, and correlates all entities directly to a unified Case Record.

---

## 3. Product Vision & Core Principles

The foundational ethos of DocShield is built around five immutable tenets:

```
[ SECURE ] ──> [ TRACEABLE ] ──> [ VERIFIABLE ] ──> [ CASE-CENTRIC ] ──> [ AUDITABLE ]
```

1. **Secure**: Zero-trust architecture with end-to-end payload validation, encrypted storage at rest, and strict role boundaries.
2. **Traceable**: Every piece of physical and digital evidence features unbroken custody provenance, logging previous holders, receivers, locations, and handover reasons.
3. **Verifiable**: Cryptographic integrity is continuously recalculated. Any single-bit alteration in an uploaded file renders an immediate `Integrity Failed` status.
4. **Case-Centric**: Every FIR, document, evidence item, forensic memo, charge sheet, and court filing is inextricably linked to its master Case Number. Disconnected records are structurally forbidden.
5. **Auditable**: All interactions (view, upload, update, verify, transfer) produce permanent, append-only audit entries containing actor ID, station, timestamp, and device fingerprint.

---

## 4. Current Scope vs. Future Scope

To ensure immediate delivery of an operational prototype for SIH evaluation, DocShield strictly segregates the active **Inspector Experience** from administrative orchestration.

| Dimension | Current Scope (Active Implementation) | Future Scope (Conceptual — Post SIH) |
| :--- | :--- | :--- |
| **Primary User** | **Police Inspector / Investigating Officer (IO)** | System Admin, Station In-Charge (SHO), SP / Dig / Court Registrars |
| **Case Operations** | Case intake, status transitions, assigned case tracking | Departmental allocation, station-to-station transfer approvals |
| **Evidence Management**| Seizure logging, tagging, custody transfers, verification | Multi-district Malkhana physical warehouse tracking, barcoding hardware integration |
| **Document Control** | Upload, versioning, SHA-256 hash generation & verification | Cross-agency automated CCTNS/ICJS synchronization |
| **Forensics & Courts** | Manual report attachment, charge sheet staging, court dates | Direct bi-directional API pipelines with National FSL portals & eCourts |
| **Audit & Integrity** | Case-level audit trail review, real-time cryptographic audit | System-wide intrusion detection, cross-node distributed ledger anchoring |
| **Administration** | Pre-seeded Inspector profiles and station configurations | Dynamic RBAC creator, user provisioning, station master configuration |

> [!IMPORTANT]
> **Future Admin Notice**: Administrative configuration, user provisioning, and system-wide monitoring are strictly designated as **FUTURE — NOT CURRENT IMPLEMENTATION**. No Admin controls are exposed to the Inspector interface.

---

## 5. Target User: The Police Inspector

The primary user of the current platform is the **Investigating Officer (IO) / Police Inspector** stationed at a jurisdictional police precinct (e.g., Bhopal Police).

### 5.1 Inspector Capabilities
- View all assigned cases in an intuitive, filterable dashboard.
- Create new cases with jurisdictional and legal classifications (e.g., IPC/BNS sections).
- Upload and inspect case documents (FIRs, Panchnamas, witness statements, medical reports).
- Initiate on-demand cryptographic integrity verifications for any or all case files.
- Register physical and digital evidence items with detailed seizure metadata.
- Execute verified Chain of Custody handovers (e.g., dispatching seized items to FSL or Malkhana).
- Attach and review Forensic Science Laboratory (FSL) reports.
- Stage and review Final Reports / Charge Sheets (Section 173 CrPC / BNSS).
- Track legal court filing dockets and judicial hearing statuses.
- Inspect immutable activity and audit logs for assigned cases.
- Export case-centric PDF verification dossiers for judicial submission.

### 5.2 Strict Inspector Limitations (Non-Capabilities)
- An Inspector **cannot** delete or purge any audit record.
- An Inspector **cannot** overwrite, alter, or back-date a verified cryptographic hash.
- An Inspector **cannot** delete cases once created; cases may only transition through formal statuses (`Active`, `Under Review`, `Charge-Sheeted`, `Closed`).
- An Inspector **cannot** modify documents after formal charge sheet freeze without producing a new, audited document version.
- An Inspector **cannot** access or modify administrative station configurations or user rosters.

---

## 6. Key Terminology

- **Case Number / Crime No.**: Unique jurisdictional identifier for an investigation (e.g., `CR-2026-BH-0042`).
- **First Information Report (FIR)**: The foundational police document initiating a cognizable offense investigation.
- **Panchnama / Seizure Memo**: Contemporary legal record signed by independent witnesses documenting the seizure of physical/digital articles.
- **Chain of Custody (CoC)**: Chronological documentation showing the seizure, custody, transfer, analysis, and disposition of evidence.
- **Cryptographic Hash**: Fixed-size 256-bit hexadecimal string (SHA-256) generated from the file's raw byte stream representing its exact digital signature.
- **Integrity Verified**: The state where a document's newly recomputed SHA-256 digest exactly matches the baseline digest captured at upload.
- **Charge Sheet**: The formal police report under Sec 173 CrPC / Sec 193 BNSS submitted to the Magistrate detailing the evidence gathered against an accused.

---

## 7. High-Level Inspector User Journey

```
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│  Secure Login   │ ───>  │ Inspector Dashboard  │ ───>  │  Cases Listing View  │
│ (Badge / Token) │       │ (Live Stats & Tasks) │       │ (Filter / New Case)  │
└─────────────────┘       └──────────────────────┘       └──────────────────────┘
                                                                    │
                                                                    ▼
┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│ Final Dossier / │ <───  │ Legal Staging        │ <───  │ Case Detail View     │
│ Charge Sheet    │       │ (Forensics & Court)  │       │ (FIR, Docs, Custody) │
└─────────────────┘       └──────────────────────┘       └──────────────────────┘
```

1. **Authentication**: Inspector authenticates with badge credentials, landing on the horizontal top-nav workspace.
2. **Dashboard Review**: Review pending tasks, active cases count, evidence in transit, and overall verified document integrity metric.
3. **Case Management**: Navigate to assigned cases; create a new case or drill into an existing investigation.
4. **Document & Evidence Intake**: Upload witness depositions, CCTV footage, and weapons; receive automatic SHA-256 certificates.
5. **Chain of Custody Transfers**: Log evidence transfers to Malkhana Moharrir or FSL dispatchers with timestamped reasons.
6. **Integrity Assurance**: Trigger batch or single-file integrity audits before court appearances.
7. **Legal Progression & Filing**: Collate forensic findings, upload the final charge sheet, record court filing details, and print certified dossiers.

---

## 8. Document Cross-References
- Comprehensive Requirements: [02_REQUIREMENTS.md](file:///d:/msi/love_you/docs/02_REQUIREMENTS.md)
- Inspector Interaction Flow: [03_INSPECTOR_WORKFLOW.md](file:///d:/msi/love_you/docs/03_INSPECTOR_WORKFLOW.md)
- UI/UX Design System: [05_UI_UX_SPECIFICATION.md](file:///d:/msi/love_you/docs/05_UI_UX_SPECIFICATION.md) & [06_DESIGN_SYSTEM.md](file:///d:/msi/love_you/docs/06_DESIGN_SYSTEM.md)
- Cryptographic Engine: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
- Audit Architecture: [16_AUDIT_LOGGING.md](file:///d:/msi/love_you/docs/16_AUDIT_LOGGING.md)
