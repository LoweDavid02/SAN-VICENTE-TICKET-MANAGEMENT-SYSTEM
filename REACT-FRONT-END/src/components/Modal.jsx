import { useEffect } from 'react';
import { X, LogOut, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../stores/langStore';
import Portal from './Portal';

/* ── Modal Wrapper ─────────────────────────────────────── */
function ModalWrapper({ children }) {
  const { closeModal } = useApp();

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeModal();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeModal]);

  return (
    <Portal>
      <div
        onClick={closeModal}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          background: 'rgba(9,18,32,.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          animation: 'fadeIn .2s ease-out both',
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#ffffff',
            border: '1px solid rgba(226,232,240,.9)',
            borderRadius: 18,
            boxShadow:
              '0 1px 0 rgba(255,255,255,.9) inset,' +
              '0 4px 8px rgba(15,23,42,.05),' +
              '0 16px 40px rgba(15,23,42,.14),' +
              '0 40px 80px rgba(15,23,42,.1)',
            animation: 'scaleIn .22s cubic-bezier(.34,1.56,.64,1) both',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
}

/* ── Shared button base ────────────────────────────────── */
const btnBase = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  padding: '9px 18px', borderRadius: 10, cursor: 'pointer',
  fontSize: '0.875rem', fontWeight: 600, fontFamily: 'inherit',
  transition: 'all .15s', border: 'none',
};

/* ── Logout Modal ──────────────────────────────────────── */
function LogoutModal({ onConfirm }) {
  const { closeModal } = useApp();
  const { t } = useT();
  return (
    <ModalWrapper>
      <div style={{ padding: '22px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a', boxShadow: '0 2px 8px rgba(245,158,11,.15)' }}>
            <LogOut size={18} style={{ color: '#ff0303ff' }} />
          </div>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.125rem', fontWeight: 400, color: '#0f172a', lineHeight: 1.2, marginBottom: 4 }}>{t('signOutTitle')}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>Your session will be securely terminated</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 12, marginBottom: 22, background: '#fffbeb', border: '1px solid #fde68a', borderLeft: '3px solid #f59e0b' }}>
          <AlertTriangle size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: '0.875rem', color: '#78350f', lineHeight: 1.55 }}>{t('signOutBody')}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={closeModal} style={{ ...btnBase, background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#e8edf2'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}>
            {t('staySignedIn')}
          </button>
          <button onClick={() => { closeModal(); onConfirm?.(); }} style={{ ...btnBase, color: '#fff', background: 'linear-gradient(135deg, #f50b0bff, #ff3030ff)', boxShadow: '0 2px 8px rgba(245,158,11,.35)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}>
            {t('signOut')}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

/* ── Confirm Modal ─────────────────────────────────────── */
function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger = false, onConfirm }) {
  const { closeModal } = useApp();
  const accentColor = danger ? '#ef4444' : '#2563eb';
  const accentBg    = danger ? '#fef2f2' : '#eff6ff';
  const accentBdr   = danger ? '#fecaca' : '#bfdbfe';

  return (
    <ModalWrapper>
      <div style={{ height: 3, background: danger ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #2563eb, #60a5fa)' }} />
      <div style={{ padding: '22px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: accentBg, border: `1px solid ${accentBdr}`,
            }}
          >
            <AlertTriangle size={16} style={{ color: accentColor }} />
          </div>
          <h3
            className="font-display"
            style={{ fontSize: '1.0625rem', fontWeight: 400, color: '#0f172a', marginTop: 6 }}
          >
            {title}
          </h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, marginBottom: 22 }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={closeModal}
            style={{ ...btnBase, background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e8edf2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          >
            Cancel
          </button>
          <button
            onClick={() => { closeModal(); onConfirm?.(); }}
            style={{
              ...btnBase, color: '#fff',
              background: danger ? '#ef4444' : '#2563eb',
              boxShadow: danger ? '0 2px 8px rgba(239,68,68,.3)' : '0 2px 8px rgba(37,99,235,.3)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = danger ? '#dc2626' : '#1d4ed8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = danger ? '#ef4444' : '#2563eb'; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

/* ── Success Modal ─────────────────────────────────────── */
function SuccessModal({ title, message }) {
  const { closeModal } = useApp();
  return (
    <ModalWrapper>
      <div style={{ padding: '32px 28px', textAlign: 'center' }}>
        <div
          style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            border: '1px solid #a7f3d0',
            boxShadow: '0 4px 12px rgba(5,150,105,.15)',
          }}
        >
          <CheckCircle size={22} style={{ color: '#059669' }} />
        </div>
        <h3
          className="font-display"
          style={{ fontSize: '1.125rem', fontWeight: 400, color: '#0f172a', marginBottom: 8 }}
        >
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, marginBottom: 22 }}>{message}</p>
        <button
          onClick={closeModal}
          style={{
            ...btnBase,
            color: '#fff', background: '#059669',
            boxShadow: '0 2px 8px rgba(5,150,105,.25)',
            padding: '9px 28px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#047857'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#059669'; }}
        >
          Done
        </button>
      </div>
    </ModalWrapper>
  );
}

/* ── Info Modal ────────────────────────────────────────── */
function InfoModal({ title, children }) {
  const { closeModal } = useApp();
  return (
    <ModalWrapper>
      <div style={{ padding: '20px 22px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#eff6ff', border: '1px solid #bfdbfe',
              }}
            >
              <Info size={15} style={{ color: '#2563eb' }} />
            </div>
            <h3
              className="font-display"
              style={{ fontSize: '1.0625rem', fontWeight: 400, color: '#0f172a' }}
            >
              {title}
            </h3>
          </div>
          <button
            onClick={closeModal}
            style={{
              width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', color: '#94a3b8', transition: 'all .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 }}>
          {children}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button
            onClick={closeModal}
            style={{ ...btnBase, background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e8edf2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          >
            Close
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}

/* ── Modal Router ──────────────────────────────────────── */
export default function ModalRoot() {
  const { modal } = useApp();
  if (!modal) return null;

  const { type, props } = modal;
  if (type === 'logout')  return <LogoutModal  {...props} />;
  if (type === 'confirm') return <ConfirmModal {...props} />;
  if (type === 'success') return <SuccessModal {...props} />;
  if (type === 'info')    return <InfoModal    {...props} />;
  return null;
}
