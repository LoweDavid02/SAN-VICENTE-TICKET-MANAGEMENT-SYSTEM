# 🚀 Render Deployment Fix Guide

**Issue**: "Cannot connect to server" on production (Render)  
**Root Cause**: Missing/incorrect `APP_KEY` configuration  
**Status**: ✅ READY TO FIX

---

## 🎯 The Problem

Your Render deployment is failing because:

1. **APP_KEY was set to `generateValue: true`** - This generates a random string, NOT a valid Laravel encryption key
2. **Laravel requires APP_KEY in format**: `base64:xxxxx...`
3. **Missing DB_SSLMODE** environment variable for PostgreSQL SSL connection

---

## ✅ Solution - Step by Step

### **Step 1: Update render.yaml** ✅ DONE

I've already fixed `render.yaml`:
- Changed `APP_KEY` from `generateValue: true` to `sync: false`
- Added `DB_SSLMODE: require` for PostgreSQL SSL

### **Step 2: Set APP_KEY in Render Dashboard** 🔧 YOU NEED TO DO THIS

1. Go to your Render Dashboard: https://dashboard.render.com
2. Find your **`san-vicente-api`** service
3. Click on it → Go to **"Environment"** tab
4. Find the `APP_KEY` variable
5. **Set it to this value**:
   ```
   base64:KISn5xhEXdifAiFYPHV/iLtb3Vro03BiQ6d9rtykL+M=
   ```
6. Click **"Save Changes"**

### **Step 3: Deploy the Changes**

```bash
# Commit the render.yaml fix
git add render.yaml
git commit -m "fix: Configure proper APP_KEY and DB_SSLMODE for Render"
git push origin main
```

Render will automatically detect the changes and redeploy.

---

## 🔍 Verify Deployment

### **1. Check Backend Health**
After deployment completes (5-10 minutes), test:

```bash
curl https://san-vicente-api.onrender.com/up
```

**Expected Response:**
```json
{"status":"ok","timestamp":"2026-04-19T..."}
```

### **2. Check Backend Logs**
In Render Dashboard:
1. Go to `san-vicente-api` service
2. Click **"Logs"** tab
3. Look for:
   - ✅ `Server running on 0.0.0.0:10000`
   - ✅ `Running migrations...`
   - ✅ `Checking if seeding is needed...`
   - ❌ Any errors about APP_KEY, database connection, or migrations

### **3. Test Login Endpoint**
```bash
curl -X POST https://san-vicente-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@barangay.gov","password":"Admin@123","portal":"admin"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {...},
    "token": "..."
  }
}
```

### **4. Test Frontend**
Open: https://san-vicente-frontend.onrender.com

Try logging in with:
- Email: `admin@barangay.gov`
- Password: `Admin@123`
- Portal: Admin Portal

---

## 🐛 Troubleshooting

### **If Backend Still Fails to Start**

#### **Check 1: APP_KEY Format**
In Render Dashboard → Environment tab:
- ✅ Should be: `base64:KISn5xhEXdifAiFYPHV/iLtb3Vro03BiQ6d9rtykL+M=`
- ❌ Should NOT be: Random string without `base64:` prefix

#### **Check 2: Database Connection**
In Render logs, look for:
```
Running migrations...
```

If you see database connection errors:
1. Verify `san-vicente-db` database is running
2. Check that `render.yaml` has correct `fromDatabase` references
3. Ensure database is in the same region as the API service

#### **Check 3: Build Logs**
In Render Dashboard → Logs → Build Logs:
- Look for Docker build errors
- Check if `composer install` succeeded
- Verify `docker-entrypoint.sh` is executable

#### **Check 4: Environment Variables**
In Render Dashboard → Environment tab, verify these are set:
- ✅ `APP_KEY` - Your Laravel encryption key
- ✅ `APP_ENV` - `production`
- ✅ `APP_URL` - `https://san-vicente-api.onrender.com`
- ✅ `DB_HOST` - Auto-populated from database
- ✅ `DB_PORT` - Auto-populated from database
- ✅ `DB_DATABASE` - Auto-populated from database
- ✅ `DB_USERNAME` - Auto-populated from database
- ✅ `DB_PASSWORD` - Auto-populated from database
- ✅ `DB_SSLMODE` - `require`
- ✅ `FRONTEND_URL` - `https://san-vicente-frontend.onrender.com`

---

## 📋 Common Render Issues & Solutions

### **Issue: "Application key not set"**
**Solution**: Set `APP_KEY` in Render environment variables (see Step 2 above)

### **Issue: "SQLSTATE[08006] Connection refused"**
**Solution**: 
1. Check database is running
2. Verify `DB_SSLMODE=require` is set
3. Ensure database and API are in same region

### **Issue: "Class 'Spatie\Permission\Models\Role' not found"**
**Solution**: 
1. Check `composer install` ran successfully in build logs
2. Verify `composer.json` includes `spatie/laravel-permission`
3. Try manual redeploy

### **Issue: Frontend shows "Cannot connect"**
**Solution**:
1. Verify backend is running (test `/up` endpoint)
2. Check CORS configuration allows frontend domain
3. Verify `VITE_API_URL` in frontend build matches backend URL
4. Check browser console for actual error (F12 → Console)

---

## 🔐 Security Notes

### **APP_KEY**
- ✅ Generated key: `base64:KISn5xhEXdifAiFYPHV/iLtb3Vro03BiQ6d9rtykL+M=`
- ⚠️ **IMPORTANT**: This key is used for encryption. Keep it secret!
- ⚠️ **DO NOT** commit this key to Git
- ⚠️ **DO NOT** share this key publicly
- ✅ Only set it in Render Dashboard environment variables

### **Database Credentials**
- ✅ Auto-managed by Render via `fromDatabase` references
- ✅ Never hardcoded in code or config files
- ✅ Automatically rotated by Render

---

## 📊 Expected Render Services

After successful deployment, you should have:

| Service | Type | URL | Status |
|---------|------|-----|--------|
| `san-vicente-api` | Web Service (Docker) | https://san-vicente-api.onrender.com | 🟢 Running |
| `san-vicente-frontend` | Static Site | https://san-vicente-frontend.onrender.com | 🟢 Running |
| `san-vicente-db` | PostgreSQL | Internal | 🟢 Running |

---

## 🎉 Success Checklist

- [ ] `render.yaml` updated and pushed to Git
- [ ] `APP_KEY` set in Render Dashboard
- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Health check `/up` returns 200 OK
- [ ] Login endpoint works
- [ ] Can log in via frontend
- [ ] No errors in Render logs

---

## 📞 Next Steps

1. **Set APP_KEY in Render Dashboard** (Step 2 above)
2. **Push the render.yaml changes** (Step 3 above)
3. **Wait for deployment** (5-10 minutes)
4. **Test the endpoints** (Verify section above)
5. **Try logging in** via frontend

---

**Once you complete Step 2 (setting APP_KEY), your deployment should work!** 🚀
