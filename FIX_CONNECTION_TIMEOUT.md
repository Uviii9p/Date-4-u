# 🔍 How to Find "Network Access" in MongoDB Atlas

If you don't see "Network Access" in the left menu, follow these steps:

## Method 1: The "Connect" Button (Easiest)
1.  Go to the **"Database"** tab (usually the first item in the left menu).
2.  You should see your Cluster (e.g., "Cluster0").
3.  Click the **"Connect"** button on that cluster card.
4.  In the popup window, look for a section about **IP Access**.
    *   It might say "Allow Access from Anywhere".
    *   Or "Add your current IP Address".
5.  Click **"Allow Access from Anywhere"** (or add `0.0.0.0/0` manually).

## Method 2: The "Security" Heading
1.  Look at the Left Sidebar.
2.  Find the word **SECURITY** (it might be a small heading).
3.  Under **SECURITY**, you should see:
    *   Database Access
    *   **Network Access** (This is the one!)

## Method 3: Direct Link
Try to edit your browser URL to look like this:
`https://cloud.mongodb.com/v2/YOUR_PROJECT_ID#security/network/accessList`

---
**Once you add `0.0.0.0/0`, wait 1 minute and try to Register again on Vercel.**
