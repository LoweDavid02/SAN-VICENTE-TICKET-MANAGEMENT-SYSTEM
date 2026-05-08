import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, X, AlertTriangle, CheckCircle, Info, User, ChevronRight, Globe, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../stores/langStore';

const NOTIF_ICON = {
  danger:  { icon: AlertTriangle, bg: 'rgba(239,68,68,.1)',   color: '#ef4444' },
  warning: { icon: AlertTriangle, bg: 'rgba(245,158,11,.1)',  color: '#f59e0b' },
  success: { icon: CheckCircle,   bg: 'rgba(16,185,129,.1)',  color: '#10b981' },
  info:    { icon: Info,          bg: 'rgba(59,130,246,.1)',  color: '#3b82f6' },
};

export default function Topbar({ sidebarWidth }) {
  const { notifications, unreadCount, markAllRead, markRead, user, openModal, logout, mobileDrawerOpen, setMobileDrawerOpen } = useApp();
  const { t, lang, setLang } = useT();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);
  const notifRef = useRef(null);
  const userRef  = useRef(null);

  // Page titles — translated
  const PAGE_META = {
    '/admin/dashboard':     { title: t('barangaySanVicente'),  sub: 'Real-time Operations Analytics'         },
    '/admin/analytics':     { title: t('analytics'),           sub: 'Ticket trends and performance metrics'  },
    '/admin/personnel':     { title: t('personnel'),           sub: 'Manage field staff and duty rosters'    },
    '/admin/tickets':       { title: t('requests'),            sub: 'All citizen-submitted service requests' },
    '/admin/settings':      { title: t('settings'),            sub: 'System configuration and preferences'   },
    '/admin/profile':       { title: t('profile'),             sub: 'Account information and preferences'    },
    '/admin/faq':           { title: t('faqs'),                sub: 'Frequently asked questions'             },
    '/resident/dashboard':  { title: t('myDashboard'),         sub: 'Your active service requests'           },
    '/resident/request':    { title: t('submitRequest'),       sub: 'Report a community issue'               },
    '/resident/profile':    { title: t('profile'),             sub: 'Account information and preferences'    },
    '/resident/faq':        { title: t('faqs'),                sub: 'Frequently asked questions'             },
    '/resident/history':    { title: t('requestHistory'),      sub: 'All your submitted service requests'    },
    '/personnel/dashboard': { title: 'Field Dashboard',        sub: 'Your assigned tasks and progress'       },
    '/personnel/tasks':     { title: t('myTasks'),             sub: 'Assigned service requests for today'    },
    '/personnel/history':   { title: t('history'),             sub: 'Completed field activity archive'       },
    '/personnel/profile':   { title: t('profile'),             sub: 'Personnel account information'          },
    '/personnel/faq':       { title: t('faqs'),                sub: 'Frequently asked questions'             },
    '/admin/notifications':     { title: t('notifications'), sub: 'All system alerts and updates'          },
    '/admin/map':               { title: 'Complaint Map',    sub: 'Geospatial view of all service requests' },
    '/resident/notifications':  { title: t('notifications'), sub: 'Your service request updates'           },
    '/personnel/notifications': { title: t('notifications'), sub: 'Task assignments and status updates'    },
  };

  const meta        = PAGE_META[location.pathname] || { title: 'Portal', sub: '' };
  const displayName = user?.full_name || user?.name || 'User';
  const initials    = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const isResident  = location.pathname.startsWith('/resident');
  const isPersonnel = location.pathname.startsWith('/personnel');
  const profilePath = isResident ? '/resident/profile' : isPersonnel ? '/personnel/profile' : '/admin/profile';

  useEffect(() => {
    const fn = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <header className="topbar" style={{ left: sidebarWidth }}>
      {/* Burger menu — visible on mobile/tablet only */}
      <button
        className="topbar-burger"
        onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
        aria-label={mobileDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={mobileDrawerOpen}
        aria-controls="mobile-drawer"
      >
        <Menu size={20} strokeWidth={2} />
      </button>

      {/* Title */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.2 }}>{meta.title}</h1>
        {meta.sub && <p style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 2 }}>{meta.sub}</p>}
      </div>

      {/* Live indicator */}
      <div className="topbar-live" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 500, color: 'var(--text-3)', background: 'var(--surface-2)', cursor: 'default', whiteSpace: 'nowrap' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0 }} />
        Live · v4.2.1
      </div>

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === 'en' ? 'tl' : 'en')}
        className="btn btn-ghost"
        title={lang === 'en' ? t('switchToFilipino') : t('switchToEnglish')}
        style={{ height: 36, padding: '0 10px', borderRadius: 'var(--radius)', gap: 5, fontSize: 11, fontWeight: 700, color: 'var(--brand)', border: '1px solid var(--border)' }}
      >
        <Globe size={13} />
        {lang === 'en' ? 'EN' : 'TL'}
      </button>

      {/* Notifications */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={notifRef}>
        <button onClick={() => { setNotifOpen((s) => !s); setUserOpen(false); }} className="btn btn-ghost" style={{ width: 36, height: 36, padding: 0, justifyContent: 'center', borderRadius: 'var(--radius)', position: 'relative' }} aria-label="Notifications">
          <Bell size={15} />
          {unreadCount > 0 && <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '2px solid var(--surface)' }} />}
        </button>

        {notifOpen && (
          <div className="notif-dropdown">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{t('notifications')}</span>
                {unreadCount > 0 && <span className="badge badge-red">{unreadCount} new</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={markAllRead} className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }}>{t('markAllRead')}</button>
                <button onClick={() => setNotifOpen(false)} className="btn btn-ghost" style={{ width: 28, height: 28, padding: 0, justifyContent: 'center' }}><X size={13} /></button>
              </div>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.map((n) => {
                const cfg  = NOTIF_ICON[n.type] || NOTIF_ICON.info;
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      markRead(n.id);
                      if (n.link) {
                        setNotifOpen(false);
                        navigate(n.link);
                      }
                    }}
                    style={{ display: 'flex', gap: 12, padding: '13px 16px', borderBottom: '1px solid var(--border)', background: n.read ? 'transparent' : 'var(--surface-2)', cursor: n.link ? 'pointer' : 'default', transition: 'background .12s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = n.read ? 'transparent' : 'var(--surface-2)'; }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} color={cfg.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: n.read ? 500 : 600, color: 'var(--text-1)', lineHeight: 1.4 }}>{n.title}</p>
                        {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0, marginTop: 4 }} />}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 2 }}>{n.body}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 3 }}>{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: '1px solid var(--border)', position: 'sticky', bottom: 0, background: 'var(--surface)', zIndex: 10 }}>
              <span
                onClick={() => {
                  setNotifOpen(false);
                  // Navigate to the notifications page for the current portal
                  const portal = location.pathname.split('/')[1] || 'admin';
                  navigate(`/${portal}/notifications`);
                }}
                style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}
              >
                {t('viewAll_notif')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div style={{ position: 'relative' }} ref={userRef}>
        <button onClick={() => { setUserOpen((v) => !v); setNotifOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'transparent', cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
            {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{displayName.split(' ')[0]}</span>
        </button>

        {userOpen && (
          <div className="animate-slide-down" style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 210, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', zIndex: 50, overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{displayName}</p>
              <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{user?.email}</p>
            </div>
            <button onClick={() => { navigate(profilePath); setUserOpen(false); }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User size={13} /> {t('profile')}</span>
              <ChevronRight size={12} style={{ color: 'var(--text-4)' }} />
            </button>
            <div style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => {
                  setUserOpen(false);
                  openModal('logout', {
                    onConfirm: async () => {
                      await logout();
                      // preloader is shown by authStore.logout()
                      // App.jsx AppRoutes handles navigation when preloader finishes
                    }
                  });
                }}
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', borderRadius: 0, color: 'var(--red)' }}
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
