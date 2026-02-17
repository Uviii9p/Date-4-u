# Date2W - 2026 Modern Dating Application

A production-ready, high-performance dating application inspired by Tinder and Hinge, featuring glassmorphism UI, real-time matching, and WebRTC video calls.

## 🚀 Features

- **2026 UI/UX Design**: Dark mode default, gradient pink-purple theme, glassmorphism cards.
- **Swipe Match System**: Smooth Framer Motion animations for swipe cards.
- **Match Discovery**: Location and Interest-based recommendation system.
- **Real-time Chat**: Persistent messaging with Socket.io, typing indicators, and seen status.
- **Audio & Video Call**: Peer-to-peer calling using WebRTC.
- **Security**: JWT Auth, bcrypt hashing, Helmet, Rate limiting, and Input validation.
- **Scalability**: Clean MVC architecture and Mongoose models.

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Framer Motion, Axios, Socket.io-client, WebRTC.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io.
- **Third Party**: Cloudinary (Image uploads), Canvas-Confetti.

## 📁 Project Structure

```
/client (Next.js)
  /app (Pages & Layouts)
  /components (Reusable UI)
  /context (Auth Management)
  /hooks (Socket & RTC Hooks)
  /lib (API & Utils)
/server (Express)
  /controllers (Logic)
  /models (Mongoose Schemas)
  /routes (API endpoints)
  /sockets (Real-time signaling)
  /middleware (Auth & Security)
  /utils (Cloudinary & Helper)
```

## ⚙️ Installation

1. **Clone the repository**
2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```
3. **Install Client Dependencies:**
   ```bash
   cd client
   npm install
   ```
4. **Set up Environment Variables:**
   - Copy `.env.example` in `server` to `.env` and fill it.
   - Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` in `client/.env.local`.

## 🏃‍♂️ Running Locally

1. **Start Backend:**
   ```bash
   cd server
   npm start
   ```
2. **Start Frontend:**
   ```bash
   cd client
   npm run dev
   ```

## 🚢 Deployment Steps

### MongoDB Atlas
1. Create a cluster.
2. Get the connection string.
3. Whitelist IP addresses.

### Render (Backend)
1. Link your GitHub repo.
2. Create a "Web Service".
3. Set Environment variables from `.env`.
4. Build command: `npm install`
5. Start command: `node server.js`

### Vercel (Frontend)
1. Link your GitHub repo.
2. Set Environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
   - `NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com`
3. Click Deploy.

## 🛡 Security & Safety
- **Age Restriction**: Block users under 18.
- **Safety**: Report and Block functionality implemented.
- **Protection**: JWT protected routes and CORS configuration.

---
Built with ❤️ for the future of dating.
