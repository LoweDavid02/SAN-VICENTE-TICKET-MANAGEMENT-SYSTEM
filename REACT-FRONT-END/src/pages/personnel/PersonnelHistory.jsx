import { useState } from 'react';
import { CheckCircle2, Clock, Search, RefreshCw } from 'lucide-react';
import { usePersonnelTasks } from '../../hooks/useTicketApi';

const SEV_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

export default function PersonnelHistory() {
  const [search, setSearch] = useState('');

  // Fetch all tasks, filter to completed ones
  const { data: rawTasks, isLoading, isError, refetch } = usePersonnelTasks();
  const allTasks = rawTasks || [];
  const HISTORY  = allTasks.filter((t) => t.status === 'Completed');

  const visible = HISTORY.filter((h) =>
    h.title?.toLowerCase().includes(search.toLowerCase()) ||
    h.tracking_id?.toLowerCase().includes(search.toLowerCase())
  );

  const thisMonth = HISTORY.filter((h) => {
    if (!h.updated_at) return false;
    const d = new Date(h.updated_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  if (isLoading && !allTasks.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(255,255,255,.2)', borderTopColor: '#f59e0b', animation: 'spin .65s linear infinite' }} />
        <p style={{ fontSize: 13, color: '#94a3b8' }}>Loading history…</p>
      </div>
    );
  }

  if (isError && !allTasks.length) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: 12 }}>Failed to load history.</p>
        <button onClick={() => refetch()} className="btn btn-brand" style={{ fontSize: 13, gap: 6 }}>
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Completed Tasks</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: 2 }}>Your permanent field activity archive</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history…"
            style={{ height: 36, paddingLeft: 34, paddingRight: 14, borderRadius: 10, fontSize: '13px', color: 'var(--text-1)', background: 'var(--surface-2)', border: '1.5px solid var(--border)', outline: 'none', fontFamily: 'inherit', width: 200, transition: 'all .18s' }}
            onFocus={(e) => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,.1)'; e.target.style.background = 'var(--surface)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = ''; e.target.style.background = 'var(--surface-2)'; }}
          />
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Completed', value: HISTORY.length, color: '#10b981' },
          { label: 'This Month',      value: thisMonth,       color: '#f59e0b' },
          { label: 'All Tasks',       value: allTasks.length, color: '#2563eb' },
        ].map((s) => (
          <div key={s.label} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(15,23,42,.04)' }}>
            <p style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{s.label}</p>
            <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: 400, color: s.color, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* History list */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.05)' }}>
        <div style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={14} style={{ color: '#10b981' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-1)' }}>Activity Log</p>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#ecfdf5', color: '#059669', marginLeft: 'auto' }}>{visible.length} records</span>
        </div>

        {visible.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px' }}>
            {HISTORY.length === 0 ? 'No completed tasks yet.' : 'No records match your search.'}
          </div>
        ) : visible.map((h, idx) => (
          <div
            key={h.id}
            style={{ padding: '14px 20px', borderBottom: idx < visible.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background .12s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={15} style={{ color: '#059669' }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#f59e0b' }}>{h.tracking_id}</span>
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: 5, background: 'var(--surface-3)', color: SEV_COLOR[h.severity] }}>{h.severity}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.3 }}>{h.title}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#059669' }}>Completed</p>
                    <p style={{ fontSize: '10.5px', color: 'var(--text-4)', marginTop: 2 }}>{h.updated}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '11.5px', color: 'var(--text-4)', marginBottom: h.field_note ? 6 : 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{h.submitted}</span>
                  {h.location && <span>{h.location}</span>}
                </div>

                {h.field_note && (
                  <p style={{ fontSize: '12px', color: 'var(--text-3)', lineHeight: 1.55, padding: '8px 10px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', marginTop: 6 }}>
                    📝 {h.field_note}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
