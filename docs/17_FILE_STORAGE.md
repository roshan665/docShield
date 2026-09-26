# 17. File Storage Architecture — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Storage Design Philosophy

In criminal investigation systems, file storage is not a generic dump folder—it is a **secure evidence repository**. Files stored within DocShield represent legal exhibits, confidential depositions, and sensitive forensic analyses.

The storage architecture is designed around four core tenets:
1. **Provider Agnostic**: Operates identically whether backing onto a local encrypted disk volume (for self-hosted police server prototypes) or an S3-compatible cloud object store (AWS S3, MinIO, or Cloudflare R2).
2. **Zero Direct Web Access**: Files are never accessible via static web servers or public URLs. All reads flow through the authenticated API streaming gateway.
3. **Deterministic Case-Centric Partitioning**: Files are organized strictly by Case ID and Document Classification.
4. **Content-Addressable Hashing & Encryption**: Every file is cryptographically hashed upon intake and encrypted at rest with AES-256.

---

## 2. File Ingestion & Validation Pipeline

```
Client Multipart Stream
          │
          ▼
[ Magic Byte Validation ] ───> Rejects disguised executables (e.g. .exe renamed to .pdf)
          │
          ▼
[ File Size Enforcer ]    ───> Rejects files exceeding 50 MB
          │
          ▼
[ SHA-256 Crypto Stream ] ───> Computes hash in-flight without unbounded RAM buffering
          │
          ▼
[ Storage Driver Put ]    ───> Writes encrypted bytes to destination volume / S3
          │
          ▼
[ DB Metadata Commit ]    ───> Stores storage key & baseline hash in atomic transaction
```

### 2.1 File Validation Rules
- **Maximum File Size**: 50 MB per single file upload (sufficient for multi-page PDF case diaries, high-resolution crime scene photos, and short CCTV clips).
- **Allowed MIME Types & Extensions**:
  - `application/pdf` (`.pdf`) — Primary legal format for FIRs, Statements, Panchnamas, Medical, and Charge Sheets.
  - `image/jpeg` (`.jpg`, `.jpeg`) — Crime scene photographs, physical evidence seizures.
  - `image/png` (`.png`) — Fingerprint scans, digital diagrams.
  - `video/mp4` (`.mp4`) — CCTV extractions, videographed panchnama recordings.
  - `audio/mpeg` (`.mp3`) — Recorded audio depositions, emergency call recordings.
- **Strictly Blocked Formats**: All executable formats (`.exe`, `.bat`, `.cmd`, `.sh`, `.ps1`, `.msi`, `.jar`, `.vbs`, `.php`) are blocked at the gateway level.

---

## 3. Deterministic Storage Key Scheme

Files are named and organized using a standardized path convention:

```
cases/{case_id}/{document_type}/{doc_id}_{timestamp}.enc
```

### Example Structure:
```
cases/
├── case_01J8F3/
│   ├── FIR/
│   │   └── doc_9901_1727071200.enc
│   ├── PANCHNAMA/
│   │   ├── doc_9921_1727074200.enc
│   │   └── doc_9925_1727081400.enc
│   ├── FORENSIC_REPORT/
│   │   └── doc_9930_1727145600.enc
│   └── CHARGE_SHEET/
│       └── doc_9945_1727232000.enc
```

- **Obfuscation**: Storage filenames do not expose raw original user filenames on disk, preventing file-system scraping.
- **Collision Immunity**: The UUID/CUID prefix guarantees that duplicate filenames uploaded by users never collide.

---

## 4. Storage Driver Interface (Provider-Agnostic Abstraction)

The backend interacts with file storage exclusively through a clean, unified TypeScript / Python interface:

```typescript
export interface IFileStorageDriver {
  /**
   * Uploads a file stream to permanent storage.
   * Returns the canonical storage key.
   */
  putObject(storageKey: string, stream: NodeJS.ReadableStream, mimeType: string): Promise<string>;

  /**
   * Retrieves a readable stream for an existing stored file.
   */
  getObject(storageKey: string): Promise<NodeJS.ReadableStream>;

  /**
   * Checks if an object exists in storage.
   */
  hasObject(storageKey: string): Promise<boolean>;

  /**
   * Permanently deletes an orphaned object (admin only).
   */
  deleteObject(storageKey: string): Promise<void>;
}
```

- **Local Disk Driver**: Uses standard POSIX file system commands with AES-256 file stream encryption.
- **S3 / MinIO Driver**: Uses AWS SDK v3 with `PutObjectCommand` and server-side encryption (`ServerSideEncryption: 'AES256'`).

---

## 5. Secure Streaming Download & Access Control

When an authorized Inspector requests `GET /api/v1/documents/:id/download`:
1. **Authorization Check**: Backend verifies the Inspector's active session and precinct case access.
2. **Audit Logging**: Emits `DOC_VIEW` or `DOC_DOWNLOAD` log entry.
3. **Stream Pipe**: The file is retrieved from storage and piped directly to the HTTP response stream:
   ```typescript
   res.setHeader('Content-Type', doc.mimeType);
   res.setHeader('Content-Disposition', `inline; filename="${doc.originalFilename}"`);
   res.setHeader('X-Content-Type-Options', 'nosniff');
   res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
   storageStream.pipe(res);
   ```

---

## 6. Retention & Archival Policies

1. **Statutory Retention**: In criminal cases, documents must be retained until the conclusion of judicial appeals (often 10–30 years).
2. **Permanent Immutability**: Active case documents cannot be deleted. If an error occurred in an upload, the document is flagged `is_active = FALSE` while the physical file and baseline hash remain archived in storage for judicial audit.
3. **Backup Strategy**: Daily snapshot backups of the storage volume and database to ensure zero data loss during power or hardware failure.

---

## 7. Document Cross-References
- System Architecture: [07_SYSTEM_ARCHITECTURE.md](file:///d:/msi/love_you/docs/07_SYSTEM_ARCHITECTURE.md)
- Backend Architecture: [08_BACKEND_ARCHITECTURE.md](file:///d:/msi/love_you/docs/08_BACKEND_ARCHITECTURE.md)
- Document Management: [12_DOCUMENT_MANAGEMENT.md](file:///d:/msi/love_you/docs/12_DOCUMENT_MANAGEMENT.md)
- Cryptographic Integrity: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
- Security Architecture: [18_SECURITY_ARCHITECTURE.md](file:///d:/msi/love_you/docs/18_SECURITY_ARCHITECTURE.md)
