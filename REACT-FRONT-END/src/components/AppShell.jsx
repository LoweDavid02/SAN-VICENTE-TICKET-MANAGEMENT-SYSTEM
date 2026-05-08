import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ModalRoot from './Modal';
import SyncStatusBar from './SyncStatusBar';
import { useApp } from '../context/AppContext';

export default function AppShell({ portalType }) {
  const { sidebarCollapsed, mobileDrawerOpen, setMobileDrawerOpen } = useApp();
  const sidebarW = sidebarCollapsed ? 'var(--sidebar-w-sm)' : 'var(--sidebar-w)';

  // Close drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [setMobileDrawerOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileDrawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileDrawerOpen]);

  return (
    <div style={{ background: 'var(--surface-2)', minHeight: '100vh' }}>
      <Sidebar portalType={portalType} />

      {/* Mobile drawer backdrop */}
      {mobileDrawerOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Topbar: left offset matches sidebar on desktop, 0 on mobile (CSS overrides) */}
      <Topbar sidebarWidth={sidebarW} />

      {/* Main content area */}
      <main
        className="app-main"
        style={{
          marginLeft: sidebarW,
          paddingTop: 'var(--topbar-h)',
          minHeight: '100vh',
          transition: 'margin-left .25s cubic-bezier(.4,0,.2,1)',
        }}
      >
        <div className="app-content">
          <Outlet />
        </div>
      </main>

      <ModalRoot />
      <SyncStatusBar />
    </div>
  );
}
