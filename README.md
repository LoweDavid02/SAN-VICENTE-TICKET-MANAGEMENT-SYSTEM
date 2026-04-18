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
