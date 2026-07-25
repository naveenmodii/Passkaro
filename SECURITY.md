# PassKaro Security & Content Protection Architecture

This document outlines the security controls, access enforcement design, residual risk tradeoffs, and future hardening roadmap for the PassKaro platform.

---

## 1. What's Protected & How

PassKaro implements multi-layered security across authentication, authorization, payments, and video delivery. Every protection mechanism is backed by server-side verification:

### Server-Side Subject Access & Video ID Protection
- **Content Sanitization ([contentController.js](file:///Users/naveenmodi/Downloads/CV%20Projects/Passkaro/server/controllers/contentController.js))**: The public API route `GET /api/content/subjects/:subjectId/chapters` returns chapter and video metadata, but **explicitly strips the `bunnyVideoId` field** (`delete videoObj.bunnyVideoId`) for all video objects returned to the frontend.
- **Strict Playback Gatekeeping ([videoController.js](file:///Users/naveenmodi/Downloads/CV%20Projects/Passkaro/server/controllers/videoController.js))**: Video URLs are generated exclusively via `GET /api/videos/:videoId/play-url`. This endpoint verifies that the user is authenticated and checks the user's `unlockedSubjects` array (or `user.role === 'admin'`). If the user has not purchased the parent subject, the backend responds with `403 Forbidden`.

### Cryptographic Razorpay Signature Verification
- **Zero Client Trust ([paymentController.js](file:///Users/naveenmodi/Downloads/CV%20Projects/Passkaro/server/controllers/paymentController.js))**: When a student purchases access, the server creates a Razorpay order via `POST /api/payments/create-order`.
- After payment, the frontend posts payment metadata to `POST /api/payments/verify`. The server recalculates an HMAC-SHA256 signature using the secret `RAZORPAY_KEY_SECRET` on `${orderId}|${paymentId}` and performs a strict equality comparison against the signature received:
  ```javascript
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  ```
  Only upon cryptographic signature verification is the subject added to the user's `unlockedSubjects` list using Mongoose `$addToSet`.

### JWT Authentication & Token Security
- **HTTP-Only Cookies ([authController.js](file:///Users/naveenmodi/Downloads/CV%20Projects/Passkaro/server/controllers/authController.js))**: Upon login or signup, JSON Web Tokens (JWT) are issued with `httpOnly: true` to prevent client-side JavaScript access and mitigate XSS token theft.
- **Cross-Site & CSRF Safeguards ([auth.js](file:///Users/naveenmodi/Downloads/CV%20Projects/Passkaro/server/middleware/auth.js))**: Production deployment sets `sameSite: 'none'` and `secure: true` for cross-site cookie compliance between Vercel and Render, with `Authorization: Bearer <token>` fallback handling.

### Short-Lived Token-Signed Video Streaming
- **Bunny Stream Signed URLs ([videoController.js](file:///Users/naveenmodi/Downloads/CV%20Projects/Passkaro/server/controllers/videoController.js))**: Direct CDN links are never exposed. When playback is authorized, the server generates a short-lived token using SHA-256 hashing:
  ```javascript
  const expiresAt = Math.floor(Date.now() / 1000) + (6 * 60 * 60); // 6 hours
  const token = crypto
    .createHash('sha256')
    .update(BUNNY_TOKEN_AUTH_KEY + video.bunnyVideoId + expiresAt)
    .digest('hex');
  ```
  Playback URLs expire automatically after 6 hours, rendering shared or leaked links useless.

---

## 2. What's Explicitly Out of Scope / Residual Risk

PassKaro makes intentional engineering tradeoffs appropriate for an engineering semester exam preparation platform:

- **Screen Recording**: This design does not prevent a authenticated, paying user from recording their screen using software or external capture devices.
- **No Full DRM (Widevine / FairPlay)**: High-grade hardware DRM requires expensive licensing, specialized encoding pipelines, and restrictive client SDKs. 

### Why This Tradeoff Is Reasonable
PassKaro is an exam-crash-course platform designed for fast, targeted study before university tests. The risk profile is fundamentally different from high-budget studio movies or AAA digital media. The current architecture (server-side authorization + cryptographic signatures + short-lived signed CDN URLs) effectively stops casual piracy, unauthorized direct downloads, and link sharing without adding prohibitive operational costs.

---

## 3. Possible Future Hardening

If PassKaro scales to high traffic and higher revenue, the following concrete security enhancements are recommended:

1. **Dynamic Viewer Watermarking**:
   Burn the logged-in viewer's email address or User ID dynamically onto the player canvas during playback to deter screen recording and leak sharing.
2. **MongoDB Atlas IP Whitelisting**:
   Restrict database access from `0.0.0.0/0` (allow all) to the specific static outbound IP range assigned by Render.
3. **Rate-Limiting on Video Endpoints**:
   Implement `express-rate-limit` on `/api/videos/:videoId/play-url` (e.g., max 30 play requests per 15 minutes) to prevent automated token scraping.
