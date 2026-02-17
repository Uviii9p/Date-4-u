# 🚂 Railway + Vercel Full Setup Guide (2026)

To make your app fully working (including Video Calls and Real-time Chat), you need a persistent server on **Railway** and a frontend on **Vercel**.

---

## 1. Backend (Railway)
Railway will host your `server` (Express + Socket.io).

### Steps:
1.  **Create a New Project** on [Railway.app](https://railway.app).
2.  **Deploy from GitHub**: Select your `Date-4-u` repository.
3.  **Crucial Setting**: In the Railway dashboard, go to **Settings > General > Root Directory**. Set this to: `server`
4.  **Add Environment Variables**: Go to **Variables** and add:
    *   `PORT` = `5000`
    *   `JWT_SECRET` = `(Your secret string)`
    *   `MONGODB_URI` = `(Your MongoDB Atlas link)`
    *   `CLIENT_URL` = `https://your-app.vercel.app` (Your Vercel link)
    *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, etc.
5.  **Expose Port**: Railway will automatically give you a domain (e.g., `https://date-4-u-production.up.railway.app`). **Copy this URL.**

---

## 2. Frontend (Vercel)
Vercel will host your `client` (Next.js).

### Steps:
1.  Go to your **Vercel Dashboard**.
2.  Go to **Settings > Environment Variables**.
3.  Add/Update these variables:
    *   `NEXT_PUBLIC_SOCKET_URL` = `https://your-railway-url.railway.app`
    *   `NEXT_PUBLIC_BACKEND_URL` = `https://your-railway-url.railway.app`
    *   `MONGODB_URI` = `(Same as backend)`
    *   `JWT_SECRET` = `(Same as backend)`
4.  **Redeploy**: Go to the **Deployments** tab and click **Redeploy**.

---

## 3. Why this works:
*   **Vercel** handles the fast pages and Auth APIs (fast).
*   **Railway** handles the **Socket.io** connection (persistent).
*   **MongoDB** shared between both keeps your users and chats synced.

---

### ✅ Checklist for "Fully Working":
- [ ] Railway backend has `CLIENT_URL` pointing to Vercel.
- [ ] Vercel frontend has `NEXT_PUBLIC_SOCKET_URL` pointing to Railway.
- [ ] Both have the same `MONGODB_URI`.

If you see the "Backend not reachable" error again, wait 30 seconds for Railway to wake up and then refresh!
