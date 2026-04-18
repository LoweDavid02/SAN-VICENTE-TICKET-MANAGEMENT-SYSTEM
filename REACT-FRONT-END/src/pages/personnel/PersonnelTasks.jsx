import { useState } from 'react';
import {
  MapPin, Clock, CheckCircle2, AlertTriangle,
  ChevronDown, X, Camera, Phone, Image as ImageIcon,
  ArrowRight, Loader,
} from 'lucide-react';

const STATUS_FLOW = ['Under Review', 'In Progress', 'Completed'];

const STATUS_CFG = {
  'In Progress':  { color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
  'Under Review': { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', dot: '#3b82f6' },
  'Pending':      { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' },
  'Completed':    { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', dot: '#10b981' },
  'Urgent':       { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' },
};

const SEV_COLOR = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

const INITIAL_TASKS = [
  {
    id: 'REQ-2025-0041', title: 'Broken streetlight – Rizal St.',
    category: 'Infrastructure', severity: 'High', status: 'In Progress',
    location: 'Rizal Street, Zone A', resident: 'Juan dela Cruz', phone: '09123456789',
    submitted: 'Apr 10, 2025', dueTime: '3:00 PM', est: '45 min',
    description: 'Streetlight at corner of Rizal St. and Burgos Ave. has been out for 3 days. Safety hazard at night for pedestrians and motorists.',
    images: [],
  },
  {
    id: 'REQ-2025-0040', title: 'Clogged drainage – P. Burgos',
    category: 'Infrastructure', severity: 'High', status: 'Under Review',
    location: 'P. Burgos Street', resident: 'Maria Santos', phone: '09198765432',
    submitted: 'Apr 9, 2025', dueTime: '5:00 PM', est: '60 min',
    description: 'Drainage canal is clogged causing water to overflow onto the road after rain. Flooding risk for nearby homes.',
    images: [],
  },
  {
    id: 'REQ-2025-0039', title: 'Pothole – Gomez Ave.',
    category: 'Infrastructure', severity: 'Medium', status: 'In Progress',
    location: 'Gomez Avenue, Block 3', resident: 'Pedro Ramos', phone: '09156789012',
    submitted: 'Apr 8, 2025', dueTime: '4:30 PM', est: '30 min',
    description: 'Large pothole approximately 80cm wide near the intersection. Multiple vehicles have been damaged.',
    images: [],
  },
  {
    id: 'REQ-2025-0034', title: 'Road damage – Purok 3 entrance',
    category: 'Infrastructure', severity: 'High', status: 'Completed',
    location: 'Purok 3 Entrance Road', resident: 'Barangay Watch', phone: '09187654321',
    submitted: 'Apr 4, 2025', dueTime: 'Done', est: '—',
    description: 'Road surface has cracked and sunk near the entrance. Repaired and sealed with asphalt patch.',
    images: [],
  },
];

/* ── Update Status Modal ── */
function UpdateStatusModal({ task, onClose, onUpdate }) {
  const [newStatus, setNewStatus] = useState(task.status);
  const [note, setNote]           = useState('');
  const currentIdx = STATUS_FLOW.indexOf(task.status);
  const available  = STATUS_FLOW.filter((_, i) => i >= currentIdx);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(9,18,32,.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn .2s ease-out both' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 420, background: '#fff', border: '1px solid rgba(226,232,240,.9)', borderRadius: 18, boxShadow: '0 4px 8px rgba(15,23,42,.05), 0 24px 56px rgba(15,23,42,.18)', overflow: 'hidden', animation: 'scaleIn .22s cubic-bezier(.34,1.56,.64,1) both' }}
      >
        {/* Amber stripe */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Update Task Status</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>{task.id} · {task.title.slice(0, 36)}{task.title.length > 36 ? '…' : ''}</p>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#64748b' }}>
              <X size={14} />
            </button>
          </div>

          <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>New Status</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {available.map((s) => {
              const sc = STATUS_CFG[s] || STATUS_CFG['Pending'];
              const sel = newStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => setNewStatus(s)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 10, cursor: 'pointer', border: `1.5px solid ${sel ? sc.border : '#e8edf2'}`, background: sel ? sc.bg : '#fafbfc', transition: 'all .15s', fontFamily: 'inherit' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot }} />
                    <span style={{ fontSize: '13px', fontWeight: sel ? 700 : 500, color: sel ? sc.color : '#334155' }}>{s}</span>
                    {s === 'Completed' && <span style={{ fontSize: '10px', color: '#94a3b8' }}>— Resident will be notified</span>}
                  </div>
                  {sel && <div style={{ width: 18, height: 18, borderRadius: '50%', background: sc.dot, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>✓</span></div>}
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Field Note (optional)</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe what was done, materials used, or any issues encountered…"
            rows={3}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, resize: 'none', fontSize: '0.875rem', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', transition: 'all .18s', lineHeight: 1.6 }}
            onFocus={(e) => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,.1)'; e.target.style.background = '#fff'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; e.target.style.background = '#f8fafc'; }}
          />

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', transition: 'all .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e8edf2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}>
              Cancel
            </button>
            <button
              onClick={() => { onUpdate(task.id, newStatus, note); onClose(); }}
              style={{ padding: '9px 22px', borderRadius: 10, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, fontFamily: 'inherit', color: '#fff', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 2px 8px rgba(245,158,11,.35)', transition: 'all .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}>
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PersonnelTasksPage() {
  const [tasks, setTasks]         = useState(INITIAL_TASKS);
  const [filter, setFilter]       = useState('All');
  const [selected, setSelected]   = useState(null);
  const [updateModal, setUpdate]  = useState(null);

  const handleUpdate = (id, newStatus) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t));
    if (selected?.id === id) setSelected((prev) => ({ ...prev, status: newStatus }));
  };

  const FILTERS = ['All', 'In Progress', 'Under Review', 'Completed'];
  const visible = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>My Tasks</h1>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: 2 }}>Assigned service requests for today</p>
        </div>
        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 12px', borderRadius: 99, fontSize: '11.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                background: filter === f ? '#f59e0b' : '#f1f5f9',
                color: filter === f ? '#fff' : '#64748b',
                border: filter === f ? 'none' : '1px solid #e2e8f0',
                boxShadow: filter === f ? '0 2px 6px rgba(245,158,11,.3)' : 'none',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 16 }}>

        {/* Task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map((task) => {
            const sc  = STATUS_CFG[task.status] || STATUS_CFG['Pending'];
            const isActive = selected?.id === task.id;
            return (
              <div
                key={task.id}
                onClick={() => setSelected(isActive ? null : task)}
                style={{
                  borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                  background: '#fff',
                  border: `1.5px solid ${isActive ? '#f59e0b' : 'rgba(226,232,240,.85)'}`,
                  boxShadow: isActive ? '0 0 0 3px rgba(245,158,11,.12), 0 4px 12px rgba(15,23,42,.06)' : '0 1px 2px rgba(15,23,42,.04), 0 4px 8px rgba(15,23,42,.04)',
                  transition: 'all .18s',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = '#fde68a'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(226,232,240,.85)'; }}
              >
                {/* Priority bar */}
                <div style={{ height: 3, background: SEV_COLOR[task.severity] }} />

                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#f59e0b' }}>{task.id}</span>
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: 5, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{task.status}</span>
                        <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: 5, background: '#f1f5f9', color: SEV_COLOR[task.severity] }}>{task.severity}</span>
                      </div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: 6 }}>{task.title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '11.5px', color: '#94a3b8' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} />{task.location}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{task.dueTime} · {task.est}</span>
                      </div>
                    </div>
                    {task.status === 'Completed'
                      ? <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                      : <ChevronDown size={16} style={{ color: '#cbd5e1', flexShrink: 0, transform: isActive ? 'rotate(180deg)' : '', transition: 'transform .2s' }} />
                    }
                  </div>

                  {/* Quick action */}
                  {task.status !== 'Completed' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setUpdate(task); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#fff', fontFamily: 'inherit', background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 2px 6px rgba(245,158,11,.3)', transition: 'all .15s', marginTop: 4 }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
                    >
                      <ArrowRight size={12} /> Update Status
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {visible.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', background: '#fff', borderRadius: 14, border: '1px solid #e8edf2' }}>
              No tasks match this filter.
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div
            className="animate-slide-in"
            style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid rgba(226,232,240,.85)', boxShadow: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.07)', alignSelf: 'start', position: 'sticky', top: 88 }}
          >
            {/* Detail header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(180deg, #fafbfc, #f8fafc)' }}>
              <div>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#f59e0b' }}>{selected.id}</span>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: 2, lineHeight: 1.3 }}>{selected.title}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#64748b', flexShrink: 0 }}>
                <X size={13} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Status + severity */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[selected.status, selected.severity].map((v, i) => {
                  const sc = i === 0 ? (STATUS_CFG[v] || STATUS_CFG['Pending']) : null;
                  return (
                    <span key={v} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: sc ? sc.bg : '#f1f5f9', color: sc ? sc.color : SEV_COLOR[v] || '#64748b', border: `1px solid ${sc ? sc.border : '#e2e8f0'}` }}>
                      {v}
                    </span>
                  );
                })}
              </div>

              {/* Details */}
              {[
                { label: 'Location',   value: selected.location,  icon: MapPin },
                { label: 'Resident',   value: selected.resident,  icon: null   },
                { label: 'Submitted',  value: selected.submitted, icon: null   },
                { label: 'Due',        value: selected.dueTime,   icon: Clock  },
                { label: 'Est. Time',  value: selected.est,       icon: null   },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {Icon && <Icon size={11} />}{label}
                  </span>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', textAlign: 'right', maxWidth: 180 }}>{value}</span>
                </div>
              ))}

              {/* Description */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Description</p>
                <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #f1f5f9' }}>{selected.description}</p>
              </div>

              {/* Evidence */}
              {selected.images && selected.images.length > 0 && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Evidence ({selected.images.length})</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: 6 }}>
                    {selected.images.map((img, idx) => (
                      <div key={idx} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }} onClick={() => window.open(img.url, '_blank')}>
                        {img.type?.startsWith('image/') ? <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={16} style={{ color: '#94a3b8' }} /></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div style={{ display: 'flex', gap: 8 }}>
                <a
                  href={`tel:${selected.phone}`}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 10, fontSize: '12.5px', fontWeight: 600, color: '#0d9488', background: '#f0fdfa', border: '1px solid #99f6e4', textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ccfbf1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f0fdfa'; }}
                >
                  <Phone size={13} /> Call Resident
                </a>
                {selected.status !== 'Completed' && (
                  <button
                    onClick={() => setUpdate(selected)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 10, fontSize: '12.5px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(245,158,11,.3)', transition: 'all .15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
                  >
                    <ArrowRight size={13} /> Update Status
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update modal */}
      {updateModal && (
        <UpdateStatusModal
          task={updateModal}
          onClose={() => setUpdate(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
