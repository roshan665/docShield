# 18. Security Architecture — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Security Architecture Principles

DocShield is designed around a **Defense-in-Depth, Zero-Trust Architecture**. Given the high evidentiary stakes of criminal investigations, every layer of the system—from frontend network transport to backend disk storage—assumes that perimeter defenses may be breached and implements granular cryptographic and behavioral barriers.

```
┌────────────────────────────────────────────────────────┐
│ 1. TRANSPORT SECURITY (TLS 1.3 / Strict CSP / HSTS)   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 2. EDGE DEFENSE (Rate Limiting, CORS, WAF Rules)       │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 3. AUTHENTICATION & RBAC (Stateless JWT + Rotating RT) │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 4. INPUT VALIDATION & FILE INSPECTION (Magic Bytes)    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 5. CRYPTOGRAPHIC DATA INTEGRITY (SHA-256 Hashes)       │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 6. DATA AT REST (AES-256 File & DB Encryption)         │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 7. IMMUTABLE FORENSIC AUDIT (Append-Only DB Logs)      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Authentication & Identity Management

### 2.1 Password Security & Hashing
- Passwords are never stored in plaintext.
- Hashed using **`bcrypt`** (work factor 12) or **`Argon2id`** (memory 64MB, iterations 3, parallelism 1).
- Minimum policy: 10 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special symbol.

### 2.2 Token-Based Session Management
- **Access Tokens**: Short-lived JSON Web Tokens (JWT) with a **15-minute expiration**.
  - Payload contains: `userId`, `badgeNumber`, `role` (`POLICE_INSPECTOR`), `stationCode`.
  - Cryptographically signed using HMAC-SHA256 (`HS256`) with a 256-bit secret, or RSA/ECDSA (`RS256`).
- **Refresh Tokens**: Long-lived (7 days) stored in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie.
  - Automatically rotated on every refresh call.
  - Stored hashed in the database with revocation support.

---

## 3. Network & Transport Security

1. **HTTPS Enforcement**: All communication strictly requires TLS 1.3 (minimum TLS 1.2). Unencrypted HTTP redirects to HTTPS automatically.
2. **HTTP Strict Transport Security (HSTS)**:
   ```http
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   ```
3. **Cross-Origin Resource Sharing (CORS)**:
   - Whitelist restricted to authorized police client origins (e.g., `https://docshield.police.gov.in` or local dev host).
   - Wildcard `*` origins are strictly forbidden.
4. **Security Headers (Helmet / Reverse Proxy)**:
   ```http
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   Referrer-Policy: strict-origin-when-cross-origin
   Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';
   ```

---

## 4. API Defense & Input Sanitization

1. **Strict Payload Schema Validation**:
   - Every endpoint validates query parameters, route IDs, and request bodies against a strict schema (e.g., Zod or Pydantic).
   - Strips unallowed or unexpected JSON keys.
2. **SQL Injection Prevention**:
   - All relational database interactions use parameterized SQL queries or type-safe ORM query builders (Prisma, Drizzle, or SQLAlchemy).
   - Raw string concatenation in queries is strictly prohibited.
3. **Cross-Site Scripting (XSS) Mitigation**:
   - Automated escaping of user input during HTML rendering.
   - Restrictive Content Security Policy (`CSP`) disabling inline script evaluation.
4. **Rate Limiting**:
   - Global API limit: 120 requests/minute per IP.
   - Sensitive endpoints (`/auth/login`, `/documents/:id/verify`): 5 requests/minute per IP to prevent brute-force attacks.

---

## 5. File Upload & Binary Defense

1. **Magic Number Inspection**: Verifies byte signatures (e.g., checking that a `.pdf` starts with `%PDF-` bytes and not executable MZ headers).
2. **Execution Neutralization**: Files are stored in non-executable storage directories with `chmod 600` or private S3 buckets.
3. **Size Quotas**: Enforces strict 50 MB upload limits to prevent resource exhaustion and denial of service.

---

## 6. Cryptography & Data Protection

| Security Context | Standard / Mechanism | Implementation Details |
| :--- | :--- | :--- |
| **Document Integrity** | **SHA-256** | 256-bit cryptographic digest calculated on pristine byte stream. |
| **Files at Rest** | **AES-256-GCM** | Symmetric encryption for stored files on local disk or S3 server-side encryption. |
| **Passwords** | **bcrypt / Argon2id** | Salting with random 128-bit salt and minimum cost factor 12. |
| **Audit Trails** | **Append-Only DB Rules** | Database engine rules reject `UPDATE` and `DELETE` queries on logs. |
| **Secrets Management** | **Environment Isolation** | Secrets loaded strictly via `.env` or system environment; never committed to git. |

---

## 7. SIH Prototype vs. Production Enterprise Considerations

For the **SIH 26190 Prototype**:
- The architecture implements production-grade cryptographic hashing, JWT security, parameterized SQL, and append-only audit rules.
- Hardware Security Modules (HSM) and enterprise PKI smart-card card readers are simulated via software cryptographic providers and token issuance to ensure clean, self-contained portability during hackathon evaluation.

---

## 8. Document Cross-References
- System Architecture: [07_SYSTEM_ARCHITECTURE.md](file:///d:/msi/love_you/docs/07_SYSTEM_ARCHITECTURE.md)
- Backend Architecture: [08_BACKEND_ARCHITECTURE.md](file:///d:/msi/love_you/docs/08_BACKEND_ARCHITECTURE.md)
- RBAC Specification: [11_RBAC.md](file:///d:/msi/love_you/docs/11_RBAC.md)
- Cryptographic Integrity: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
- Audit Logging: [16_AUDIT_LOGGING.md](file:///d:/msi/love_you/docs/16_AUDIT_LOGGING.md)
