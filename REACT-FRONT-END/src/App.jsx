/**
 * App.jsx — Root router with lazy-loaded routes for optimal performance.
 *
 * Every portal page is lazy-loaded via React.lazy + dynamic import().
 * This means only the JS needed for the current route is downloaded.
 *
 * Initial bundle contains only:
 *   - React core
 *   - Router
 *   - AppShell + Preloader (always needed after login)
 *   - Landing + Login (public entry points)
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ROUTES } from './constants/routes';
import AppShell from './components/AppShell';
import Preloader from './components/Preloader';
import useAuthStore from './stores/authStore';

/* ── Public pages — loaded eagerly (entry points) ── */
import Landing  from './pages/Landing';
import Login    from './pages/Login';

/* ── Lazy-loaded pages — only downloaded when navigated to ── */
const PortalSelector = lazy(() => import('./pages/PortalSelector'));
const FAQ            = lazy(() => import('./pages/FAQ'));
const Profile        = lazy(() => import('./pages/Profile'));
const Settings       = lazy(() => import('./pages/Settings'));
const Notifications  = lazy(() => import('./pages/Notifications'));

/* ── Admin portal ── */
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const Personnel      = lazy(() => import('./pages/Personnel'));
const PersonnelTasks = lazy(() => import('./pages/PersonnelTasks'));
const Requests       = lazy(() => import('./pages/Requests'));
const AnalyticsDashboard = lazy(() =>
  import('./features/admin/AnalyticsDashboard/AnalyticsDashboard')
);

/* ── Resident portal ── */
const ResidentDashboard = lazy(() => import('./pages/ResidentDashboard'));
const ResidentHistory   = lazy(() => import('./pages/ResidentHistory'));
const SubmitRequest     = lazy(() =>
  import('./features/resident/SubmitRequest/SubmitRequest')
);

/* ── Personnel portal ── */
const PersonnelDashboard = lazy(() => import('./pages/personnel/PersonnelDashboard'));
const PersonnelHistory   = lazy(() => import('./pages/personnel/PersonnelHistory'));
const PersonnelProfile   = lazy(() => import('./pages/personnel/PersonnelProfile'));
const FieldWorkTask      = lazy(() =>
  import('./features/personnel/FieldWorkTask/FieldWorkTask')
);

/* ── Route-level loading fallback ── */
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '60vh', flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '2.5px solid var(--surface-3)',
        borderTopColor: 'var(--brand)',
        animation: 'spin .65s linear infinite',
      }} />
    </div>
  );
}

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
    if (preloader?.portal === 'logout') {
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      {preloader && (
        <Preloader
          portal={preloader.portal}
          userName={preloader.userName}
          onDone={handlePreloaderDone}
        />
      )}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public ── */}
          <Route path="/"             element={<Landing />} />
          <Route path="/home"         element={<Landing />} />
          <Route path={ROUTES.LOGIN}  element={<Login />} />
          <Route path={ROUTES.PORTAL} element={<PortalSelector />} />

          {/* ════════════════════════════════════
              ADMIN PORTAL
          ════════════════════════════════════ */}
          <Route path="/admin" element={<AppShell portalType="admin" />}>
            <Route index                element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<Dashboard />} />
            <Route path="analytics"     element={<AnalyticsDashboard />} />
            <Route path="personnel"     element={<Personnel />} />
            <Route path="tasks"         element={<PersonnelTasks />} />
            <Route path="tickets"       element={<Requests />} />
            <Route path="settings"      element={<Settings />} />
            <Route path="profile"       element={<Profile />} />
            <Route path="faq"           element={<FAQ />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="*"             element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* ════════════════════════════════════
              RESIDENT PORTAL
          ════════════════════════════════════ */}
          <Route path="/resident" element={<AppShell portalType="resident" />}>
            <Route index                element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<ResidentDashboard />} />
            <Route path="request"       element={<SubmitRequest />} />
            <Route path="history"       element={<ResidentHistory />} />
            <Route path="profile"       element={<Profile />} />
            <Route path="faq"           element={<FAQ />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="*"             element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* ════════════════════════════════════
              PERSONNEL PORTAL
          ════════════════════════════════════ */}
          <Route path="/personnel" element={<AppShell portalType="personnel" />}>
            <Route index                element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<PersonnelDashboard />} />
            <Route path="tasks"         element={<FieldWorkTask />} />
            <Route path="history"       element={<PersonnelHistory />} />
            <Route path="profile"       element={<PersonnelProfile />} />
            <Route path="faq"           element={<FAQ />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="analytics"     element={<Navigate to="/personnel/dashboard" replace />} />
            <Route path="*"             element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
