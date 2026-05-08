# Render Deployment Guide

**Project:** Barangay San Vicente Ticket Management System  
**Date:** May 8, 2026  
**Status:** 📋 **DEPLOYMENT GUIDE**

---

## Overview

This guide provides step-by-step instructions for deploying the Barangay San Vicente system to Render, including both frontend (React) and backend (Laravel) services.

---

## Prerequisites

- ✅ Render account (free tier available)
- ✅ GitHub repository with latest code
- ✅ PostgreSQL database (Render provides free tier)
- ✅ Google reCAPTCHA keys (site key and secret key)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Render Platform                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  Frontend (React) │────────▶│ Backend (Laravel)│     │
│  │  Static Site      │  API    │  Web Service     │     │
│  └──────────────────┘         └──────────────────┘     │
│                                        │                 │
│                                        ▼                 │
│                              ┌──────────────────┐       │
│                              │  PostgreSQL DB   │       │
│                              │  Database        │       │
│                              └──────────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Part 1: Backend Deployment (Laravel)

### Step 1: Create PostgreSQL Database

1. Go to Render Dashboard
2. Click **New** → **PostgreSQL**
3. Configure:
   - **Name:** `san-vicente-db`
   - **Database:** `san_vicente`
   - **User:** (auto-generated)
   - **Region:** Choose closest to your users
   - **Plan:** Free (or paid for production)
4. Click **Create Database**
5. **Save the connection details:**
   - Internal Database URL
   - External Database URL
   - Username
   - Password
   - Host
   - Port

### Step 2: Create Backend Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `san-vicente-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `LARAVEL-BACK-END`
   - **Runtime:** `Docker`
   - **Plan:** Free (or paid for production)

### Step 3: Set Backend Environment Variables

Go to **Environment** tab and add these variables:

#### Required Variables

```env
# Application
APP_NAME="San Vicente Barangay System"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://san-vicente-backend.onrender.com

# Database (from Step 1)
DB_CONNECTION=pgsql
DB_HOST=your-db-host.render.com
DB_PORT=5432
DB_DATABASE=san_vicente
DB_USERNAME=your-db-username
DB_PASSWORD=your-db-password

# Frontend URL (will be set after frontend deployment)
FRONTEND_URL=https://san-vicente-frontend.onrender.com

# Google reCAPTCHA
RECAPTCHA_SECRET_KEY=your-secret-key-here

# Session & Cache
SESSION_DRIVER=database
CACHE_DRIVER=database
QUEUE_CONNECTION=database

# Mail (optional - for notifications)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@sanvicente.gov.ph
MAIL_FROM_NAME="San Vicente Barangay"
```

#### Generate APP_KEY

Run locally:
```bash
cd LARAVEL-BACK-END
php artisan key:generate --show
```

Copy the output and use it for `APP_KEY`.

### Step 4: Deploy Backend

1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait for build to complete (5-10 minutes)
3. Check logs for errors
4. Once deployed, note the URL: `https://san-vicente-backend.onrender.com`

### Step 5: Run Database Migrations

1. Go to **Shell** tab in Render dashboard
2. Run:
```bash
php artisan migrate --force
php artisan db:seed --force
```

---

## Part 2: Frontend Deployment (React)

### Step 1: Create Static Site

1. Click **New** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `san-vicente-frontend`
   - **Region:** Same as backend
   - **Branch:** `main`
   - **Root Directory:** `REACT-FRONT-END`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

### Step 2: Set Frontend Environment Variables

Go to **Environment** tab and add these variables:

```env
# API URL - Point to your backend service
VITE_API_URL=https://san-vicente-backend.onrender.com/api/v1

# Google reCAPTCHA Site Key (Public - safe to expose)
VITE_RECAPTCHA_SITE_KEY=6Lfpzt8sAAAAACzA8SodKS3sKJjemeH5g33CKTHL

# WebSocket URL (optional - for real-time features)
VITE_WS_URL=wss://san-vicente-backend.onrender.com/ws

# Google Maps API Key (optional)
VITE_GOOGLE_MAPS_KEY=

# VAPID Public Key (optional - for push notifications)
VITE_VAPID_PUBLIC_KEY=
```

### Step 3: Deploy Frontend

1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait for build to complete (3-5 minutes)
3. Check logs for errors
4. Once deployed, note the URL: `https://san-vicente-frontend.onrender.com`

### Step 4: Update Backend FRONTEND_URL

1. Go back to backend service
2. Update `FRONTEND_URL` environment variable:
   ```env
   FRONTEND_URL=https://san-vicente-frontend.onrender.com
   ```
3. Save and redeploy backend

---

## Part 3: Configuration & Testing

### Step 1: Update CORS Configuration

Ensure backend allows requests from frontend:

**Backend: `LARAVEL-BACK-END/config/cors.php`**
```php
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:5173'),
],
```

### Step 2: Configure reCAPTCHA Domains

1. Go to https://www.google.com/recaptcha/admin
2. Select your site
3. Add domains:
   - `san-vicente-frontend.onrender.com`
   - `localhost` (for local testing)

### Step 3: Test Deployment

#### Test Backend
1. Visit: `https://san-vicente-backend.onrender.com/api/v1/health`
2. Should return: `{"status": "ok"}`

#### Test Frontend
1. Visit: `https://san-vicente-frontend.onrender.com`
2. Should load landing page
3. Test navigation
4. Test form submission

#### Test reCAPTCHA
1. Go to: `https://san-vicente-frontend.onrender.com/report`
2. Verify reCAPTCHA widget loads
3. Fill form and submit
4. Verify success page appears

---

## Part 4: Custom Domain (Optional)

### Step 1: Add Custom Domain to Frontend

1. Go to frontend service → **Settings** → **Custom Domains**
2. Click **Add Custom Domain**
3. Enter your domain: `www.sanvicente.gov.ph`
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

### Step 2: Add Custom Domain to Backend

1. Go to backend service → **Settings** → **Custom Domains**
2. Click **Add Custom Domain**
3. Enter your domain: `api.sanvicente.gov.ph`
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

### Step 3: Update Environment Variables

**Frontend:**
```env
VITE_API_URL=https://api.sanvicente.gov.ph/api/v1
```

**Backend:**
```env
APP_URL=https://api.sanvicente.gov.ph
FRONTEND_URL=https://www.sanvicente.gov.ph
```

---

## Troubleshooting

### Issue: Build Fails

**Check 1: Build Logs**
- Review build logs in Render dashboard
- Look for missing dependencies or syntax errors

**Check 2: Environment Variables**
- Ensure all required variables are set
- Check for typos in variable names

**Check 3: Build Command**
- Verify build command is correct
- For frontend: `npm install && npm run build`
- For backend: Docker builds automatically

### Issue: reCAPTCHA Not Loading

**Check 1: Environment Variable**
```bash
# In Render shell
echo $VITE_RECAPTCHA_SITE_KEY
```

**Check 2: Domain Whitelist**
- Ensure Render domain is in Google reCAPTCHA console

**Check 3: Browser Console**
- Check for JavaScript errors
- Verify reCAPTCHA script loads

### Issue: API Requests Fail

**Check 1: CORS Configuration**
- Verify `FRONTEND_URL` is set correctly in backend
- Check `config/cors.php` allows frontend domain

**Check 2: API URL**
- Verify `VITE_API_URL` points to correct backend URL
- Test backend health endpoint

**Check 3: Network Tab**
- Open browser DevTools → Network
- Check if requests reach backend
- Look for 404, 500, or CORS errors

### Issue: Database Connection Fails

**Check 1: Database Credentials**
- Verify all `DB_*` variables are correct
- Check database is running

**Check 2: Database Host**
- Use internal database URL for backend service
- Format: `postgres://user:pass@host:5432/dbname`

**Check 3: Migrations**
- Run migrations in Render shell:
  ```bash
  php artisan migrate --force
  ```

---

## Monitoring & Maintenance

### Health Checks

**Backend Health Endpoint:**
```
GET https://san-vicente-backend.onrender.com/api/v1/health
```

**Frontend Health:**
- Visit homepage
- Check console for errors

### Logs

**View Logs:**
1. Go to service in Render dashboard
2. Click **Logs** tab
3. Monitor for errors

**Log Levels:**
- `INFO` - Normal operations
- `WARNING` - Potential issues
- `ERROR` - Critical errors

### Performance

**Monitor Metrics:**
- Response times
- Error rates
- Database queries
- Memory usage

**Optimize:**
- Enable caching
- Optimize database queries
- Use CDN for static assets

---

## Security Checklist

### Backend Security

- ✅ `APP_DEBUG=false` in production
- ✅ Strong `APP_KEY` generated
- ✅ Database credentials secure
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ HTTPS enforced

### Frontend Security

- ✅ Environment variables set
- ✅ No secrets in code
- ✅ HTTPS enforced
- ✅ CSP headers configured
- ✅ XSS protection enabled

### Database Security

- ✅ Strong password
- ✅ Internal connections only
- ✅ Regular backups
- ✅ Encryption at rest

---

## Backup & Recovery

### Database Backups

**Automatic Backups:**
- Render provides automatic daily backups (paid plans)

**Manual Backup:**
```bash
# In Render shell
pg_dump $DATABASE_URL > backup.sql
```

**Restore Backup:**
```bash
psql $DATABASE_URL < backup.sql
```

### Code Backups

- ✅ Code is in GitHub (version controlled)
- ✅ Render deploys from GitHub
- ✅ Can rollback to previous commits

---

## Cost Estimation

### Free Tier (Development)

| Service | Plan | Cost |
|---------|------|------|
| Frontend | Static Site | $0/month |
| Backend | Web Service | $0/month (750 hours) |
| Database | PostgreSQL | $0/month (90 days) |
| **Total** | | **$0/month** |

### Paid Tier (Production)

| Service | Plan | Cost |
|---------|------|------|
| Frontend | Static Site | $0/month |
| Backend | Starter | $7/month |
| Database | Starter | $7/month |
| **Total** | | **$14/month** |

---

## Support

### Render Support
- Documentation: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### Project Support
- GitHub Issues: [Your Repository]
- Email: support@sanvicente.gov.ph

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Render
3. ✅ Configure environment variables
4. ✅ Test all functionality
5. ✅ Set up custom domain (optional)
6. ✅ Configure monitoring
7. ✅ Set up backups
8. ✅ Train users

---

**Deployment Status:** 📋 **READY TO DEPLOY**  
**Estimated Time:** 30-60 minutes  
**Difficulty:** Medium

---

**Last Updated:** May 8, 2026  
**Version:** 1.0  
**Maintainer:** Development Team

