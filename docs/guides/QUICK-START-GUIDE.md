# 🚀 QUICK START GUIDE

**San Vicente Municipal System**  
**Status**: ✅ Ready to Use  
**Last Verified**: May 6, 2026 2:24 PM

---

## ⚡ START THE SYSTEM (2 Steps)

### **Terminal 1: Backend**
```bash
cd LARAVEL-BACK-END
php artisan serve
```
✅ **Wait for**: `INFO  Server running on [http://127.0.0.1:8000]`

### **Terminal 2: Frontend**
```bash
cd REACT-FRONT-END
npm run dev
```
✅ **Wait for**: `VITE v8.0.10  ready in XXX ms`

---

## 🌐 ACCESS THE SYSTEM

1. **Open Browser**: `http://localhost:5174`
2. **Hard Refresh**: Press `Ctrl+Shift+R` (clears old cache)
3. **Login**:
   - **Admin**: `admin@sanvicente.gov.ph` / `Admin@2026!`
   - **Personnel**: `personnel1@sanvicente.gov.ph` / `Personnel@2026!`

---

## ✅ WHAT TO EXPECT

### **Admin Portal** (`/admin/dashboard`)
- 📊 4 KPI cards (Total Tickets, Urgent, In Progress, Active Personnel)
- 🗺️ Interactive map with ticket markers
- 📊 Department workload charts
- 📋 Recent incidents table
- 🔔 Notifications (bell icon, top right)

### **Personnel Portal** (`/personnel/dashboard`)
- 👋 Welcome banner with your name
- 📊 Quick stats (Assigned, Completed, Pending)
- 📋 Assigned tasks (cards with update buttons)
- 🔔 Notifications (bell icon, top right)

### **Guest Submission** (`/report`)
- 📝 Public form (no login required)
- 📸 Photo upload (up to 5 images)
- 🗺️ Location picker (click on map)
- 🎫 Tracking code generated on submit

---

## ⚠️ IGNORE THESE WARNINGS

### **Console Warnings** (Safe to Ignore)
```
WebSocket connection to 'ws://localhost:8000/ws' failed: 404
[SyncManager] Reconnecting...
```
**Why**: Optional real-time sync feature not configured  
**Impact**: None - system works perfectly without it

```
`esbuild` option was specified by "vite:react-babel" plugin
```
**Why**: Vite deprecation warning for future versions  
**Impact**: None - current functionality not affected

---

## 🐛 TROUBLESHOOTING

### **Problem: Giant Green Circle Appears**
**Solution**:
1. Stop frontend server (`Ctrl+C`)
2. Clear cache:
   ```bash
   cd REACT-FRONT-END
   rm -rf node_modules/.vite dist
   ```
3. Restart: `npm run dev`
4. Hard refresh browser: `Ctrl+Shift+R`

### **Problem: "Cannot read properties of null"**
**Solution**:
1. Stop frontend server
2. Reinstall dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Restart: `npm run dev`

### **Problem: Build Fails**
**Solution**:
```bash
cd REACT-FRONT-END
npm run build
```
If it fails, check the error message and run:
```bash
npm install --legacy-peer-deps
npm run build
```

### **Problem: Backend Not Responding**
**Solution**:
1. Check if Laravel server is running
2. Verify database connection in `.env`
3. Run migrations:
   ```bash
   cd LARAVEL-BACK-END
   php artisan migrate
   ```

---

## 📊 SYSTEM STATUS

| Component | Status | Port |
|-----------|--------|------|
| **Frontend** | ✅ Ready | 5174 |
| **Backend** | ✅ Ready | 8000 |
| **Database** | ✅ Ready | 5432 |
| **Build** | ✅ Passing | - |
| **Dependencies** | ✅ Healthy | - |

---

## 🎯 QUICK TESTS

### **Test 1: Login**
1. Go to `http://localhost:5174`
2. Login as admin
3. ✅ Should see dashboard with KPI cards

### **Test 2: Create Ticket (Guest)**
1. Go to `http://localhost:5174/report`
2. Fill form and submit
3. ✅ Should get tracking code

### **Test 3: Track Ticket**
1. Go to `http://localhost:5174/track`
2. Enter tracking code
3. ✅ Should see ticket details

### **Test 4: Update Status (Admin)**
1. Login as admin
2. Go to Tickets page
3. Click a ticket, update status
4. ✅ Should see success message

---

## 📚 DOCUMENTATION

- `SYSTEM-VERIFICATION-COMPLETE.md` - Full verification report
- `SYSTEM-STATUS-FINAL.md` - Previous status report
- `COMPLETE-UI-FIX.md` - UI fix guide
- `EMERGENCY-FIX-APPLIED.md` - Emergency fixes

---

## 🎉 YOU'RE READY!

The system is **fully operational** and ready to use. Just start both servers and access the system in your browser.

**Status**: ✅ **ALL SYSTEMS GO**

---

**Need Help?**
- Check `SYSTEM-VERIFICATION-COMPLETE.md` for detailed information
- Review console logs for any errors
- Ensure both servers are running
- Hard refresh browser if UI looks broken

**Last Updated**: May 6, 2026 2:24 PM
