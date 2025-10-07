# 🚀 Push Notifications - Quick Start

## ✅ Setup Complete!

Aapka push notification system ready hai. Ab ye steps follow karo:

## 📋 Local Testing

1. **Dev server start karo:**
   ```bash
   npm run dev
   ```

2. **Browser me kholo:**
   ```
   http://localhost:3000
   ```

3. **Dashboard pe:**
   - "Enable Push Notifications" button click karo
   - Browser permission allow karo
   - "Test Notification" se test karo

## 🌐 Production Deployment (Vercel)

### Step 1: Vercel pe deploy karo
```bash
vercel
```

### Step 2: Environment Variables add karo

Vercel Dashboard me jao aur ye variables add karo:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEj6uv5SLD9YxBc2dZB2u5fPBhJ1xL7qTuv-VPgJP5jOiabLKSuxQTzgFJ62bSakDPz9yiuCgtZlAFqucg1vF56Q

VAPID_PRIVATE_KEY=MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgsP7KcjqW3X7gZOmUUO8v4lbj019Q4STxeInFoWWB0cmhRANCAASPq6_lIsP1jEFzZ1kHa7l88GEnXEvupO6_5U-Ak_mM6JpsspK7FBPOAUnrZtJqQM_P3KK4KC1mUAWq5yDW8Xnp

VAPID_EMAIL=mailto:viraj@taliyotech.com

NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

CRON_SECRET=apna-strong-secret-key-yaha-dalo
```

### Step 3: Redeploy
```bash
vercel --prod
```

## ⏰ Notification Time Change Karna

`vercel.json` file me schedule edit karo:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-reminder",
      "schedule": "30 3 * * *"  // 9:00 AM IST (3:30 AM UTC)
    }
  ]
}
```

**IST to UTC conversion:**
- 9:00 AM IST = 3:30 AM UTC → `30 3 * * *`
- 10:00 AM IST = 4:30 AM UTC → `30 4 * * *`
- 8:00 AM IST = 2:30 AM UTC → `30 2 * * *`

## 🎯 Features

✅ **Local Notifications** - App open hone pe
✅ **Push Notifications** - App band hone pe bhi
✅ **Daily Reminders** - Vercel Cron se automatic
✅ **PWA Support** - Install kar sakte ho
✅ **Test Button** - Instantly test kar sakte ho

## 📱 User Experience

1. User dashboard pe jata hai
2. "Enable Push Notifications" click karta hai
3. Browser permission allow karta hai
4. Daily set time pe notification aata hai
5. Notification click karne pe app khulta hai

## 🔍 Monitoring

**Vercel Dashboard me check karo:**
- Deployments > Functions > Logs
- Cron job execution dekh sakte ho
- Errors track kar sakte ho

**Manual test:**
```bash
curl -X GET https://your-app.vercel.app/api/cron/daily-reminder \
  -H "Authorization: Bearer your-cron-secret"
```

## 💡 Tips

- **HTTPS required** - Push notifications sirf HTTPS pe kaam karte hain
- **Service Worker** - Automatically register ho jayega
- **Browser Support** - Chrome, Firefox, Edge, Safari (iOS 16.4+)
- **Permissions** - User ko explicitly allow karna padega

## 🐛 Common Issues

**"Push notifications enable nahi ho paye"**
- Check: Service worker registered hai?
- Check: HTTPS enabled hai?
- Check: Browser notifications allowed hain?

**"Notifications nahi aa rahe"**
- Check: Vercel Cron enabled hai?
- Check: Environment variables set hain?
- Check: User ne push subscribe kiya hai?

---

**All set! 🎉** Deploy karo aur test karo!
