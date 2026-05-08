# Production reCAPTCHA Fix - Render Deployment

**Issue:** reCAPTCHA failing in production with "Missing required parameters: sitekey"  
**Date:** May 8, 2026  
**Status:** 🔧 **FIXING**

---

## Problem Analysis

### Error Message
```
Error: Missing required parameters: sitekey
    at ks.<anonymous> (recaptcha__en.js:169:172)
```

### Root Cause
The reCAPTCHA component is trying to use `import.meta.env.VITE_RECAPTCHA_SITE_KEY` but this environment variable is:
1. ✅ Defined in local `.env` file
2. ❌ **NOT** set in Render environment variables
3. ❌ **NOT** available during production build

### Current Configuration
**Local .env file:**
```env
VITE_RECAPTCHA_SITE_KEY=6Lfpzt8sAAAAACzA8SodKS3sKJjemeH5g33CKTHL
```

**Component usage:**
```jsx
<ReCAPTCHA
  ref={recaptchaRef}
  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
  onChange={(token) => setCaptchaToken(token)}
/>
```

---

## Solution

### Option 1: Set Environment Variable in Render (RECOMMENDED)

#### Step 1: Add Environment Variable in Render Dashboard

1. Go to your Render dashboard
2. Select your frontend service (React app)
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key:** `VITE_RECAPTCHA_SITE_KEY`
   - **Value:** `6Lfpzt8sAAAAACzA8SodKS3sKJjemeH5g33CKTHL`
6. Click **Save Changes**
7. Render will automatically redeploy

#### Step 2: Verify Build
After redeployment, check the build logs to ensure the environment variable is available.

---

### Option 2: Add Fallback in Code (TEMPORARY FIX)

If you need an immediate fix while waiting for Render configuration:

**Update ReportConcern.jsx:**
```jsx
<ReCAPTCHA
  ref={recaptchaRef}
  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6Lfpzt8sAAAAACzA8SodKS3sKJjemeH5g33CKTHL'}
  onChange={(token) => setCaptchaToken(token)}
/>
```

⚠️ **WARNING:** This exposes the site key in the bundle. While site keys are meant to be public, it's better to use environment variables.

---

### Option 3: Create Production .env File

Create `.env.production` file:

```env
# Production Environment Variables
VITE_API_URL=/api/v1
VITE_RECAPTCHA_SITE_KEY=6Lfpzt8sAAAAACzA8SodKS3sKJjemeH5g33CKTHL
```

Then ensure this file is included in your repository (but **NEVER** include secret keys).

---

## Render Configuration Checklist

### Frontend Service Environment Variables

| Variable | Value | Required | Status |
|----------|-------|----------|--------|
| `VITE_API_URL` | `/api/v1` or full backend URL | ✅ Yes | ❌ Check |
| `VITE_RECAPTCHA_SITE_KEY` | `6Lfpzt8sAAAAACzA8SodKS3sKJjemeH5g33CKTHL` | ✅ Yes | ❌ Missing |
| `VITE_WS_URL` | WebSocket URL | ⚠️ Optional | ❌ Check |

### Backend Service Environment Variables

| Variable | Value | Required | Status |
|----------|-------|----------|--------|
| `RECAPTCHA_SECRET_KEY` | Secret key from Google | ✅ Yes | ❌ Check |
| `APP_URL` | Frontend URL | ✅ Yes | ❌ Check |
| `DB_*` | Database credentials | ✅ Yes | ❌ Check |

---

## Testing After Fix

### 1. Check Environment Variable
```bash
# In Render shell or build logs
echo $VITE_RECAPTCHA_SITE_KEY
```

### 2. Test reCAPTCHA Loading
1. Open browser console
2. Navigate to `/report`
3. Check for errors
4. Verify reCAPTCHA widget loads

### 3. Test Form Submission
1. Fill out the form
2. Complete reCAPTCHA
3. Submit
4. Verify success page appears

---

## Additional Checks

### 1. CORS Configuration
Ensure backend allows requests from frontend domain:

**Laravel `config/cors.php`:**
```php
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:5173'),
    'https://your-frontend.onrender.com', // Add your Render URL
],
```

### 2. API URL Configuration
Ensure frontend knows where to send API requests:

**Option A: Relative URL (if same domain)**
```env
VITE_API_URL=/api/v1
```

**Option B: Absolute URL (if different domain)**
```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

### 3. reCAPTCHA Domain Whitelist
Ensure your Render domain is whitelisted in Google reCAPTCHA console:

1. Go to https://www.google.com/recaptcha/admin
2. Select your site
3. Add your Render domain to **Domains** list:
   - `your-app.onrender.com`
   - `localhost` (for local testing)

---

## Deployment Steps

### 1. Set Environment Variables in Render
```
VITE_RECAPTCHA_SITE_KEY=6Lfpzt8sAAAAACzA8SodKS3sKJjemeH5g33CKTHL
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

### 2. Trigger Redeploy
- Render will automatically redeploy when you save environment variables
- Or manually trigger: **Manual Deploy** → **Deploy latest commit**

### 3. Monitor Build Logs
Watch for:
- ✅ Environment variables loaded
- ✅ Build successful
- ✅ No errors

### 4. Test Production
1. Visit your Render URL
2. Navigate to `/report`
3. Verify reCAPTCHA loads
4. Test form submission

---

## Troubleshooting

### Issue: reCAPTCHA Still Not Loading

**Check 1: Environment Variable Set Correctly**
```bash
# In Render shell
env | grep VITE_RECAPTCHA_SITE_KEY
```

**Check 2: Build Includes Environment Variable**
- Environment variables must be set **before** build
- Render rebuilds automatically when you add env vars

**Check 3: Domain Whitelisted**
- Check Google reCAPTCHA console
- Ensure Render domain is in allowed domains list

### Issue: reCAPTCHA Loads But Verification Fails

**Check 1: Backend Secret Key**
```env
# In backend .env
RECAPTCHA_SECRET_KEY=your-secret-key-here
```

**Check 2: Backend Verification Code**
Ensure `GuestController.php` verifies the token correctly.

**Check 3: Network Requests**
- Open browser DevTools → Network tab
- Check if `/api/v1/tickets` request succeeds
- Look for 422 validation errors

### Issue: CORS Errors

**Check 1: Backend CORS Configuration**
```php
// config/cors.php
'allowed_origins' => [
    'https://your-frontend.onrender.com',
],
```

**Check 2: Backend .env**
```env
FRONTEND_URL=https://your-frontend.onrender.com
```

---

## Security Notes

### Public vs Secret Keys

**Site Key (Public):**
- ✅ Safe to expose in frontend code
- ✅ Can be in environment variables
- ✅ Can be in version control
- Used by: Frontend (React)

**Secret Key (Private):**
- ❌ NEVER expose in frontend
- ❌ NEVER commit to version control
- ❌ NEVER log or display
- Used by: Backend (Laravel)

### Environment Variable Best Practices

1. **Frontend (.env):**
   - Only public configuration
   - Prefixed with `VITE_`
   - Included in build

2. **Backend (.env):**
   - Secret keys and credentials
   - Database passwords
   - API secret keys
   - **NEVER** commit to version control

---

## Quick Fix Commands

### For Immediate Fix (Temporary)
```bash
# Add fallback in code
# Edit REACT-FRONT-END/src/pages/ReportConcern.jsx
# Line 1032: Add fallback value
sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6Lfpzt8sAAAAACzA8SodKS3sKJjemeH5g33CKTHL'}

# Commit and push
git add REACT-FRONT-END/src/pages/ReportConcern.jsx
git commit -m "fix: Add fallback for reCAPTCHA site key in production"
git push origin main
```

### For Proper Fix (Recommended)
1. Go to Render Dashboard
2. Add environment variable: `VITE_RECAPTCHA_SITE_KEY`
3. Wait for automatic redeploy
4. Test production site

---

## Success Criteria

- ✅ reCAPTCHA widget loads on `/report` page
- ✅ No console errors about missing sitekey
- ✅ Form submission works
- ✅ Success page displays with reference code
- ✅ Backend receives and validates CAPTCHA token

---

**Status:** 🔧 **AWAITING RENDER CONFIGURATION**  
**Next Step:** Set environment variable in Render dashboard  
**ETA:** 5 minutes after configuration

---

**Last Updated:** May 8, 2026  
**Priority:** 🔴 **CRITICAL** - Blocks production form submissions

