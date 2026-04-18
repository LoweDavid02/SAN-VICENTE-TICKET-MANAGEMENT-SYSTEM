import { useState } from 'react';
import { Clock, MapPin, ChevronRight, Download } from 'lucide-react';

const STATUS_FLOW = ['URGENT', 'IN PROGRESS', 'RESOLVED'];

const SEVERITY = {
  High:   { dot: '#dc2626', bg: '#fef2f2', border: '#fecaca', text: '#991b1b', badge: '#fee2e2', badgeText: '#b91c1c' },
  Medium: { dot: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: '#92400e', badge: '#fef3c7', badgeText: '#b45309' },
  Low:    { dot: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', text: '#065f46', badge: '#d1fae5', badgeText: '#065f46' },
};

const STATUS_STYLE = {
  'URGENT':      { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  'IN PROGRESS': { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  'RESOLVED':    { bg: '#f0fdf4', text: '#065f46', border: '#bbf7d0' },
};

const INITIAL = [
  { id: 1, title: 'Flash Flood Warning — Zone 4',       time: '14 min ago',   severity: 'High',   status: 'URGENT',      location: 'San Jose District', urgent: true  },
  { id: 2, title: 'Road Obstruction — Batasan Hills',   time: '1 hr ago',     severity: 'High',   status: 'URGENT',      location: 'Batasan Hills',     urgent: false },
  { id: 3, title: 'Streetlight Outage — San Jose St.',  time: '2 hrs ago',    severity: 'Medium', status: 'IN PROGRESS', location: 'San Jose Street',   urgent: false },
  { id: 4, title: 'Garbage Collection Delay — Fairview',time: '4 hrs ago',    severity: 'Low',    status: 'IN PROGRESS', location: 'Fairview',          urgent: false },
  { id: 5, title: 'Senior Wellness Enrollment',         time: 'Batch update', severity: 'Low',    status: 'RESOLVED',    location: 'Community Center',  urgent: false },
];

export default function IncidentLog() {
  const [logs, setLogs]     = useState(INITIAL);
  const [filter, setFilter] = useState('All');

  const advance = (id) =>
    setLogs((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const i = STATUS_FLOW.indexOf(l.status);
      return i < STATUS_FLOW.length - 1 ? { ...l, status: STATUS_FLOW[i + 1] } : l;
    }));

  const ORDER = { High: 0, Medium: 1, Low: 2 };
  const visible = logs
    .filter((l) => filter === 'All' || l.severity === filter)
    .sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4"
           style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Priority Incident Log</h2>
          <p className="text-xs text-slate-500 mt-0.5">Sorted by severity · real-time updates</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
          <Download size={13} /> Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 px-6 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        {['All', 'High', 'Medium', 'Low'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
            style={filter === f
              ? { background: 'var(--navy)', color: '#fff' }
              : { background: 'var(--surface-3)', color: 'var(--text-secondary)' }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {visible.map((log) => {
          const sev = SEVERITY[log.severity];
          const sta = STATUS_STYLE[log.status];
          const canAdvance = log.status !== 'RESOLVED';
          return (
            <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
              {/* Severity dot */}
              <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: sev.dot }} />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800 leading-snug">{log.title}</p>
                    {log.urgent && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                            style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
                        Urgent
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: sta.bg, color: sta.text, border: `1px solid ${sta.border}` }}>
                    {log.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Clock size={11} />{log.time}</span>
                  <span className="flex items-center gap-1"><MapPin size={11} />{log.location}</span>
                  <span className="font-medium px-1.5 py-0.5 rounded"
                        style={{ background: sev.badge, color: sev.badgeText }}>
                    {log.severity}
                  </span>
                </div>

                {canAdvance && (
                  <button
                    onClick={() => advance(log.id)}
                    className="flex items-center gap-1 mt-2 text-xs font-medium transition-colors"
                    style={{ color: 'var(--brand)' }}
                  >
                    <ChevronRight size={12} />
                    Move to {STATUS_FLOW[STATUS_FLOW.indexOf(log.status) + 1]}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
