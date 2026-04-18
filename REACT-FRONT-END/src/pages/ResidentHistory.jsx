import { useState } from 'react';
import { CheckCircle2, Clock, MapPin, Search, AlertTriangle, Loader, X } from 'lucide-react';
import Portal from '../components/Portal';

const ALL_HISTORY = [
  { id: 'SVR-001', title: 'Streetlight Outage on Main St',    category: 'Infrastructure', severity: 'High',   status: 'In Progress',  location: 'Main Street, Zone A',       submitted: 'Apr 10, 2025', updated: '2 hrs ago',  progress: 65,  description: 'Streetlight at corner of Main St. has been out for 3 days. It creates a safety hazard at night for pedestrians and motorists.' },
  { id: 'SVR-002', title: 'Pothole Near Community Center',    category: 'Road Damage',    severity: 'Medium', status: 'Under Review', location: 'Purok 3, Community Center', submitted: 'Apr 14, 2025', updated: '30 min ago', progress: 30,  description: 'Large pothole approximately 1 meter wide near the entrance of the Community Center. Vehicles have been damaged.' },
  { id: 'SVR-003', title: 'Drainage Overflow — Rizal St.',    category: 'Drainage',       severity: 'High',   status: 'Pending',      location: 'Rizal Street, Zone B',      submitted: 'Apr 14, 2025', updated: 'Just now',   progress: 10,  description: 'Drainage canal overflowing after heavy rain. Water is flooding the road and nearby homes.' },
  { id: 'SVR-H01', title: 'Broken Curb — Burgos Ave.',        category: 'Infrastructure', severity: 'Medium', status: 'Completed',    location: 'Burgos Avenue, Block 2',    submitted: 'Mar 28, 2025', updated: 'Apr 2, 2025',  progress: 100, description: 'Concrete curb broken and hazardous to pedestrians. Repaired successfully.' },
  { id: 'SVR-H02', title: 'Garbage Overflow — Market Area',   category: 'Waste',          severity: 'Low',    status: 'Completed',    location: 'Market Area, Zone C',       submitted: 'Mar 15, 2025', updated: 'Mar 17, 2025', progress: 100, description: 'Garbage bins overflowing near the market entrance. Cleared and bins replaced.' },
  { id: 'SVR-H03', title: 'Water Supply Interruption',        category: 'Water Supply',   severity: 'High',   status: 'Completed',    location: 'Purok 5, Zone D',           submitted: 'Feb 20, 2025', updated: 'Feb 22, 2025', progress: 100, description: 'No water supply for 2 days in Purok 5. Issue resolved — pipe repaired.' },
  { id: 'SVR-H04', title: 'Streetlight — Gomez Ave.',         category: 'Infrastructure', severity: 'Low',    status: 'Rejected',     location: 'Gomez Avenue',              submitted: 'Feb 10, 2025', updated: 'Feb 11, 2025', progress: 0,   description: 'Streetlight flickering. Duplicate report — already being handled under REQ-2025-0028.' },
];

const STATUS_CFG = {
  'In Progress':  { color: '#d97706', bg: 'rgba(217,119,6,.08)',  badge: 'badge-amber', icon: Loader,        dot: '#f59e0b' },
  'Under Review': { color: '#2563eb', bg: 'rgba(37,99,235,.08)',  badge: 'badge-blue',  icon: Clock,         dot: '#3b82f6' },
  'Pending':      { color: '#ef4444', bg: 'rgba(239,68,68,.08)',  badge: 'badge-red',   icon: AlertTriangle, dot: '#ef4444' },
  'Completed':    { color: '#059669', bg: 'rgba(5,150,105,.08)',  badge: 'badge-green', icon: CheckCircle2,  dot: '#10b981' },
  'Rejected':     { color: '#64748b', bg: 'rgba(100,116,139,.08)',badge: 'badge-slate', icon: X,             dot: '#94a3b8' },
};

const SEV_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
const STATUS_FILTERS = ['All', 'In Progress', 'Under Review', 'Pending', 'Completed', 'Rejected'];

export default function ResidentHistory() {
  const [search,       setSearch]  = useState('');
  const [statusFilter, setStatus]  = useState('All');
  const [selected,     setSelected] = useState(null);

  const visible = ALL_HISTORY.filter((h) => {
    const matchStatus = statusFilter === 'All' || h.status === statusFilter;
    const matchSearch = !search
      || h.title.toLowerCase().includes(search.toLowerCase())
      || h.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    active:    ALL_HISTORY.filter((h) => !['Completed', 'Rejected'].includes(h.status)).length,
    completed: ALL_HISTORY.filter((h) => h.status === 'Completed').length,
    rejected:  ALL_HISTORY.filter((h) => h.status === 'Rejected').length,
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
          Request History
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-4)', marginTop: 3 }}>
          All your submitted service requests and their current status
        </p>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Active',   value: counts.active,    color: '#2563eb', bg: '#eff6ff' },
          { label: 'Resolved', value: counts.completed, color: '#059669', bg: '#ecfdf5' },
          { label: 'Rejected', value: counts.rejected,  color: '#64748b', bg: 'var(--surface-3)' },
        ].map((s) => (
          <div key={s.label} style={{ padding: '14px 18px', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(15,23,42,.05)' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{s.label}</p>
            <p className="font-display" style={{ fontSize: '1.75rem', fontWeight: 400, color: s.color, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests…"
            style={{ width: '100%', height: 38, paddingLeft: 36, paddingRight: 12, borderRadius: 10, fontSize: '13px', color: 'var(--text-1)', background: 'var(--surface)', border: '1.5px solid var(--border)', outline: 'none', fontFamily: 'inherit', transition: 'all .18s' }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px var(--brand-muted)'; }}
            onBlur={(e)  => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = ''; }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatus(f)}
              style={{
                padding: '5px 12px', borderRadius: 99, fontSize: '11.5px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                background: statusFilter === f ? 'var(--brand)' : 'var(--surface)',
                color: statusFilter === f ? '#fff' : 'var(--text-3)',
                border: statusFilter === f ? 'none' : '1px solid var(--border)',
                boxShadow: statusFilter === f ? '0 2px 6px rgba(20,184,166,.3)' : 'none',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* History list */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(15,23,42,.05)' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>All Requests</p>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: 'var(--surface-3)', color: 'var(--text-4)' }}>{visible.length} records</span>
        </div>

        {visible.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}>
            No requests match your filters.
          </div>
        ) : visible.map((h, idx) => {
          const cfg        = STATUS_CFG[h.status] || STATUS_CFG['Pending'];
          const StatusIcon = cfg.icon;
          return (
            <div
              key={h.id}
              onClick={() => setSelected(h)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 14,
                padding: '14px 20px',
                borderLeft: `3px solid ${cfg.dot}`,
                background: cfg.bg,
                borderBottom: idx < visible.length - 1 ? '1px solid var(--border)' : 'none',
                cursor: 'pointer', transition: 'filter .12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(.97)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${cfg.dot}1a` }}>
                <StatusIcon size={15} style={{ color: cfg.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: 'var(--brand)' }}>{h.id}</span>
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: 5, background: 'var(--surface-3)', color: 'var(--text-4)' }}>{h.category}</span>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: SEV_COLOR[h.severity] }}>{h.severity}</span>
                  </div>
                  <span className={`badge ${cfg.badge}`} style={{ flexShrink: 0 }}>{h.status}</span>
                </div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.35, marginBottom: 4 }}>{h.title}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '11.5px', color: 'var(--text-4)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{h.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />Submitted {h.submitted}</span>
                </div>
                {h.progress > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ height: 4, borderRadius: 99, background: 'var(--surface-4)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, width: `${h.progress}%`, background: `linear-gradient(90deg, ${cfg.dot}99, ${cfg.dot})`, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Detail Modal — Portal so backdrop covers full screen including sidebar ── */}
      {selected && (() => {
        const cfg = STATUS_CFG[selected.status] || STATUS_CFG['Pending'];
        return (
          <Portal>
            {/*
              Backdrop: position fixed, inset 0 — covers 100vw × 100vh.
              overflow-y: auto on the BACKDROP (not the card) so the card
              stays centered and the backdrop scrolls if the card is taller
              than the viewport on very small screens.
            */}
            <div
              onClick={() => setSelected(null)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999,
                background: 'rgba(9,18,32,.65)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 16px',
                overflowY: 'auto',
                animation: 'fadeIn .2s ease-out both',
              }}
            >
              {/* Modal card — fixed max-height with internal scroll */}
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: 500,
                  maxHeight: 'calc(100vh - 48px)',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  boxShadow: '0 4px 8px rgba(15,23,42,.06), 0 24px 56px rgba(15,23,42,.22)',
                  animation: 'scaleIn .22s cubic-bezier(.34,1.56,.64,1) both',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {/* Colour stripe removed */}

                {/* Sticky header */}
                <div
                  style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    padding: '18px 22px 14px',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--surface-2)',
                    flexShrink: 0,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: 'var(--brand)' }}>{selected.id}</span>
                      <span className={`badge ${cfg.badge}`}>{selected.status}</span>
                    </div>
                    <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3 }}>{selected.title}</h2>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-3)', color: 'var(--text-3)', flexShrink: 0, transition: 'background .15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Scrollable body */}
                <div style={{ padding: '18px 22px 22px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>

                  {/* Detail grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Category',  value: selected.category  },
                      { label: 'Severity',  value: selected.severity  },
                      { label: 'Location',  value: selected.location  },
                      { label: 'Submitted', value: selected.submitted },
                      { label: 'Updated',   value: selected.updated   },
                      { label: 'Progress',  value: `${selected.progress}%` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{label}</p>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Description</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', lineHeight: 1.65, padding: '12px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      {selected.description}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>Resolution Progress</span>
                      <span style={{ fontWeight: 700, color: cfg.dot }}>{selected.progress}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: 'var(--surface-4)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, width: `${selected.progress}%`, background: `linear-gradient(90deg, ${cfg.dot}99, ${cfg.dot})`, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setSelected(null)}
                    style={{ alignSelf: 'flex-end', padding: '9px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit', background: 'var(--surface-3)', color: 'var(--text-2)', transition: 'background .15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        );
      })()}

    </div>
  );
}
