# DocShield — Secure Digital Case, Document and Evidence Management Platform

> **SIH 26190** — Advanced Legal, Forensic, Chain of Custody & Judicial Workflow System conforming to CCTNS, ICJS, and statutory evidentiary requirements under the Indian Evidence Act (IEA) / Bharatiya Sakshya Adhiniyam (BSA) and Code of Criminal Procedure (CrPC) / Bharatiya Nagarik Suraksha Sanhita (BNSS).

---

## 1. Project Setup

DocShield is built with React 19, Vite 8, Vanilla CSS design tokens, and the official Supabase JavaScript SDK (`@supabase/supabase-js`).

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation
```bash
git clone <repository-url>
cd love_you
npm install
```

---

## 2. Environment Variables Required

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Define the public client-safe Supabase configuration:

```env
# DocShield Client Environment Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

> **Security Rule:** Never include or expose `SUPABASE_SERVICE_ROLE_KEY`, database superuser credentials, or backend API secrets in frontend environment files or client bundles.

---

## 3. Supabase Configuration

DocShield utilizes Supabase PostgreSQL with Row Level Security (RLS) enabled across all public tables, cryptographic extensions (`uuid-ossp`, `pgcrypto`), and private Supabase Storage buckets.

### Key Connection File
[`src/lib/supabaseClient.js`](file:///d:/msi/love_you/src/lib/supabaseClient.js) configures the centralized client singleton with automatic token refresh, session persistence, and zero-leakage anonymous authorization.

---

## 4. Database Migration Status

Database migrations are located in [`supabase/migrations/`](file:///d:/msi/love_you/supabase/migrations/):

1. **`20240923000000_docshield_complete_schema.sql`**: Full schema creation including custom ENUMs, 10 primary tables (`profiles`, `cases`, `documents`, `evidence`, `forensic_reports`, `charge_sheets`, `court_filings`, `chain_of_custody_transfers`, `audit_logs`), performance indexes, immutability triggers, and Row Level Security policies.
2. **`20240924000000_fix_auth_trigger_search_path.sql`**: Hardens the `handle_new_user()` trigger on `auth.users` with explicit `SET search_path = public, auth`, fully qualified `public.app_role` casting, and conflict resolution.

---

## 5. Authentication Setup

- **Provider:** Supabase Auth (Email + Secure Passcode / Session JWTs).
- **Session Persistence:** Authenticated sessions persist across page reloads via token storage.
- **Verification Persona Presets:** For evaluation and role testing, pre-configured officer personas can be selected directly on the login modal to test specific role permissions.

---

## 6. Role Definitions & Access Boundaries

| Role | Canonical Identifier | Core Responsibilities & Permissions | Restricted Modules |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | Full administrative oversight, officer provisioning, global settings, audit monitoring. | None |
| **Police Inspector** | `inspector` | Station House Officer; FIR registration, Panchnama documentation, field evidence seizure, custody initiation. | Users, Settings, Admin Dashboard |
| **Legal Officer / Prosecutor** | `legal_officer` | Public Prosecutor; legal scrutiny, Section 173 CrPC charge sheet review, court filings submission. | Users, Settings, Admin Dashboard |
| **Forensic Officer** | `forensic_officer` | Senior Scientific Officer; laboratory intake, evidence examination, report drafting (Form IV Sec 45 IEA), chain of custody transfer chaining. | Charge Sheets, Court Filings, Users, Settings, Admin Dashboard |

---

## 7. Storage Configuration

DocShield employs private Supabase Storage buckets configured with `public = false`:

- `case-documents`: Case dockets, FIR records, Panchnama memos.
- `evidence-vault`: Seized exhibits, photographs, audio/video recordings.
- `forensic-reports`: Certified laboratory analysis certificates.
- `court-filings`: Certified judicial submissions and bail responses.

### Retrieval Security
- Permanent public URLs are strictly forbidden.
- Retrieval generates short-lived (60-second) cryptographically signed URLs (`storageService.getSecureSignedUrl`).
- Uploads enforce a 50 MB threshold and permitted MIME type verification (`application/pdf`, `image/*`, `audio/*`, `video/mp4`).

---

## 8. Development Command

To start the Vite development server with hot module replacement (HMR):

```bash
npm run dev
```

Default local URL: `http://localhost:5173/`

---

## 9. Production Build & Preview Commands

To create an optimized production bundle:

```bash
npm run build
```

To preview the built production bundle locally:

```bash
npm run preview
```

To run the automated verification test suite:

```bash
npm test
```

---

## 10. Deployment Requirements

### Static SPA Hosting (Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront)
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **SPA Rewrites:** All routes rewrite to `/index.html`. Pre-configured via `vercel.json` and `public/_redirects`.
- **Environment Variables:** Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting dashboard.

---

## 11. Security Notes

1. **Append-Only Immutability:** Audit logs and chain-of-custody transfers are immutable. PostgreSQL triggers (`prevent_audit_tampering`, `prevent_custody_tampering`) raise runtime exceptions on any `UPDATE` or `DELETE` statement.
2. **Cryptographic Chaining:** Each custody event computes a SHA-256 block hash incorporating the previous block's hash, custodian identities, locations, and timestamps.
3. **Dual-Layer Access Control:** Client-side route guards prevent unauthorized navigation, while Supabase Row Level Security (RLS) enforces access control at the database engine level.
