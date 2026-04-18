import { TrendingUp, TrendingDown, Star } from 'lucide-react';

// ── Avatar ────────────────────────────────────────────────
const AV_COLORS = [
  { bg: 'rgba(20,184,166,.15)',  fg: '#14b8a6' },
  { bg: 'rgba(59,130,246,.15)',  fg: '#3b82f6' },
  { bg: 'rgba(245,158,11,.15)',  fg: '#d97706' },
  { bg: 'rgba(239,68,68,.15)',   fg: '#ef4444' },
  { bg: 'rgba(168,85,247,.15)',  fg: '#9333ea' },
  { bg: 'rgba(236,72,153,.15)',  fg: '#db2777' },
];

export function Avatar({ initials, size = 36, idx = 0 }) {
  const c = AV_COLORS[idx % AV_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: c.bg, color: c.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.34), fontWeight: 700, flexShrink: 0,
      letterSpacing: '-0.02em',
    }}>
      {initials}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────
export function StatCard({ label, value, change, trend, note, accent, delay = 0 }) {
  const isDown   = trend === 'down';
  const TrendIco = isDown ? TrendingDown : TrendingUp;
  const tColor   = isDown ? 'var(--green)' : 'var(--green)';

  return (
    <div
      className="card card-hover animate-fade-up"
      style={{ padding: '22px 24px', animationDelay: `${delay}ms` }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
        {label}
      </p>
      <p className="stat-value" style={{ color: accent || 'var(--text-1)', marginBottom: 10 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {change && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <TrendIco size={13} color={tColor} />
          <span style={{ fontSize: 12, fontWeight: 600, color: tColor }}>{change}</span>
          {note && <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{note}</span>}
        </div>
      )}
      {!change && note && (
        <p style={{ fontSize: 12, color: accent || 'var(--text-4)' }}>{note}</p>
      )}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────
const STATUS_CLS = {
  'Urgent':       'badge-red',
  'In Progress':  'badge-amber',
  'Pending':      'badge-slate',
  'Under Review': 'badge-blue',
  'Resolved':     'badge-green',
  'On Call':      'badge-amber',
  'Active':       'badge-green',
  'Off Duty':     'badge-slate',
};
export function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_CLS[status] || 'badge-slate'}`}>{status}</span>;
}

// ── Severity Badge ────────────────────────────────────────
const SEV_CLS = { High: 'badge-red', Medium: 'badge-amber', Low: 'badge-green' };
export function SeverityBadge({ severity }) {
  return <span className={`badge ${SEV_CLS[severity] || 'badge-slate'}`}>{severity}</span>;
}

// ── Workload Bar ──────────────────────────────────────────
export function WorkloadBar({ dept }) {
  const pct   = dept.capacity;
  const fill  = pct >= 90 ? 'var(--red)' : pct >= 70 ? 'var(--amber)' : 'var(--brand)';
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', letterSpacing: '0.03em' }}>{dept.name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 8 }}>{dept.tickets} active</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: fill }}>{pct}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: fill }} />
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>Team: {dept.team}</p>
    </div>
  );
}

// ── Incident Row ──────────────────────────────────────────
const SEV_BG = {
  High:   'rgba(239,68,68,.1)',
  Medium: 'rgba(245,158,11,.1)',
  Low:    'rgba(16,185,129,.1)',
};
export function IncidentRow({ incident, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '13px 16px',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface)',
        cursor: 'pointer',
        transition: 'all .15s',
        marginBottom: 8,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border-dark)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: SEV_BG[incident.severity] || SEV_BG.Low,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
      }}>
        {incident.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{incident.title}</p>
        <p style={{ fontSize: 11, color: 'var(--text-4)' }}>Reported {incident.time} · {incident.severity} Severity</p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Assigned to</p>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginBottom: 5 }}>{incident.assignedTo}</p>
        <StatusBadge status={incident.status} />
      </div>
      <span style={{ color: 'var(--text-4)', fontSize: 16, marginLeft: 4 }}>›</span>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────
export function Toggle({ on, onChange, label, description }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1, paddingRight: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 2 }}>{description}</p>}
      </div>
      <button
        onClick={onChange}
        className="toggle"
        style={{ background: on ? 'var(--brand)' : 'var(--border-dark)', border: 'none' }}
        role="switch"
        aria-checked={on}
      >
        <div className="toggle-knob" style={{ left: on ? 21 : 3 }} />
      </button>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────
export function SectionHeader({ title, sub, action, onAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{title}</h2>
        {sub && <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 2 }}>{sub}</p>}
      </div>
      {action && (
        <button onClick={onAction} className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ── Star Rating ───────────────────────────────────────────
export function StarRating({ score }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1,2,3,4,5].map((s) => (
        <Star
          key={s}
          size={13}
          fill={s <= Math.round(score) ? 'var(--amber)' : 'none'}
          color={s <= Math.round(score) ? 'var(--amber)' : 'var(--border-dark)'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}
