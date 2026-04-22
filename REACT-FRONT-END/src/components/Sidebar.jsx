import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BarChart2, Users, FileText,
  Settings, Plus, ChevronRight,
  Home, ChevronLeft, ClipboardList, History,
  HelpCircle, PlusCircle,
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
  const { sidebarCollapsed, setSidebarCollapsed, user } = useApp();
  const { t } = useT();
  const navigate = useNavigate();

  const isAdmin     = portalType === 'admin';
  const isPersonnel = portalType === 'personnel';

  // Nav items built with translated labels — rebuilds on lang change
  const ADMIN_NAV = [
    { to: '/admin/dashboard', label: t('dashboard'),   icon: LayoutDashboard },
    { to: '/admin/analytics', label: t('analytics'),   icon: BarChart2       },
    { to: '/admin/personnel', label: t('personnel'),   icon: Users           },
    { to: '/admin/tickets',   label: t('requests'),    icon: FileText        },
    { to: '/admin/settings',  label: t('settings'),    icon: Settings        },
    { to: '/admin/faq',       label: t('faqs'),        icon: HelpCircle      },
  ];
  const RESIDENT_NAV = [
    { to: '/resident/dashboard', label: t('myDashboard'),   icon: Home        },
    { to: '/resident/request',   label: t('submitRequest'), icon: PlusCircle  },
    { to: '/resident/history',   label: t('myHistory'),     icon: History     },
    { to: '/resident/faq',       label: t('faqs'),          icon: HelpCircle  },
  ];
  const PERSONNEL_NAV = [
    { to: '/personnel/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { to: '/personnel/tasks',     label: t('myTasks'),   icon: ClipboardList   },
    { to: '/personnel/history',   label: t('history'),   icon: History         },
    { to: '/personnel/faq',       label: t('faqs'),      icon: HelpCircle      },
  ];

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

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="sidebar"
        style={{ width: w, background: 'var(--sidebar-bg)', minHeight: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', zIndex: 100, borderRight: '1px solid var(--sidebar-border)', overflow: 'hidden', ...activeStyle }}
      >
        {/* Brand */}
        <div style={{ padding: '16px 12px 14px', borderBottom: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* San Vicente logo — always visible */}
            <div style={{ flexShrink: 0, lineHeight: 0 }}>
              <SanVicenteLogo size={sidebarCollapsed ? 36 : 38} />
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-label">
                <p style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{portalLabel}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>{portalSub}</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav section label */}
        {!sidebarCollapsed && (
          <div style={{ padding: '16px 18px 6px' }}>
            <p className="section-label" style={{ color: 'rgba(255,255,255,.22)' }}>{navSectionLabel}</p>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '6px 8px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(({ to, label, icon: NavIcon }) => (
            <NavLink
              key={to}
              to={to}
              title={sidebarCollapsed ? label : undefined}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              style={sidebarCollapsed ? { justifyContent: 'center', padding: '11px' } : { padding: '10px 12px' }}
            >
              <NavIcon size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              {!sidebarCollapsed && <span className="sidebar-label" style={{ fontSize: 13 }}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* New Report (admin only) */}
        {isAdmin && (
          <div style={{ padding: '0 8px 12px', flexShrink: 0 }}>
            {sidebarCollapsed ? (
              <button onClick={() => navigate('/admin/tickets')} title={t('newReport')} className="btn btn-brand" style={{ width: '100%', justifyContent: 'center', padding: '10px 0' }}>
                <Plus size={15} strokeWidth={2.5} />
              </button>
            ) : (
              <button onClick={() => navigate('/admin/tickets')} className="btn btn-brand" style={{ width: '100%', justifyContent: 'center', padding: '10px 0', fontSize: 13 }}>
                <Plus size={15} strokeWidth={2.5} /> {t('newReport')}
              </button>
            )}
          </div>
        )}

        {/* User footer */}
        <div style={{ borderTop: '1px solid var(--sidebar-border)', padding: sidebarCollapsed ? '14px 8px' : '14px 14px', display: 'flex', alignItems: 'center', gap: sidebarCollapsed ? 0 : 10, flexShrink: 0, justifyContent: sidebarCollapsed ? 'center' : 'flex-start', marginTop: 'auto' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: meta.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: meta.avatarColor, flexShrink: 0, overflow: 'hidden' }}>
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
              <button onClick={() => setSidebarCollapsed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'rgba(255,255,255,.25)', flexShrink: 0 }} title="Collapse sidebar">
                <ChevronLeft size={14} />
              </button>
            </>
          )}
          {sidebarCollapsed && (
            <button onClick={() => setSidebarCollapsed(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(255,255,255,.25)' }} title="Expand sidebar">
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="mobile-bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, background: 'var(--sidebar-bg)', borderTop: '1px solid var(--sidebar-border)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {nav.map(({ to, label, icon: NavIcon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 4px 8px', gap: 4, color: isActive ? 'var(--brand)' : 'rgba(255,255,255,.4)', textDecoration: 'none', transition: 'color .15s', fontSize: '10px', fontWeight: 600, borderTop: isActive ? '2px solid var(--brand)' : '2px solid transparent' })}>
            <NavIcon size={20} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <button onClick={() => navigate('/admin/tickets')} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 4px 8px', gap: 4, color: 'rgba(255,255,255,.4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', fontWeight: 600, fontFamily: 'inherit', borderTop: '2px solid transparent' }}>
            <Plus size={20} strokeWidth={1.8} />
            <span>{t('add')}</span>
          </button>
        )}
      </nav>
    </>
  );
}
