# PassKaro Frontend — Deployment Guide (Vercel)

This directory contains the React 19 + Vite + Tailwind CSS frontend application for PassKaro.

---

## Deploying to Vercel

### 1. Import Project to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your GitHub repository (`naveenmodii/Passkaro`).
4. Set the **Root Directory** to `client` (Click **Edit** next to Root Directory and select `client`).

---

### 2. Build & Development Settings
Vercel automatically detects Vite projects. Confirm the following settings:
- **Framework Preset**: `Vite`
- **Build Command**: 
  ```bash
  npm run build
  ```
- **Output Directory**: 
  ```
  dist
  ```
- **Install Command**: 
  ```bash
  npm install
  ```

---

### 3. Required Environment Variable
Under the **Environment Variables** section in Vercel, add the following key:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://<your-render-backend-name>.onrender.com` | Deployed backend URL (without trailing `/`) |

> [!IMPORTANT]
> - Ensure the variable name is **`VITE_API_URL`** (case-sensitive with the `VITE_` prefix).
> - After setting environment variables, click **Deploy** (or trigger a fresh redeploy if already imported).

---

## Local Development
To run the client locally:
```bash
npm install
npm run dev
```
Local dev server runs at `http://localhost:5173`.
