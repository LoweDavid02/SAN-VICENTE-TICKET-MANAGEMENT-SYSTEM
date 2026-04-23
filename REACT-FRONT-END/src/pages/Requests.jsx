import { useState } from 'react';
import { Search, Download, X, Users, UserCheck, RefreshCw } from 'lucide-react';
import { StatusBadge, SeverityBadge } from '../components/ui/Components';
import { useAdminTickets, useUpdateTicketStatus, useAssignTicket, useAdminPersonnel } from '../hooks/useTicketApi';
import { useTickets } from '../store/TicketStore';
import { useLang } from '../stores/langStore';
import { useDebounce } from '../hooks/useDebounce';
import Portal from '../components/Portal';

const SEVERITIES    = ['All', 'High', 'Medium', 'Low'];
const STATUSES      = ['All', 'Urgent', 'In Progress', 'Under Review', 'Pending', 'Resolved', 'Completed'];
const STATUS_OPTIONS = ['Pending', 'Under Review', 'In Progress', 'Completed', 'Rejected'];

const STATUS_COLORS = {
  'Pending':      { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  'Under Review': { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  'In Progress':  { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  'Completed':    { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  'Rejected':     { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

function UpdateStatusModal({ ticket, onClose, onUpdate, isUpdating }) {
  const [newStatus, setNewStatus] = useState(ticket.status);
  const [note, setNote]           = useState('');
  const { t } = useLang();

  return (
    <Portal>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(9,18,32,.65)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn .2s ease-out both' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 440, background: '#ffffff', border: '1px solid rgba(226,232,240,.9)', borderRadius: 18, boxShadow: '0 4px 8px rgba(15,23,42,.05), 0 24px 56px rgba(15,23,42,.18)', overflow: 'hidden', animation: 'scaleIn .22s cubic-bezier(.34,1.56,.64,1) both' }}>
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>{t('updateStatus')}</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>{ticket.tracking_id} · {ticket.title?.slice(0, 40)}{ticket.title?.length > 40 ? '…' : ''}</p>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#64748b' }}><X size={14} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {STATUS_OPTIONS.map((s) => {
              const sc = STATUS_COLORS[s] || STATUS_COLORS['Pending'];
              const sel = newStatus === s;
              return (
                <button key={s} onClick={() => setNewStatus(s)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', border: `1.5px solid ${sel ? sc.border : '#e8edf2'}`, background: sel ? sc.bg : '#fafbfc', transition: 'all .15s', fontFamily: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.color }} />
                    <span style={{ fontSize: '13px', fontWeight: sel ? 700 : 500, color: sel ? sc.color : '#334155' }}>{s}</span>
                  </div>
                  {sel && <div style={{ width: 18, height: 18, borderRadius: '50%', background: sc.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>✓</span></div>}
                </button>
              );
            })}
          </div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note about this status change…" rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, resize: 'none', fontSize: '0.875rem', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', transition: 'all .18s', lineHeight: 1.6 }} onFocus={(e) => { e.target.style.borderColor = '#14b8a6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,.1)'; e.target.style.background = '#fff'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; e.target.style.background = '#f8fafc'; }} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>{t('cancel')}</button>
            <button onClick={() => { onUpdate(ticket.id, newStatus, note); onClose(); }} disabled={isUpdating} style={{ padding: '9px 22px', borderRadius: 10, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, fontFamily: 'inherit', color: '#fff', border: 'none', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', boxShadow: '0 2px 8px rgba(20,184,166,.3)', transition: 'all .15s' }}>
              {isUpdating ? 'Updating…' : t('updateStatus')}
            </button>
          </div>
        </div>
      </div>
      </div>
    </Portal>
  );
}

function ReassignModal({ ticket, personnel, onClose, onReassign, isAssigning }) {
  const [selected, setSelected] = useState(ticket.assigned_to?.id || '');
  const [note, setNote]         = useState('');
  const { t } = useLang();

  return (
    <Portal>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(9,18,32,.65)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', animation: 'fadeIn .2s ease-out both' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 480, background: '#ffffff', border: '1px solid rgba(226,232,240,.9)', borderRadius: 18, boxShadow: '0 4px 8px rgba(15,23,42,.05), 0 24px 56px rgba(15,23,42,.18)', overflow: 'hidden', animation: 'scaleIn .22s cubic-bezier(.34,1.56,.64,1) both' }}>
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCheck size={16} style={{ color: '#14b8a6' }} /> {t('reassign')}
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>{ticket.tracking_id} · {ticket.title?.slice(0, 40)}</p>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#64748b' }}><X size={14} /></button>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: 2 }}>Currently assigned to</p>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{ticket.assigned_to?.full_name || 'Unassigned'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18, maxHeight: 260, overflowY: 'auto' }}>
            {personnel.map((p) => {
              const isSel = selected === p.id;
              return (
                <button key={p.id} onClick={() => setSelected(p.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', border: `1.5px solid ${isSel ? '#14b8a6' : '#e8edf2'}`, background: isSel ? 'rgba(20,184,166,.06)' : '#fafbfc', transition: 'all .15s', fontFamily: 'inherit', textAlign: 'left' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: isSel ? 'rgba(20,184,166,.15)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: isSel ? '#0d9488' : '#64748b' }}>
                    {p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: isSel ? 700 : 600, color: isSel ? '#0d9488' : '#0f172a', lineHeight: 1.2 }}>{p.full_name}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: 1 }}>{p.active_tickets || 0} active tickets</p>
                  </div>
                  {isSel && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#14b8a6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>✓</span></div>}
                </button>
              );
            })}
          </div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for reassignment…" rows={2} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, resize: 'none', fontSize: '0.875rem', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', transition: 'all .18s', lineHeight: 1.6 }} onFocus={(e) => { e.target.style.borderColor = '#14b8a6'; e.target.style.boxShadow = '0 0 0 3px rgba(20,184,166,.1)'; e.target.style.background = '#fff'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; e.target.style.background = '#f8fafc'; }} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>{t('cancel')}</button>
            <button onClick={() => { if (selected) { onReassign(ticket.id, selected, note); onClose(); } }} disabled={!selected || isAssigning} style={{ padding: '9px 22px', borderRadius: 10, cursor: (!selected || isAssigning) ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 700, fontFamily: 'inherit', color: '#fff', border: 'none', background: (!selected || isAssigning) ? '#94a3b8' : 'linear-gradient(135deg, #14b8a6, #0d9488)', boxShadow: (!selected || isAssigning) ? 'none' : '0 2px 8px rgba(20,184,166,.3)', transition: 'all .15s' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><UserCheck size={13} /> {isAssigning ? 'Assigning…' : 'Assign'}</span>
            </button>
          </div>
        </div>
      </div>
      </div>
    </Portal>
  );
}

export default function Requests() {
  const { t } = useLang();
  const [search, setSearch]           = useState('');
  const [sev,    setSev]              = useState('All');
  const [stat,   setStat]             = useState('All');

  // Debounce search — prevents API call on every keystroke
  const debouncedSearch = useDebounce(search, 300);
  const [sel,    setSel]              = useState(null);
  const [updateModal, setUpdateModal] = useState(null);
  const [reassignModal, setReassignModal] = useState(null);

  const { applyOptimisticUpdate, mergeOptimistic } = useTickets();
  const { data: ticketData, isLoading, refetch } = useAdminTickets({ search: debouncedSearch, status: stat !== 'All' ? stat : undefined, severity: sev !== 'All' ? sev : undefined });
  const { data: personnelList = [] } = useAdminPersonnel();
  const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdateTicketStatus();
  const { mutateAsync: assignTicket, isPending: isAssigning } = useAssignTicket();

  const rawTickets = ticketData?.tickets || [];
  const tickets    = mergeOptimistic(rawTickets);

  const handleStatusUpdate = async (id, newStatus, note) => {
    applyOptimisticUpdate(id, newStatus, note);
    if (sel?.id === id) setSel((prev) => ({ ...prev, status: newStatus }));
    try {
      await updateStatus({ id, status: newStatus, field_note: note });
    } catch { refetch(); }
  };

  const handleReassign = async (id, personnelId, note) => {
    try {
      const { data } = await assignTicket({ id, personnel_id: personnelId, note });
      if (sel?.id === id) setSel(data.data);
      refetch();
    } catch (err) {
      console.error('Assign failed:', err);
    }
  };

  if (isLoading && !ticketData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#14b8a6', animation: 'spin .65s linear infinite' }} />
        <p style={{ fontSize: 13, color: '#94a3b8' }}>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
          <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search requests or ID…" style={{ paddingLeft: 32, width: 220 }} />
        </div>
        
        {/* Severity Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 11.5, color: 'var(--text-4)', fontWeight: 600 }}>Severity</label>
          <select 
            value={sev} 
            onChange={(e) => setSev(e.target.value)}
            style={{
              padding: '6px 32px 6px 12px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-2)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              outline: 'none',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2394a3b8\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 11.5, color: 'var(--text-4)', fontWeight: 600 }}>Status</label>
          <select 
            value={stat} 
            onChange={(e) => setStat(e.target.value)}
            style={{
              padding: '6px 32px 6px 12px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-2)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              outline: 'none',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2394a3b8\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
            }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => refetch()} className="btn btn-outline" style={{ fontSize: 12, gap: 6 }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-outline" style={{ fontSize: 12, gap: 6 }}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: sel ? '1fr 420px' : '1fr', gap: 20 }}>
        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Ticket ID', t('category'), t('severity'), t('status'), t('updated'), t('assignedTo')].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((r) => (
                <tr key={r.id} className={sel?.id === r.id ? 'active' : ''} onClick={() => setSel(sel?.id === r.id ? null : r)}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 11.5, color: 'var(--brand)', fontWeight: 600 }}>{r.tracking_id}</span></td>
                  <td>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{r.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{r.resident?.full_name}</p>
                  </td>
                  <td><SeverityBadge severity={r.severity} /></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 11.5 }}>{r.updated}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.assigned_to?.full_name || 'Unassigned'}</td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-4)' }}>{t('noRequests')}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {sel && (
          <div className="card animate-slide-in" style={{ padding: 24, alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{t('ticketDetail')}</h2>
              <button onClick={() => setSel(null)} className="btn btn-ghost" style={{ width: 28, height: 28, padding: 0, justifyContent: 'center' }}><X size={14} /></button>
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: 11.5, color: 'var(--brand)', fontWeight: 700, marginBottom: 6 }}>{sel.tracking_id}</p>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 12, lineHeight: 1.35 }}>{sel.title}</h3>
            <div style={{ display: 'flex', gap: 7, marginBottom: 20 }}>
              <SeverityBadge severity={sel.severity} />
              <StatusBadge status={sel.status} />
            </div>
            {[
              { label: 'Reported by', val: sel.resident?.full_name || '—' },
              { label: 'Category',    val: sel.category  },
              { label: 'Location',    val: sel.location  },
              { label: 'Assigned to', val: sel.assigned_to?.full_name || 'Unassigned' },
              { label: 'Submitted',   val: sel.submitted },
              { label: 'Last updated',val: sel.updated   },
            ].map((k) => (
              <div key={k.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-4)' }}>{k.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)', textAlign: 'right', maxWidth: 200 }}>{k.val}</span>
              </div>
            ))}
            {sel.field_note && (
              <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 3 }}>Field Note</p>
                <p style={{ fontSize: 12, color: '#78350f' }}>{sel.field_note}</p>
              </div>
            )}
            {/* Timeline */}
            {sel.timeline?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <p className="section-label" style={{ marginBottom: 12 }}>Status History</p>
                {sel.timeline.map((tl, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, marginTop: 3, background: i === 0 ? 'var(--brand)' : 'var(--border-dark)', boxShadow: i === 0 ? '0 0 0 3px rgba(20,184,166,.2)' : 'none' }} />
                      {i < sel.timeline.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', marginTop: 4 }} />}
                    </div>
                    <div style={{ paddingBottom: 6 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{tl.status}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{tl.time} · {tl.updated_by || 'System'}</p>
                      {tl.note && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{tl.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-brand" style={{ flex: 1, fontSize: 12, justifyContent: 'center' }} onClick={() => setUpdateModal(sel)}>
                {t('updateStatus')}
              </button>
              <button className="btn btn-outline" style={{ flex: 1, fontSize: 12, justifyContent: 'center' }} onClick={() => setReassignModal(sel)}>
                <Users size={12} /> {t('reassign')}
              </button>
            </div>
          </div>
        )}
      </div>

      {updateModal && <UpdateStatusModal ticket={updateModal} onClose={() => setUpdateModal(null)} onUpdate={handleStatusUpdate} isUpdating={isUpdating} />}
      {reassignModal && <ReassignModal ticket={reassignModal} personnel={personnelList} onClose={() => setReassignModal(null)} onReassign={handleReassign} isAssigning={isAssigning} />}
    </div>
  );
}
