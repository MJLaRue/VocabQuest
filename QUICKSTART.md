# Quick Start - Deploy to Render in 5 Minutes

## Fastest Path to Production 🚀

### 1. Prepare Your Code (1 minute)

```bash
# Ensure all deployment files are committed
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Deploy via Render Blueprint (2 minutes)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select your repo (the one with `render.yaml`)
5. Click **"Apply"**

That's it! Render will:
- ✅ Create PostgreSQL database (1 GB, free for 90 days)
- ✅ Create web service (512 MB RAM, auto-sleeps after 15 min)
- ✅ Link database to app automatically
- ✅ Run migrations (`npm run migrate`)
- ✅ Deploy your app

### 3. Update Admin Credentials (1 minute)

After deployment completes:

1. Go to your web service → **Environment**
2. Update these variables:
   ```
   ADMIN_EMAIL=your-email@example.edu
   ADMIN_PASSWORD=YourSecurePassword123!
   ```
3. Click **"Save Changes"** (triggers re-deploy)

### 4. Access Your App (1 minute)

1. Copy your app URL: `https://hspt-vocab-app-xxxx.onrender.com`
2. First request takes 30-60 seconds (cold start)
3. Login with your admin credentials
4. Start using the app! 🎉

---

## Alternative: Manual Setup (10 minutes)

If Blueprint doesn't work or you prefer manual setup:

### Step 1: Create Database First

1. **Render Dashboard** → **"New +"** → **"PostgreSQL"**
2. Name: `hspt-vocab-db`
3. Plan: **Free**
4. Region: **Oregon**
5. Click **"Create Database"**
6. Copy **Internal Database URL**

### Step 2: Create Web Service

1. **Render Dashboard** → **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `hspt-vocab-app`
   - **Region**: Oregon (same as database)
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables

Add these in the Environment tab:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<paste internal database URL>
SESSION_SECRET=<generate random 32+ character string>
ADMIN_EMAIL=admin@example.edu
ADMIN_PASSWORD=Admin123!
```

**Generate SESSION_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Deploy

Click **"Create Web Service"** and wait for deployment to complete.

---

## Testing Your Deployment

### Health Check
```bash
curl https://your-app-url.onrender.com/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-..."}
```

### Login
1. Visit your app URL
2. Click "Login"
3. Use admin credentials
4. Should see flashcard interface

---

## Troubleshooting

### "Cannot connect to database"
- Wait 2-3 minutes for database to fully initialize
- Check DATABASE_URL is set correctly
- Verify database and web service are in same region

### "Application error" or 503
- Check Logs in Render dashboard
- Ensure all environment variables are set
- Verify `npm start` command works locally

### Cold starts (30-60 second delay)
- **Expected behavior** on free tier
- App spins down after 15 minutes of inactivity
- Use uptime monitoring service to keep warm (optional)

---

## Next Steps

✅ **Deployed!** Your app is live.

Now:
1. **Test thoroughly**: All features working?
2. **Monitor logs**: Check for errors in Render dashboard
3. **Set up monitoring**: Use UptimeRobot or similar (optional)
4. **Backup database**: Export data periodically
5. **Plan for 90-day renewal**: Render free Postgres expires after 90 days

---

## Need Help?

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- 🐛 [Troubleshooting Section](./DEPLOYMENT.md#-troubleshooting)
- 📚 [Render Documentation](https://render.com/docs)

---

**⚡ Pro Tip**: Bookmark your Render dashboard and app URL for quick access!
