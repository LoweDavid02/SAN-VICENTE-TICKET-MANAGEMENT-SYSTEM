# Barangay Connect — San Vicente

A 3-portal system for Barangay San Vicente: Admin, Resident, and Personnel portals.

---

## Running Locally

You need **two terminals open at the same time**.

### Terminal 1 — Laravel Backend

```bash
cd LARAVEL-BACK-END
php artisan serve --host=127.0.0.1 --port=8000
```

### Terminal 2 — React Frontend

```bash
cd REACT-FRONT-END
npm run dev
```

Then open: **http://localhost:5173/login**

### Login Credentials

| Portal    | Email                        | Password       |
|-----------|------------------------------|----------------|
| Admin     | admin@barangay.gov           | Admin@123      |
| Resident  | resident@barangay.gov        | Resident@123   |
| Personnel | personnel@barangay.gov       | Personnel@123  |

---

## Deploying to Render

1. Push this repo to GitHub
2. Go to https://dashboard.render.com
3. Click **New → Blueprint**
4. Connect your GitHub repo
5. Render reads `render.yaml` and creates:
   - PostgreSQL database
   - Laravel API (Docker)
   - React frontend (Static Site)
6. Done — both services deploy automatically on every `git push`

---

## Tech Stack

- **Backend:** Laravel 11, PHP 8.3, PostgreSQL, Sanctum, Spatie Permissions
- **Frontend:** React 19, Vite, Zustand, React Query, Tailwind CSS
- **Deployment:** Render.com (Docker + Static Site)

---

## 📚 Documentation

Comprehensive project documentation is organized in the [`docs/`](./docs/) folder:

- **[Quick Start Guide](./docs/guides/QUICK-START-GUIDE.md)** - Get up and running quickly
- **[Testing Guide](./docs/guides/TESTING-GUIDE.md)** - Testing procedures and checklists
- **[Production Deployment](./docs/implementation/PRODUCTION-DEPLOYMENT-READY.md)** - Deploy to production
- **[Project WBS](./docs/wbs/PROJECT-WBS.md)** - Complete work breakdown structure
- **[Design System](./docs/design/COLOR-PALETTE-REFERENCE.md)** - UI/UX and color palette
- **[All Documentation](./docs/README.md)** - Complete documentation index

### Documentation Categories

- **Implementation** (67 docs) - Bug fixes, features, and deployment guides
- **Status Reports** (40 docs) - Project status and completion summaries
- **Design** (19 docs) - UI/UX, Material Design 3, and theming
- **Guides** (14 docs) - Setup, testing, and troubleshooting
- **WBS** (6 docs) - Project structure and planning
- **Testing** (3 docs) - Testing checklists and verification
