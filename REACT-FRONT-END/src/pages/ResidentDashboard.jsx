import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, ChevronRight, X,
  AlertTriangle, Loader, CheckCircle2, FileText,
  MapPin, Calendar, User, Image as ImageIcon, RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useResidentDashboard } from '../hooks/useTicketApi';
import useAuthStore from '../stores/authStore';
import { useLang } from '../stores/langStore';
import Portal from '../components/Portal';

const STAGES = ['Submitted', 'Under Review', 'In Progress', 'Completed'];

const STATUS_CFG = {
  'Urgent':       { border: '#ef4444', bg: 'rgba(239,68,68,.04)',  badge: 'badge-red',   icon: AlertTriangle, iconColor: '#ef4444' },
  'Under Review': { border: '#d97706', bg: 'rgba(217,119,6,.04)',  badge: 'badge-amber', icon: Loader,        iconColor: '#d97706' },
  'In Progress':  { border: '#d97706', bg: 'rgba(217,119,6,.04)',  badge: 'badge-amber', icon: Loader,        iconColor: '#d97706' },
  'Completed':    { border: '#059669', bg: 'rgba(5,150,105,.04)',  badge: 'badge-green', icon: CheckCircle2,  iconColor: '#059669' },
  'Pending':      { border: '#ef4444', bg: 'rgba(239,68,68,.04)',  badge: 'badge-red',   icon: AlertTriangle, iconColor: '#ef4444' },
  'Rejected':     { border: '#7c3aed', bg: 'rgba(124,58,237,.04)', badge: 'badge-slate', icon: X,             iconColor: '#7c3aed' },
};

const STAGE_MAP = {
  'Pending':      0,
  'Under Review': 1,
  'In Progress':  2,
  'Completed':    3,
};

export default function ResidentDashboard() {
  const navigate = useNavigate();
  const { openModal } = useApp();
  const { user } = useAuthStore();
  const { t } = useLang();
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { data, isLoading, isError, refetch } = useResidentDashboard();

  const tickets  = data?.tickets  || [];
  const summary  = data?.summary  || { requests_submitted: 0, requests_resolved: 0, requests_pending: 0 };
  const firstName = user?.first_name || user?.full_name?.split(' ')[0] || 'there';

  const STATS = [
    { label: t('activeRequests'), value: String(summary.requests_pending),   color: '#2563eb' },
    { label: t('resolved'),       value: String(summary.requests_resolved),  color: '#059669' },
    { label: t('totalTickets'),   value: String(summary.requests_submitted), color: '#0f172a' },
  ];

  // Only show loading spinner on first load (no data yet)
  if (isLoading && !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', animation: 'spin .65s linear infinite' }} />
        <p style={{ fontSize: 13, color: '#94a3b8' }}>{t('loading')}</p>
      </div>
    );
  }

  // Only show error if we have NO data at all (first load failed after all retries)
  if (isError && !data) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: 12 }}>Failed to load dashboard.</p>
        <button onClick={() => refetch()} className="btn btn-brand" style={{ fontSize: 13 }}>
          <RefreshCw size={13} /> {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Hero banner ── */}
      <div style={{ borderRadius: 16, padding: '28px 28px 24px', background: 'linear-gradient(145deg, #060d1a 0%, #0c1f35 40%, #0a2e2a 75%, #071a16 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.055) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: 280, height: 280, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle, rgba(37,99,235,.18) 0%, transparent 70%)', filter: 'blur(2px)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(147,197,253,.75)', marginBottom: 14 }}>
            Barangay San Vicente · {t('residentPortal')}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
            <div>
              <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 400, color: '#fff', lineHeight: 1.15, marginBottom: 6 }}>
                {t('welcome')}, {firstName}!
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'rgba(148,163,184,.8)', lineHeight: 1.6, maxWidth: 420 }}>
                Track your service requests and report new community issues directly to the barangay.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <button
                onClick={() => openModal('info', {
                  title: 'Emergency Hotlines',
                  children: (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { e: '🚨', l: 'Barangay Emergency', v: '911' },
                        { e: '🏥', l: 'Health Center', v: '(02) 8123-4567' },
                        { e: '🚒', l: 'Fire Station', v: '(02) 8765-4321' },
                      ].map((r) => (
                        <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.875rem', color: '#334155' }}>{r.e} {r.l}</span>
                          <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>{r.v}</strong>
                        </div>
                      ))}
                    </div>
                  ),
                })}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, color: '#fff', fontFamily: 'inherit', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)', transition: 'all .18s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.14)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; }}
              >
                <AlertTriangle size={13} /> Emergency
              </button>
            </div>
          </div>

          {/* KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,.09)' }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ padding: '14px 20px', background: 'rgba(255,255,255,.05)', borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,.07)' : 'none' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(148,163,184,.65)', marginBottom: 6 }}>{s.label}</p>
                <p className="font-display" style={{ fontSize: '1.625rem', fontWeight: 400, color: s.color === '#0f172a' ? '#fff' : s.color, lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── My Active Requests ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: '#ffffff', border: '1px solid rgba(226,232,240,.85)', boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(180deg, #fafbfc 0%, #f8fafc 100%)' }}>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{t('myActiveRequests')}</p>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: 2 }}>Sorted by urgency · real-time status</p>
          </div>
          <button onClick={() => navigate('/resident/request')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#fff', fontFamily: 'inherit', background: '#2563eb', boxShadow: '0 2px 6px rgba(37,99,235,.3)', transition: 'all .15s' }}>
            + New Request
          </button>
        </div>

        {tickets.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>{t('noRequestsYet')}</p>
            <button onClick={() => navigate('/resident/request')} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#fff', background: '#2563eb', fontFamily: 'inherit' }}>
              {t('submitFirst')}
            </button>
          </div>
        ) : (
          tickets.filter(tk => tk.status !== 'Completed' && tk.status !== 'Rejected').map((tk, tIdx, arr) => {
            const cfg        = STATUS_CFG[tk.status] || STATUS_CFG['Pending'];
            const StatusIcon = cfg.icon;
            const stageIdx   = STAGE_MAP[tk.status] ?? 0;

            return (
              <div
                key={tk.id}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', borderLeft: `3px solid ${cfg.border}`, background: cfg.bg, borderBottom: tIdx < arr.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', transition: 'filter .12s' }}
                onClick={() => setSelectedTicket(tk)}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(.975)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${cfg.border}18` }}>
                  <StatusIcon size={15} style={{ color: cfg.iconColor }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#2563eb' }}>{tk.tracking_id}</span>
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: 6, background: '#f1f5f9', color: '#64748b' }}>{tk.category}</span>
                    </div>
                    <span className={`badge ${cfg.badge}`} style={{ flexShrink: 0 }}>{tk.status}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.4, marginBottom: 6 }}>{tk.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '11.5px', color: '#94a3b8', marginBottom: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {tk.updated}</span>
                    <span>{tk.location}</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: 5 }}>
                      <span style={{ color: '#94a3b8' }}>Resolution progress</span>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{tk.progress}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: '#e8edf2', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, width: `${tk.progress}%`, background: `linear-gradient(90deg, ${cfg.border}cc, ${cfg.border})`, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
                    </div>
                  </div>
                  {/* Stage stepper */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {STAGES.map((s, i) => {
                      const done = i < stageIdx, active = i === stageIdx;
                      return (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, background: done || active ? cfg.border : '#e8edf2', color: done || active ? '#fff' : '#94a3b8', boxShadow: active ? `0 0 0 3px ${cfg.border}28` : 'none', transition: 'all .2s' }}>
                              {done ? '✓' : i + 1}
                            </div>
                            <p style={{ fontSize: '8.5px', fontWeight: 500, marginTop: 3, textAlign: 'center', lineHeight: 1.2, color: done || active ? cfg.border : '#94a3b8' }}>{s}</p>
                          </div>
                          {i < STAGES.length - 1 && <div style={{ flex: 1, height: 1, margin: '0 4px', marginBottom: 14, borderRadius: 99, background: done ? cfg.border : '#e2e8f0', transition: 'background .3s' }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: '#cbd5e1', flexShrink: 0, marginTop: 4 }} />
              </div>
            );
          })
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 20px', borderTop: '1px solid #f1f5f9', background: 'linear-gradient(180deg, #f8fafc 0%, #f5f7fa 100%)' }}>
          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
            {tickets.filter(tk => tk.status !== 'Completed').length} active requests
          </span>
          <button onClick={() => navigate('/resident/history')} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '11.5px', fontWeight: 600, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <FileText size={12} /> {t('viewAllHistory')}
          </button>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Portal>
          <div onClick={() => setSelectedTicket(null)} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(9,18,32,.65)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn .2s ease-out both' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', border: '1px solid rgba(226,232,240,.9)', borderRadius: 20, boxShadow: '0 4px 8px rgba(15,23,42,.05), 0 24px 56px rgba(15,23,42,.18)', animation: 'scaleIn .22s cubic-bezier(.34,1.56,.64,1) both' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(180deg, #fafbfc, #f8fafc)', borderRadius: '20px 20px 0 0', position: 'sticky', top: 0, zIndex: 1 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>{selectedTicket.tracking_id}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: '#f1f5f9', color: '#64748b' }}>{selectedTicket.category}</span>
                  <span className={`badge ${(STATUS_CFG[selectedTicket.status] || STATUS_CFG['Pending']).badge}`}>{selectedTicket.status}</span>
                </div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{selectedTicket.title}</h2>
              </div>
              <button onClick={() => setSelectedTicket(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#64748b', flexShrink: 0, marginLeft: 12 }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { icon: MapPin,   label: 'Location',    value: selectedTicket.location },
                  { icon: Calendar, label: 'Submitted',   value: selectedTicket.submitted },
                  { icon: User,     label: 'Assigned To', value: selectedTicket.assigned_to?.full_name || 'Unassigned' },
                  { icon: Clock,    label: 'Last Updated', value: selectedTicket.updated },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Icon size={12} style={{ color: '#94a3b8' }} />
                      <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{value}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Description</p>
                <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.65, padding: '12px 14px', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>{selectedTicket.description}</p>
              </div>
              {selectedTicket.field_note && (
                <div style={{ marginBottom: 20, padding: '12px 14px', borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Field Note</p>
                  <p style={{ fontSize: '13px', color: '#78350f' }}>{selectedTicket.field_note}</p>
                </div>
              )}
              {/* Timeline */}
              {selectedTicket.timeline?.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Status History</p>
                  {selectedTicket.timeline.map((tl, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 3, background: i === 0 ? '#2563eb' : '#cbd5e1', boxShadow: i === 0 ? '0 0 0 3px rgba(37,99,235,.2)' : 'none' }} />
                        {i < selectedTicket.timeline.length - 1 && <div style={{ width: 1, flex: 1, background: '#e2e8f0', marginTop: 4 }} />}
                      </div>
                      <div style={{ paddingBottom: 4 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{tl.status}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: 2 }}>{tl.time} · {tl.updated_by || 'System'}</p>
                        {tl.note && <p style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>{tl.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}
