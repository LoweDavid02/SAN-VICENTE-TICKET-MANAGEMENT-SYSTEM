# 🐛 White Screen Debugging Guide

## Issue
Both local preview (http://localhost:4173/) and dev server (http://localhost:5174/) show white screen.

## Immediate Steps to Debug

### Step 1: Open Browser Console
1. Open http://localhost:5174/ in Chrome
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for RED error messages

### Step 2: Check Network Tab
1. In DevTools, go to **Network** tab
2. Reload the page (Ctrl + R)
3. Look for:
   - Failed requests (red)
   - 404 errors
   - CORS errors

### Step 3: Common Causes

#### A. JavaScript Error
**Symptoms:** Red error in console  
**Solution:** Read the error message, it will tell you exactly what's wrong

#### B. Missing Environment Variables
**Symptoms:** `undefined` in console for `import.meta.env.VITE_API_URL`  
**Solution:**
```bash
# Check .env file exists
ls .env

# Restart dev server
npm run dev
```

#### C. Module Import Error
**Symptoms:** "Failed to resolve import" error  
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### D. React Error
**Symptoms:** "Error: Minified React error #..."  
**Solution:** Check the error boundary in browser console

---

## Quick Fix Checklist

- [ ] Open browser console (F12)
- [ ] Screenshot any red errors
- [ ] Check if `.env` file exists
- [ ] Restart dev server: `npm run dev`
- [ ] Clear browser cache (Ctrl + Shift + Delete)
- [ ] Try incognito mode
- [ ] Check if `http://localhost:5174/` loads HTML (view source)

---

## Manual Test

### Test 1: Check if HTML loads
```bash
curl http://localhost:5174/
# Should return HTML with <div id="root"></div>
```

### Test 2: Check if JS file exists
Open: http://localhost:5174/src/main.jsx
- Should show JavaScript code
- If 404, there's a build issue

### Test 3: Check environment variables
Add this to `src/main.jsx` temporarily:
```javascript
console.log('ENV CHECK:', {
  mode: import.meta.env.MODE,
  apiUrl: import.meta.env.VITE_API_URL,
  base: import.meta.env.BASE_URL,
});
```

Reload and check console.

---

## Most Likely Causes (in order)

### 1. JavaScript Runtime Error (90%)
- **Check:** Browser console for red errors
- **Fix:** Read error message and fix the code

### 2. Missing Dependencies (5%)
- **Check:** `npm list` shows errors
- **Fix:** `npm install`

### 3. Environment Variables (3%)
- **Check:** `.env` file exists
- **Fix:** Create `.env` from `.env.example`

### 4. Browser Cache (2%)
- **Check:** Try incognito mode
- **Fix:** Clear cache or use incognito

---

## Emergency Fallback

If nothing works, create a minimal test:

### Create `src/test.jsx`:
```javascript
import React from 'react';
import { createRoot } from 'react-dom/client';

function Test() {
  return <h1>React is working!</h1>;
}

createRoot(document.getElementById('root')).render(<Test />);
```

### Update `index.html`:
```html
<script type="module" src="/src/test.jsx"></script>
```

If this works, the issue is in your App code.  
If this doesn't work, there's a build/environment issue.

---

## Report Back

When you open the browser console, you should see:
1. **Environment logs** (if you added the console.log)
2. **Any red error messages**
3. **Network requests** in Network tab

**Please share:**
- Screenshot of console errors
- Screenshot of Network tab
- Any red error messages

This will help identify the exact issue!

---

## Quick Commands

```bash
# Restart dev server
npm run dev

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev

# Build and preview
npm run build
npm run preview

# Check environment
cat .env
```

---

**Status:** Waiting for browser console output  
**Next:** Open http://localhost:5174/ and check console (F12)
