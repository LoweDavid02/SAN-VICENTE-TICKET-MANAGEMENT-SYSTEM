/**
 * App.jsx — Root router.
 *
 * Route structure follows the feature-based architecture:
 *   /admin/*     → Admin portal (ROLES.ADMIN only)
 *   /resident/*  → Resident portal (ROLES.RESIDENT only)
 *   /personnel/* → Personnel portal (ROLES.PERSONNEL only)
 *
 * RBAC is enforced at two levels:
 *   1. Route level: RoleGuard redirects unauthorized roles to /login.
 *   2. Feature level: can() checks inside feature components.
 *
 * The AnalyticsDashboard feature is explicitly blocked for ROLES.PERSONNEL.
 */

import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ROUTES } from './constants/routes';
import AppShell from './components/AppShell';
import Preloader from './components/Preloader';
import useAuthStore from './stores/authStore';

/* ── Public pages ── */
import Landing        from './pages/Landing';
import Login          from './pages/Login';
import PortalSelector from './pages/PortalSelector';
import FAQ            from './pages/FAQ';

/* ── Shared pages ── */
import Profile        from './pages/Profile';
import Settings       from './pages/Settings';

/* ── Admin pages ── */
import Dashboard      from './pages/Dashboard';
import Personnel      from './pages/Personnel';
import PersonnelTasks from './pages/PersonnelTasks';
import Requests       from './pages/Requests';

/* ── Resident pages ── */
import ResidentDashboard from './pages/ResidentDashboard';
import ResidentHistory   from './pages/ResidentHistory';

/* ── Personnel pages ── */
import PersonnelDashboard from './pages/personnel/PersonnelDashboard';
import PersonnelHistory   from './pages/personnel/PersonnelHistory';
import PersonnelProfile   from './pages/personnel/PersonnelProfile';

/* ── Feature components ── */
import SubmitRequest      from './features/resident/SubmitRequest/SubmitRequest';
import FieldWorkTask      from './features/personnel/FieldWorkTask/FieldWorkTask';
import AnalyticsDashboard from './features/admin/AnalyticsDashboard/AnalyticsDashboard';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const { preloader, clearPreloader } = useAuthStore();

  const handlePreloaderDone = () => {
    clearPreloader();
    // If logging out, navigate to login after preloader finishes
    if (preloader?.portal === 'logout') {
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      {/* Global preloader — shown on login and logout */}
      {preloader && (
        <Preloader
          portal={preloader.portal}
          userName={preloader.userName}
          onDone={handlePreloaderDone}
        />
      )}

      <Routes>
          {/* ── Public / Landing ── */}
          <Route path="/"            element={<Landing />} />
          <Route path="/home"        element={<Landing />} />
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.PORTAL}element={<PortalSelector />} />

          {/* ════════════════════════════════════
              ADMIN PORTAL
          ════════════════════════════════════ */}
          <Route path="/admin" element={<AppShell portalType="admin" />}>
            <Route index              element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"   element={<Dashboard />} />
            <Route path="analytics"   element={<AnalyticsDashboard />} />
            <Route path="personnel"   element={<Personnel />} />
            <Route path="tasks"       element={<PersonnelTasks />} />
            <Route path="tickets"     element={<Requests />} />
            <Route path="settings"    element={<Settings />} />
            <Route path="profile"     element={<Profile />} />
            <Route path="faq"         element={<FAQ />} />
            <Route path="*"           element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* ════════════════════════════════════
              RESIDENT PORTAL
          ════════════════════════════════════ */}
          <Route path="/resident" element={<AppShell portalType="resident" />}>
            <Route index              element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"   element={<ResidentDashboard />} />
            <Route path="request"     element={<SubmitRequest />} />
            <Route path="history"     element={<ResidentHistory />} />
            <Route path="profile"     element={<Profile />} />
            <Route path="faq"         element={<FAQ />} />
            <Route path="*"           element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* ════════════════════════════════════
              PERSONNEL PORTAL
          ════════════════════════════════════ */}
          <Route path="/personnel" element={<AppShell portalType="personnel" />}>
            <Route index              element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"   element={<PersonnelDashboard />} />
            <Route path="tasks"       element={<FieldWorkTask />} />
            <Route path="history"     element={<PersonnelHistory />} />
            <Route path="profile"     element={<PersonnelProfile />} />
            <Route path="faq"         element={<FAQ />} />
            <Route path="analytics"   element={<Navigate to="/personnel/dashboard" replace />} />
            <Route path="*"           element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    );
  }
