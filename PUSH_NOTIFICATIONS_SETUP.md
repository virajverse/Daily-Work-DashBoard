# Push Notifications Setup Guide

## ✅ Setup Complete!

Aapke project me push notifications ab ready hain. Ye guaranteed notifications denge chahe app band ho.

## 🔧 Configuration

### 1. Environment Variables (.env.local)
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<already set>
VAPID_PRIVATE_KEY=<already set>
VAPID_EMAIL=mailto:viraj@taliyotech.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your-secret-key-change-this
```

### 2. Vercel Deployment

**Production me deploy karne ke baad:**

1. Vercel Dashboard me jao
2. Project Settings > Environment Variables
3. Ye variables add karo:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (apni production URL)
   - `CRON_SECRET` (strong random string)

4. Vercel Cron automatically `vercel.json` se configure ho jayega
   - Daily 9:00 AM UTC pe notification bhejega
   - Time change karne ke liye `vercel.json` edit karo

### 3. Cron Schedule Format

`vercel.json` me schedule change kar sakte ho:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-reminder",
      "schedule": "0 9 * * *"  // 9:00 AM UTC daily
    }
  ]
}
```

**Examples:**
- `0 9 * * *` - Daily 9:00 AM UTC (2:30 PM IST)
- `30 3 * * *` - Daily 3:30 AM UTC (9:00 AM IST)
- `0 */6 * * *` - Every 6 hours
- `0 9 * * 1-5` - Weekdays only at 9 AM

## 🚀 Usage

### User Side:
1. Dashboard pe "Enable Push Notifications" button click karo
2. Browser permission allow karo
3. Ab daily set time pe notification aayega (app band hone pe bhi)

### Testing:
1. "Test Notification" button se test karo
2. Manual notification bhejne ke liye:
   ```bash
   curl -X POST http://localhost:3000/api/push/send \
     -H "Content-Type: application/json" \
     -d '{"title":"Test","message":"Testing push"}'
   ```

### Cron Test (Local):
```bash
curl -X GET http://localhost:3000/api/cron/daily-reminder \
  -H "Authorization: Bearer your-secret-key-change-this"
```

## 📱 How It Works

1. **User subscribes** → Browser creates push subscription
2. **Subscription stored** → Server saves subscription endpoint
3. **Cron runs daily** → Vercel triggers `/api/cron/daily-reminder`
4. **Push sent** → Server sends notification to all subscribed users
5. **User receives** → Notification shows even if app is closed

## 🔒 Security Notes

- VAPID keys already generated aur secure hain
- Production me `CRON_SECRET` ko strong random string se replace karo
- Subscriptions currently in-memory hain (production me database use karo)

## 📊 Database Integration (Optional)

Production me subscriptions ko database me store karo:

```typescript
// Example with Prisma
model PushSubscription {
  id         String   @id @default(cuid())
  userId     String
  endpoint   String
  p256dh     String
  auth       String
  createdAt  DateTime @default(now())
}
```

## 🐛 Troubleshooting

**Notifications nahi aa rahe?**
1. Check browser permissions (Settings > Notifications)
2. Check service worker registered hai ya nahi (DevTools > Application > Service Workers)
3. Check Vercel Cron logs (Vercel Dashboard > Deployments > Functions)
4. Test manually: `/api/push/send` endpoint call karo

**Local testing:**
- Localhost pe push notifications limited hain
- Production URL pe deploy karke test karo
- Ya ngrok use karke HTTPS URL banao

## 📝 Next Steps

1. ✅ Push notifications setup complete
2. ⏳ Deploy to Vercel
3. ⏳ Test on production
4. ⏳ (Optional) Add database for subscriptions
5. ⏳ (Optional) Add user preferences (time selection per user)

---

**Questions?** Check Vercel Cron docs: https://vercel.com/docs/cron-jobs
