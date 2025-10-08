# 🔧 Vercel 500 Error Fix

## ❌ Problem:
```
Failed to load resource: the server responded with a status of 500 ()
/api/data/tasks
/api/data/leads
```

## ✅ Solution:

### Step 1: Install @vercel/kv Package

```bash
npm install @vercel/kv
```

### Step 2: Commit & Push

```bash
git add package.json package-lock.json
git commit -m "Add @vercel/kv dependency"
git push origin master
```

### Step 3: Vercel Will Auto-Deploy

Vercel automatically redeploy karega with the new package.

---

## 🔍 Check Vercel Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments** tab
4. Click on latest deployment
5. Click **Functions** tab
6. Check `/api/data/tasks` logs

You'll see the actual error message.

---

## 🎯 Common Issues:

### Issue 1: @vercel/kv Not Installed
**Error:** `Cannot find module '@vercel/kv'`

**Fix:**
```bash
npm install @vercel/kv
git push
```

### Issue 2: Upstash Not Connected
**Error:** `KV_REST_API_URL is not defined`

**Fix:**
1. Vercel Dashboard → Storage
2. Connect Upstash database
3. Redeploy

### Issue 3: Environment Variables Missing
**Error:** `KV environment variables not found`

**Fix:**
1. Vercel Dashboard → Settings → Environment Variables
2. Check if KV variables are there:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_URL`
3. If missing, reconnect Upstash database

---

## 🚀 Quick Fix Commands:

```bash
# Install package
npm install @vercel/kv

# Commit
git add .
git commit -m "Fix: Add @vercel/kv package"

# Push (Vercel auto-deploys)
git push origin master
```

---

## ✅ Verify Fix:

After deployment:
1. Open your app
2. Check browser console
3. No more 500 errors!
4. Data loads successfully

---

## 📝 Note:

The error happens because:
- Code tries to import `@vercel/kv`
- Package not in `node_modules`
- Import fails → 500 error

Solution: Install the package!
