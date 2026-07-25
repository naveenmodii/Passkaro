# PassKaro Backend — Deployment Guide (Render)

This directory contains the Node.js + Express + MongoDB backend API for PassKaro.

---

## Deploying to Render (Web Service)

### 1. Create a New Web Service
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** $\rightarrow$ **Web Service**.
3. Connect your GitHub repository (`naveenmodii/Passkaro`).
4. Set the **Root Directory** to `server`.

---

### 2. Service Configuration
- **Runtime**: `Node`
- **Build Command**: 
  ```bash
  npm install
  ```
- **Start Command**: 
  ```bash
  node index.js
  ```

---

### 3. Required Environment Variables
In the Render Service Dashboard under **Environment**, add the following environment variables:

| Variable Name | Description / Example |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` (or leave default assigned by Render) |
| `MONGO_URI` | `mongodb+srv://<user>:<password>@cluster.mongodb.net/passkaro?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key used to sign & verify JWT tokens |
| `CLIENT_URL` | Deployed Vercel frontend URL (e.g., `https://passkaro-iota.vercel.app`) |
| `RAZORPAY_KEY_ID` | `rzp_test_...` or production Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `BUNNY_LIBRARY_ID` | Bunny Stream Library ID (e.g., `707508`) |
| `BUNNY_API_KEY` | Bunny Stream API Key |
| `BUNNY_TOKEN_AUTH_KEY` | Bunny Stream Token Authentication Key |

---

## Health Check
Once deployed, verify that the backend service is running by navigating to:
```
https://<your-render-service-name>.onrender.com/api/health
```
Expected response:
```json
{ "status": "ok" }
```
