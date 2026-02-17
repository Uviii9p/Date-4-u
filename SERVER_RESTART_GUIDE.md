# 🔧 Quick Fix: Server Restart Required

## The Issue

You're seeing this error:
```
Failed to send media: Route POST /api/chat/send-media not found
```

## Why This Happens

The server was running **before** we added the new camera and media upload code. The server needs to be **restarted** to load the updated code.

## Solution: Restart the Server

### Option 1: Using Terminal (Recommended)

#### Step 1: Stop the Current Server
1. Find the terminal running the server (shows `Server running on port 5000`)
2. Press `Ctrl + C` to stop it

#### Step 2: Restart the Server
```bash
cd server
npm run dev
```

You should see:
```
Server running on port 5000
Local File Storage initialized
```

### Option 2: Kill and Restart

If you can't find the terminal:

#### Windows PowerShell:
```powershell
# Stop the server
Get-Process -Name node | Stop-Process -Force

# Navigate to server directory
cd server

# Start server
npm run dev
```

### Option 3: Using VS Code

1. Open VS Code terminal
2. Stop server with `Ctrl + C`
3. Run: `cd server && npm run dev`

## Verify It's Working

### Test 1: Check Server Health
Open browser and go to:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "UP",
  "storage": "LOCAL_FILE_SYSTEM"
}
```

### Test 2: Check Routes
The server console should show when you make requests:
```
POST /api/chat/send-media 200 - 1234ms
```

### Test 3: Try Uploading Media
1. Go to any chat
2. Click paperclip
3. Click Camera
4. Take a photo
5. Click send

If it works, you'll see in the console:
```
sendMedia called: { receiverId: '...', file: 'camera-123.jpg' }
Media file details: { ... }
Media message saved successfully
```

## Still Not Working?

### Check 1: Server Port
Make sure the server is running on port 5000:
```bash
# Windows
netstat -ano | findstr :5000

# Should show something like:
# TCP    0.0.0.0:5000    0.0.0.0:0    LISTENING    29280
```

### Check 2: Client Proxy
The client should proxy to `http://127.0.0.1:5000`

Check `client/next.config.mjs`:
```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://127.0.0.1:5000/api/:path*',
    },
  ];
}
```

### Check 3: Both Servers Running
You need **TWO** servers:
1. **Backend** (port 5000) - `cd server && npm run dev`
2. **Frontend** (port 3000) - `cd client && npm run dev`

### Check 4: Clear Browser Cache
Sometimes the browser caches the old API responses:
1. Open DevTools (F12)
2. Right-click refresh button
3. Click "Empty Cache and Hard Reload"

## Common Errors & Solutions

### Error: "Port 5000 already in use"
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
# Note the PID (last number)
taskkill /PID <PID> /F

# Then restart
cd server
npm run dev
```

### Error: "Cannot find module"
```bash
# Reinstall dependencies
cd server
npm install

# Then restart
npm run dev
```

### Error: "ENOENT: no such file or directory"
```bash
# Create uploads directory
mkdir -p server/data/uploads/chat

# Then restart server
cd server
npm run dev
```

## Quick Restart Commands

### Full Restart (Both Servers):

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

### One-Line Restart (PowerShell):

**Backend:**
```powershell
Get-Process -Name node | Where-Object {$_.Path -like "*server*"} | Stop-Process -Force; cd server; npm run dev
```

**Frontend:**
```powershell
cd client; npm run dev
```

## Verification Checklist

After restarting, verify:

- [ ] Server shows: `Server running on port 5000`
- [ ] Client shows: `Ready on http://localhost:3000`
- [ ] Health check works: `http://localhost:5000/api/health`
- [ ] Can access app: `http://localhost:3000`
- [ ] Can open chat
- [ ] Can click paperclip
- [ ] Can click camera
- [ ] Camera opens
- [ ] Can capture photo
- [ ] Can send photo
- [ ] Photo appears in chat

## Debug Logs

After restart, when you upload media, you should see these logs:

### Client Console (Browser F12):
```
Opening camera...
Camera stream obtained
Photo captured: { fileName: 'camera-123.jpg', fileSize: 234567, fileType: 'image/jpeg' }
Uploading media: { ... }
Upload progress: 100%
Media uploaded successfully: { ... }
```

### Server Console (Terminal):
```
POST /api/chat/send-media - - ms
sendMedia called: { receiverId: '...', file: 'camera-123.jpg' }
Media file details: {
  originalName: 'camera-123.jpg',
  filename: 'chat-1708164123456-a1b2c3d4.jpg',
  mimetype: 'image/jpeg',
  size: 234567,
  mediaType: 'image',
  mediaUrl: '/uploads/chat/chat-1708164123456-a1b2c3d4.jpg',
  storagePath: '...'
}
Creating message: { ... }
Media message saved successfully
POST /api/chat/send-media 200 - 1234ms
```

## Still Getting 404?

If you still get "Route POST /api/chat/send-media not found" after restart:

1. **Check the route file exists:**
   ```bash
   ls server/routes/chatRoutes.js
   ```

2. **Check the controller exists:**
   ```bash
   ls server/controllers/chatController.js
   ```

3. **Check for syntax errors:**
   ```bash
   cd server
   node -c routes/chatRoutes.js
   node -c controllers/chatController.js
   ```

4. **Check server logs for errors:**
   Look for red error messages when server starts

5. **Try accessing route directly:**
   ```
   http://localhost:5000/api/chat/send-media
   ```
   Should get: "No file uploaded" (means route exists!)

---

**TL;DR**: Stop server (`Ctrl+C`), restart (`npm run dev`), try again! 🚀
