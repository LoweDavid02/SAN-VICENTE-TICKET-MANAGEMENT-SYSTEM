import { useState, useRef } from 'react';
import { Camera, Save, Star, Shield, Briefcase, Calendar, Phone, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const PERSONNEL = {
  name: 'Engr. Elias Santos',
  role: 'Field Engineer',
  dept: 'Infrastructure',
  level: 3,
  avatar: 'ES',
  rating: 4.8,
  joined: 'Mar 2021',
  phone: '+63 912 345 6789',
  email: 'e.santos@barangay.gov',
  bio: 'Field engineer specializing in road and drainage infrastructure. 4+ years of service.',
};

const RATINGS = [
  { label: 'Resolution Speed',      score: 4.8 },
  { label: 'Resident Satisfaction', score: 4.5 },
  { label: 'Report Accuracy',       score: 4.9 },
  { label: 'Response Time',         score: 4.7 },
];

function StarRow({ score }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={13} fill={s <= Math.round(score) ? '#f59e0b' : 'none'} color={s <= Math.round(score) ? '#f59e0b' : '#e2e8f0'} strokeWidth={1.5} />
      ))}
    </div>
  );
}

export default function PersonnelProfile() {
  const { openModal } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: PERSONNEL.name, email: PERSONNEL.email, phone: PERSONNEL.phone, bio: PERSONNEL.bio });
  const [savedForm, setSavedForm] = useState({ name: PERSONNEL.name, email: PERSONNEL.email, phone: PERSONNEL.phone, bio: PERSONNEL.bio });
  const [avatar, setAvatar] = useState(null);
  const fileRef             = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSaveClick = () => {
    openModal('confirm', {
      title: 'Save profile changes?',
      message: 'Your profile information will be updated.',
      confirmLabel: 'Save Changes',
      danger: false,
      onConfirm: () => {
        setSavedForm({ ...form });
        setEditing(false);
        openModal('success', { title: 'Profile updated', message: 'Your profile information has been saved.' });
      },
    });
  };

  const handleCancel = () => { setForm({ ...savedForm }); setEditing(false); };

  const inputFocus = (e) => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,.1)'; e.target.style.background = '#fff'; };
  const inputBlur  = (e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; e.target.style.background = '#f8fafc'; };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>My Profile</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-4)', marginTop: 2 }}>{editing ? 'Edit your personnel account' : 'View your personnel account'}</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 18px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 2px 8px rgba(245,158,11,.3)', transition: 'all .15s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}>
            <Save size={13} /> Edit Profile
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Avatar card */}
          <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid rgba(226,232,240,.85)', boxShadow: '0 1px 2px rgba(15,23,42,.04)' }}>
            <div style={{ height: 56, background: 'linear-gradient(135deg, #1c1917, #292524)' }} />
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ position: 'relative', width: 'fit-content', marginTop: -28, marginBottom: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#fff', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(245,158,11,.3)', overflow: 'hidden' }}>
                  {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : PERSONNEL.avatar}
                </div>
                <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: -2, right: -2, width: 22, height: 22, borderRadius: '50%', background: '#0f172a', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                  <Camera size={11} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) setAvatar(URL.createObjectURL(f)); }} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{form.name}</p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>{PERSONNEL.role}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>Level {PERSONNEL.level}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>● Active</span>
              </div>
            </div>
          </div>

          {/* Account details */}
          <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid rgba(226,232,240,.85)', boxShadow: '0 1px 2px rgba(15,23,42,.04)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Account Details</p>
            </div>
            {[
              { icon: Calendar,  label: 'Joined',      value: PERSONNEL.joined,  color: '#f59e0b' },
              { icon: Briefcase, label: 'Department',   value: PERSONNEL.dept,    color: '#2563eb' },
              { icon: Shield,    label: 'Level',        value: `Level ${PERSONNEL.level}`, color: '#8b5cf6' },
              { icon: Star,      label: 'Rating',       value: `${PERSONNEL.rating}/5.0`, color: '#f59e0b' },
            ].map(({ icon: Icon, label, value, color }, idx, arr) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: idx < arr.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: '#94a3b8' }}>{label}</p>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Performance ratings */}
          <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid rgba(226,232,240,.85)', boxShadow: '0 1px 2px rgba(15,23,42,.04)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Performance</p>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {RATINGS.map((r) => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{r.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StarRow score={r.score} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', minWidth: 28 }}>{r.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Personal info */}
          <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid rgba(226,232,240,.85)', boxShadow: '0 1px 2px rgba(15,23,42,.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={13} style={{ color: '#d97706' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Personal Information</p>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>Update your contact details</p>
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              {editing ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[
                      { label: 'Full Name', key: 'name',  icon: null  },
                      { label: 'Email',     key: 'email', icon: Mail  },
                      { label: 'Phone',     key: 'phone', icon: Phone },
                    ].map(({ label, key, icon: Icon }) => (
                      <div key={key} style={{ gridColumn: key === 'name' ? '1 / -1' : 'auto' }}>
                        <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</label>
                        <div style={{ position: 'relative' }}>
                          {Icon && <Icon size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />}
                          <input value={form[key]} onChange={set(key)} style={{ width: '100%', height: 38, paddingLeft: Icon ? 32 : 12, paddingRight: 12, borderRadius: 10, fontSize: '0.875rem', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', transition: 'all .18s' }} onFocus={inputFocus} onBlur={inputBlur} />
                        </div>
                      </div>
                    ))}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Bio</label>
                      <textarea value={form.bio} onChange={set('bio')} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontSize: '0.875rem', color: '#0f172a', background: '#f8fafc', border: '1.5px solid #e2e8f0', outline: 'none', fontFamily: 'inherit', resize: 'none', lineHeight: 1.6, transition: 'all .18s' }} onFocus={inputFocus} onBlur={inputBlur} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                    <button onClick={handleSaveClick} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, color: '#fff', fontFamily: 'inherit', background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 2px 8px rgba(245,158,11,.3)', transition: 'all .15s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}>
                      <Save size={13} /> Save Changes
                    </button>
                    <button onClick={handleCancel} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#334155', fontFamily: 'inherit', background: '#f1f5f9', transition: 'all .15s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#e8edf2'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Full Name', value: form.name  },
                    { label: 'Email',     value: form.email },
                    { label: 'Phone',     value: form.phone },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>{value}</span>
                    </div>
                  ))}
                  {form.bio && (
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Bio</p>
                      <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.65 }}>{form.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Branding */}
          <div style={{ padding: '12px 16px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e8edf2', textAlign: 'center' }}>
            <p style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155' }}>Barangay Connect</p>
            <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: 1 }}>Personnel Portal · Centralized Intelligence Platform · v4.2.1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
