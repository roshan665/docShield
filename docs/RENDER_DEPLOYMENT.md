# Deploying DOCS SHIELD on Render

This guide outlines how to deploy **DOCS SHIELD – Digital Evidence Command Center** to [Render](https://render.com) in minutes.

---

## Option 1: 1-Click Blueprint Deployment (Recommended)

Render provides infrastructure-as-code support through `render.yaml` located at the root of the repository.

### Steps:
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top right corner and select **Blueprint**.
3. Connect your GitHub repository: `https://github.com/roshan665/docShield.git`.
4. Render will automatically parse `render.yaml` and discover:
   - **`docshield-backend`**: FastAPI Python Web Service
   - **`docshield-frontend`**: Next.js 14 Node Web Service
   - **`docshield-db`**: Managed PostgreSQL Database
5. Click **Apply**.
6. Render will provision the services and link environment variables automatically.

---

## Option 2: Manual Service Creation

If you prefer to configure services manually in the Render dashboard:

### 1. Database (`PostgreSQL`)
1. Click **New +** $\to$ **PostgreSQL**.
2. **Name**: `docshield-db`
3. **Database**: `docshield`
4. **User**: `docshield_user`
5. **Plan**: `Free`
6. Click **Create Database**. Copy the **Internal Database URL** for the backend service.

---

### 2. Backend Web Service (`FastAPI`)
1. Click **New +** $\to$ **Web Service**.
2. Select your repository `https://github.com/roshan665/docShield.git`.
3. Configure the settings:
   - **Name**: `docshield-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. Add **Environment Variables**:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.9` | Ensures compatible Python environment |
   | `APP_ENV` | `production` | Production mode |
   | `APP_DEBUG` | `false` | Disable debug flags in production |
   | `API_V1_STR` | `/api/v1` | API base path |
   | `DATABASE_URL` | `<Internal Database URL>` | From your Render Postgres instance |
   | `JWT_SECRET_KEY` | `<Random 64-char hex string>` | Used to sign access tokens |
   | `BACKEND_CORS_ORIGINS` | `https://*.onrender.com,http://localhost:3000` | Enables CORS across Render domains |
   | `MALWARE_SCAN_REQUIRED` | `false` | Set to false unless ClamAV daemon is linked |
5. Click **Create Web Service**. Note your backend URL (e.g., `https://docshield-backend.onrender.com`).

---

### 3. Frontend Web Service (`Next.js`)
1. Click **New +** $\to$ **Web Service**.
2. Select your repository `https://github.com/roshan665/docShield.git`.
3. Configure the settings:
   - **Name**: `docshield-frontend`
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Add **Environment Variables**:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_VERSION` | `20.16.0` | Node.js runtime version |
   | `NEXT_PUBLIC_API_URL` | `https://docshield-backend.onrender.com/api/v1` | Replace with your backend URL |
5. Click **Create Web Service**.

---

## 🔒 Post-Deployment Verification

1. Open your frontend URL (e.g. `https://docshield-frontend.onrender.com`).
2. Verify the **Login Page** loads with the cybersecurity design.
3. Test **1-Click Demo Login** (`System Admin` or `Investigating Officer`).
4. Test navigating through **Command Dashboard**, **Cases**, **Documents**, **Evidence Vault**, **Search**, and **Settings**.
