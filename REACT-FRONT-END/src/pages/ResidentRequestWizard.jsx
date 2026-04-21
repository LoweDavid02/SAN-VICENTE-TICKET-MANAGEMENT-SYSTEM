import { useState, useRef } from 'react';
import {
  CheckCircle, ArrowRight, ArrowLeft,
  MapPin, AlertTriangle, FileText, Hash,
  Upload, X, Image as ImageIcon,
} from 'lucide-react';
import { useSubmitTicket } from '../hooks/useTicketApi';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 'streetlight', label: 'Streetlight Outage', icon: '💡', dept: 'Infrastructure' },
  { id: 'drainage',    label: 'Drainage / Flood',   icon: '💧', dept: 'Public Works'   },
  { id: 'road',        label: 'Road Damage',         icon: '🛣️', dept: 'Infrastructure' },
  { id: 'waste',       label: 'Waste Management',    icon: '🗑️', dept: 'Sanitation'     },
  { id: 'water',       label: 'Water Supply',        icon: '💦', dept: 'Utilities'      },
  { id: 'other',       label: 'Other Issues',        icon: '📋', dept: 'General'        },
];

const STEPS = ['Category', 'Details', 'Location', 'Review'];

const SEVERITY = [
  { value: 'Low',    icon: '😊', color: '#059669', bg: 'rgba(5,150,105,.07)',  label: 'Non-urgent' },
  { value: 'Medium', icon: '⚠️', color: '#d97706', bg: 'rgba(217,119,6,.07)',  label: 'Moderate'   },
  { value: 'High',   icon: '🚨', color: '#ef4444', bg: 'rgba(239,68,68,.07)',  label: 'Urgent'     },
];

/* ── Centering shell — defined OUTSIDE component to prevent remount ── */
function Shell({ children }) {
  return (
    <div className="wizard-shell" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 'min(55vw, 680px)', minWidth: 320, maxWidth: '100%' }}>
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  height: 44,
  padding: '0 16px',
  borderRadius: 11,
  fontSize: '0.9375rem',
  color: '#0f172a',
  background: '#f8fafc',
  border: '1.5px solid #e2e8f0',
  boxShadow: 'inset 0 1px 2px rgba(15,23,42,.04)',
  outline: 'none',
  transition: 'all .18s',
  fontFamily: 'inherit',
};

const onFocus = (e) => {
  e.target.style.borderColor = '#2563eb';
  e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,.1), inset 0 1px 2px rgba(15,23,42,.04)';
  e.target.style.background = '#fff';
};
const onBlur = (e) => {
  e.target.style.borderColor = '#e2e8f0';
  e.target.style.boxShadow = 'inset 0 1px 2px rgba(15,23,42,.04)';
  e.target.style.background = '#f8fafc';
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 8,
};

export default function ResidentRequestWizard() {
  const navigate               = useNavigate();
  const [step, setStep]        = useState(0);
  const [submitted, setSubmit] = useState(null);
  const [form, setForm]        = useState({ category: '', description: '', location: '', severity: 'Medium' });
  const [images, setImages]    = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const fileInputRef           = useRef(null);
  const { mutateAsync: submitTicket, isPending: isSubmitting } = useSubmitTicket();

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    const newImgs = files
      .filter((f) => f.type.startsWith('image/') || f.type === 'application/pdf')
      .slice(0, 5 - images.length)
      .map((f) => ({ file: f, url: URL.createObjectURL(f), name: f.name, size: f.size, type: f.type }));
    setImages((prev) => [...prev, ...newImgs].slice(0, 5));
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const valid = () => {
    if (step === 0) return form.category !== '';
    if (step === 1) return form.description.length > 10;
    if (step === 2) return form.location !== '';
    return true;
  };

  const submit = async () => {
    setSubmitError(null);
    try {
      // Convert image files to base64 for API submission
      const imageBase64 = await Promise.all(
        images.map((img) => new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(img.file);
        }))
      );

      const { data } = await submitTicket({
        title:       CATEGORIES.find((c) => c.id === form.category)?.label || form.category,
        description: form.description,
        category:    form.category,
        location:    form.location,
        severity:    form.severity,
        images:      imageBase64,
      });

      setSubmit({
        ...form,
        images,
        trackingNumber: data.data?.trackingId || data.data?.ticket?.tracking_id,
      });
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit request. Please try again.');
    }
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <Shell>
        <div
          className="animate-scale-in"
          style={{
            borderRadius: 20,
            padding: '52px 48px',
            textAlign: 'center',
            background: '#ffffff',
            border: '1px solid rgba(226,232,240,.85)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,.9) inset,' +
              '0 2px 4px rgba(15,23,42,.04),' +
              '0 12px 32px rgba(15,23,42,.08)',
          }}
        >
          <div
            style={{
              width: 64, height: 64, borderRadius: 18, margin: '0 auto 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              border: '1px solid #a7f3d0',
              boxShadow: '0 4px 16px rgba(5,150,105,.18)',
            }}
          >
            <CheckCircle size={30} style={{ color: '#059669' }} />
          </div>

          <h2
            className="font-display"
            style={{ fontSize: '1.75rem', fontWeight: 400, color: '#0f172a', marginBottom: 8 }}
          >
            Request Submitted
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#64748b', marginBottom: 20 }}>
            Your tracking number — save this for reference
          </p>

          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '12px 24px', borderRadius: 14, marginBottom: 24,
              fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
              border: '1.5px solid #bfdbfe',
              color: '#1d4ed8',
              boxShadow: '0 2px 10px rgba(37,99,235,.14)',
            }}
          >
            <Hash size={18} />
            {submitted.trackingNumber}
          </div>

          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: 32, lineHeight: 1.7 }}>
            Our team will review your request within 24 hours.<br />
            You can track progress on your dashboard.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => { setSubmit(null); setStep(0); setForm({ category: '', description: '', location: '', severity: 'Medium' }); setImages([]); }}
              style={{
                padding: '11px 24px', borderRadius: 11, cursor: 'pointer',
                fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'inherit',
                background: '#f1f5f9', color: '#334155',
                border: '1px solid #e2e8f0', transition: 'all .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e8edf2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            >
              Submit Another
            </button>
            <button
              onClick={() => navigate('/resident/dashboard')}
              style={{
                padding: '11px 24px', borderRadius: 11, cursor: 'pointer',
                fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'inherit',
                color: '#fff', border: 'none',
                background: '#2563eb',
                boxShadow: '0 2px 10px rgba(37,99,235,.32)',
                transition: 'all .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = ''; }}
            >
              View Dashboard
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#94a3b8', marginTop: 20 }}>
          Barangay Connect · Centralized Intelligence Platform · v4.2.1-stable
        </p>
      </Shell>
    );
  }

  /* ── Wizard ── */
  return (
    <Shell>
      <div className="animate-fade-up">

        {/* ── Stepper ── */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700,
                    background: i < step ? '#059669' : i === step ? '#2563eb' : '#f1f5f9',
                    color: i <= step ? '#fff' : '#94a3b8',
                    boxShadow: i === step ? '0 0 0 5px rgba(37,99,235,.15)' : 'none',
                    transition: 'all .25s',
                  }}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <p style={{
                  fontSize: '11px', fontWeight: 600, marginTop: 7,
                  color: i < step ? '#059669' : i === step ? '#2563eb' : '#94a3b8',
                  transition: 'color .25s',
                }}>
                  {s}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: '0 10px', marginBottom: 20, borderRadius: 99,
                  background: i < step ? '#059669' : '#e2e8f0',
                  transition: 'background .3s',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step card ── */}
        <div
          style={{
            borderRadius: 18,
            marginBottom: 16,
            background: '#ffffff',
            border: '1px solid rgba(226,232,240,.85)',
            boxShadow:
              '0 1px 0 rgba(255,255,255,.9) inset,' +
              '0 2px 4px rgba(15,23,42,.04),' +
              '0 8px 24px rgba(15,23,42,.06)',
            overflow: 'hidden',
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: '18px 28px',
              borderBottom: '1px solid #f1f5f9',
              background: 'linear-gradient(180deg, #fafbfc 0%, #f8fafc 100%)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            {step === 0 && <FileText  size={17} style={{ color: '#2563eb', flexShrink: 0 }} />}
            {step === 1 && <FileText  size={17} style={{ color: '#2563eb', flexShrink: 0 }} />}
            {step === 2 && <MapPin    size={17} style={{ color: '#2563eb', flexShrink: 0 }} />}
            {step === 3 && <CheckCircle size={17} style={{ color: '#2563eb', flexShrink: 0 }} />}
            <div>
              <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                {["What's the issue?", 'Describe the issue', 'Location & severity', 'Review & submit'][step]}
              </p>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: 2 }}>
                {[
                  'Select the category that best describes your concern.',
                  'Provide details to help our team respond faster.',
                  'Help us find and prioritize your request.',
                  'Confirm your request details before submitting.',
                ][step]}
              </p>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: '28px 28px 32px' }}>

            {/* Step 0 — Category */}
            {step === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                {CATEGORIES.map((c) => {
                  const sel = form.category === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => { set('category')(c.id); setTimeout(() => setStep(1), 200); }}
                      style={{
                        padding: '22px 14px', borderRadius: 14, textAlign: 'center', cursor: 'pointer',
                        border: `1.5px solid ${sel ? '#2563eb' : '#e8edf2'}`,
                        background: sel
                          ? 'linear-gradient(135deg, rgba(37,99,235,.08), rgba(29,78,216,.04))'
                          : '#fafbfc',
                        boxShadow: sel
                          ? '0 0 0 3px rgba(37,99,235,.12)'
                          : '0 1px 3px rgba(15,23,42,.05)',
                        transition: 'all .18s',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        if (!sel) {
                          e.currentTarget.style.borderColor = '#2563eb';
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,23,42,.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!sel) {
                          e.currentTarget.style.borderColor = '#e8edf2';
                          e.currentTarget.style.transform = '';
                          e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,.05)';
                        }
                      }}
                    >
                      <div style={{ fontSize: '1.75rem', marginBottom: 10 }}>{c.icon}</div>
                      <p style={{ fontSize: '12.5px', fontWeight: 600, color: sel ? '#1d4ed8' : '#334155', lineHeight: 1.3 }}>
                        {c.label}
                      </p>
                      <p style={{ fontSize: '10px', fontWeight: 500, color: '#94a3b8', marginTop: 4 }}>
                        {c.dept}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 1 — Details */}
            {step === 1 && (
              <div>
                <label style={labelStyle}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set('description')(e.target.value)}
                  placeholder="Describe the issue in detail — include what you observed, when it started, and any safety concerns…"
                  rows={6}
                  style={{
                    ...inputStyle,
                    height: 'auto',
                    padding: '14px 16px',
                    resize: 'none',
                    lineHeight: 1.65,
                    fontSize: '0.9375rem',
                  }}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                  <p style={{ fontSize: '12px', color: form.description.length > 10 ? '#059669' : '#94a3b8' }}>
                    {form.description.length > 10 ? '✓ Sufficient detail' : `${form.description.length} / 10 chars minimum`}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>{form.description.length} chars</p>
                </div>

                {/* ── Photo Evidence Upload ── */}
                <div style={{ marginTop: 22 }}>
                  <label style={labelStyle}>
                    Photo / File Evidence{' '}
                    <span style={{ color: '#cbd5e1', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                      (optional, max 5)
                    </span>
                  </label>

                  {/* Show drop-zone only when NO files uploaded yet */}
                  {images.length === 0 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#2563eb';
                        e.currentTarget.style.background = 'rgba(37,99,235,.04)';
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.background = '#fafbfc';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.background = '#fafbfc';
                        if (e.dataTransfer.files.length) {
                          handleImageAdd({ target: { files: e.dataTransfer.files, value: '' } });
                        }
                      }}
                      style={{
                        border: '2px dashed #e2e8f0',
                        borderRadius: 12,
                        padding: '24px 16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: '#fafbfc',
                        transition: 'all .18s',
                      }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, margin: '0 auto 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#eff6ff',
                      }}>
                        <Upload size={20} style={{ color: '#2563eb' }} />
                      </div>
                      <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                        Click to upload or drag & drop
                      </p>
                      <p style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                        PNG, JPG, WEBP, PDF · Max 10 MB each
                      </p>
                    </div>
                  )}

                  {/* After upload: thumbnail grid + "+" add button */}
                  {images.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
                      gap: 10,
                    }}>
                      {/* Existing thumbnails */}
                      {images.map((img, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative', borderRadius: 12, overflow: 'hidden',
                            border: '1px solid #e2e8f0', background: '#f8fafc',
                            aspectRatio: '1',
                          }}
                        >
                          {img.type.startsWith('image/') ? (
                            <img
                              src={img.url}
                              alt={img.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                              <ImageIcon size={24} style={{ color: '#94a3b8' }} />
                              <p style={{ fontSize: '9px', color: '#94a3b8', textAlign: 'center', padding: '0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' }}>
                                {img.name}
                              </p>
                            </div>
                          )}
                          {/* Remove × */}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                            style={{
                              position: 'absolute', top: 5, right: 5,
                              width: 22, height: 22, borderRadius: '50%',
                              background: 'rgba(15,23,42,.72)', border: 'none', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', transition: 'background .15s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15,23,42,.72)'; }}
                          >
                            <X size={11} />
                          </button>
                          {/* Size chip */}
                          <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            padding: '3px 6px',
                            background: 'rgba(15,23,42,.55)',
                            fontSize: '9px', color: '#fff', textAlign: 'center',
                          }}>
                            {(img.size / 1024).toFixed(0)} KB
                          </div>
                        </div>
                      ))}

                      {/* "+" add more button — only if under limit */}
                      {images.length < 5 && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            aspectRatio: '1',
                            borderRadius: 12,
                            border: '2px dashed #bfdbfe',
                            background: '#f0f7ff',
                            cursor: 'pointer',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            gap: 6,
                            transition: 'all .18s',
                            fontFamily: 'inherit',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#2563eb';
                            e.currentTarget.style.background = '#dbeafe';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#bfdbfe';
                            e.currentTarget.style.background = '#f0f7ff';
                          }}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: '#2563eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span style={{ color: '#fff', fontSize: '20px', lineHeight: 1, fontWeight: 300 }}>+</span>
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: 600, color: '#2563eb' }}>
                            Add more
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleImageAdd}
                  />
                </div>
              </div>
            )}

            {/* Step 2 — Location & Severity */}
            {step === 2 && (
              <div>
                <label style={labelStyle}>Location *</label>
                <div style={{ position: 'relative', marginBottom: 24 }}>
                  <MapPin
                    size={15}
                    style={{
                      position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                      pointerEvents: 'none', color: form.location ? '#2563eb' : '#94a3b8',
                    }}
                  />
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => set('location')(e.target.value)}
                    placeholder="Street name, landmark, or purok…"
                    style={{ ...inputStyle, paddingLeft: 42 }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>

                <label style={labelStyle}>Severity *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                  {SEVERITY.map((s) => {
                    const sel = form.severity === s.value;
                    return (
                      <button
                        key={s.value}
                        onClick={() => set('severity')(s.value)}
                        style={{
                          padding: '18px 14px', borderRadius: 14, textAlign: 'center', cursor: 'pointer',
                          border: `1.5px solid ${sel ? s.color : '#e8edf2'}`,
                          background: sel ? s.bg : '#fafbfc',
                          color: sel ? s.color : '#64748b',
                          boxShadow: sel ? `0 0 0 3px ${s.color}20` : '0 1px 3px rgba(15,23,42,.05)',
                          transition: 'all .18s',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={(e) => {
                          if (!sel) {
                            e.currentTarget.style.borderColor = s.color;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!sel) {
                            e.currentTarget.style.borderColor = '#e8edf2';
                            e.currentTarget.style.transform = '';
                          }
                        }}
                      >
                        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{s.icon}</div>
                        <p style={{ fontSize: '13px', fontWeight: 700 }}>{s.value}</p>
                        <p style={{ fontSize: '11px', marginTop: 3, opacity: .7 }}>{s.label}</p>
                      </button>
                    );
                  })}
                </div>

                {form.severity === 'High' && (
                  <div
                    className="animate-fade-in"
                    style={{
                      display: 'flex', gap: 12, padding: '12px 16px', borderRadius: 12, marginTop: 16,
                      background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.18)',
                      borderLeft: '3px solid #ef4444',
                    }}
                  >
                    <AlertTriangle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: '13px', color: '#b91c1c', lineHeight: 1.55 }}>
                      <strong>High severity</strong> requests are escalated immediately to the barangay emergency response team.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <div>
                <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #e8edf2' }}>
                  {[
                    { label: 'Category',    value: CATEGORIES.find((c) => c.id === form.category)?.label || form.category },
                    { label: 'Description', value: form.description },
                    { label: 'Location',    value: form.location    },
                    { label: 'Severity',    value: form.severity    },
                  ].map((r, i) => (
                    <div
                      key={r.label}
                      style={{
                        display: 'flex', gap: 20, padding: '14px 20px',
                        borderTop: i > 0 ? '1px solid #f1f5f9' : 'none',
                        background: i % 2 === 0 ? '#ffffff' : '#fafbfc',
                      }}
                    >
                      <span style={{
                        fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.07em', color: '#94a3b8', width: 96, flexShrink: 0, paddingTop: 2,
                      }}>
                        {r.label}
                      </span>
                      <span style={{ fontSize: '0.9375rem', color: '#0f172a', lineHeight: 1.55 }}>{r.value}</span>
                    </div>
                  ))}
                </div>
                {/* Evidence preview in review */}
                {images.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ ...labelStyle, marginBottom: 10 }}>Evidence ({images.length} file{images.length > 1 ? 's' : ''})</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {images.map((img, idx) => (
                        <div key={idx} style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0 }}>
                          {img.type.startsWith('image/') ? (
                            <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImageIcon size={20} style={{ color: '#94a3b8' }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: 14, lineHeight: 1.55 }}>
                  By submitting, you confirm this information is accurate.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* ── Navigation ── */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '11px 22px', borderRadius: 11, cursor: 'pointer',
                fontSize: '0.9375rem', fontWeight: 600, fontFamily: 'inherit',
                background: '#f1f5f9', color: '#334155',
                border: '1px solid #e2e8f0', transition: 'all .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e8edf2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            >
              <ArrowLeft size={15} /> Back
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!valid()}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                marginLeft: 'auto', padding: '11px 28px', borderRadius: 11,
                cursor: valid() ? 'pointer' : 'not-allowed',
                fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'inherit',
                color: '#fff', border: 'none',
                background: '#2563eb',
                boxShadow: '0 2px 10px rgba(37,99,235,.32)',
                opacity: valid() ? 1 : 0.4,
                transition: 'all .15s',
              }}
              onMouseEnter={(e) => {
                if (valid()) {
                  e.currentTarget.style.background = '#1d4ed8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,.38)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2563eb';
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(37,99,235,.32)';
              }}
            >
              Continue <ArrowRight size={15} />
            </button>
          ) : (
            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              {submitError && (
                <p style={{ fontSize: 12, color: '#dc2626', maxWidth: 300, textAlign: 'right' }}>{submitError}</p>
              )}
              <button
                onClick={submit}
                disabled={isSubmitting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '11px 28px', borderRadius: 11,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'inherit',
                  color: '#fff', border: 'none',
                  background: isSubmitting ? '#6b7280' : '#059669',
                  boxShadow: isSubmitting ? 'none' : '0 2px 10px rgba(5,150,105,.32)',
                  transition: 'all .15s',
                  opacity: isSubmitting ? 0.8 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = '#047857';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(5,150,105,.38)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = '#059669';
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(5,150,105,.32)';
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'spin .65s linear infinite' }} />
                    Submitting…
                  </>
                ) : (
                  <><CheckCircle size={15} /> Submit Request</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Branding footer */}
        <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#94a3b8', marginTop: 20 }}>
          Barangay Connect · Centralized Intelligence Platform · v4.2.1-stable
        </p>

      </div>
    </Shell>
  );
}
