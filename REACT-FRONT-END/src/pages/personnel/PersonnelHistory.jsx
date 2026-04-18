import { useState } from 'react';
import { CheckCircle2, Clock, MapPin, Search, Filter } from 'lucide-react';

const HISTORY = [
  { id: 'REQ-2025-0034', title: 'Road damage – Purok 3 entrance',    category: 'Infrastructure',   severity: 'High',   completedAt: 'Apr 14, 2025 · 2:30 PM', duration: '1h 20m', note: 'Repaired and sealed with asphalt patch. Area marked with cones during work.' },
  { id: 'REQ-2025-0031', title: 'Broken curb – Rizal Ave.',           category: 'Infrastructure',   severity: 'Medium', completedAt: 'Apr 12, 2025 · 4:15 PM', duration: '45m',    note: 'Concrete curb replaced. Resident confirmed satisfaction.' },
  { id: 'REQ-2025-0028', title: 'Streetlight – Purok Norte',          category: 'Infrastructure',   severity: 'Low',    completedAt: 'Apr 10, 2025 · 11:00 AM', duration: '30m',   note: 'Bulb replaced. Wiring checked and secured.' },
  { id: 'REQ-2025-0025', title: 'Drainage repair – Market Area',      category: 'Infrastructure',   severity: 'High',   completedAt: 'Apr 8, 2025 · 3:45 PM',  duration: '2h 10m', note: 'Cleared blockage and reinforced drainage walls.' },
  { id: 'REQ-2025-0022', title: 'Pothole – Gomez Ave. (prev)',        category: 'Infrastructure',   severity: 'Medium', completedAt: 'Apr 5, 2025 · 1:00 PM',  duration: '50m',    note: 'Filled and compacted. Road surface leveled.' },
];

const SEV_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

export default function PersonnelHistory() {
  const [search, setSearch] = useState('');

  const visible = HISTORY.filter((h) =>
    h.title.toLowerCase().includes(search.toLowerCase()) ||
    h.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>Completed Tasks</h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: 2 }}>Your permanent field activity archive</p>
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history…"
            style={{ height: 36, paddingLeft: 34, paddingRight: 14, borderRadius: 10, fontSize: '13px', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', width: 200, transition: 'all .18s' }}
            onFocus={(e) => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,.1)'; e.target.style.background = '#fff'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; e.target.style.background = '#f8fafc'; }}
          />
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Completed', value: HISTORY.length, color: '#10b981' },
          { label: 'This Month',      value: 5,              color: '#f59e0b' },
          { label: 'Avg. Duration',   value: '1h 3m',        color: '#2563eb' },
        ].map((s) => (
          <div key={s.label} style={{ padding: '14px 16px', borderRadius: 12, background: '#fff', border: '1px solid rgba(226,232,240,.85)', boxShadow: '0 1px 2px rgba(15,23,42,.04)' }}>
            <p style={{ fontSize: '10.5px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{s.label}</p>
            <p className="font-display" style={{ fontSize: '1.5rem', fontWeight: 400, color: s.color, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* History list */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid rgba(226,232,240,.85)', boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 4px 12px rgba(15,23,42,.05)' }}>
        <div style={{ padding: '13px 20px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(180deg, #fafbfc, #f8fafc)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={14} style={{ color: '#10b981' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Activity Log</p>
          <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#ecfdf5', color: '#059669', marginLeft: 'auto' }}>{visible.length} records</span>
        </div>

        {visible.map((h, idx) => (
          <div
            key={h.id}
            style={{ padding: '14px 20px', borderBottom: idx < visible.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background .12s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fafbfc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {/* Green check */}
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={15} style={{ color: '#059669' }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#f59e0b' }}>{h.id}</span>
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: 5, background: '#f1f5f9', color: SEV_COLOR[h.severity] }}>{h.severity}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>{h.title}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#059669' }}>Completed</p>
                    <p style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: 2 }}>{h.duration}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '11.5px', color: '#94a3b8', marginBottom: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{h.completedAt}</span>
                </div>

                {h.note && (
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.55, padding: '8px 10px', borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    📝 {h.note}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
            No records match your search.
          </div>
        )}
      </div>
    </div>
  );
}
