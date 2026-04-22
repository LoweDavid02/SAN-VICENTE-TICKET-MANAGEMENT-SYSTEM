/**
 * Notifications — Full notifications page for all portals.
 * Shared across admin, resident, and personnel portals.
 * Shows all notifications with click-to-navigate behaviour.
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, AlertTriangle, CheckCircle, Info, ArrowRight, CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../stores/langStore';

const NOTIF_ICON = {
  danger:  { icon: AlertTriangle, bg: 'rgba(239,68,68,.1)',   color: '#ef4444' },
  warning: { icon: AlertTriangle, bg: 'rgba(245,158,11,.1)',  color: '#f59e0b' },
  success: { icon: CheckCircle,   bg: 'rgba(16,185,129,.1)',  color: '#10b981' },
  info:    { icon: Info,          bg: 'rgba(59,130,246,.1)',  color: '#3b82f6' },
};

const TYPE_LABEL = {
  danger:  { label: 'Urgent',  bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  warning: { label: 'Warning', bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  success: { label: 'Success', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  info:    { label: 'Info',    bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
};

export default function Notifications() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { t }     = useT();
  const { notifications, markRead, markAllRead, unreadCount } = useApp();

  // Determine current portal from URL
  const portal = location.pathname.split('/')[1] || 'admin';

  // Filter notifications relevant to this portal (show all if no portal field)
  const visible = notifications.filter(
    (n) => !n.portal || n.portal === portal
  );

  const handleClick = (n) => {
    markRead(n.id);
    if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} style={{ color: 'var(--brand)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
              {t('notifications')}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-4)', marginTop: 2 }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-2)',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
          >
            <CheckCheck size={14} /> {t('markAllRead')}
          </button>
        )}
      </div>

      {/* ── Notification list ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(15,23,42,.05)' }}>

        {visible.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={22} style={{ color: 'var(--text-4)' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)' }}>No notifications yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-4)' }}>You're all caught up! New alerts will appear here.</p>
          </div>
        ) : (
          visible.map((n, idx) => {
            const cfg  = NOTIF_ICON[n.type] || NOTIF_ICON.info;
            const tag  = TYPE_LABEL[n.type] || TYPE_LABEL.info;
            const Icon = cfg.icon;
            const isLast = idx === visible.length - 1;

            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '16px 20px',
                  borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  background: n.read ? 'transparent' : 'var(--surface-2)',
                  cursor: n.link ? 'pointer' : 'default',
                  transition: 'background .12s',
                  borderLeft: `3px solid ${n.read ? 'transparent' : cfg.color}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = n.read ? 'transparent' : 'var(--surface-2)'; }}
              >
                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Icon size={17} color={cfg.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <p style={{ fontSize: 14, fontWeight: n.read ? 500 : 700, color: 'var(--text-1)', lineHeight: 1.3 }}>
                        {n.title}
                      </p>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                        background: tag.bg, color: tag.color, border: `1px solid ${tag.border}`,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {tag.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {!n.read && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: 11.5, color: 'var(--text-4)', whiteSpace: 'nowrap' }}>{n.time}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.55 }}>{n.body}</p>

                  {n.link && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>View details</span>
                      <ArrowRight size={12} style={{ color: 'var(--brand)' }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
