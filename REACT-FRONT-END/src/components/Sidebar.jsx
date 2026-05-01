import { useEffect, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BarChart2, Users, FileText,
  Settings, Plus, ChevronRight,
  Home, ChevronLeft, ClipboardList, History,
  HelpCircle, PlusCircle, X, Bell, User, LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../stores/langStore';
import SanVicenteLogo from './SanVicenteLogo';

const PORTAL_META = {
  admin:     { avatarBg: 'rgba(20,184,166,.2)',  avatarColor: 'var(--brand)' },
  resident:  { avatarBg: 'rgba(37,99,235,.25)',  avatarColor: '#93c5fd'      },
  personnel: { avatarBg: 'rgba(245,158,11,.25)', avatarColor: '#fbbf24'      },
};

export default function Sidebar({ portalType }) {
  const {
    sidebarCollapsed, setSidebarCollapsed,
    mobileDrawerOpen, setMobileDrawerOpen,
    user, unreadCount, openModal, logout,
  } = useApp();
  const { t } = useT();
  const navigate  = useNavigate();
  const location  = useLocation();

  const isAdmin     = portalType === 'admin';
  const isPersonnel = portalType === 'personnel';

  // Close drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname, setMobileDrawerOpen]);

  // Nav items — memoized so they don't rebuild on every render
  const ADMIN_NAV = useMemo(() => [
    { to: '/admin/dashboard', label: t('dashboard'),   icon: LayoutDashboard },
    { to: '/admin/analytics', label: t('analytics'),   icon: BarChart2       },
    { to: '/admin/personnel', label: t('personnel'),   icon: Users           },
    { to: '/admin/tickets',   label: t('requests'),    icon: FileText        },
    { to: '/admin/settings',  label: t('settings'),    icon: Settings        },
    { to: '/admin/faq',       label: t('faqs'),        icon: HelpCircle      },
  ], [t]);

  const RESIDENT_NAV = useMemo(() => [
    { to: '/resident/dashboard', label: t('myDashboard'),   icon: Home        },
    { to: '/resident/request',   label: t('submitRequest'), icon: PlusCircle  },
    { to: '/resident/history',   label: t('myHistory'),     icon: History     },
    { to: '/resident/faq',       label: t('faqs'),          icon: HelpCircle  },
  ], [t]);

  const PERSONNEL_NAV = useMemo(() => [
    { to: '/personnel/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/personnel/tasks',     label: t('myTasks'),   icon: ClipboardList   },
    { to: '/personnel/history',   label: t('history'),   icon: History         },
    { to: '/personnel/faq',       label: t('faqs'),      icon: HelpCircle      },
  ], [t]);

  const nav = isAdmin ? ADMIN_NAV : isPersonnel ? PERSONNEL_NAV : RESIDENT_NAV;

  const displayName = user?.full_name || user?.name || 'User';
  const roleLabel   = user?.role || portalType;
  const initials    = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const meta        = PORTAL_META[portalType] || PORTAL_META.resident;

  const portalLabel = isAdmin
    ? t('adminPortal')
    : isPersonnel
    ? t('personnelPortal')
    : t('residentPortal');

  const portalSub = isAdmin
    ? t('systemOversight')
    : isPersonnel
    ? t('fieldOperations')
    : t('barangaySanVicente');

  const navSectionLabel = isAdmin
    ? 'Main Menu'
    : isPersonnel
    ? t('fieldOperations')
    : 'Services';

  const w = sidebarCollapsed ? 'var(--sidebar-w-sm)' : 'var(--sidebar-w)';
  const activeStyle = isPersonnel ? { '--sidebar-active': 'rgba(245,158,11,.15)', '--brand': '#f59e0b' } : {};

  const profilePath = isAdmin
    ? '/admin/profile'
    : isPersonnel
    ? '/personnel/profile'
    : '/resident/profile';

  const notifPath = isAdmin
    ? '/admin/notifications'
    : isPersonnel
    ? '/personnel/notifications'
    : '/resident/notifications';

  /* ── Shared nav link renderer ── */
  const NavItem = ({ to, label, icon: NavIcon, onClick, collapsed }) => (
    <NavLink
      key={to}
      to={to}
      onClick={(e) => {
        // Allow navigation but prevent sidebar toggle
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
      title={collapsed ? label : undefined}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      style={collapsed ? { 
        justifyContent: 'center', 
        padding: '11px', 
        position: 'relative', 
        zIndex: 3,
        pointerEvents: 'auto', // Re-enable clicks for nav items
      } : { 
        padding: '10px 12px', 
        position: 'relative', 
        zIndex: 3,
        pointerEvents: 'auto', // Re-enable clicks for nav items
      }}
    >
      <NavIcon size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
      {!collapsed && <span className="sidebar-label" style={{ fontSize: 13 }}>{label}</span>}
    </NavLink>
  );

  return (
    <>
      {/* ══════════════════════════════════════════
          DESKTOP SIDEBAR (hidden on mobile via CSS)
      ══════════════════════════════════════════ */}
      <aside
        className="sidebar"
        style={{
          width: w,
          background: 'var(--sidebar-bg)',
          minHeight: '100vh',
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          borderRight: '1px solid var(--sidebar-border)',
          overflow: 'hidden',
          ...activeStyle,
        }}
      >
        {/* Clickable overlay for toggling - covers entire sidebar */}
        <div
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            cursor: 'pointer',
            // Subtle visual feedback on hover
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title={sidebarCollapsed ? 'Click to expand sidebar' : 'Click to collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        />

        {/* Brand */}
        <div style={{ padding: '16px 12px 14px', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flexShrink: 0, lineHeight: 0, pointerEvents: 'none' }}>
              <SanVicenteLogo size={sidebarCollapsed ? 36 : 38} />
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-label" style={{ flex: 1, minWidth: 0, pointerEvents: 'none' }}>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{portalLabel}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{portalSub}</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav section label */}
        {!sidebarCollapsed && (
          <div style={{ padding: '16px 18px 6px', position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
            <p className="section-label" style={{ color: 'rgba(255,255,255,.22)' }}>{navSectionLabel}</p>
          </div>
        )}

        {/* Nav items */}
        <nav
          role="navigation"
          aria-label="Main navigation"
          style={{ 
            flex: 1, 
            padding: '6px 8px 8px', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            position: 'relative', 
            zIndex: 2,
            pointerEvents: 'none', // Allow clicks to pass through empty areas
          }}
        >
          {nav.map(({ to, label, icon: NavIcon }) => (
            <NavItem key={to} to={to} label={label} icon={NavIcon} collapsed={sidebarCollapsed} />
          ))}
        </nav>

        {/* New Report (admin only) */}
        {isAdmin && (
          <div style={{ padding: '0 8px 12px', flexShrink: 0, position: 'relative', zIndex: 2, pointerEvents: 'none' }}>
            {sidebarCollapsed ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/admin/tickets');
                }}
                title={t('newReport')}
                className="btn btn-brand"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 0', position: 'relative', zIndex: 3, pointerEvents: 'auto' }}
              >
                <Plus size={15} strokeWidth={2.5} />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/admin/tickets');
                }}
                className="btn btn-brand"
                style={{ width: '100%', justifyContent: 'center', padding: '10px 0', fontSize: 13, position: 'relative', zIndex: 3, pointerEvents: 'auto' }}
              >
                <Plus size={15} strokeWidth={2.5} /> {t('newReport')}
              </button>
            )}
          </div>
        )}

        {/* User footer */}
        <div style={{
          borderTop: '1px solid var(--sidebar-border)',
          padding: sidebarCollapsed ? '14px 8px' : '14px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: sidebarCollapsed ? 0 : 10,
          flexShrink: 0,
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          marginTop: 'auto',
          position: 'relative',
          zIndex: 2,
          pointerEvents: 'none', // Allow clicks to pass through
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: meta.avatarBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: meta.avatarColor,
            flexShrink: 0, overflow: 'hidden',
          }}>
            {user?.avatar
              ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          {!sidebarCollapsed && (
            <>
              <div className="sidebar-label" style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</p>
                <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,.3)' }}>{roleLabel}</p>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          MOBILE DRAWER (slide-in from left)
      ══════════════════════════════════════════ */}
      <div
        className={`mobile-drawer${mobileDrawerOpen ? ' mobile-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{ ...activeStyle }}
      >
        {/* Drawer header: logo + close */}
        <div className="mobile-drawer__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SanVicenteLogo size={36} />
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{portalLabel}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{portalSub}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="mobile-drawer__close"
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile section */}
        <div className="mobile-drawer__profile">
          <div className="mobile-drawer__avatar" style={{ background: meta.avatarBg, color: meta.avatarColor }}>
            {user?.avatar
              ? <img src={user.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 2, textTransform: 'capitalize' }}>{roleLabel}</p>
          </div>
        </div>

        {/* Nav section label */}
        <div style={{ padding: '12px 16px 4px' }}>
          <p className="section-label" style={{ color: 'rgba(255,255,255,.22)' }}>{navSectionLabel}</p>
        </div>

        {/* Nav items */}
        <nav
          role="navigation"
          aria-label="Mobile navigation"
          style={{ flex: 1, padding: '4px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {nav.map(({ to, label, icon: NavIcon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              style={{ padding: '12px 14px', fontSize: 14 }}
            >
              <NavIcon size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </NavLink>
          ))}

          {/* Admin: new report */}
          {isAdmin && (
            <button
              onClick={() => { navigate('/admin/tickets'); setMobileDrawerOpen(false); }}
              className="nav-item"
              style={{ padding: '12px 14px', fontSize: 14, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
            >
              <Plus size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <span>{t('newReport')}</span>
            </button>
          )}
        </nav>

        {/* Drawer footer actions */}
        <div className="mobile-drawer__footer">
          <button
            onClick={() => { navigate(notifPath); setMobileDrawerOpen(false); }}
            className="mobile-drawer__action"
            aria-label={t('notifications')}
          >
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <Bell size={18} strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  minWidth: 16, height: 16, borderRadius: 99,
                  background: '#ef4444', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                  border: '2px solid var(--sidebar-bg)',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span>{t('notifications')}</span>
          </button>

          <button
            onClick={() => { navigate(profilePath); setMobileDrawerOpen(false); }}
            className="mobile-drawer__action"
            aria-label={t('profile')}
          >
            <User size={18} strokeWidth={1.8} />
            <span>{t('profile')}</span>
          </button>

          <button
            onClick={() => {
              setMobileDrawerOpen(false);
              openModal('logout', {
                onConfirm: async () => { await logout(); }
              });
            }}
            className="mobile-drawer__action mobile-drawer__action--danger"
            aria-label={t('signOut')}
          >
            <LogOut size={18} strokeWidth={1.8} />
            <span>{t('signOut')}</span>
          </button>
        </div>
      </div>

    </>
  );
}
