# 11. Role-Based Access Control (RBAC) — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Access Control Philosophy

DocShield implements a **Precinct-Scoped, Principle-of-Least-Privilege RBAC architecture**. In the active deployment phase, access control is strictly tailored to the **Police Inspector / Investigating Officer (IO)**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DOCSHIELD ACCESS BOUNDARY                       │
├─────────────────────────────────────────┬──────────────────────────────┤
│  CURRENT ACTIVE ROLE                    │  FUTURE RESERVED ROLES       │
│  [ POLICE_INSPECTOR ]                   │  [ SYSTEM_ADMIN ]            │
│  • Precinct Case Management             │  • User & Role Provisioning  │
│  • Evidence & Custody Handover          │  • Station Master Config     │
│  • Document Intake & SHA-256 Verify     │  • Global Compliance Audits  │
│  • Charge Sheet & Court Tracking        │  • Multi-Tenant Management   │
└─────────────────────────────────────────┴──────────────────────────────┘
```

> [!IMPORTANT]
> **Admin Functionality Strict Separation**:
> The `SYSTEM_ADMIN` role and its associated administrative controls (user provisioning, station registration, global permission mutation) are strictly designated as **FUTURE — NOT CURRENT IMPLEMENTATION**.
> No Admin UI elements, API endpoints, or database mutation triggers are exposed to the active Inspector experience.

---

## 2. Active Role Definition: `POLICE_INSPECTOR`

The Inspector is the operational backbone of criminal investigation at a jurisdictional station (e.g., Bhopal Central Police Station).

### 2.1 Permitted Capabilities (What the Inspector CAN Do)
1. **Case Management**:
   - Create new investigation cases within their assigned police precinct.
   - View, search, and filter all cases assigned to them or their station.
   - Update case status with mandatory justification notes (`Active`, `Under Review`, `Charge-Sheeted`).
2. **Document & Evidence Operations**:
   - Upload investigation documents (FIR, Panchnama, witness depositions, medical reports).
   - Initiate on-demand cryptographic integrity verification (single file or batch).
   - Log seized evidence items (physical weapons, seized electronics, narcotics).
   - Execute Chain of Custody handovers (releasing evidence to the Malkhana or dispatching to FSL).
3. **Forensic & Legal Staging**:
   - Requisition FSL tests and upload completed forensic lab findings.
   - Stage and review draft charge sheets under Sec 173 CrPC / Sec 193 BNSS.
   - Record court hearing dates, bail statuses, and magistrate orders.
4. **Audit & Reporting**:
   - View chronological audit trails scoped to their authorized cases.
   - Export certified case dossiers with cryptographic verification proofs.

### 2.2 Prohibited Actions (What the Inspector CANNOT Do)
1. **Cannot Modify Cryptographic Baseline**: An Inspector cannot alter, replace, or back-date an established SHA-256 hash record.
2. **Cannot Delete Audit Logs**: An Inspector cannot purge, edit, or disable audit records or custody entries.
3. **Cannot Delete Cases or Evidence**: Physical and digital records cannot be deleted; they may only be marked with terminal statuses (`Closed`, `Disposed`).
4. **Cannot Manage Users or Roles**: An Inspector cannot create new officer accounts, reset colleagues' credentials, or change system roles.
5. **Cannot Access Out-of-Jurisdiction Precincts**: An Inspector cannot view or query cases belonging to other districts/stations without formal cross-assignment.

---

## 3. Resource Ownership & Authorization Matrix

The table below defines the exact authorization policy enforced by the backend middleware for each resource type:

| Resource Entity | Inspector Action | Permitted? | Condition / Boundary Rule |
| :--- | :--- | :--- | :--- |
| **Case** | Create | **YES** | Scoped to Inspector's registered station code. |
| **Case** | Read / View | **YES** | Only cases assigned to IO or registered at IO's station. |
| **Case** | Update Status | **YES** | Requires non-empty operational justification note. |
| **Case** | Delete | **NO** | Cases are permanent records under police regulations. |
| **Document** | Upload | **YES** | Requires valid Case ID; auto-generates SHA-256 baseline. |
| **Document** | Read / Stream | **YES** | Only for authorized station cases. |
| **Document** | Verify Integrity | **YES** | Read-only recomputation; updates verification status. |
| **Document** | Delete / Overwrite | **NO** | Revisions create new versions; old versions remain immutable. |
| **Evidence** | Log Seizure | **YES** | Must specify seizure memo / panchnama witness details. |
| **Evidence** | Transfer Custody | **YES** | Must identify releasing officer and recipient badge. |
| **Evidence** | Delete | **NO** | Physical evidence records are permanent legal entries. |
| **Audit Logs** | Read | **YES** | Strictly scoped to assigned case IDs. |
| **Audit Logs** | Create | System Only | Auto-emitted by application events; manual insertion blocked. |
| **Audit Logs** | Update / Delete | **NO** | Enforced immutable at database trigger level. |
| **User Accounts**| Create / Modify | **NO** | Reserved strictly for **FUTURE Admin Scope**. |

---

## 4. Enforcement Implementation Pattern

The backend enforces RBAC through a two-stage middleware pipeline:

```typescript
// 1. Role Scope Check
function requireInspectorRole(req, res, next) {
  if (req.user.role !== 'POLICE_INSPECTOR') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Access restricted to authenticated Police Inspectors.'
    });
  }
  next();
}

// 2. Case Ownership & Station Boundary Check
async function requireCaseStationAccess(req, res, next) {
  const caseId = req.params.id || req.body.caseId;
  const caseRecord = await caseRepository.findById(caseId);

  if (!caseRecord) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Case not found.' });
  }

  // Enforce jurisdictional boundary
  if (caseRecord.stationCode !== req.user.stationCode) {
    return res.status(403).json({
      error: 'JURISDICTION_DENIED',
      message: 'You are not authorized to access cases outside your jurisdictional station.'
    });
  }

  req.case = caseRecord;
  next();
}
```

---

## 5. Future Scope: System Administration (`SYSTEM_ADMIN`)

The conceptual future responsibilities of the `SYSTEM_ADMIN` role are documented below for roadmap planning only:
- Station Master Management (adding new police stations, districts, and pin codes).
- User Provisioning & Lifecycle (onboarding officers, badge number allocations, transfers, role assignments).
- System-Wide Storage & Encryption Key Rotation.
- Global Audit Telemetry (cross-station compliance monitoring and intrusion alerts).
- Enterprise CCTNS / ICJS Integration Gateway configuration.

---

## 6. Document Cross-References
- Product Vision: [01_PRODUCT_OVERVIEW.md](file:///d:/msi/love_you/docs/01_PRODUCT_OVERVIEW.md)
- Inspector Workflow: [03_INSPECTOR_WORKFLOW.md](file:///d:/msi/love_you/docs/03_INSPECTOR_WORKFLOW.md)
- Backend Architecture: [08_BACKEND_ARCHITECTURE.md](file:///d:/msi/love_you/docs/08_BACKEND_ARCHITECTURE.md)
- Audit Logging: [16_AUDIT_LOGGING.md](file:///d:/msi/love_you/docs/16_AUDIT_LOGGING.md)
- Implementation Roadmap: [25_IMPLEMENTATION_ROADMAP.md](file:///d:/msi/love_you/docs/25_IMPLEMENTATION_ROADMAP.md)
