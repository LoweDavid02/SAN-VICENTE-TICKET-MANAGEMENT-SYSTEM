# Quick Start Guide 🚀

## Get the PWA Running in 5 Minutes

### Prerequisites
- Node.js 18+
- PHP 8.2+
- Composer
- PostgreSQL (or SQLite for dev)

---

## Frontend Setup

```bash
# 1. Navigate to frontend
cd REACT-FRONT-END

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Start development server
npm run dev
```

**App will be available at:** http://localhost:5173

---

## Backend Setup

```bash
# 1. Navigate to backend
cd LARAVEL-BACK-END

# 2. Install dependencies
composer install

# 3. Copy environment file
cp .env.example .env

# 4. Generate app key
php artisan key:generate

# 5. Run migrations
php artisan migrate

# 6. Seed database (optional)
php artisan db:seed

# 7. Start server
php artisan serve
```

**API will be available at:** http://localhost:8000

---

## Test PWA Features

### 1. Test Offline Mode
1. Open app in Chrome
2. DevTools > Network > Offline
3. Reload page - should load from cache
4. Create a ticket - should queue in IndexedDB
5. Go online - should auto-sync

### 2. Test Install
1. Look for install icon in Chrome address bar
2. Click install
3. App opens in standalone mode

### 3. Check Service Worker
1. DevTools > Application > Service Workers
2. Should show "Activated and is running"

---

## Common Commands

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend
```bash
php artisan serve              # Start server
php artisan migrate           # Run migrations
php artisan db:seed           # Seed database
php artisan config:cache      # Cache config
php artisan route:cache       # Cache routes
php artisan storage:link      # Link storage
```

---

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=/api/v1
VITE_WS_URL=ws://localhost:8000/ws
VITE_VAPID_PUBLIC_KEY=          # Optional
```

### Backend (.env)
```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
DB_CONNECTION=sqlite            # or pgsql
```

---

## Default Login Credentials

After seeding:

**Admin:**
- Email: admin@sanvicente.gov.ph
- Password: password

**Personnel:**
- Email: personnel@sanvicente.gov.ph
- Password: password

**Resident:**
- Email: resident@sanvicente.gov.ph
- Password: password

---

## Troubleshooting

### Port Already in Use
```bash
# Frontend (change port)
npm run dev -- --port 3000

# Backend (change port)
php artisan serve --port 8001
```

### Service Worker Not Updating
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
location.reload();
```

### Database Connection Error
```bash
# Check .env file
# For SQLite, ensure database file exists:
touch database/database.sqlite
php artisan migrate
```

---

## Next Steps

1. **Generate Icons** - See `ICON-GENERATION-GUIDE.md`
2. **Read Documentation** - See `PWA-SETUP.md`
3. **Run Tests** - See `FINAL-DEPLOYMENT-CHECKLIST.md`
4. **Deploy** - See deployment section in docs

---

## Need Help?

- **Setup Issues:** Check `PWA-SETUP.md`
- **Bug Fixes:** Check `FIXES-APPLIED.md`
- **Deployment:** Check `FINAL-DEPLOYMENT-CHECKLIST.md`
- **Full Analysis:** Check `SYSTEM-ANALYSIS-REPORT.md`

---

**Happy Coding! 🎉**
