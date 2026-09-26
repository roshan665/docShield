# 12. Document Management — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Document Lifecycle Management

In police investigations, official documentation constitutes the evidentiary core presented to the judiciary. DocShield enforces a strict, linear **8-Stage Document Lifecycle** ensuring that from the moment a file enters the system, its provenance and cryptographic validity are guaranteed.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  1. Upload   │ ──> │2. Validation │ ──> │3. Hash Generation│ ──> │  4. Storage  │
└──────────────┘     └──────────────┘     └──────────────────┘     └──────────────┘
                                                                           │
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐             ▼
│   8. Audit   │ <── │7. Versioning │ <── │    6. Access     │ <── ┌──────────────┐
│   Logging    │     │  & Locking   │     │  (Stream/View)   │     │5.Verification│
└──────────────┘     └──────────────┘     └──────────────────┘     └──────────────┘
```

---

## 2. The 8 Stages of the Document Lifecycle

### Stage 1: Upload (Client Submission)
- Inspector navigates to the **Documents** sub-tab of an active case (`/cases/:id`).
- Selects the target file via drag-and-drop or file browser.
- Selects legal classification (`Document Type`) and inputs a descriptive title.
- Initiates `POST /api/v1/cases/:id/documents`.

### Stage 2: Validation (Ingestion Security)
Before writing bytes to disk or database, the backend middleware performs strict validation:
1. **Magic Number Inspection**: Verifies true file headers to prevent spoofed extensions (e.g., verifying `%PDF` for `.pdf` files, `FF D8 FF` for `.jpg`).
2. **Whitelisted MIME Types**: Restricts uploads strictly to `application/pdf`, `image/jpeg`, `image/png`, `video/mp4`, `audio/mpeg`.
3. **Payload Size Enforcements**: Max 50 MB per document file to preserve server memory and ensure swift hash processing.
4. **Case Association**: Validates that the target `caseId` exists and belongs to the Inspector's active precinct.

### Stage 3: Hash Generation (Cryptographic Baseline)
- As the file stream flows into memory, it passes through the Node.js / Go crypto stream engine.
- Generates a 64-character hexadecimal **SHA-256 digest**.
- Example Digest: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- This digest becomes the permanent, unalterable baseline for all future integrity checks.

### Stage 4: Storage (Encrypted Persistence)
- The raw file is stored in the designated storage repository (local volume or private S3 bucket).
- **Storage Key Convention**:
  ```
  cases/{case_id}/{document_type}/{doc_id}_{timestamp}.enc
  ```
- Files are encrypted at rest using server-side AES-256 encryption.

### Stage 5: Verification (Baseline Registration)
- The system writes atomic records to:
  1. `documents`: Metadata record (Title, MIME, Size, Storage Path).
  2. `document_integrity_records`: Verification state (`status: 'VERIFIED'`, `baseline_hash: '...'`, `last_verified_at: NOW`).
- Initial status is marked `Verified` because the baseline is newly generated from the pristine stream.

### Stage 6: Access (Secure In-Browser Streaming)
- Files are never exposed via public static URLs.
- Viewing or downloading requires `GET /api/v1/documents/:id/download`.
- The backend streams the file with security headers (`Content-Disposition: inline`, `X-Content-Type-Options: nosniff`).

### Stage 7: Versioning & Locking
- Investigation files must never be silently overwritten.
- If a supplementary or corrected document is submitted (e.g., an amended witness statement):
  - A new version is created in `document_versions`.
  - The previous version's binary payload and SHA-256 baseline remain completely preserved and accessible in the version history.
  - The document's `current_version` increments.
- Once a case is marked `Charge-Sheeted` or `Closed`, document versioning is locked.

### Stage 8: Audit Logging
- Every single interaction (Upload, View, Verify, Version Create) generates a synchronous, immutable entry in `audit_logs` capturing officer ID, IP address, timestamp, and hash digest.

---

## 3. Supported Document Classifications

DocShield standardizes documentation into 9 institutional types:

| Document Type Code | Legal Name & Context | Evidentiary Role | Allowed Formats |
| :--- | :--- | :--- | :--- |
| `FIR` | **First Information Report** | Foundational document initiating cognizable offense. | PDF |
| `WITNESS_STATEMENT` | **Statement under Sec 161 CrPC / 180 BNSS** | Depositions recorded during investigation. | PDF |
| `PANCHNAMA` | **Seizure Memo / Spot Inspection** | Contemporaneous crime scene inspection memo signed by Panch witnesses. | PDF, JPEG |
| `MEDICAL_REPORT` | **Medico-Legal / Post-Mortem Certificate** | Doctor's injury/autopsy findings from District Hospital. | PDF |
| `FORENSIC_REPORT` | **State/Central FSL Laboratory Report** | Chemical, ballistic, DNA, toxicological analysis. | PDF |
| `CCTV_MEDIA` | **Digital Surveillance Footage Extraction** | Digital recordings seized from cameras or phones. | MP4, AVI, MKV |
| `CHARGE_SHEET` | **Final Report under Sec 173 CrPC / 193 BNSS**| Formal accusation document submitted to Magistrate. | PDF |
| `COURT_FILING` | **Judicial Order / Remand / Bail Docket** | Official magistrate orders and court date records. | PDF |
| `OTHER` | **General Diary Entry / Departmental Memo** | Ancillary investigation communications. | PDF, JPEG, PNG |

---

## 4. Metadata Schema & Requirements

Every document ingested into DocShield must include complete metadata:

```json
{
  "documentId": "doc_01J8F3A4B",
  "caseId": "case_01J8F3",
  "title": "Spot Panchnama & Site Map",
  "documentType": "PANCHNAMA",
  "originalFilename": "Site_Map_Panchnama_Signed.pdf",
  "mimeType": "application/pdf",
  "fileSizeBytes": 3412080,
  "storagePath": "cases/case_01J8F3/PANCHNAMA/doc_01J8F3A4B_1727074200.enc",
  "uploadedBy": {
    "userId": "usr_9918",
    "name": "Insp. A. Sharma",
    "badgeNumber": "INSP-BH-104"
  },
  "version": 1,
  "sha256Digest": "7b8d4e9c1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
  "integrityStatus": "VERIFIED",
  "uploadedAt": "2026-09-23T06:50:00Z",
  "lastVerifiedAt": "2026-09-23T06:50:00Z"
}
```

---

## 5. Document Cross-References
- System Architecture: [07_SYSTEM_ARCHITECTURE.md](file:///d:/msi/love_you/docs/07_SYSTEM_ARCHITECTURE.md)
- API Specification: [09_API_SPECIFICATION.md](file:///d:/msi/love_you/docs/09_API_SPECIFICATION.md)
- Database Schema: [10_DATABASE_SCHEMA.md](file:///d:/msi/love_you/docs/10_DATABASE_SCHEMA.md)
- Cryptographic Integrity Engine: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
- File Storage Architecture: [17_FILE_STORAGE.md](file:///d:/msi/love_you/docs/17_FILE_STORAGE.md)
