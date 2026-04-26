import { useState } from 'react';
import { Search, Plus, X, User, Mail, Phone, Briefcase } from 'lucide-react';
import { Avatar, StatusBadge, StarRating } from '../components/ui/Components';
import { personnel, requests } from '../data/mockData';
import Portal from '../components/Portal';

const DEPT_OPTIONS = ['Admin', 'Infrastructure', 'Waste Management', 'Social Services', 'Public Safety'];

/* -- Modal Backdrop � Portal so it covers full screen including sidebar -- */
function ModalBackdrop({ onClose, children }) {
  return (
    <Portal>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(9,18,32,.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn .2s ease-out both',
        }}
      >
        <div onClick={(e) => e.stopPropagation()}>{children}</div>
      </div>
    </Portal>
  );
}

/* -- Modal shell ------------------------------------------- */
function ModalShell({ stripeColor, title, subtitle, onClose, children, footer }) {
  return (
    <div style={{
      width: '100%', maxWidth: 480,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 20,
      boxShadow: '0 24px 56px rgba(9,18,32,.22)',
      overflow: 'hidden',
      animation: 'scaleIn .2s ease-out both',
    }}>
      {/* Stripe */}
      <div style={{ height: 4, background: stripeColor }} />
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '18px 22px 14px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{title}</p>
          {subtitle && <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 2 }}>{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          style={{
            width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface-3)', color: 'var(--text-3)',
            transition: 'background .15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-4)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
        >
          <X size={14} />
        </button>
      </div>
      {/* Body */}
      <div style={{ padding: '18px 22px' }}>{children}</div>
      {/* Footer */}
      {footer && (
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '14px 22px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-2)',
        }}>
          {footer}
        </div>
      )}
    </div>
  );
}

/* -- Shared form field ------------------------------------- */
function FormField({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  height: 38, width: '100%', padding: '0 12px',
  border: '1.5px solid var(--border)', borderRadius: 9,
  fontSize: 13, fontFamily: 'inherit',
  color: 'var(--text-1)', background: 'var(--surface-2)',
  outline: 'none', transition: 'border-color .15s, box-shadow .15s',
};

const selectStyle = { ...inputStyle, cursor: 'pointer' };

/* -- Add Personnel Modal ----------------------------------- */
function AddPersonnelModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', role: '', dept: DEPT_OPTIONS[0], phone: '', email: '', status: 'Active' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell
        stripeColor="linear-gradient(90deg,#14b8a6,#0d9488)"
        title="Add Personnel"
        subtitle="Register a new barangay staff member"
        onClose={onClose}
        footer={
          <>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-brand"
              onClick={() => { onAdd(form); onClose(); }}
              disabled={!form.name || !form.role}
            >
              <Plus size={13} /> Add Personnel
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label="Full Name">
            <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="e.g. Juan Dela Cruz" />
          </FormField>
          <FormField label="Role / Position">
            <input style={inputStyle} value={form.role} onChange={set('role')} placeholder="e.g. Field Engineer" />
          </FormField>
          <FormField label="Department">
            <select style={selectStyle} value={form.dept} onChange={set('dept')}>
              {DEPT_OPTIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select style={selectStyle} value={form.status} onChange={set('status')}>
              {['Active', 'Off Duty', 'On Call'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Phone">
            <input style={inputStyle} value={form.phone} onChange={set('phone')} placeholder="+63 9XX XXX XXXX" />
          </FormField>
          <FormField label="Email">
            <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="name@barangay.gov" />
          </FormField>
        </div>
      </ModalShell>
    </ModalBackdrop>
  );
}

/* -- Edit Personnel Modal ---------------------------------- */
function EditPersonnelModal({ person, onClose, onSave }) {
  const [form, setForm] = useState({ name: person.name, role: person.role, dept: person.dept, status: person.status });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell
        stripeColor="linear-gradient(90deg,#2563eb,#1d4ed8)"
        title="Edit Personnel"
        subtitle={`Editing record for ${person.name}`}
        onClose={onClose}
        footer={
          <>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn" style={{ background: '#2563eb', color: '#fff' }} onClick={() => { onSave({ ...person, ...form }); onClose(); }}>
              Save Changes
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormField label="Full Name">
            <input style={inputStyle} value={form.name} onChange={set('name')} />
          </FormField>
          <FormField label="Role / Position">
            <input style={inputStyle} value={form.role} onChange={set('role')} />
          </FormField>
          <FormField label="Department">
            <select style={selectStyle} value={form.dept} onChange={set('dept')}>
              {DEPT_OPTIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select style={selectStyle} value={form.status} onChange={set('status')}>
              {['Active', 'Off Duty', 'On Call'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormField>
        </div>
      </ModalShell>
    </ModalBackdrop>
  );
}

/* -- Assign Ticket Modal ----------------------------------- */
function AssignTicketModal({ person, onClose, onAssign }) {
  const unassigned = requests.filter((r) => r.assignedTo === 'Unassigned');
  const [selected, setSelected] = useState(null);

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalShell
        stripeColor="linear-gradient(90deg,#f59e0b,#d97706)"
        title="Assign Ticket"
        subtitle={`Assign an open request to ${person.name}`}
        onClose={onClose}
        footer={
          <>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button
              className="btn"
              style={{ background: selected ? '#f59e0b' : 'var(--surface-3)', color: selected ? '#fff' : 'var(--text-4)', cursor: selected ? 'pointer' : 'not-allowed' }}
              disabled={!selected}
              onClick={() => { if (selected) { onAssign(selected); onClose(); } }}
            >
              Assign Ticket
            </button>
          </>
        }
      >
        {unassigned.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-4)', textAlign: 'center', padding: '20px 0' }}>No unassigned requests at this time.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
            {unassigned.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelected(r.id === selected ? null : r.id)}
                style={{
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  border: `1.5px solid ${selected === r.id ? '#f59e0b' : 'var(--border)'}`,
                  background: selected === r.id ? 'rgba(245,158,11,.07)' : 'var(--surface-2)',
                  transition: 'all .15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#2563eb' }}>{r.id}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{r.title}</p>
                <p style={{ fontSize: 11, color: 'var(--text-4)' }}>{r.category} � {r.submitted}</p>
              </div>
            ))}
          </div>
        )}
      </ModalShell>
    </ModalBackdrop>
  );
}

/* -- Main Personnel Component ------------------------------ */
const ALL_DEPTS = ['All', ...DEPT_OPTIONS];

export default function Personnel() {
  const [list, setList]               = useState(personnel);
  const [search, setSearch]           = useState('');
  const [deptFilter, setDeptFilter]   = useState('All');
  const [selected, setSelected]       = useState(list[0]);
  const [showAdd, setShowAdd]         = useState(false);
  const [showEdit, setShowEdit]       = useState(false);
  const [showAssign, setShowAssign]   = useState(false);

  const filtered = list.filter((p) => {
    const matchDept   = deptFilter === 'All' || p.dept === deptFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  const handleAdd = (form) => {
    const newP = {
      id: `P${String(list.length + 1).padStart(3, '0')}`,
      name: form.name, role: form.role, dept: form.dept,
      status: form.status, phone: form.phone, email: form.email,
      tickets: 0, level: 1, avatar: form.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      rating: 0,
    };
    setList((l) => [newP, ...l]);
    setSelected(newP);
  };

  const handleSave = (updated) => {
    setList((l) => l.map((p) => p.id === updated.id ? updated : p));
    setSelected(updated);
  };

  const DEPT_COLORS = {
    'Admin': '#8b5cf6', 'Infrastructure': '#f59e0b',
    'Waste Management': '#14b8a6', 'Social Services': '#3b82f6', 'Public Safety': '#ef4444',
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.025em' }}>Personnel</h1>
          <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 3 }}>{list.length} staff members registered</p>
        </div>
        <button className="btn btn-brand" onClick={() => setShowAdd(true)}>
          <Plus size={14} strokeWidth={2.5} /> Add Personnel
        </button>
      </div>

      {/* Dept filter pills + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {ALL_DEPTS.map((d) => (
            <button
              key={d}
              onClick={() => setDeptFilter(d)}
              style={{
                padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                fontFamily: 'inherit', cursor: 'pointer', transition: 'all .15s',
                border: deptFilter === d ? 'none' : '1px solid var(--border)',
                background: deptFilter === d ? 'var(--brand)' : 'var(--surface)',
                color: deptFilter === d ? '#fff' : 'var(--text-3)',
              }}
            >
              {d}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
          <input
            className="input"
            style={{ paddingLeft: 32, width: 220, height: 36 }}
            placeholder="Search personnel�"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Two-panel layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, alignItems: 'start' }}>

        {/* List panel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              {filtered.length} member{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ maxHeight: 560, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <p style={{ padding: '24px 16px', fontSize: 13, color: 'var(--text-4)', textAlign: 'center' }}>No results found.</p>
            ) : filtered.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => setSelected(p)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: selected?.id === p.id ? 'rgba(20,184,166,.07)' : 'transparent',
                  borderLeft: selected?.id === p.id ? '3px solid var(--brand)' : '3px solid transparent',
                  transition: 'background .12s',
                }}
                onMouseEnter={(e) => { if (selected?.id !== p.id) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={(e) => { if (selected?.id !== p.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <Avatar initials={p.avatar} size={36} idx={idx} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 1 }}>{p.role}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selected ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {/* Header strip removed */}

            <div style={{ padding: '22px 24px' }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <Avatar initials={selected.avatar} size={52} idx={list.indexOf(selected)} />
                  <div>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-1)' }}>{selected.name}</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{selected.role}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <StatusBadge status={selected.status} />
                      <span style={{ fontSize: 11, color: 'var(--text-4)' }}>Level {selected.level}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => setShowEdit(true)}>
                    Edit
                  </button>
                  <button
                    className="btn"
                    style={{ fontSize: 12, padding: '6px 14px', background: '#f59e0b', color: '#fff' }}
                    onClick={() => setShowAssign(true)}
                  >
                    Assign Ticket
                  </button>
                </div>
              </div>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { icon: Briefcase, label: 'Department', value: selected.dept },
                  { icon: User,      label: 'Member Since', value: selected.joined },
                  { icon: Mail,      label: 'Email', value: selected.email || 'Not set' },
                  { icon: Phone,     label: 'Phone', value: selected.phone || 'Not set' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Icon size={12} style={{ color: 'var(--text-4)' }} />
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{label}</span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Active Tickets', value: selected.tickets },
                  { label: 'Rating', value: selected.rating || '�' },
                  { label: 'Level', value: `L${selected.level}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>{value}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 3 }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Star rating */}
              {selected.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StarRating score={selected.rating} />
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{selected.rating} / 5.0</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--text-4)' }}>Select a personnel member to view details.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd    && <AddPersonnelModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
      {showEdit   && selected && <EditPersonnelModal person={selected} onClose={() => setShowEdit(false)} onSave={handleSave} />}
      {showAssign && selected && <AssignTicketModal person={selected} onClose={() => setShowAssign(false)} onAssign={(id) => console.log('Assigned', id, 'to', selected.name)} />}
    </div>
  );
}
