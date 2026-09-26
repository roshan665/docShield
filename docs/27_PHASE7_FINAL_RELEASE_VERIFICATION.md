# DocShield Phase 7: Production Deployment Preparation & Final Release Verification

## 1. Executive Overview

DocShield has undergone comprehensive production readiness hardening and verification across all architectural tiers:
- **Frontend Layer**: React 19 + Vite client bundle with zero mock/development credentials in production builds, strict API proxy configuration, and full role-based dashboard routing.
- **Authoritative Backend**: FastAPI application enforcing server-side SHA-256 byte hashing, multi-version immutable exhibit ledgers, cryptographic Chain of Custody block chaining, state-machine workflow locks, and centralized audit logging.
- **Database & Storage**: Supabase PostgreSQL with Row Level Security (RLS) active on all tables, immutability database triggers (`prevent_version_tampering`), and private storage buckets with pre-signed ephemeral URL retrieval.

---

## 2. Environment Variables Checklist

### 2.1 Backend Production Configuration (`backend/.env`)

| Variable Name | Required | Example / Recommended Setting | Security Description |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | **Yes** | `production` | Suppresses Swagger/OpenAPI documentation endpoints and enables strict security assertions |
| `HOST` | **Yes** | `0.0.0.0` | Bind interface within production container / systemd service |
| `PORT` | **Yes** | `8000` | Application HTTP listening port |
| `API_V1_PREFIX` | **Yes** | `/api/v1` | Versioned API route prefix |
| `FRONTEND_URL` | **Yes** | `https://docshield.gov.in` | Explicit frontend origin for CORS whitelist |
| `ALLOWED_ORIGINS` | **Yes** | `https://docshield.gov.in` | Comma-delimited list of permitted CORS origins. **Wildcards (`*`) are strictly stripped** |
| `SUPABASE_URL` | **Yes** | `https://<project-ref>.supabase.co` | Remote Supabase project API gateway |
| `SUPABASE_ANON_KEY` | **Yes** | `<publishable-anon-key>` | Public API key for client-scoped operations |
| `SUPABASE_SERVICE_ROLE_KEY` | **Optional** | `<service-role-secret>` | High-privilege key strictly retained on backend; **never exposed to client** |
| `SUPABASE_JWT_SECRET` | **Optional** | `<jwt-secret>` | Optional server-side secret for local signature validation |

### 2.2 Frontend Production Configuration (`.env`)

| Variable Name | Required | Example Setting | Security Description |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | **Yes** | `https://<project-ref>.supabase.co` | Supabase gateway for public auth queries |
| `VITE_SUPABASE_ANON_KEY` | **Yes** | `<publishable-anon-key>` | Publishable anonymous token |
| `VITE_API_URL` | **Yes** | `https://api.docshield.gov.in/api/v1` | Base URL pointing directly to authoritative FastAPI backend |

> [!CAUTION]
> Never place `SUPABASE_SERVICE_ROLE_KEY`, database passwords, or private encryption keys in the frontend `.env` file. Frontend environment variables are bundled into public static JavaScript files.

---

## 3. Production Build & Execution Commands

### 3.1 Backend Service (FastAPI)

For production Linux deployments, execute the ASGI application using `uvicorn` managed under `systemd` or as a multi-worker `gunicorn` process:

```bash
# 1. Activate virtual environment
source backend/.venv/bin/activate

# 2. Install production dependencies
pip install --no-cache-dir -r backend/requirements.txt

# 3. Launch with multi-worker Uvicorn
gunicorn backend.app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile /var/log/docshield/backend_access.log \
  --error-logfile /var/log/docshield/backend_error.log \
  --timeout 120
```

### 3.2 Frontend Client (React / Vite)

```bash
# 1. Install dependencies
npm ci

# 2. Compile optimized production bundle
npm run build

# Artifacts are generated in the `dist/` directory:
# - dist/index.html (Entry HTML with security headers)
# - dist/assets/*.js (Code-split vendor and application chunks)
# - dist/assets/*.css (Compiled CSS bundle)
```

---

## 4. Production Reverse Proxy & TLS Configuration (Nginx)

Place Nginx in front of both the static frontend bundle and the FastAPI backend:

```nginx
# /etc/nginx/sites-available/docshield.gov.in

server {
    listen 80;
    server_name docshield.gov.in api.docshield.gov.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name docshield.gov.in;

    ssl_certificate /etc/letsencrypt/live/docshield.gov.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/docshield.gov.in/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; connect-src 'self' https://*.supabase.co https://api.docshield.gov.in; img-src 'self' data: https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;" always;

    # Frontend Static Distribution
    root /var/www/docshield/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy Routing
    location /api/v1/ {
        proxy_pass http://127.0.0.1:8000/api/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 55M; # Supports 50MB exhibits + headers
    }
}
```

---

## 5. Non-Destructive Database Migration Procedure

All migrations in `supabase/migrations/` are idempotent, additive, and safe for production execution:

1. `20240923000000_docshield_complete_schema.sql`: Core schema, foreign keys, and profiles.
2. `20240924000000_fix_auth_trigger_search_path.sql`: Hardened `SECURITY DEFINER` function paths.
3. `20240924010000_evidence_document_versioning.sql`: Adds `evidence_versions` and `document_versions` immutable ledgers, SHA-256 regex constraints (`^[a-f0-9]{64}$`), and `prevent_version_tampering()` triggers.

Execute migration check via Supabase CLI:
```bash
supabase db push
```

---

## 6. Pre-Flight Release Checklist

- [x] All 78 backend pytest test cases pass cleanly (`pytest backend/tests/`).
- [x] All 60 Node.js production QA verification checks pass (`node --env-file=.env test-production-qa.js`).
- [x] Frontend builds with zero compiler or bundling errors (`vite build` in 442ms).
- [x] No plaintext passwords, keys, or credentials committed in git repository.
- [x] `.env` excluded from version control in `.gitignore`.
- [x] Safe `.env.example` templates provided for frontend and backend.
- [x] FastAPI CORS strictly prohibits wildcard `*` in production mode.
- [x] Interactive Swagger/Redoc UI automatically disabled when `ENVIRONMENT=production`.
- [x] Evidence file uploads strictly bounded by statutory 50 MB threshold.
- [x] Filenames sanitized against directory traversal attacks (`..` and path separators removed).
- [x] Evidence versioning preserves byte history across exhibit updates.
- [x] Storage tamper detection verified with original hash retention and high-severity audit logging.
- [x] Append-only Chain of Custody enforces cryptographic SHA-256 block hash chaining.
- [x] Finalized forensic reports and accepted charge sheets locked against state tampering.
- [x] RLS enabled across all database tables with role enforcement functions.
- [x] UI design and visual layout remain completely frozen and preserved.
