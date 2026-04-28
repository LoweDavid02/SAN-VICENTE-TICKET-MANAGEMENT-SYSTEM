# 🚀 Quick Deploy to Render - 5 Minutes

## ✅ Prerequisites
- [x] All fixes applied
- [x] Build successful
- [x] Preview tested locally

---

## 📝 Step 1: Update URLs (2 minutes)

### Edit `.env.production`:
```env
VITE_API_URL=https://YOUR-BACKEND.onrender.com/api/v1
VITE_WS_URL=wss://YOUR-BACKEND.onrender.com/ws
```

### Edit `public/_redirects`:
```
/api/* https://YOUR-BACKEND.onrender.com/api/:splat 200
/*    /index.html   200
```

**Replace `YOUR-BACKEND` with your actual backend URL!**

---

## 🚀 Step 2: Deploy to Render (3 minutes)

### A. Go to Render Dashboard
https://dashboard.render.com/

### B. Create New Static Site
Click: **New +** → **Static Site**

### C. Connect Repository
- Select your GitHub repository
- Click **Connect**

### D. Configure Settings
```
Name:              bsv-frontend
Branch:            main
Root Directory:    REACT-FRONT-END
Build Command:     npm install && npm run build
Publish Directory: dist
```

### E. Add Environment Variables
Click **Advanced** → **Add Environment Variable**:
```
NODE_VERSION = 18
VITE_API_URL = https://YOUR-BACKEND.onrender.com/api/v1
VITE_WS_URL = wss://YOUR-BACKEND.onrender.com/ws
```

### F. Deploy
Click **Create Static Site**

---

## ✅ Step 3: Verify (1 minute)

### When deployment completes:
1. Click on the deployed URL
2. Press F12 (open console)
3. Check for:
   - ✅ `[App] Environment: {...}` logged
   - ✅ `[App] React app mounted successfully`
   - ✅ No red errors

### Test Routes:
- `/` → Landing page ✓
- `/login` → Login page ✓
- `/admin/dashboard` → Redirects to login ✓

---

## 🐛 If White Screen Appears

### Quick Fixes:
1. **Clear browser cache** (Ctrl + Shift + Delete)
2. **Hard refresh** (Ctrl + Shift + R)
3. **Check console** (F12 → Console tab)
4. **Check Render logs** (Dashboard → Logs)

### Common Issues:
- **404 on routes:** _redirects file missing → Rebuild
- **CORS errors:** Update backend CORS settings
- **Blank console:** JavaScript error → Check Render logs
- **Environment errors:** Verify environment variables in Render

---

## 📚 Full Documentation

For detailed troubleshooting:
- **RENDER-DEPLOYMENT-GUIDE.md** - Complete guide
- **DEPLOYMENT-FIXES-APPLIED.md** - Technical details
- **FIXES-SUMMARY.md** - Quick reference

---

## ✅ Success Checklist

- [ ] Updated .env.production
- [ ] Updated public/_redirects
- [ ] Created Static Site on Render
- [ ] Added environment variables
- [ ] Deployment completed
- [ ] Site loads without white screen
- [ ] No console errors
- [ ] All routes work

---

**Time Required:** ~5 minutes  
**Difficulty:** Easy  
**Status:** Ready to deploy! 🚀
