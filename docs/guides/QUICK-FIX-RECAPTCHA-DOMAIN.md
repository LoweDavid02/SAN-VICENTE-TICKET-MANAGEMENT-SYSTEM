# Quick Fix: reCAPTCHA Domain Error

**Error:** "Invalid domain for site key"  
**Time to Fix:** 5 minutes  
**Difficulty:** ⭐ Easy

---

## What You Need

1. ✅ Google account (the one that created the reCAPTCHA site)
2. ✅ Your Render deployment URL
3. ✅ 5 minutes

---

## Step-by-Step Fix

### Step 1: Get Your Render Domain (1 minute)

1. Open your Render dashboard
2. Click on your frontend service
3. Copy the URL (example: `https://san-vicente-frontend.onrender.com`)
4. **Write down the domain part only:** `san-vicente-frontend.onrender.com`

---

### Step 2: Open reCAPTCHA Console (1 minute)

1. Go to: **https://www.google.com/recaptcha/admin**
2. Sign in with your Google account
3. You should see a list of your reCAPTCHA sites

---

### Step 3: Find Your Site (1 minute)

Look for the site with:
- **Site key ending in:** `...CKTHL`
- **Or label:** "San Vicente" or similar

**Can't find it?**
- Check if you're signed in with the correct Google account
- If you can't find it, skip to "Create New Site" section below

---

### Step 4: Add Your Domain (2 minutes)

1. Click on your site name
2. Look for **"Domains"** section
3. You should see a text box or list
4. Add these domains (one per line):
   ```
   your-app-name.onrender.com
   localhost
   ```
5. Click **"Save"** or **"Submit"**

---

### Step 5: Test (1 minute)

1. Wait **1-2 minutes** for changes to take effect
2. Go back to your Render deployment
3. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
4. Navigate to the `/report` page
5. The reCAPTCHA should now work! ✅

---

## Visual Guide

### What You'll See in reCAPTCHA Console

```
┌──────────────────────────────────────────────┐
│  reCAPTCHA Admin Console                     │
├──────────────────────────────────────────────┤
│                                               │
│  My Sites:                                    │
│  ┌────────────────────────────────────────┐ │
│  │ San Vicente Barangay System            │ │
│  │ Site key: 6Lfpzt8s...CKTHL             │ │
│  │ Type: reCAPTCHA v2                      │ │
│  │                                         │ │
│  │ Domains:                                │ │
│  │ ┌─────────────────────────────────┐   │ │
│  │ │ localhost                        │   │ │
│  │ │ your-app.onrender.com           │   │ │
│  │ └─────────────────────────────────┘   │ │
│  │                                         │ │
│  │ [Save]                                  │ │
│  └────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

## Can't Find Your Site? Create a New One

### Step 1: Create New reCAPTCHA Site

1. Go to: https://www.google.com/recaptcha/admin/create
2. Fill in:
   - **Label:** `San Vicente Production`
   - **reCAPTCHA type:** Select **"reCAPTCHA v2"**
   - **Sub-type:** Select **"I'm not a robot" Checkbox**
   - **Domains:** Add your Render domain
     ```
     your-app-name.onrender.com
     localhost
     ```
3. Accept terms
4. Click **"Submit"**

### Step 2: Copy Your New Keys

You'll see:
```
Site Key: 6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Secret Key: 6LeYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
```

**⚠️ IMPORTANT:** Keep the Secret Key private!

### Step 3: Update Render Environment Variables

**Frontend Service:**
1. Go to Render Dashboard
2. Select your frontend service
3. Go to **Environment** tab
4. Update or add:
   ```
   VITE_RECAPTCHA_SITE_KEY=your-new-site-key-here
   ```
5. Save (Render will auto-redeploy)

**Backend Service:**
1. Go to Render Dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Update or add:
   ```
   RECAPTCHA_SECRET_KEY=your-new-secret-key-here
   ```
5. Save (Render will auto-redeploy)

### Step 4: Wait for Redeployment

- Frontend: ~3-5 minutes
- Backend: ~5-10 minutes

### Step 5: Test

1. Visit your Render deployment
2. Go to `/report` page
3. reCAPTCHA should work! ✅

---

## Troubleshooting

### Still Showing Error After Adding Domain?

**Try these:**

1. **Wait longer** - Can take up to 5 minutes
2. **Clear browser cache** - Ctrl+Shift+Delete
3. **Try incognito mode** - Ctrl+Shift+N (Chrome) or Ctrl+Shift+P (Firefox)
4. **Check domain spelling** - Must match exactly
5. **Refresh the page** - Hard refresh: Ctrl+F5

### Domain Format Examples

✅ **Correct:**
```
my-app.onrender.com
localhost
127.0.0.1
```

❌ **Wrong:**
```
https://my-app.onrender.com    (no https://)
my-app.onrender.com/           (no trailing slash)
*.onrender.com                 (no wildcards in production)
```

---

## Quick Reference

### URLs You Need

| Purpose | URL |
|---------|-----|
| reCAPTCHA Admin | https://www.google.com/recaptcha/admin |
| Create New Site | https://www.google.com/recaptcha/admin/create |
| reCAPTCHA Docs | https://developers.google.com/recaptcha |

### Environment Variables

| Service | Variable | Type |
|---------|----------|------|
| Frontend | `VITE_RECAPTCHA_SITE_KEY` | Public (Site Key) |
| Backend | `RECAPTCHA_SECRET_KEY` | Private (Secret Key) |

---

## Success Checklist

After fixing:

- [ ] reCAPTCHA checkbox appears
- [ ] No error message shown
- [ ] Can check the checkbox
- [ ] Form submits successfully
- [ ] Success page appears

---

## Need More Help?

**Full Documentation:**
- `docs/status/RECAPTCHA-DOMAIN-FIX.md` - Detailed guide
- `docs/guides/RENDER-DEPLOYMENT-GUIDE.md` - Complete deployment guide

**Support:**
- GitHub Issues: [Your Repository]
- Email: support@sanvicente.gov.ph

---

**Time Required:** 5 minutes  
**Difficulty:** ⭐ Easy  
**Success Rate:** 99%

---

**Last Updated:** May 8, 2026  
**Status:** ✅ **READY TO USE**

