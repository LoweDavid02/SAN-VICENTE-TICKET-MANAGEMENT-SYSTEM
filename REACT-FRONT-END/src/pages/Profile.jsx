import { useState, useRef } from 'react';
import {
  Camera, Save,
  Mail, Phone, Briefcase,
  Calendar, Shield, User, MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useUpdateProfile } from '../hooks/useTicketApi';
import useAuthStore from '../stores/authStore';
import { useT as useLang } from '../stores/langStore';

/* ── Shared input style ── */
const inputBase = {
  height:       42,
  width:        '100%',
  paddingLeft:  38,
  paddingRight: 14,
  border:       '1.5px solid var(--border)',
  borderRadius: 10,
  fontSize:     13.5,
  fontFamily:   'inherit',
  color:        'var(--text-1)',
  background:   'var(--surface-2)',
  outline:      'none',
  transition:   'border-color .15s, box-shadow .15s, background .15s',
};

const onFocusInput = (e) => {
  e.target.style.borderColor = '#3b82f6';
  e.target.style.boxShadow   = '0 0 0 3px rgba(59,130,246,.12)';
  e.target.style.background  = 'var(--surface)';
};
const onBlurInput = (e) => {
  e.target.style.borderColor = 'var(--border)';
  e.target.style.boxShadow   = '';
  e.target.style.background  = 'var(--surface-2)';
};

/* ── Card header — defined OUTSIDE component to prevent remount ── */
function CardHeader({ icon: Icon, iconBg, iconColor, title, subtitle }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 20px', background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>
      <div style={{ width:32, height:32, borderRadius:8, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={15} style={{ color: iconColor }} />
      </div>
      <div>
        <p style={{ fontSize:13.5, fontWeight:700, color:'var(--text-1)' }}>{title}</p>
        <p style={{ fontSize:11.5, color:'var(--text-4)', marginTop:1 }}>{subtitle}</p>
      </div>
    </div>
  );
}

/* ── Labelled input field — defined OUTSIDE component to prevent remount ── */
function Field({ label, fieldKey, icon: Icon, type = 'text', form, onChange }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
      <label style={{ fontSize:10.5, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', color:'var(--text-3)' }}>
        {label}
      </label>
      <div style={{ position:'relative' }}>
        <Icon size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-4)', pointerEvents:'none' }} />
        <input type={type} value={form[fieldKey]} onChange={onChange(fieldKey)} style={inputBase} onFocus={onFocusInput} onBlur={onBlurInput} />
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, openModal } = useApp();
  const { setUser } = useAuthStore();
  const { t } = useLang();
  const portal = user?.portal || 'admin';
  const { mutateAsync: saveProfile, isPending: isSaving } = useUpdateProfile(portal);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name:       user?.full_name || user?.name || '',
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email   || '',
    role:       user?.portal  || 'Admin',
    phone:      user?.phone   || '',
    address:    user?.address || '',
    bio:        user?.bio     || '',
  });
  const [savedForm, setSavedForm] = useState({ ...form });
  const [avatar, setAvatar]   = useState(user?.avatar || null);
  const fileRef               = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = () => {
    openModal('confirm', {
      title: t('save'),
      message: 'Your profile information will be updated.',
      confirmLabel: t('save'),
      danger: false,
      onConfirm: async () => {
        try {
          const nameParts = form.name.trim().split(' ');
          const first_name = nameParts[0] || form.first_name;
          const last_name  = nameParts.slice(1).join(' ') || form.last_name;

          const response = await saveProfile({
            first_name,
            last_name,
            email:   form.email,
            phone:   form.phone,
            address: form.address,
            bio:     form.bio,
            avatar:  avatar,
          });

          // response.data.data is the updated user from the API
          const updatedUser = response?.data?.data;
          if (updatedUser) {
            // Sync avatar from API response
            if (updatedUser.avatar) setAvatar(updatedUser.avatar);
            // Sync form from API response so display reflects saved data
            const newForm = {
              name:       updatedUser.full_name || '',
              first_name: updatedUser.first_name || '',
              last_name:  updatedUser.last_name  || '',
              email:      updatedUser.email   || '',
              role:       updatedUser.portal  || portal,
              phone:      updatedUser.phone   || '',
              address:    updatedUser.address || '',
              bio:        updatedUser.bio     || '',
            };
            setForm(newForm);
            setSavedForm(newForm);
          } else {
            setSavedForm({ ...form });
          }
          setEditing(false);
          openModal('success', {
            title:   'Profile updated',
            message: 'Your profile information has been saved successfully.',
          });
        } catch (err) {
          // Extract the real error message from the API response
          const apiMessage = err?.response?.data?.message;
          const apiErrors  = err?.response?.data?.errors;
          let message = 'Failed to save profile. Please try again.';

          if (apiMessage) {
            message = apiMessage;
          } else if (apiErrors) {
            // Flatten validation errors into a readable string
            message = Object.values(apiErrors).flat().join(' ');
          }

          // Use 'confirm' modal type for errors so it shows correctly
          openModal('confirm', {
            title:        'Save Failed',
            message,
            confirmLabel: 'OK',
            danger:       true,
            onConfirm:    () => {},
          });
        }
      },
    });
  };

  const handleCancel = () => {
    setForm({ ...savedForm });
    setEditing(false);
  };

  const initials = form.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  /* ── Reusable card wrapper ── */
  const cardStyle = {
    background:   'var(--surface)',
    border:       '1px solid var(--border)',
    borderRadius: 16,
    overflow:     'hidden',
  };

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.025em' }}>
            {t('profile')}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 3 }}>
            {editing ? 'Edit your account information below' : 'View your account information'}
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 20px', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'all .15s', boxShadow: '0 2px 8px rgba(20,184,166,.3)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.transform = ''; }}
          >
            <User size={14} /> {t('edit')}
          </button>
        )}
      </div>

      <div
        style={{
          display:             'grid',
          gridTemplateColumns: '288px 1fr',
          gap:                 20,
          alignItems:          'start',
        }}
      >

        {/* ══════════════════════════════
            LEFT COLUMN
        ══════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar card */}
          <div style={cardStyle}>
            <div
              style={{
                height:     76,
                background: 'linear-gradient(130deg,#1e3a5f,#1d4ed8 55%,#3b82f6)',
              }}
            />

            <div style={{ position: 'relative', width: 'fit-content', margin: '-34px 0 14px 20px' }}>
              <div
                style={{
                  width:          68,
                  height:         68,
                  borderRadius:   14,
                  background:     'linear-gradient(135deg,#2563eb,#1d4ed8)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       22,
                  fontWeight:     700,
                  color:          '#fff',
                  outline:        '4px solid var(--surface)',
                  overflow:       'hidden',
                }}
              >
                {avatar
                  ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  position:       'absolute',
                  bottom:         -3,
                  right:          -3,
                  width:          26,
                  height:         26,
                  borderRadius:   '50%',
                  background:     'var(--navy)',
                  border:         '2px solid var(--surface)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  cursor:         'pointer',
                }}
                aria-label="Upload photo"
              >
                <Camera size={11} color="#fff" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>

            <div style={{ padding: '0 20px 20px' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{form.name}</p>
              <p style={{ fontSize: 12.5, color: 'var(--text-4)', margin: '3px 0 12px' }}>{form.email}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--blue-muted)', color: '#1d4ed8' }}>
                  {user?.portal ? user.portal.charAt(0).toUpperCase() + user.portal.slice(1) : 'Resident'}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'rgba(5,150,105,.12)', color: '#059669' }}>
                  ● Verified
                </span>
              </div>
            </div>
          </div>

          {/* Account Details card */}
          <div style={cardStyle}>
            <div style={{ padding: '11px 20px', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-4)' }}>
                Account Details
              </p>
            </div>

            {[
              { icon: Calendar,  label: t('memberSince'), value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A', color: '#2563eb', bg: '#eff6ff' },
              { icon: Shield,    label: t('portal'),       value: `${user?.portal ? user.portal.charAt(0).toUpperCase() + user.portal.slice(1) : 'Resident'} Portal`, color: '#8b5cf6', bg: '#f5f3ff' },
              { icon: MapPin,    label: t('barangay'),     value: 'San Vicente',     color: '#059669', bg: '#ecfdf5' },
              { icon: Briefcase, label: t('requests'),     value: '15 total',        color: '#d97706', bg: '#fffbeb' },
            ].map(({ icon: Icon, label, value, color, bg }, idx, arr) => (
              <div
                key={label}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          12,
                  padding:      '13px 20px',
                  borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-4)' }}>{label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginTop: 2 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Branding */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '13px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>Barangay Connect</p>
            <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 3 }}>
              Centralized Intelligence Platform · v4.2.1
            </p>
          </div>
        </div>

        {/* ══════════════════════════════
            RIGHT COLUMN
        ══════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Personal Information */}
          <div style={cardStyle}>
            <CardHeader
              icon={User}
              iconBg="var(--blue-muted)"
              iconColor="#2563eb"
              title="Personal Information"
              subtitle={editing ? 'Update your name, contact details, and address' : 'Your account information'}
            />

            {editing ? (
              /* ── EDIT MODE ── */
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, padding: '22px 20px' }}>
                  <Field label="Full Name" fieldKey="name"    icon={User}  form={form} onChange={set} />
                  <Field label="Email"     fieldKey="email"   icon={Mail}  type="email" form={form} onChange={set} />
                  <Field label="Phone"     fieldKey="phone"   icon={Phone} type="tel" form={form} onChange={set} />
                  <Field label="Address"   fieldKey="address" icon={MapPin} form={form} onChange={set} />
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <label style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Bio</label>
                    <textarea value={form.bio} onChange={set('bio')} rows={4} style={{ width: '100%', padding: '11px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13.5, fontFamily: 'inherit', color: 'var(--text-1)', background: 'var(--surface-2)', outline: 'none', resize: 'none', lineHeight: 1.6, transition: 'border-color .15s, box-shadow .15s, background .15s' }} onFocus={onFocusInput} onBlur={onBlurInput} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                  <button onClick={handleSaveClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'background .15s' }} onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')} onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}>
                    <Save size={14} /> Save Changes
                  </button>
                  <button onClick={handleCancel} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 16px', background: 'var(--surface-3)', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', transition: 'background .15s' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-4)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ── VIEW MODE ── */
              <div style={{ padding: '6px 0 6px' }}>
                {[
                  { label: 'Full Name', value: form.name,    icon: User   },
                  { label: 'Email',     value: form.email,   icon: Mail   },
                  { label: 'Phone',     value: form.phone,   icon: Phone  },
                  { label: 'Address',   value: form.address, icon: MapPin },
                ].map(({ label, value, icon: Icon }, idx, arr) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={14} style={{ color: 'var(--text-4)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{label}</p>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', marginTop: 2 }}>{value}</p>
                    </div>
                  </div>
                ))}
                {form.bio && (
                  <div style={{ padding: '13px 20px' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, marginBottom: 6 }}>Bio</p>
                    <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.65 }}>{form.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Security */}
          <div style={cardStyle}>
            <CardHeader
              icon={Shield}
              iconBg="var(--purple-muted)"
              iconColor="#8b5cf6"
              title="Account Security"
              subtitle="Password, 2FA, and active sessions"
            />

            {[
              { label: 'Password',                value: 'Last changed 3 months ago',          action: 'Change', color: '#2563eb', bg: 'var(--blue-muted)',   border: 'rgba(37,99,235,.25)' },
              { label: 'Two-Factor Authentication',value: 'Not enabled — adds extra login security', action: 'Enable', color: '#8b5cf6', bg: 'var(--purple-muted)', border: 'rgba(139,92,246,.25)' },
              { label: 'Active Sessions',          value: '1 device currently signed in',       action: 'Manage', color: 'var(--text-3)', bg: 'var(--surface-3)', border: 'var(--border)' },
            ].map((row, idx, arr) => (
              <div
                key={row.label}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)' }}>{row.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 3 }}>{row.value}</p>
                </div>
                <button style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: row.color, background: row.bg, border: `1.5px solid ${row.border}`, flexShrink: 0, transition: 'opacity .15s' }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '.7')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                  {row.action}
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}