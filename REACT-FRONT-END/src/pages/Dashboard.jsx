import { useState } from 'react';
import { Lightbulb, X, MapPin, Clock, User, Tag, RefreshCw } from 'lucide-react';
import { StatCard, WorkloadBar, IncidentRow, SectionHeader } from '../components/ui/Components';
import { StatusBadge, SeverityBadge } from '../components/ui/Components';
import { useAdminDashboard } from '../hooks/useTicketApi';
import { kpiData, departments, heatmapZones } from '../data/mockData';
import { useT } from '../stores/langStore';
import Portal from '../components/Portal';

const HEAT_BG = [
  'rgba(20,184,166,.12)', 'rgba(20,184,166,.28)',
  'rgba(20,184,166,.48)', 'rgba(20,184,166,.68)', 'rgba(20,184,166,.88)',
];
const HEAT_FG = ['#0d9488', '#0f766e', '#fff', '#fff', '#fff'];

const SEV_BG = {
  High:   'rgba(239,68,68,.1)',
  Medium: 'rgba(245,158,11,.1)',
  Low:    'rgba(16,185,129,.1)',
};

export default function Dashboard() {
  const [zone,     setZone]     = useState(null);
  const [incident, setIncident] = useState(null);
  const { t } = useT();

  const { data, isLoading, refetch } = useAdminDashboard();

  const stats   = data?.stats   || {};
  const tickets = data?.tickets || [];

  // Build KPI cards from real data
  const kpis = [
    { label: t('totalTickets'),    value: stats.total_tickets    ?? kpiData.totalTickets.value,    change: '+12.5%', trend: 'up',   note: 'vs last month',  delay: 0   },
    { label: t('pendingUrgent'),   value: stats.urgent_tickets   ?? kpiData.pendingUrgent.value,   note: 'Requires immediate attention', accent: 'var(--red)', delay: 75  },
    { label: t('inProgress'),      value: stats.in_progress      ?? 0,                             change: '',       trend: 'up',   note: 'active now',     delay: 150 },
    { label: t('activePersonnel'), value: stats.total_personnel  ?? kpiData.activePersonnel.value, change: '',       trend: 'up',   note: 'registered',     delay: 225 },
  ];

  // Use real tickets as incidents, fall back to mock
  const incidents = tickets.slice(0, 6).map(tk => ({
    id:         tk.tracking_id,
    title:      tk.title,
    time:       tk.updated,
    severity:   tk.severity,
    status:     tk.status,
    assignedTo: tk.assigned_to?.full_name || 'Unassigned',
    category:   tk.category,
    icon:       tk.severity === 'High' ? '🚨' : tk.severity === 'Medium' ? '⚠️' : '📋',
    ...tk,
  }));

  if (isLoading && !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#14b8a6', animation: 'spin .65s linear infinite' }} />
        <p style={{ fontSize: 13, color: '#94a3b8' }}>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 16, gap: 8 }}>
        <button onClick={() => refetch()} className="btn btn-ghost" style={{ fontSize: 11, gap: 5, padding: '4px 10px' }}>
          <RefreshCw size={11} /> {t('refresh')}
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} change={k.change} trend={k.trend} note={k.note} accent={k.accent} delay={k.delay} />
        ))}
      </div>

      {/* Heatmap + Workload */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card animate-fade-up" style={{ padding: 24, animationDelay: '100ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{t('issueHeatmap')}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 3 }}>Geographical distribution of reported incidents</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 7, marginBottom: 16 }}>
            {heatmapZones.map((z) => (
              <button key={z.zone} onClick={() => setZone(zone?.zone === z.zone ? null : z)} title={z.label}
                style={{ aspectRatio: '1', borderRadius: 10, border: 'none', background: HEAT_BG[z.intensity - 1], color: HEAT_FG[z.intensity - 1], display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 2, outline: zone?.zone === z.zone ? '2px solid var(--brand)' : '2px solid transparent', outlineOffset: 2, transition: 'transform .12s, outline .1s', fontFamily: 'var(--font-sans)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.07)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
              >
                <span style={{ fontSize: 12, fontWeight: 700 }}>{z.zone}</span>
                <span style={{ fontSize: 9.5, fontWeight: 500, opacity: .8 }}>{z.count}</span>
              </button>
            ))}
          </div>
          {zone && (
            <div className="animate-fade-up" style={{ marginTop: 12, padding: '10px 14px', background: 'var(--brand-muted)', borderRadius: 'var(--radius)', border: '1px solid rgba(20,184,166,.2)' }}>
              <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--brand)' }}>{zone.label}</p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{zone.count} active tickets this month</p>
            </div>
          )}
        </div>

        <div className="card animate-fade-up" style={{ padding: 24, animationDelay: '175ms' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 4 }}>{t('deptWorkload')}</h2>
          <p style={{ fontSize: 12, color: 'var(--text-4)', marginBottom: 22 }}>Active task distribution by sector</p>
          {departments.map((d) => <WorkloadBar key={d.name} dept={d} />)}
          <div style={{ marginTop: 8, padding: '12px 14px', background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 'var(--radius)', display: 'flex', gap: 10 }}>
            <Lightbulb size={15} color="var(--amber)" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--amber)' }}>Optimization Alert:</strong> Social Services is at near-full capacity.
            </p>
          </div>
        </div>
      </div>

      {/* Incident Log — real tickets */}
      <div className="card animate-fade-up" style={{ padding: 24, animationDelay: '250ms' }}>
        <SectionHeader
          title={t('incidentLog')}
          sub={`Live feed of service requests — ${tickets.length} total`}
          action={t('export')}
          onAction={() => {}}
        />
        {incidents.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-4)', padding: '24px 0', fontSize: 13 }}>{t('noTickets')} Residents can submit requests from their portal.</p>
        ) : (
          incidents.map((inc) => (
            <IncidentRow key={inc.id} incident={inc} onClick={() => setIncident(inc)} />
          ))
        )}
      </div>

      {/* Incident Detail Modal */}
      {incident && (
        <Portal>
          <div onClick={() => setIncident(null)} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(9,18,32,.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn .2s ease-out both' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 520, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, boxShadow: '0 4px 8px rgba(15,23,42,.06), 0 24px 56px rgba(15,23,42,.2)', overflow: 'hidden', animation: 'scaleIn .22s cubic-bezier(.34,1.56,.64,1) both' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: SEV_BG[incident.severity] || SEV_BG.Low, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {incident.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11.5, fontWeight: 700, color: 'var(--brand)' }}>{incident.id}</span>
                    <SeverityBadge severity={incident.severity} />
                    <StatusBadge status={incident.status} />
                  </div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3 }}>{incident.title}</h2>
                </div>
              </div>
              <button onClick={() => setIncident(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-3)', color: 'var(--text-3)', flexShrink: 0 }}><X size={15} /></button>
            </div>
            <div style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { icon: Tag,   label: 'Category',   value: incident.category   },
                  { icon: Clock, label: 'Reported',    value: incident.time       },
                  { icon: User,  label: 'Assigned To', value: incident.assignedTo },
                  { icon: MapPin,label: 'Location',    value: incident.location || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Icon size={12} style={{ color: 'var(--text-4)' }} />
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{value}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setIncident(null)} style={{ padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit', background: 'var(--surface-3)', color: 'var(--text-2)', border: '1px solid var(--border)', transition: 'all .15s' }}>Close</button>
              </div>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}
