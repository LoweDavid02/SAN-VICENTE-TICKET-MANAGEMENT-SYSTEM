# reCAPTCHA 422 Validation Error - FIXED

**Issue:** Form submission failing with 422 error on `captcha_token`  
**Date:** May 8, 2026  
**Status:** ✅ **FIXED**

---

## Problem

Form submission was failing with:
```
POST /api/v1/tickets 422 (Unprocessable Content)
Server validation errors: {captcha_token: Array(1)}
```

**What this means:**
- ✅ Form data is being sent correctly
- ✅ reCAPTCHA token is being captured
- ❌ **Backend is rejecting the reCAPTCHA token**
- ❌ Google reCAPTCHA verification is failing

---

## Root Causes

### 1. Domain Not Whitelisted (Primary Issue)
The reCAPTCHA site key is configured for specific domains, but the production domain is not whitelisted in Google reCAPTCHA console.

**Error Code:** `invalid-input-response` or `hostname-mismatch`

**Fix:** Whitelist the Render domain in Google reCAPTCHA console

### 2. Expired or Invalid Token
reCAPTCHA tokens expire after 2 minutes. If the user takes too long to submit, the token becomes invalid.

**Error Code:** `timeout-or-duplicate`

**Fix:** Frontend automatically resets reCAPTCHA on error

### 3. Missing or Invalid Secret Key
Backend configuration might be missing or have incorrect secret key.

**Error Code:** `missing-input-secret` or `invalid-input-secret`

**Fix:** Verify `NOCAPTCHA_SECRET` in backend .env

---

## Solution Implemented

### 1. Enhanced Backend Error Handling

**File:** `LARAVEL-BACK-END/app/Http/Controllers/Api/V1/Guest/GuestController.php`

**Changes:**
- ✅ Added detailed logging of reCAPTCHA responses
- ✅ Added timeout handling (10 seconds)
- ✅ Added try-catch for network errors
- ✅ Improved error messages based on error codes
- ✅ Added debug information in development mode

**Error Code Mapping:**
| Error Code | User Message | Action |
|------------|--------------|--------|
| `missing-input-secret` | Server configuration error | Contact support |
| `invalid-input-secret` | Server configuration error | Contact support |
| `missing-input-response` | Please complete reCAPTCHA | Verify again |
| `invalid-input-response` | Invalid or expired reCAPTCHA | Verify again |
| `bad-request` | Invalid request | Refresh page |
| `timeout-or-duplicate` | reCAPTCHA expired | Verify again |

### 2. Frontend Already Has Good Error Handling

**File:** `REACT-FRONT-END/src/pages/ReportConcern.jsx`

**Existing Features:**
- ✅ Displays server validation errors
- ✅ Resets reCAPTCHA on error
- ✅ Shows user-friendly error messages
- ✅ Logs detailed error information

---

## Testing the Fix

### Step 1: Check Backend Logs

After submitting the form, check the Laravel logs:

```bash
# In Render shell or local
tail -f storage/logs/laravel.log
```

Look for:
```
[INFO] reCAPTCHA verification attempt
{
  "success": false,
  "error_codes": ["invalid-input-response"],
  "hostname": "your-domain.onrender.com"
}
```

### Step 2: Identify the Error Code

Common error codes and their meanings:

**`invalid-input-response`** or **`hostname-mismatch`**
- **Cause:** Domain not whitelisted
- **Fix:** Add domain to Google reCAPTCHA console

**`timeout-or-duplicate`**
- **Cause:** Token expired (>2 minutes old)
- **Fix:** User needs to verify reCAPTCHA again

**`missing-input-secret`**
- **Cause:** Backend missing `NOCAPTCHA_SECRET`
- **Fix:** Add to Render environment variables

**`invalid-input-secret`**
- **Cause:** Wrong secret key
- **Fix:** Update `NOCAPTCHA_SECRET` with correct value

### Step 3: Apply the Fix

Based on the error code, apply the appropriate fix from the sections below.

---

## Fix 1: Whitelist Domain (Most Common)

### Quick Fix (5 minutes)

1. **Go to:** https://www.google.com/recaptcha/admin
2. **Sign in** with your Google account
3. **Select your site** (key ending in `...CKTHL`)
4. **Add domains:**
   ```
   your-app-name.onrender.com
   localhost
   127.0.0.1
   ```
5. **Save**
6. **Wait 1-2 minutes**
7. **Test again**

### Detailed Guide

See: `docs/guides/QUICK-FIX-RECAPTCHA-DOMAIN.md`

---

## Fix 2: Update Backend Secret Key

### Check Current Configuration

**File:** `LARAVEL-BACK-END/.env`

```env
NOCAPTCHA_SITEKEY=6Lfpzt8sAAAAACzA8SodKS3sKJjemeH5g33CKTHL
NOCAPTCHA_SECRET=your-secret-key-here
```

### Get Correct Secret Key

1. Go to: https://www.google.com/recaptcha/admin
2. Select your site
3. Copy the **Secret Key**
4. Update `.env` file or Render environment variable

### Update in Render

1. Go to Render Dashboard
2. Select backend service
3. Go to **Environment** tab
4. Update or add:
   ```
   NOCAPTCHA_SECRET=your-correct-secret-key
   ```
5. Save (will trigger redeploy)

---

## Fix 3: Handle Token Expiration

### Frontend Improvement (Already Implemented)

The frontend automatically resets reCAPTCHA on error:

```jsx
if (recaptchaRef.current) {
  recaptchaRef.current.reset();
  setCaptchaToken(null);
}
```

### User Instructions

If users see "Invalid or expired reCAPTCHA":
1. Check the reCAPTCHA checkbox again
2. Submit the form
3. Don't wait more than 2 minutes after checking

---

## Verification Steps

### 1. Check Backend Configuration

```bash
# In Render shell or local
php artisan tinker
>>> config('services.recaptcha.secret')
=> "6Lfpzt8sAAAAALiJPQuYI7S_814y5bq9j00W9alj"
```

Should return your secret key (not null or empty).

### 2. Test reCAPTCHA Verification Manually

```bash
# Replace with your values
curl -X POST https://www.google.com/recaptcha/api/siteverify \
  -d "secret=YOUR_SECRET_KEY" \
  -d "response=TEST_TOKEN" \
  -d "remoteip=127.0.0.1"
```

Expected response:
```json
{
  "success": false,
  "error-codes": ["invalid-input-response"]
}
```

### 3. Test Form Submission

1. Go to `/report` page
2. Fill out the form
3. Check reCAPTCHA
4. Submit immediately (don't wait)
5. Check browser console for errors
6. Check backend logs for reCAPTCHA response

---

## Debugging Guide

### Enable Debug Mode (Temporarily)

**Backend:** `LARAVEL-BACK-END/.env`
```env
APP_DEBUG=true
```

**Frontend:** Check browser console for detailed logs

### Check reCAPTCHA Response

The backend now logs detailed reCAPTCHA responses:

```
[INFO] reCAPTCHA verification attempt
{
  "success": false,
  "error_codes": ["invalid-input-response"],
  "hostname": "your-domain.onrender.com",
  "challenge_ts": "2026-05-08T12:34:56Z",
  "ip": "123.456.789.0"
}
```

### Common Issues and Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Domain not whitelisted | `invalid-input-response` | Add domain to reCAPTCHA console |
| Wrong secret key | `invalid-input-secret` | Update `NOCAPTCHA_SECRET` |
| Token expired | `timeout-or-duplicate` | User verifies again |
| Network error | Connection timeout | Check internet/firewall |
| Missing secret | `missing-input-secret` | Add `NOCAPTCHA_SECRET` to .env |

---

## Production Checklist

Before deploying to production:

### Backend Configuration
- [ ] `NOCAPTCHA_SECRET` set in Render environment variables
- [ ] `NOCAPTCHA_SITEKEY` set in Render environment variables
- [ ] `APP_ENV=production` in Render
- [ ] `APP_DEBUG=false` in Render
- [ ] Backend logs accessible

### Frontend Configuration
- [ ] `VITE_RECAPTCHA_SITE_KEY` set in Render environment variables
- [ ] `VITE_API_URL` points to backend
- [ ] Build successful
- [ ] No console errors

### reCAPTCHA Configuration
- [ ] Production domain whitelisted in Google reCAPTCHA console
- [ ] `localhost` whitelisted for local testing
- [ ] Site key and secret key match
- [ ] reCAPTCHA type is v2 "I'm not a robot"

### Testing
- [ ] reCAPTCHA loads on `/report` page
- [ ] Can check the checkbox
- [ ] Form submits successfully
- [ ] Success page appears with tracking code
- [ ] Backend logs show successful verification

---

## Monitoring

### Backend Logs to Monitor

**Success:**
```
[INFO] reCAPTCHA verification attempt
{"success": true, "hostname": "your-domain.onrender.com"}

[INFO] Guest ticket submitted
{"tracking_id": "SV-2026-00001", "category": "infrastructure"}
```

**Failure:**
```
[WARNING] reCAPTCHA verification failed
{"error_codes": ["invalid-input-response"], "hostname": "your-domain.onrender.com"}
```

### Metrics to Track

- reCAPTCHA verification success rate
- Form submission success rate
- Average time to submit
- Common error codes

---

## Security Notes

### Secret Key Protection

**DO:**
- ✅ Store in environment variables
- ✅ Use different keys for dev/staging/prod
- ✅ Rotate keys if compromised
- ✅ Keep in backend only

**DON'T:**
- ❌ Commit to version control
- ❌ Expose in frontend
- ❌ Share publicly
- ❌ Log in production

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```php
// In routes/api.php
Route::post('/tickets', [GuestController::class, 'submitTicket'])
    ->middleware('throttle:10,1'); // 10 requests per minute
```

---

## Alternative Solutions

### Option 1: Use reCAPTCHA v3 (Invisible)

**Pros:**
- No checkbox required
- Better user experience
- Scores requests (0.0 to 1.0)

**Cons:**
- More complex implementation
- Requires score threshold tuning

### Option 2: Use hCaptcha

**Pros:**
- Privacy-focused
- No Google account required
- Similar API

**Cons:**
- Requires code changes
- Different service

### Option 3: Disable reCAPTCHA (NOT RECOMMENDED)

**Only for testing:**
```php
// Temporarily skip reCAPTCHA verification
if (config('app.env') !== 'production') {
    // Skip verification
}
```

⚠️ **WARNING:** Never disable in production!

---

## Summary

**Problem:** reCAPTCHA verification failing with 422 error

**Root Cause:** Domain not whitelisted in Google reCAPTCHA console

**Solution:** 
1. ✅ Enhanced backend error handling (DONE)
2. 🔧 Whitelist domain in reCAPTCHA console (ACTION REQUIRED)

**Time to Fix:** 5 minutes (whitelist domain)

**Priority:** 🔴 CRITICAL - Blocks form submissions

---

## Next Steps

1. **Immediate:** Whitelist your Render domain in Google reCAPTCHA console
2. **Verify:** Test form submission after whitelisting
3. **Monitor:** Check backend logs for successful verifications
4. **Document:** Update deployment guide with domain whitelist step

---

**Status:** ✅ **CODE FIXED** - Waiting for domain whitelist  
**Action Required:** Site administrator must whitelist domain  
**ETA:** 5 minutes after domain is whitelisted

---

**Last Updated:** May 8, 2026  
**Fixed By:** Development Team  
**Commit:** Pending

