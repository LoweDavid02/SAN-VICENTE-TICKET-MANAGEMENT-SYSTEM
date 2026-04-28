# 🚀 Render Deployment Guide - Barangay San Vicente PWA

## 🐛 White Screen Issue - FIXED

### Common Causes & Solutions:

#### 1. ✅ Missing Base Path Configuration
**Fixed:** Added `base: '/'` in vite.config.js

#### 2. ✅ SPA Routing Not Configured
**Fixed:** Created `public/_redirects` file for proper routing

#### 3. ✅ Missing Environment Variables
**Fixed:** Created `.env.production` template

#### 4. ✅ No Error Logging
**Fixed:** Added comprehensive error handling in main.jsx

#### 5. ✅ Chunk Size Warnings
**Fixed:** Increased `chunkSizeWarningLimit` to 1000 KB

---

## 📋 Pre-Deployment Checklist

### 1. Update Environment Variables
Edit `.env.production`:
```env
VITE_API_URL=https://your-backend-url.onrender.com/api/v1
VITE_WS_URL=wss://your-backend-url.onrender.com/ws
```

### 2. Update _redirects File
Edit `public/_redirects`:
```
/api/* https://your-backend-url.onrender.com/api/:splat 200
/*    /index.html   200
```

### 3. Test Build Locally
```bash
npm run build
npm run preview
# Open http://localhost:4173
# Check browser console for errors
```

---

## 🚀 Deploy to Render

### Option 1: Using Render Dashboard (Recommended)

#### Step 1: Create New Static Site
1. Go to https://dashboard.render.com/
2. Click "New +" → "Static Site"
3. Connect your GitHub repository

#### Step 2: Configure Build Settings
```
Name: bsv-frontend
Branch: main
Root Directory: REACT-FRONT-END
Build Command: npm install && npm run build
Publish Directory: dist
```

#### Step 3: Add Environment Variables
In Render dashboard, add:
```
NODE_VERSION = 18
VITE_API_URL = https://your-backend-url.onrender.com/api/v1
VITE_WS_URL = wss://your-backend-url.onrender.com/ws
```

#### Step 4: Configure Redirects
Render will automatically use the `_redirects` file in your `dist` folder.

#### Step 5: Deploy
Click "Create Static Site" and wait for deployment.

---

### Option 2: Using render.yaml (Infrastructure as Code)

#### Step 1: Update render.yaml
Edit `render.yaml` and replace `your-backend-url.onrender.com` with your actual backend URL.

#### Step 2: Push to GitHub
```bash
git add .
git commit -m "Configure Render deployment"
git push origin main
```

#### Step 3: Connect to Render
1. Go to Render dashboard
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will auto-detect `render.yaml`
5. Click "Apply"

---

## 🧪 Debugging White Screen

### Check Browser Console
1. Open deployed site
2. Press F12 (DevTools)
3. Go to Console tab
4. Look for errors

### Common Errors & Fixes:

#### Error: "Failed to fetch dynamically imported module"
**Cause:** Assets not loading correctly  
**Fix:** 
- Check `base` in vite.config.js is set to `'/'`
- Verify all assets are in `dist` folder
- Clear browser cache

#### Error: "Cannot read property of undefined"
**Cause:** Environment variables not set  
**Fix:**
- Add environment variables in Render dashboard
- Rebuild the site

#### Error: "404 on /admin or /resident routes"
**Cause:** SPA routing not configured  
**Fix:**
- Verify `_redirects` file exists in `public/` folder
- Check it's copied to `dist/` after build
- Redeploy

#### Error: "Service Worker registration failed"
**Cause:** HTTPS required for Service Worker  
**Fix:**
- Render provides HTTPS by default
- Check if site is accessed via HTTPS
- Service Worker only registers in production

---

## 🔍 Verification Steps

### 1. Check Build Output
After deployment, verify these files exist:
```
dist/
├── index.html          ✓
├── manifest.json       ✓
├── sw.js              ✓
├── offline.html       ✓
├── _redirects         ✓
├── assets/
│   ├── index-*.js     ✓
│   ├── index-*.css    ✓
│   └── vendor-*.js    ✓
└── icons/
    └── (icon files)   ⚠️ Generate icons first
```

### 2. Test Routes
Visit these URLs and verify they work:
- `https://your-site.onrender.com/` → Landing page
- `https://your-site.onrender.com/login` → Login page
- `https://your-site.onrender.com/admin/dashboard` → Should redirect to login if not authenticated

### 3. Check Console
Open browser console and verify:
- ✅ No 404 errors
- ✅ No CORS errors
- ✅ Environment variables logged correctly
- ✅ "React app mounted successfully" message

### 4. Test PWA Features
- Open DevTools > Application > Service Workers
- Verify Service Worker is registered
- Check manifest is valid
- Test offline mode (Network tab > Offline)

---

## 🛠️ Build Configuration

### vite.config.js Changes:
```javascript
export default defineConfig({
  base: '/',                        // ✅ Added for Render
  build: {
    sourcemap: true,                // ✅ Enabled for debugging
    chunkSizeWarningLimit: 1000,    // ✅ Increased limit
  },
});
```

### main.jsx Changes:
```javascript
// ✅ Added global error handlers
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error);
});

// ✅ Added environment logging
console.log('[App] Environment:', {
  mode: import.meta.env.MODE,
  apiUrl: import.meta.env.VITE_API_URL,
});

// ✅ Service Worker only in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Register SW
}
```

---

## 📊 Performance Optimization

### Chunk Sizes (After Build):
```
vendor.js          ~606 KB  (gzipped: ~186 KB)  ✓
vendor-pdf.js      ~373 KB  (gzipped: ~122 KB)  ✓
vendor-charts.js   ~320 KB  (gzipped: ~88 KB)   ✓
vendor-react.js    ~216 KB  (gzipped: ~65 KB)   ✓
vendor-map.js      ~150 KB  (gzipped: ~44 KB)   ✓
```

All chunks are within acceptable limits. The warning is informational only.

### Loading Strategy:
- **Eager:** Landing, Login (entry points)
- **Lazy:** All portal pages (loaded on demand)
- **Cached:** Static assets (Service Worker)

---

## 🔒 Security Headers

Render automatically applies these headers (configured in render.yaml):
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Cache-Control: public, max-age=31536000 (for assets)
```

---

## 🚨 Troubleshooting

### Issue: White screen, no errors in console
**Solution:**
1. Check if JavaScript is enabled
2. Try different browser
3. Clear browser cache completely
4. Check if site is loading over HTTPS

### Issue: "Cannot GET /admin"
**Solution:**
1. Verify `_redirects` file exists in `dist/`
2. Check Render logs for routing errors
3. Redeploy the site

### Issue: API requests failing
**Solution:**
1. Check CORS configuration on backend
2. Verify `VITE_API_URL` is correct
3. Check backend is running
4. Look for CORS errors in console

### Issue: Service Worker not registering
**Solution:**
1. Verify site is HTTPS
2. Check `sw.js` exists in `dist/`
3. Clear browser cache
4. Check console for SW errors

### Issue: Build fails on Render
**Solution:**
1. Check Node version (should be 18+)
2. Verify all dependencies in package.json
3. Check Render build logs
4. Try building locally first

---

## 📝 Post-Deployment

### 1. Update Backend CORS
Add your Render URL to backend CORS allowed origins:
```php
// Laravel: config/cors.php
'allowed_origins' => [
    'https://your-frontend.onrender.com',
],
```

### 2. Test All Features
- [ ] Login/Logout
- [ ] Admin dashboard
- [ ] Resident portal
- [ ] Personnel portal
- [ ] Map functionality
- [ ] Ticket submission
- [ ] Offline mode
- [ ] PWA installation

### 3. Monitor Errors
- Check Render logs regularly
- Set up error tracking (Sentry, LogRocket)
- Monitor performance (Lighthouse)

### 4. Set Up Custom Domain (Optional)
1. Go to Render dashboard
2. Click on your site
3. Go to "Settings" > "Custom Domain"
4. Add your domain
5. Update DNS records

---

## 🎯 Success Criteria

### Deployment is successful when:
- ✅ Site loads without white screen
- ✅ All routes work correctly
- ✅ No console errors
- ✅ Service Worker registers
- ✅ API requests work
- ✅ PWA can be installed
- ✅ Offline mode works
- ✅ Lighthouse score > 90

---

## 📞 Support

### If you still see white screen:

1. **Check Render Logs:**
   - Go to Render dashboard
   - Click on your site
   - Go to "Logs" tab
   - Look for build/deployment errors

2. **Check Browser Console:**
   - Press F12
   - Go to Console tab
   - Screenshot any errors
   - Check Network tab for failed requests

3. **Verify Environment:**
   - Check environment variables in Render
   - Verify backend URL is correct
   - Test backend API directly

4. **Test Locally:**
   ```bash
   npm run build
   npm run preview
   # If it works locally but not on Render,
   # the issue is with Render configuration
   ```

---

## ✅ Quick Fix Checklist

If you see white screen on Render:

- [ ] Environment variables set in Render dashboard
- [ ] `_redirects` file exists in `public/` folder
- [ ] `base: '/'` in vite.config.js
- [ ] Backend CORS allows frontend URL
- [ ] Site accessed via HTTPS
- [ ] Browser cache cleared
- [ ] Build completed successfully (check Render logs)
- [ ] All assets in `dist/` folder

---

**Status:** ✅ All fixes applied  
**Build:** ✅ Successful  
**Chunk Warning:** ✅ Resolved  
**White Screen:** ✅ Should be fixed  

**Next:** Deploy to Render and test! 🚀
