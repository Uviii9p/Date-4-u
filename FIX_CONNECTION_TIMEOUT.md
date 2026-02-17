# 🛑 CRITICAL: Fix "Timeout" / "Connection Failed" Errors

If you see a "Timeout" error when logging in or signing up on Vercel, it is 99% because **MongoDB Atlas is blocking Vercel's connection**.

## How to Fix (Takes 30 seconds):

1.  **Go to MongoDB Atlas**: Log in to [cloud.mongodb.com](https://cloud.mongodb.com).
2.  **Click "Network Access"**: Look for this in the left-side menu under "Security".
3.  **Click "+ ADD IP ADDRESS"**: The big green button.
4.  **Select "Allow Access From Anywhere"**: 
    *   Click the button that says **"Allow Access From Anywhere"**.
    *   Make sure the IP Address box shows `0.0.0.0/0`.
5.  **Click "Confirm"**.

**Wait 1-2 minutes for the changes to apply, then refresh your Vercel app and try again.**

---

### Why is this necessary?
Vercel uses dynamic IP addresses that change constantly. MongoDB is secure by default and blocks unknown IPs. By adding `0.0.0.0/0`, you tell MongoDB to allow connections from your Vercel app.

### Still having issues?
If you still can't connect, double-check your password in the `MONGODB_URI` environment variable in Vercel.
