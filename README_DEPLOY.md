# 🚀 Deployment Guide for Date2W

This guide will help you deploy your application so it works perfectly in production.

## 1. Backend (Server) - Recommended: Render.com or Railway.app
Vercel is not ideal for the backend because it doesn't support persistent WebSockets (Socket.io).

### Steps:
1. Create an account on [Render](https://render.com) or [Railway](https://railway.app).
2. Connect your GitHub repository.
3. Set the **Root Directory** to `server`.
4. Set the **Build Command** to `npm install`.
5. Set the **Start Command** to `node server.js`.
6. **Environment Variables**: Add your `.env` variables (Cloudinary, JWT_SECRET, etc.).

## 2. Frontend (Client) - Recommended: Vercel.com
Vercel is the best home for your Next.js frontend.

### Steps:
1. Create an account on [Vercel](https://vercel.com).
2. Import your project.
3. **Important**: Vercel will detect the root. In the deployment settings:
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/.next`
4. **Environment Variables**:
   - `NEXT_PUBLIC_BACKEND_URL`: Your Backend URL (e.g., `https://your-server.onrender.com`)
   - `NEXT_PUBLIC_SOCKET_URL`: Your Backend URL (same as above)

## 3. Database Note
Currently, the app uses local `.json` files. For production:
1. Sign up for a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/lp/try2) cluster.
2. Get your connection string.
3. Add it as `MONGODB_URI` in your backend environment variables.
4. *Tip*: If you want to keep using JSON files, use **Render** with a "Disk" attached, but MongoDB is much better.

## 4. Environment Variables Checklist
Make sure these are set in your production platforms:
- `JWT_SECRET` (Any long random string)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLIENT_URL` (Your Vercel URL)
- `NODE_ENV=production`

---
**Everything is now ready!** Just push your code to GitHub and connect the apps. ✅
