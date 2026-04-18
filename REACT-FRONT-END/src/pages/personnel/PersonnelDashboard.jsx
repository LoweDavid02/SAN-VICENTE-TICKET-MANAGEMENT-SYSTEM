import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Clock, AlertTriangle, MapPin,
  ChevronRight, Zap, TrendingUp, Star, RefreshCw,
} from 'lucide-react';
import { usePersonnelDashboard } from '../../hooks/useTicketApi';
import useAuthStore from '../../stores/authStore';
import { useLang } from '../../stores/langStore';

const STATUS_CFG = {
  'In Progress':  { color: '#d97706', bg: 'rgba(217,119,6,.1)',  dot: '#f59e0b' },
  'Under Review': { color: '#2563eb', bg: 'rgba(37,99,235,.1)',  dot: '#3b82f6' },
  'Pending':      { color: '#ef4444', bg: 'rgba(239,68,68,.1)',  dot: '#ef4444' },
  'Completed':    { color: '#059669', bg: 'rgba(5,150,105,.1)',  dot: '#10b981' },
};

const SEV_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

export default function PersonnelDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useLang();
  const { data, isLoading } = usePersonnelDashboard();

  const summary = data?.summary || { tasks_assigned: 0, tasks_completed: 0, tasks_in_progress: 0, tasks_urgent: 0 };
  const tasks   = data?.tasks   || [];
  const active  = tasks.filter(tk => tk.status !== 'Completed' && tk.status !== 'Rejected');
  const done    = tasks.filter(tk => tk.status === 'Completed');
  const pct     = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0;
  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'there';

  const STATS = [
    { label: 'Assigned',  value: summary.tasks_assigned,   color: '#f59e0b', icon: Clock        },
    { label: 'Completed', value: summary.tasks_completed,  color: '#10b981', icon: CheckCircle2 },
    { label: 'Urgent',    value: summary.tasks_urgent,     color: '#ef4444', icon: AlertTriangle },
    { label: 'Rating',    value: '4.8★',                   color: '#f59e0b', icon: Star         },
  ];

  if (isLoading && !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(255,255,255,.2)', borderTopColor: '#f59e0b', animation: 'spin .65s linear infinite' }} />
        <p style={{ fontSize: 13, color: '#94a3b8' }}>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Hero ── */}
      <div style={{ borderRadius: 16, padding: '24px 28px', background: 'linear-gradient(145deg, #0f172a 0%, #1c1917 50%, #1a1207 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,.18) 0%, transparent 70%)', filter: 'blur(2px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(251,191,36,.7)', marginBottom: 8 }}>
                Field Personnel · {t('personnelPortal')}
              </p>
              <h1 className="font-display" style={{ fontSize: '1.625rem', fontWeight: 400, color: '#fff', lineHeight: 1.15, marginBottom: 4 }}>
                Good morning, {firstName}!
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(148,163,184,.75)', lineHeight: 1.5 }}>
                You have <strong style={{ color: '#fbbf24' }}>{active.length} active tasks</strong> assigned today.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#fff', boxShadow: '0 4px 16px rgba(245,158,11,.4)' }}>
                {firstName.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: 6 }}>
              <span style={{ color: 'rgba(148,163,184,.7)', fontWeight: 600 }}>Today's Progress</span>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>{done.length}/{tasks.length} tasks · {pct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ padding: '12px 14px', background: 'rgba(255,255,255,.04)', borderRight: i < 3 ? '1px solid rgba(255,255,255,.07)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                    <Icon size={11} style={{ color: s.color }} />
                    <p style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(148,163,184,.6)' }}>{s.label}</p>
                  </div>
                  <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: 400, color: s.color, lineHeight: 1 }}>{s.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Active Tasks ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid rgba(226,232,240,.85)', boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(180deg, #fafbfc, #f8fafc)' }}>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{t('activeTasks')}</p>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: 2 }}>{active.length} tasks requiring action</p>
          </div>
          <button onClick={() => navigate('/personnel/tasks')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '11.5px', fontWeight: 700, color: '#fff', fontFamily: 'inherit', background: '#f59e0b', boxShadow: '0 2px 6px rgba(245,158,11,.3)', transition: 'all .15s' }}>
            <Zap size={11} strokeWidth={2.5} /> {t('viewAll')}
          </button>
        </div>

        {active.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <CheckCircle2 size={32} style={{ color: '#10b981', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#94a3b8' }}>{t('allCompleted')}</p>
          </div>
        ) : (
          active.slice(0, 5).map((tk, idx) => {
            const sc = STATUS_CFG[tk.status] || STATUS_CFG['Pending'];
            return (
              <div key={tk.id} onClick={() => navigate('/personnel/tasks')} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 20px', borderLeft: `3px solid ${sc.dot}`, background: sc.bg, borderBottom: idx < active.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', transition: 'filter .12s' }} onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(.97)'; }} onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: SEV_COLOR[tk.severity], flexShrink: 0, marginTop: 6 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#f59e0b' }}>{tk.tracking_id}</span>
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: 5, background: '#f1f5f9', color: '#64748b' }}>{tk.severity}</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: sc.bg, color: sc.color, border: `1px solid ${sc.dot}30`, flexShrink: 0 }}>{tk.status}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: 4, lineHeight: 1.35 }}>{tk.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '11.5px', color: '#94a3b8' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{tk.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{tk.updated}</span>
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: '#cbd5e1', flexShrink: 0, marginTop: 4 }} />
              </div>
            );
          })
        )}

        <div style={{ padding: '10px 20px', borderTop: '1px solid #f1f5f9', background: 'linear-gradient(180deg, #f8fafc, #f5f7fa)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>{done.length} completed today</span>
          <button onClick={() => navigate('/personnel/tasks')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '11.5px', fontWeight: 600, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <TrendingUp size={12} /> {t('viewCompleted')}
          </button>
        </div>
      </div>

      {/* Branding */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e8edf2' }}>
        <div>
          <p style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>Barangay Connect</p>
          <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: 1 }}>Personnel Portal · v4.2.1-stable</p>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: 'rgba(5,150,105,.08)', color: '#059669', border: '1px solid rgba(5,150,105,.15)' }}>{t('onDuty')}</span>
      </div>
    </div>
  );
}
