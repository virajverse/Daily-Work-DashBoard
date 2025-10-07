# 🚀 Vercel Deployment Guide

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier works!)
- Your code pushed to GitHub

---

## 🎯 Step-by-Step Deployment

### 1️⃣ Install Vercel KV Dependency

```bash
npm install @vercel/kv
```

### 2️⃣ Push to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin master
```

### 3️⃣ Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Click **"Deploy"**

### 4️⃣ Setup Vercel KV Database

1. In Vercel Dashboard, go to your project
2. Click **"Storage"** tab
3. Click **"Create Database"**
4. Select **"KV"** (Key-Value Store)
5. Choose a name (e.g., `daily-work-db`)
6. Select region closest to you
7. Click **"Create"**

Vercel will automatically add these environment variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`
- `KV_URL`

### 5️⃣ Add Other Environment Variables

In **Settings → Environment Variables**, add:

```env
DASHBOARD_PASSWORD=your-password

NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=mailto:your-email@example.com

NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
CRON_SECRET=your-cron-secret
```

### 6️⃣ Redeploy

After adding environment variables:
1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**

---

## 🔄 How Storage Works

### Local Development (Your Computer)
- ✅ Data saved to `local-data/` folder
- ✅ Files: `tasks.json`, `leads.json`
- ✅ Easy to backup and access

### Production (Vercel)
- ✅ Data saved to Vercel KV (Redis-based)
- ✅ Fast, reliable, and scalable
- ✅ Free tier: 256 MB storage, 100K requests/month

### Automatic Switching
The app automatically detects the environment:
- **Local:** Uses file storage
- **Vercel:** Uses KV storage

---

## 💾 Data Migration (Local → Vercel)

If you have existing data in `local-data/`, you can migrate it:

### Option 1: Manual Migration (Recommended)

1. Deploy your app to Vercel
2. Open your deployed app
3. Manually add your tasks and leads through the UI

### Option 2: API Migration Script

Create a migration script:

```bash
# Create migration script
cat > migrate-to-vercel.sh << 'EOF'
#!/bin/bash

# Your Vercel app URL
APP_URL="https://your-app.vercel.app"

# Migrate tasks
curl -X POST "$APP_URL/api/data/tasks" \
  -H "Content-Type: application/json" \
  -d @local-data/tasks.json

# Migrate leads
curl -X POST "$APP_URL/api/data/leads" \
  -H "Content-Type: application/json" \
  -d @local-data/leads.json

echo "Migration complete!"
EOF

chmod +x migrate-to-vercel.sh
./migrate-to-vercel.sh
```

---

## 📊 Vercel KV Pricing

### Free Tier (Hobby)
- ✅ 256 MB storage
- ✅ 100,000 commands/month
- ✅ Perfect for personal use

### Pro Tier ($20/month)
- ✅ 1 GB storage
- ✅ 10M commands/month
- ✅ For production apps

**Your dashboard will work perfectly on the free tier!**

---

## 🔍 Monitoring

### Check Your Data in Vercel KV

1. Go to Vercel Dashboard
2. Click **Storage** → Your KV database
3. Click **Data Browser**
4. You'll see:
   - `dashboard:tasks` - Your tasks
   - `dashboard:leads` - Your leads

### View Logs

1. Go to **Deployments**
2. Click on a deployment
3. Click **Functions** tab
4. View logs for `/api/data/tasks` and `/api/data/leads`

---

## 🐛 Troubleshooting

### "Failed to read tasks" Error

**Solution:** Make sure Vercel KV is created and connected
1. Check Storage tab in Vercel
2. Verify environment variables are set
3. Redeploy the app

### Data Not Saving

**Solution:** Check function logs
1. Go to Deployments → Functions
2. Look for errors in `/api/data/tasks` or `/api/data/leads`
3. Verify KV environment variables

### Local Development Issues

**Solution:** Make sure `local-data/` folder exists
```bash
mkdir -p local-data
```

---

## 🔐 Security Notes

- ✅ KV data is encrypted at rest
- ✅ Only your app can access the data
- ✅ Environment variables are secure
- ✅ No public access to your data

---

## 📱 Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS setup instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

---

## ✅ Deployment Checklist

- [ ] Install `@vercel/kv` package
- [ ] Push code to GitHub
- [ ] Deploy to Vercel
- [ ] Create Vercel KV database
- [ ] Add environment variables
- [ ] Redeploy
- [ ] Test the app
- [ ] Migrate existing data (if any)
- [ ] Setup custom domain (optional)

---

## 🎉 You're Done!

Your Daily Work DashBoard is now live on Vercel with persistent storage!

**Questions?** Check Vercel docs: https://vercel.com/docs/storage/vercel-kv
