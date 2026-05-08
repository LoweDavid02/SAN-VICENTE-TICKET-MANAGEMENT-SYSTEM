# reCAPTCHA Domain Whitelist Fix

**Issue:** "ERROR for site owner: Invalid domain for site key"  
**Date:** May 8, 2026  
**Status:** 🔧 **ACTION REQUIRED**

---

## Problem

The reCAPTCHA widget is showing:

```
ERROR for site owner:
Invalid domain for site key
```

**What this means:**
- ✅ reCAPTCHA site key is loading correctly
- ✅ Code implementation is correct
- ❌ **Your Render domain is NOT whitelisted** in Google reCAPTCHA console
- ❌ reCAPTCHA only works on pre-approved domains

---

## Root Cause

Google reCAPTCHA v2 requires you to whitelist all domains where the reCAPTCHA will be used. Your current site key is configured for specific domains (likely `localhost`), but your Render production domain is not in the whitelist.

---

## Solution Options

### Option 1: Add Render Domain to Existing Site Key (RECOMMENDED)

This is the quickest fix if you want to keep using the same site key.

#### Step 1: Go to Google reCAPTCHA Admin Console
1. Visit: https://www.google.com/recaptcha/admin
2. Sign in with your Google account
3. Find your site (the one with key `6Lfpzt8sAAAAACzA8SodKS3sKJjemeH5g33CKTHL`)

#### Step 2: Add Your Render Domain
1. Click on your site name
2. Go to **Settings** → **Domains**
3. Add your Render domains:
   ```
   your-app-name.onrender.com
   localhost
   127.0.0.1
   ```
4. Click **Save**

#### Step 3: Test
1. Wait 1-2 minutes for changes to propagate
2. Refresh your Render deployment page
3. Try the reCAPTCHA again

---

### Option 2: Create New Site Key for Production

If you want separate keys for development and production:

#### Step 1: Create New reCAPTCHA Site
1. Go to: https://www.google.com/recaptcha/admin/create
2. Fill in:
   - **Label:** San Vicente Production
   - **reCAPTCHA type:** reCAPTCHA v2 → "I'm not a robot" Checkbox
   - **Domains:** 
     ```
     your-app-name.onrender.com
     ```
3. Accept terms and click **Submit**

#### Step 2: Get New Keys
You'll receive:
- **Site Key** (public) - for frontend
- **Secret Key** (private) - for backend

#### Step 3: Update Render Environment Variables

**Frontend Service:**
```env
VITE_RECAPTCHA_SITE_KEY=your-new-site-key-here
```

**Backend Service:**
```env
RECAPTCHA_SECRET_KEY=your-new-secret-key-here
```

#### Step 4: Update Code (Optional)

If you want to remove the fallback and use only environment variables:

**File:** `REACT-FRONT-END/src/pages/ReportConcern.jsx`

```jsx
<ReCAPTCHA
  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
/>
```

Then commit and push:
```bash
git add REACT-FRONT-END/src/pages/ReportConcern.jsx
git commit -m "fix: Use environment variable for reCAPTCHA site key"
git push origin main
```

---

### Option 3: Use Universal Key (NOT RECOMMENDED)

Google reCAPTCHA allows creating keys that work on all domains, but this is less secure.

**Why not recommended:**
- ❌ Less secure
- ❌ Can be abused
- ❌ Not suitable for production

---

## Quick Fix Guide

### For Immediate Fix (5 minutes)

1. **Go to reCAPTCHA Admin Console**
   - URL: https://www.google.com/recaptcha/admin
   - Sign in with Google account

2. **Find Your Site**
   - Look for the site with key ending in `...CKTHL`
   - Or create a new site if you can't find it

3. **Add Render Domain**
   - Click on site name
   - Go to Settings → Domains
   - Add: `your-app-name.onrender.com`
   - Add: `localhost` (for local testing)
   - Click Save

4. **Wait & Test**
   - Wait 1-2 minutes
   - Refresh your Render page
   - Test reCAPTCHA

---

## Finding Your Render Domain

### Method 1: From Render Dashboard
1. Go to Render Dashboard
2. Click on your frontend service
3. Look for the URL at the top
4. Example: `https://san-vicente-frontend.onrender.com`
5. Domain to whitelist: `san-vicente-frontend.onrender.com`

### Method 2: From Browser
1. Open your deployed app
2. Look at the URL in the address bar
3. Copy the domain (without `https://`)

---

## Verification Steps

### 1. Check Domain Whitelist
In Google reCAPTCHA console:
- ✅ Your Render domain should be listed
- ✅ `localhost` should be listed (for local testing)

### 2. Test reCAPTCHA Loading
1. Open your Render deployment
2. Navigate to `/report` page
3. Check reCAPTCHA widget:
   - ✅ Should show checkbox
   - ❌ Should NOT show error message

### 3. Test Form Submission
1. Fill out the form
2. Check the reCAPTCHA checkbox
3. Click Submit
4. Verify success page appears

---

## Troubleshooting

### Issue: Still Showing "Invalid domain" Error

**Check 1: Domain Spelling**
- Ensure domain is spelled correctly
- No `https://` prefix
- No trailing slash
- Example: `my-app.onrender.com` ✅
- Example: `https://my-app.onrender.com/` ❌

**Check 2: Wait Time**
- Changes can take 1-2 minutes to propagate
- Try clearing browser cache
- Try in incognito/private window

**Check 3: Correct Site Key**
- Verify you're editing the correct site in reCAPTCHA console
- Check the site key matches the one in your code

### Issue: reCAPTCHA Works Locally But Not in Production

**Cause:** Different domains

**Fix:** Add both domains to whitelist:
```
localhost
127.0.0.1
your-app.onrender.com
```

### Issue: Can't Find reCAPTCHA Site in Console

**Option 1: Create New Site**
- Follow "Option 2" above to create new site key

**Option 2: Check Google Account**
- Ensure you're signed in with the correct Google account
- The site might be under a different account

---

## Security Best Practices

### Domain Whitelist
- ✅ **DO** whitelist only domains you control
- ✅ **DO** include `localhost` for local development
- ❌ **DON'T** use wildcard domains in production
- ❌ **DON'T** whitelist untrusted domains

### Key Management
- ✅ **DO** use environment variables for keys
- ✅ **DO** use different keys for dev/staging/prod
- ❌ **DON'T** commit secret keys to version control
- ❌ **DON'T** share secret keys publicly

### Monitoring
- ✅ **DO** monitor reCAPTCHA usage in console
- ✅ **DO** check for suspicious activity
- ✅ **DO** rotate keys if compromised

---

## Alternative: Use Different reCAPTCHA Version

If you continue having issues, consider:

### reCAPTCHA v3 (Invisible)
- No checkbox required
- Better user experience
- Scores requests (0.0 to 1.0)
- More complex implementation

### hCaptcha (Alternative)
- Similar to reCAPTCHA
- Privacy-focused
- No Google account required
- Easy migration

---

## Step-by-Step Visual Guide

### 1. Access reCAPTCHA Admin Console

```
┌─────────────────────────────────────────┐
│  Google reCAPTCHA Admin Console         │
│  https://www.google.com/recaptcha/admin │
└─────────────────────────────────────────┘
```

### 2. Select Your Site

```
┌─────────────────────────────────────────┐
│  My Sites                                │
├─────────────────────────────────────────┤
│  ▶ San Vicente Barangay System          │
│    Site key: 6Lfpzt8s...CKTHL           │
│    Type: reCAPTCHA v2                    │
└─────────────────────────────────────────┘
```

### 3. Add Domain

```
┌─────────────────────────────────────────┐
│  Settings                                │
├─────────────────────────────────────────┤
│  Domains:                                │
│  ┌─────────────────────────────────┐   │
│  │ localhost                        │   │
│  │ your-app.onrender.com           │   │
│  │ [Add new domain]                │   │
│  └─────────────────────────────────┘   │
│                                          │
│  [Save]                                  │
└─────────────────────────────────────────┘
```

---

## Expected Result

### Before Fix
```
┌─────────────────────────────────────────┐
│  ⚠️ ERROR for site owner:               │
│  Invalid domain for site key             │
│                                          │
│  reCAPTCHA error. Please refresh and    │
│  try again.                              │
└─────────────────────────────────────────┘
```

### After Fix
```
┌─────────────────────────────────────────┐
│  ☐ I'm not a robot                      │
│                                          │
│  [reCAPTCHA logo]                        │
└─────────────────────────────────────────┘
```

---

## Testing Checklist

After adding domain to whitelist:

- [ ] Wait 1-2 minutes for changes to propagate
- [ ] Clear browser cache
- [ ] Refresh deployment page
- [ ] Navigate to `/report` page
- [ ] Verify reCAPTCHA checkbox appears
- [ ] Verify no error message
- [ ] Check the checkbox
- [ ] Fill out form
- [ ] Submit form
- [ ] Verify success page appears

---

## Support

### If You Need Help

1. **Check reCAPTCHA Documentation**
   - https://developers.google.com/recaptcha/docs/domain_validation

2. **Check Render Domain**
   - Verify exact domain name from Render dashboard

3. **Try Incognito Mode**
   - Rules out browser cache issues

4. **Check Browser Console**
   - Look for additional error messages

---

## Summary

**Problem:** reCAPTCHA domain not whitelisted  
**Solution:** Add Render domain to Google reCAPTCHA console  
**Time Required:** 5 minutes  
**Difficulty:** Easy

**Steps:**
1. Go to https://www.google.com/recaptcha/admin
2. Select your site
3. Add your Render domain to whitelist
4. Save and wait 1-2 minutes
5. Test

---

**Status:** 🔧 **ACTION REQUIRED**  
**Priority:** 🔴 **CRITICAL** - Blocks form submissions  
**Owner:** Site Administrator  
**ETA:** 5 minutes after domain is whitelisted

---

**Last Updated:** May 8, 2026  
**Issue:** Invalid domain for site key  
**Fix:** Whitelist Render domain in reCAPTCHA console

