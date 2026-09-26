# 16. Audit Logging & System Telemetry — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Architectural Philosophy & Evidentiary Non-Repudiation

In police information systems, the audit trail is not merely a debugging utility—it is a **forensic artifact presented before the judiciary**. If an accused or defense counsel alleges that an officer planted evidence, back-dated a statement, or tampered with a digital file, the DocShield immutable audit log provides an unchallengeable, timestamped record of every interaction.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DOCSHIELD AUDIT PIPELINE                        │
├───────────────────┬────────────────────────────────┬───────────────────┤
│ 1. TRIGGER        │ 2. ENRICHMENT                  │ 3. PERSISTENCE    │
│ State-changing or │ • Authenticated Actor Badge    │ • Append-Only DB  │
│ access-sensitive  │ • Synchronized NTP Timestamp   │ • Strictly No Edit│
│ action executed   │ • IP Address & Browser UA      │ • Case Associated │
│ via API call      │ • Request Metadata Diff & Hash │ • Searchable Read │
└───────────────────┴────────────────────────────────┴───────────────────┘
```

---

## 2. Security-Sensitive Audited Events

DocShield captures 14 core categories of security-sensitive events:

| Action Code | Category | Triggering Action | Captured Event Metadata |
| :--- | :--- | :--- | :--- |
| `AUTH_LOGIN` | Authentication | Inspector signs into the application. | Badge Number, Station, Client IP, User-Agent. |
| `AUTH_LOGOUT` | Authentication | Inspector terminates active session. | Session duration, Token expiration stamp. |
| `AUTH_FAILURE` | Security Alert | Failed login attempt / invalid password. | Targeted badge, Client IP, Failure count. |
| `CASE_CREATE` | Case Lifecycle | New investigation case initiated. | Case No, Sections, Initial Status, Precinct. |
| `CASE_STATUS_UPDATE`| Case Lifecycle | Case transitions to new status. | Old Status, New Status, Officer Justification Note. |
| `DOC_UPLOAD` | Document Mgmt | Document attached to case. | Document ID, Title, MIME, Size, SHA-256 Hash. |
| `DOC_VIEW` | Access Audit | Document previewed or downloaded. | Document ID, Download format, Accessing Officer. |
| `DOC_VERIFY` | Integrity Engine | Integrity check executed on document. | Baseline Hash, Recomputed Hash, Match (T/F). |
| `ALERT_INTEGRITY_FAIL`| Security Alert | Hash mismatch detected during verify. | Baseline Hash vs Mismatch Hash, Alert Priority. |
| `EVIDENCE_LOG` | Evidence Mgmt | Seized physical/digital item logged. | Evidence Tag, Category, Location, Seizing Officer. |
| `CUSTODY_TRANSFER` | Chain of Custody | Custody handed over to new holder. | Evidence Tag, Released By, Received By, Reason. |
| `FORENSIC_UPLOAD` | Forensics | FSL scientific report attached. | FSL Docket No, Lab Name, Expert Name, File Hash. |
| `CHARGE_SHEET_STAGE`| Legal / Court | Final Police Report staged/locked. | Charge Sheet No, Accused List, Statute Deadlines. |
| `COURT_FILING_LOG` | Legal / Court | Hearing outcome or judicial order logged.| Court Name, Magistrate, Hearing Date, Bail Orders. |

---

## 3. Audit Log Record Schema

Every entry committed to the `audit_logs` table conforms to the following schema:

```json
{
  "id": "aud_01J8F399A2",
  "actorId": "usr_9918",
  "actorBadge": "INSP-BH-104",
  "actorName": "Insp. A. Sharma",
  "actionType": "DOC_UPLOAD",
  "resourceType": "DOCUMENT",
  "resourceId": "doc_9921",
  "caseId": "case_01J8F3",
  "caseNumber": "CR-2026-BH-0042",
  "timestamp": "2026-09-23T05:30:15.124Z",
  "ipAddress": "192.168.1.45",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0",
  "metadataDiff": {
    "title": "Panchnama of Crime Scene",
    "documentType": "PANCHNAMA",
    "filename": "Panchnama_Crime_Scene_01.pdf",
    "fileSizeBytes": 2451200,
    "sha256Hash": "a8f5c2d3e4b5a6c7d8e9f0123456789abcdef0123456789abcdef0123456789a",
    "integrityStatus": "VERIFIED"
  }
}
```

---

## 4. Immutability & Anti-Tampering Protections

To ensure audit records withstand technical cross-examination in court:
1. **Database Level Write-Only Protections**:
   - The application database user possesses only `SELECT` and `INSERT` permissions on `audit_logs`.
   - `UPDATE` and `DELETE` commands are revoked or blocked via an PostgreSQL database trigger:
   ```sql
   CREATE OR REPLACE FUNCTION prevent_audit_tampering()
   RETURNS TRIGGER AS $$
   BEGIN
     RAISE EXCEPTION 'DocShield Security Policy: Modification or deletion of audit records is strictly prohibited.';
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER trg_audit_immutable
   BEFORE UPDATE OR DELETE ON audit_logs
   FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();
   ```
2. **Synchronous Execution**: The backend writes the audit log synchronously inside the request lifecycle. If the audit insert fails, the parent transaction aborts, ensuring no unrecorded operations can occur.
3. **No User Modifications**: No UI or API endpoint exists that allows any user (including an Inspector) to edit or remove an audit entry.

---

## 5. Case-Scoped Audit Log UI & Inspector View

Within `/cases/:id?tab=audit`, the Inspector can inspect the complete historical activity stream:
- **Searchable**: Filter by actor name, action type (`DOC_UPLOAD`, `CUSTODY_TRANSFER`), or date range.
- **Detailed Inspection**: Clicking an event expands a modal revealing the JSON metadata snapshot, IP address, and cryptographic digests.
- **Printable**: Exportable as a sworn audit certificate for court proceedings.

---

## 6. Document Cross-References
- Product Vision: [01_PRODUCT_OVERVIEW.md](file:///d:/msi/love_you/docs/01_PRODUCT_OVERVIEW.md)
- System Architecture: [07_SYSTEM_ARCHITECTURE.md](file:///d:/msi/love_you/docs/07_SYSTEM_ARCHITECTURE.md)
- Backend Architecture: [08_BACKEND_ARCHITECTURE.md](file:///d:/msi/love_you/docs/08_BACKEND_ARCHITECTURE.md)
- Database Schema: [10_DATABASE_SCHEMA.md](file:///d:/msi/love_you/docs/10_DATABASE_SCHEMA.md)
- Cryptographic Integrity: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
- Security Architecture: [18_SECURITY_ARCHITECTURE.md](file:///d:/msi/love_you/docs/18_SECURITY_ARCHITECTURE.md)
