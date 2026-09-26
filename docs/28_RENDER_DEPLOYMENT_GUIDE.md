# DocShield — Complete Render Deployment Guide

This guide provides step-by-step instructions for deploying DocShield to [Render](https://render.com).

DocShield is structured for zero-friction cloud deployment on Render's Free or Paid tiers with two deployment strategies:

1. **Option A (Recommended — Blueprint)**: Decoupled Multi-Service via `render.yaml`
   - **Backend**: Python Web Service running authoritative FastAPI on `https://<your-backend>.onrender.com`.
   - **Frontend**: Render Static Site (100% Free, CDN-accelerated) serving the React + Vite SPA on `https://<your-frontend>.onrender.com`.
2. **Option B (Unified Single Service)**: Multi-stage Docker container via `Dockerfile` hosting both the API and compiled SPA frontend from a single Render Web Service.

---

## Prerequisites

Before starting, ensure you have:
1. A [GitHub](https://github.com) account with repository access to [docShield_UI](https://github.com/roshan665/docShield_UI.git).
2. A [Render](https://render.com) account.
3. Your Supabase project credentials:
   - `SUPABASE_URL` (e.g. `https://xyzcompany.supabase.co`)
   - `SUPABASE_ANON_KEY` (public client key)
   - `SUPABASE_SERVICE_ROLE_KEY` (secret server key for backend RLS bypass)
   - `SUPABASE_JWT_SECRET` (from Supabase Project Settings -> API -> JWT Settings)

---

## Option A: 1-Click Blueprint Deployment (Recommended)

Render Blueprints use the pre-configured [render.yaml](file:///d:/msi/love_you/render.yaml) file at the root of the repository to automatically provision both the FastAPI Web Service and the React Static Site.

### Step 1: Create a Blueprint Instance in Render
1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Connect your GitHub repository (`roshan665/docShield_UI`).
4. Give your Blueprint instance a name (e.g., `docshield-production`).
5. Click **Apply**. Render will detect `render.yaml` and display the two declared services:
   - `docshield-backend` (Web Service, Python 3.12)
   - `docshield-frontend` (Static Site, Vite build)

### Step 2: Configure Environment Variables in Render
When prompted or by navigating to each service's **Environment** tab:

#### 1. Backend Service (`docshield-backend`)
| Variable Key | Required | Value / Description |
|---|---|---|
| `ENVIRONMENT` | Yes | `production` |
| `PYTHON_VERSION` | Yes | `3.12.0` |
| `SUPABASE_URL` | Yes | `https://<your-project>.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Your Supabase public anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Your Supabase service role secret |
| `SUPABASE_JWT_SECRET` | Recommended | Supabase JWT Secret for token verification |
| `FRONTEND_URL` | Optional | `https://docshield-frontend.onrender.com` (Render automatically permits `*.onrender.com` subdomains) |
| `ALLOWED_ORIGINS` | Optional | `https://docshield-frontend.onrender.com,http://localhost:5173` |

#### 2. Frontend Service (`docshield-frontend`)
| Variable Key | Required | Value / Description |
|---|---|---|
| `VITE_API_URL` | Yes | `https://docshield-backend.onrender.com` (Do not worry about `/api/v1` or trailing slashes; DocShield normalizes this automatically) |
| `VITE_SUPABASE_URL` | Yes | `https://<your-project>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase public anonymous key |

### Step 3: Deploy
1. Click **Apply Changes** or **Deploy**.
2. Render will build both services in parallel.
3. Backend health check automatically verifies against `/api/v1/health`.

---

## Option B: Manual Service Creation (Step-by-Step UI)

If you prefer to configure each service manually in the Render web dashboard:

### 1. Backend Web Service
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select your repository: `roshan665/docShield_UI`.
3. Configure the service settings:
   - **Name**: `docshield-backend`
   - **Region**: Choose closest to your database (e.g. `Oregon (US West)` or `Frankfurt (EU)`)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank for repo root)*
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. Expand **Advanced Settings**:
   - **Health Check Path**: `/api/v1/health`
   - **Auto-Deploy**: `Yes`
5. Add Environment Variables (from the table in Option A).
6. Click **Create Web Service**.

### 2. Frontend Static Site
1. In Render Dashboard, click **New +** -> **Static Site**.
2. Select your repository: `roshan665/docShield_UI`.
3. Configure the settings:
   - **Name**: `docshield-frontend`
   - **Branch**: `main`
   - **Root Directory**: *(leave blank for repo root)*
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Expand **Advanced Settings**:
   - Add a **Rewrite Rule**:
     - **Source**: `/*`
     - **Destination**: `/index.html`
5. Add Environment Variables:
   - `VITE_API_URL`: Your backend URL (e.g. `https://docshield-backend.onrender.com`)
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
6. Click **Create Static Site**.

---

## Option C: Unified Single-Service Container (Docker)

If you want a single Web Service on Render that serves both the FastAPI API and the React frontend:

1. Click **New +** -> **Web Service**.
2. Select `roshan665/docShield_UI`.
3. Choose **Docker** as the runtime (Render will automatically detect [Dockerfile](file:///d:/msi/love_you/Dockerfile)).
4. Set Environment Variables:
   - `SUPABASE_URL`: Supabase URL
   - `SUPABASE_ANON_KEY`: Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key
   - `SUPABASE_JWT_SECRET`: Supabase JWT Secret
   - `SERVE_STATIC_FRONTEND`: `true`
5. Click **Create Web Service**.

---

## Verification & Testing

Once both services report **Live**:

### 1. Test Backend Health Check
Open a terminal or browser and query the backend health endpoint:
```bash
curl -i https://<your-backend-name>.onrender.com/api/v1/health
```
Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "environment": "production",
    "supabase_connected": true
  }
}
```

### 2. Verify CORS Integration
Execute an OPTIONS pre-flight request from your terminal:
```bash
curl -i -X OPTIONS https://<your-backend-name>.onrender.com/api/v1/cases \
  -H "Origin: https://<your-frontend-name>.onrender.com" \
  -H "Access-Control-Request-Method: GET"
```
Verify `access-control-allow-origin: https://<your-frontend-name>.onrender.com` is returned.

### 3. Verify Frontend Application
1. Navigate to `https://<your-frontend-name>.onrender.com`.
2. Ensure the DocShield sign-in portal loads immediately.
3. Test logging in as any role:
   - Inspector (`inspector@docshield.gov.in`)
   - Admin (`admin@docshield.gov.in`)
   - Legal Officer (`legal@docshield.gov.in`)
   - Forensic Officer (`forensic@docshield.gov.in`)
4. Confirm no bottom horizontal scrollbar appears and the UI layout is responsive.

---

## Troubleshooting Common Issues

### 1. Free Tier Backend Cold Starts
On Render's Free plan, Web Services spin down after 15 minutes of inactivity. The first request after sleep may take ~30–45 seconds while the container initializes.
- **Remedy**: The DocShield frontend includes a 30-second client timeout and retry mechanism. If zero-downtime is required, upgrade the backend service to the Render **Starter** plan ($7/mo).

### 2. Frontend 404 on Page Refresh
If refreshing a page (e.g. `#/inspector/dashboard` or deep link) returns 404:
- **Remedy**: Ensure the Static Site rewrite rule `/* -> /index.html` is configured in Render dashboard or `render.yaml`.

### 3. Supabase Auth Redirect URLs
In your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**:
- Set **Site URL** to: `https://<your-frontend-name>.onrender.com`
- Under **Redirect URLs**, add:
  - `https://<your-frontend-name>.onrender.com/**`
  - `http://localhost:5173/**`
