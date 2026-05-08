/**
 * FieldWorkTask — Personnel Portal feature component.
 * Clean, minimal design — no colored stripes on cards or modals.
 */

import { useState } from 'react';
import {
  MapPin, Clock, CheckCircle2, X,
  Image as ImageIcon, ArrowRight, ChevronRight,
} from 'lucide-react';
import { STATUS_CFG, SEVERITY_CFG } from '../../../constants/tickets';
import { useFieldWorkTask } from './useFieldWorkTask';
import { useT } from '../../../stores/langStore';
import Portal from '../../../components/Portal';

/* ── Shared badge ── */
function Badge({ label, color, bg, border }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 11, fontWeight: 600,
      padding: '3px 9px', borderRadius: 99,
      background: bg, color, border: `1px solid ${border}`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

/* ── Update Status Modal ── */
function UpdateStatusModal({ task, availableStatuses, onClose, onUpdate }) {
  const [newStatus, setNewStatus] = useState(task.status);
  const [note, setNote]           = useState('');

  return (
    <Portal>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(15,23,42,.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          animation: 'fadeIn .18s ease-out both',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 440,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            boxShadow: '0 4px 6px rgba(15,23,42,.04), 0 20px 48px rgba(15,23,42,.12)',
            overflow: 'hidden',
            animation: 'scaleIn .2s cubic-bezier(.34,1.56,.64,1) both',
          }}
        >
          {/* Header — no colored stripe */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            padding: '20px 22px 16px',
            borderBottom: '1px solid #f1f5f9',
          }}>
            <div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                Update Task Status
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                {task.tracking_id || task.id} · {task.title?.slice(0, 40)}{task.title?.length > 40 ? '…' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#64748b', flexShrink: 0, transition: 'background .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ padding: '18px 22px 22px' }}>
            {/* Status options */}
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              New Status
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {availableStatuses.map((s) => {
                const sc  = STATUS_CFG[s] || STATUS_CFG['Pending'];
                const sel = newStatus === s;
                return (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 14px', borderRadius: 10, cursor: 'pointer',
                      border: `1.5px solid ${sel ? sc.border : '#e8edf2'}`,
                      background: sel ? sc.bg : '#fafbfc',
                      transition: 'all .15s', fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => { if (!sel) e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseLeave={(e) => { if (!sel) e.currentTarget.style.borderColor = '#e8edf2'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: sel ? 700 : 500, color: sel ? sc.color : '#334155' }}>{s}</span>
                      {s === 'Completed' && (
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>— Resident will be notified</span>
                      )}
                    </div>
                    {sel && (
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: sc.dot, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Field note */}
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Field Note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe what was done, materials used, or any issues encountered…"
              rows={3}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, resize: 'none', fontSize: '0.875rem', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, transition: 'border-color .15s, box-shadow .15s' }}
              onFocus={(e) => { e.target.style.borderColor = '#94a3b8'; e.target.style.boxShadow = '0 0 0 3px rgba(148,163,184,.12)'; e.target.style.background = '#fff'; }}
              onBlur={(e)  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; e.target.style.background = '#f8fafc'; }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
              <button
                onClick={onClose}
                style={{ padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', transition: 'background .15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e8edf2'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              >
                Cancel
              </button>
              <button
                onClick={() => { onUpdate(task.id, newStatus, note); onClose(); }}
                style={{ padding: '9px 22px', borderRadius: 10, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, fontFamily: 'inherit', color: '#fff', border: 'none', background: '#0f172a', transition: 'all .15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = ''; }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}

/* ── Main component ── */
export default function FieldWorkTask() {
  const { t } = useT();
  const {
    visibleTasks, filter, setFilter, FILTERS,
    selected, selectTask,
    updateModal, openUpdateModal, closeUpdateModal,
    handleStatusUpdate, getAvailableStatuses,
    isLoading,
  } = useFieldWorkTask();

  if (isLoading && !visibleTasks.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2.5px solid #e2e8f0', borderTopColor: '#64748b', animation: 'spin .65s linear infinite' }} />
        <p style={{ fontSize: 13, color: '#94a3b8' }}>{t('loading')}</p>
      </div>
    );
  }

  const getResidentName = (task) => {
    if (!task?.resident) return '—';
    if (typeof task.resident === 'string') return task.resident;
    return task.resident?.full_name || task.resident?.email || '—';
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            {t('myTasks')}
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: 3 }}>
            Assigned service requests — update status after fieldwork
          </p>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 14px', borderRadius: 99, fontSize: '11.5px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                background: filter === f ? '#0f172a' : 'var(--surface)',
                color:      filter === f ? '#fff'    : 'var(--text-3)',
                border:     filter === f ? 'none'    : '1px solid var(--border)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Task list ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleTasks.map((task) => {
            const sc       = STATUS_CFG[task.status] || STATUS_CFG['Pending'];
            const sevCfg   = SEVERITY_CFG[task.severity] || {};
            const isActive = selected?.id === task.id;

            return (
              <div
                key={task.id}
                onClick={() => selectTask(task)}
                style={{
                  borderRadius: 12,
                  background: 'var(--surface)',
                  border: `1.5px solid ${isActive ? '#0f172a' : 'var(--border)'}`,
                  boxShadow: isActive
                    ? '0 0 0 3px rgba(15,23,42,.08), 0 4px 12px rgba(15,23,42,.06)'
                    : '0 1px 3px rgba(15,23,42,.04)',
                  cursor: 'pointer',
                  transition: 'all .18s',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,.07)'; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,.04)'; } }}
              >
                <div style={{ padding: '16px 18px' }}>
                  {/* Top row: ID + badges + chevron */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: 'var(--text-3)' }}>
                        {task.tracking_id || task.id}
                      </span>
                      <Badge
                        label={task.status}
                        color={sc.color}
                        bg={sc.bg}
                        border={sc.border}
                      />
                      <Badge
                        label={task.severity}
                        color={sevCfg.color || '#64748b'}
                        bg={sevCfg.bg || '#f1f5f9'}
                        border={`${sevCfg.color || '#94a3b8'}30`}
                      />
                    </div>
                    {task.status === 'Completed'
                      ? <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                      : <ChevronRight size={16} style={{ color: 'var(--text-4)', flexShrink: 0, transform: isActive ? 'rotate(90deg)' : '', transition: 'transform .2s' }} />
                    }
                  </div>

                  {/* Title */}
                  <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.35, marginBottom: 8 }}>
                    {task.title}
                  </p>

                  {/* Meta */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '12px', color: 'var(--text-4)', marginBottom: task.status !== 'Completed' ? 12 : 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} strokeWidth={1.8} /> {task.location || '—'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} strokeWidth={1.8} /> {task.updated}
                    </span>
                  </div>

                  {/* Update button */}
                  {task.status !== 'Completed' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openUpdateModal(task); }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 8,
                        border: '1.5px solid #e2e8f0',
                        background: '#f8fafc',
                        cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                        color: '#334155', fontFamily: 'inherit',
                        transition: 'all .15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                      <ArrowRight size={12} strokeWidth={2} /> {t('updateStatus')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {visibleTasks.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-4)', fontSize: '13px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
              {t('noTasks')}
            </div>
          )}
        </div>

        {/* ── Detail panel ── */}
        {selected && (
          <div
            className="animate-slide-in"
            style={{
              borderRadius: 12,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 3px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.06)',
              overflow: 'hidden',
              position: 'sticky', top: 88,
            }}
          >
            {/* Panel header — no colored stripe */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              padding: '16px 18px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--surface-2)',
            }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 600, color: 'var(--text-4)' }}>
                  {selected.tracking_id || selected.id}
                </span>
                <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-1)', marginTop: 3, lineHeight: 1.3 }}>
                  {selected.title}
                </p>
              </div>
              <button
                onClick={() => selectTask(selected)}
                style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-3)', color: 'var(--text-3)', flexShrink: 0, transition: 'background .15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-3)'; }}
              >
                <X size={13} />
              </button>
            </div>

            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Badges */}
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {(() => {
                  const sc     = STATUS_CFG[selected.status] || STATUS_CFG['Pending'];
                  const sevCfg = SEVERITY_CFG[selected.severity] || {};
                  return (
                    <>
                      <Badge label={selected.status}   color={sc.color}              bg={sc.bg}       border={sc.border} />
                      <Badge label={selected.severity} color={sevCfg.color || '#64748b'} bg={sevCfg.bg || '#f1f5f9'} border={`${sevCfg.color || '#94a3b8'}30`} />
                    </>
                  );
                })()}
              </div>

              {/* Detail rows */}
              {[
                { label: 'Location',  value: selected.location          },
                { label: 'Resident',  value: getResidentName(selected)  },
                { label: 'Submitted', value: selected.submitted         },
                { label: 'Updated',   value: selected.updated           },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-4)', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-1)', textAlign: 'right' }}>{value || '—'}</span>
                </div>
              ))}

              {/* Description */}
              {selected.description && (
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
                    Description
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.65, padding: '10px 12px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    {selected.description}
                  </p>
                </div>
              )}

              {/* Field note */}
              {selected.field_note && (
                <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
                    Field Note
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.55 }}>{selected.field_note}</p>
                </div>
              )}

              {/* Evidence */}
              {(() => {
                const images = Array.isArray(selected.images) ? selected.images : [];
                return images.length > 0 && (
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                      Evidence ({images.length})
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 6 }}>
                      {images.map((img, idx) => (
                        <div key={idx} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer' }} onClick={() => window.open(img.url, '_blank')}>
                          {img.type?.startsWith('image/')
                            ? <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={14} style={{ color: 'var(--text-4)' }} /></div>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Update button */}
              {selected.status !== 'Completed' && (
                <button
                  onClick={() => openUpdateModal(selected)}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 10,
                    border: '1.5px solid #0f172a',
                    background: '#0f172a', color: '#fff',
                    fontSize: '13px', fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    transition: 'all .15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = ''; }}
                >
                  <ArrowRight size={14} strokeWidth={2.5} /> {t('updateStatus')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {updateModal && (
        <UpdateStatusModal
          task={updateModal}
          availableStatuses={getAvailableStatuses(updateModal.status)}
          onClose={closeUpdateModal}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
