# 🚀 QUICK FIX REFERENCE

**San Vicente Municipal System - Common Issues & Solutions**

---

## 🐛 ISSUE #1: Dashboard Components Invisible Locally

### **Symptoms**:
- Production works fine ✅
- Local dev shows empty white space ❌
- Components are invisible

### **Quick Fix**:
```bash
# 1. Check CSS import in main.jsx
# Should be: import './index.css';
# NOT: import './index-civic.css';

# 2. Clear cache
cd REACT-FRONT-END
rm -rf node_modules/.vite dist

# 3. Restart dev server
npm run dev

# 4. Hard refresh browser
# Press Ctrl+Shift+R
```

### **Root Cause**:
Wrong CSS file imported - `index-civic.css` is incomplete.

### **Permanent Fix**:
Always use `import './index.css'` in `main.jsx`.

**Documentation**: `UI-INVISIBLE-COMPONENTS-FIXED.md`

---

## 🐛 ISSUE #2: Giant Green Circle Covering UI

### **Symptoms**:
- Massive green circle covers entire screen
- UI completely broken
- React errors in console

### **Quick Fix**:
```bash
# 1. Stop servers (Ctrl+C)

# 2. Clear ALL caches
cd REACT-FRONT-END
rm -rf node_modules/.vite dist

# 3. Reinstall dependencies
npm install --legacy-peer-deps

# 4. Restart servers
npm run dev

# 5. Hard refresh browser
# Press Ctrl+Shift+R
```

### **Root Cause**:
Vite cache corruption + React module initialization failure.

**Documentation**: `COMPLETE-UI-FIX.md`

---

## 🐛 ISSUE #3: React useState Error

### **Symptoms**:
```
Cannot read properties of null (reading 'useState')
```

### **Quick Fix**:
```bash
# 1. Clear Vite cache
cd REACT-FRONT-END
rm -rf node_modules/.vite

# 2. Reinstall dependencies
npm install --legacy-peer-deps

# 3. Restart dev server
npm run dev
```

### **Root Cause**:
Vite cached broken React modules.

**Documentation**: `SYSTEM-STATUS-FINAL.md`

---

## 🐛 ISSUE #4: Build Fails

### **Symptoms**:
```
npm run build
# Exits with error
```

### **Quick Fix**:
```bash
cd REACT-FRONT-END

# 1. Check for missing dependencies
npm install --legacy-peer-deps

# 2. Try build again
npm run build

# 3. If still fails, check diagnostics
# Look for specific error message
```

### **Common Causes**:
- Missing dependencies
- Syntax errors in code
- Import errors

**Documentation**: `SYSTEM-VERIFICATION-COMPLETE.md`

---

## 🐛 ISSUE #5: WebSocket Errors in Console

### **Symptoms**:
```
WebSocket connection to 'ws://localhost:8000/ws' failed: 404
[SyncManager] Reconnecting...
```

### **Quick Fix**:
**IGNORE IT** - This is harmless! ✅

### **Explanation**:
- Optional real-time sync feature
- System works perfectly without it
- Just console noise

**Action**: None required

---

## 🐛 ISSUE #6: Vite Deprecation Warnings

### **Symptoms**:
```
`esbuild` option was specified by "vite:react-babel" plugin
```

### **Quick Fix**:
**IGNORE IT** - This is harmless! ✅

### **Explanation**:
- Future compatibility warning
- No impact on current functionality
- Plugin authors will update eventually

**Action**: None required

---

## 🔧 GENERAL TROUBLESHOOTING STEPS

### **Step 1: Clear All Caches**
```bash
cd REACT-FRONT-END
rm -rf node_modules/.vite dist
```

### **Step 2: Reinstall Dependencies**
```bash
npm install --legacy-peer-deps
```

### **Step 3: Restart Servers**
```bash
# Backend
cd LARAVEL-BACK-END
php artisan serve

# Frontend (new terminal)
cd REACT-FRONT-END
npm run dev
```

### **Step 4: Hard Refresh Browser**
- Windows/Linux: `Ctrl+Shift+R`
- Mac: `Cmd+Shift+R`

### **Step 5: Check Console**
- Press F12
- Look for errors in Console tab
- Look for failed requests in Network tab

---

## 🚀 QUICK START (Fresh Setup)

```bash
# 1. Backend
cd LARAVEL-BACK-END
php artisan serve

# 2. Frontend (new terminal)
cd REACT-FRONT-END
npm install --legacy-peer-deps
npm run dev

# 3. Browser
# Go to: http://localhost:5174
# Hard refresh: Ctrl+Shift+R
# Login: admin@sanvicente.gov.ph / Admin@2026!
```

---

## 📊 VERIFY SYSTEM HEALTH

### **Check Build**:
```bash
cd REACT-FRONT-END
npm run build
# Should exit with: Exit Code: 0 ✅
```

### **Check Dependencies**:
```bash
npm ls react react-dom react-is
# Should show all installed ✅
```

### **Check Diagnostics**:
```bash
# No command needed - Kiro checks automatically
# Should show: "No diagnostics found" ✅
```

---

## 📚 DOCUMENTATION INDEX

| Issue | Document |
|-------|----------|
| Invisible Components | `UI-INVISIBLE-COMPONENTS-FIXED.md` |
| Giant Green Circle | `COMPLETE-UI-FIX.md` |
| React Errors | `SYSTEM-STATUS-FINAL.md` |
| Full Verification | `SYSTEM-VERIFICATION-COMPLETE.md` |
| Quick Start | `QUICK-START-GUIDE.md` |
| Context Transfer | `CONTEXT-TRANSFER-SUMMARY.md` |

---

## 🎯 PREVENTION CHECKLIST

### **Before Deploying**:
- [ ] Test locally first
- [ ] Run `npm run build` successfully
- [ ] Check browser console for errors
- [ ] Verify all components visible
- [ ] Test all major features

### **Before Committing**:
- [ ] Verify CSS import is `index.css` (not `index-civic.css`)
- [ ] Run diagnostics (no errors)
- [ ] Build passes
- [ ] No console errors

### **Regular Maintenance**:
- [ ] Clear Vite cache weekly: `rm -rf node_modules/.vite`
- [ ] Update dependencies monthly: `npm update`
- [ ] Check for security vulnerabilities: `npm audit`

---

## 📞 EMERGENCY CONTACTS

### **If Everything Breaks**:

1. **Nuclear Option** - Complete Reinstall:
   ```bash
   cd REACT-FRONT-END
   rm -rf node_modules package-lock.json dist .vite
   npm install --legacy-peer-deps
   npm run build
   npm run dev
   ```

2. **Check Documentation**:
   - Read `SYSTEM-VERIFICATION-COMPLETE.md`
   - Read `CONTEXT-TRANSFER-SUMMARY.md`

3. **Verify Files**:
   - `main.jsx` imports `index.css` ✅
   - `AppContext.jsx` uses mock notifications ✅
   - Controllers don't call NotificationService ✅

---

**Last Updated**: May 6, 2026  
**Status**: ✅ All Systems Operational  
**Build**: ✅ Passing  

**🎯 KEEP THIS HANDY FOR QUICK REFERENCE** ✅
