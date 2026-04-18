import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Shield, AlertCircle,
  Mail, Lock, ArrowRight, Home, ChevronDown,
} from 'lucide-react';
import useAuthStore from '../stores/authStore';

const STATS = [
  { value: '1,284', label: 'Tickets resolved' },
  { value: '14.2h', label: 'Avg resolution'   },
  { value: '98%',   label: 'System uptime'    },
];

const PORTALS = [
  { value: 'admin',     label: 'Admin Portal',     sub: 'System administration & oversight'  },
  { value: 'resident',  label: 'Resident Portal',  sub: 'Citizen services & requests'        },
  { value: 'personnel', label: 'Personnel Portal', sub: 'Field operations & task management' },
];

function FloatOrb({ size, top, left, delay, color = 'rgba(20,184,166,.18)' }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size, top, left,
        background: `radial-gradient(circle at 35% 35%, ${color}, transparent 70%)`,
        filter: 'blur(32px)',
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [form,     setForm]     = useState({ email: '', password: '', portal: '' });
  const [showPass, setShowPass] = useState(false);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    // If already authenticated (page refresh), redirect to portal
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u?.portal && localStorage.getItem('auth_token')) {
          navigate(`/${u.portal}/dashboard`, { replace: true });
          return;
        }
      } catch { /* ignore */ }
    }
    document.documentElement.classList.remove('dark');
    const timer = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(timer);
  }, [navigate]);

  const set = (k) => (e) => {
    clearError();
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!form.portal) {
      useAuthStore.setState({ error: 'Please select a portal before signing in.' });
      return;
    }

    try {
      const { portal } = await login({ email: form.email, password: form.password, portal: form.portal });
      // Preloader is shown by authStore — navigate immediately so portal loads behind it
      navigate(`/${portal}/dashboard`, { replace: true });
    } catch {
      // error already set in authStore
    }
  };

  const inputStyle = {
    width: '100%', height: 44, paddingLeft: 40, paddingRight: 14,
    borderRadius: 12, fontSize: '0.875rem', color: '#0f172a',
    background: '#f8fafc', border: '1.5px solid #e2e8f0',
    outline: 'none', transition: 'all .18s', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };
  const onFocus = (e) => {
    e.target.style.borderColor = '#14b8a6';
    e.target.style.boxShadow   = '0 0 0 3px rgba(20,184,166,.12)';
    e.target.style.background  = '#fff';
  };
  const onBlur = (e) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.boxShadow   = 'none';
    e.target.style.background  = '#f8fafc';
  };

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{
        opacity:    ready ? 1 : 0,
        transform:  ready ? 'none' : 'translateY(10px)',
        transition: 'opacity .5s ease, transform .5s ease',
      }}
    >
      {/* ══ LEFT PANEL ══════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between"
        style={{
          padding: '52px 56px',
          background: 'linear-gradient(160deg, #060d1a 0%, #0c1f35 35%, #0a2e2a 70%, #071a16 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.06) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <FloatOrb size={480} top="-120px" left="-120px" delay={0}   color="rgba(20,184,166,.2)"  />
        <FloatOrb size={300} top="35%"    left="55%"    delay={3}   color="rgba(20,184,166,.15)" />
        <FloatOrb size={200} top="72%"    left="5%"     delay={1.5} color="rgba(45,212,191,.12)" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, rgba(20,184,166,.3), rgba(13,148,136,.2))', border: '1px solid rgba(20,184,166,.4)' }}>
            <Shield size={18} style={{ color: '#5eead4' }} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm tracking-wide leading-none">Barangay Connect</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(94,234,212,.6)' }}>v4.2.1-stable</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7"
               style={{ background: 'rgba(20,184,166,.1)', border: '1px solid rgba(20,184,166,.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[10.5px] font-semibold tracking-[0.1em] uppercase" style={{ color: '#5eead4' }}>
              Barangay San Vicente
            </span>
          </div>
          <h1 className="font-display text-white leading-[1.1] mb-5"
              style={{ fontSize: 'clamp(2.4rem, 3.8vw, 3.2rem)', fontWeight: 400 }}>
            Smarter local<br />
            <span style={{
              background: 'linear-gradient(90deg, #5eead4 0%, #2dd4bf 50%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontStyle: 'italic',
            }}>
              governance
            </span>
            <br />starts here.
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(148,163,184,.75)', lineHeight: 1.7, maxWidth: 320 }}>
            A unified platform for real-time incident tracking, department workload management,
            and citizen service requests.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl"
                 style={{ padding: '16px 18px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
              <p className="font-display text-white leading-none mb-1.5" style={{ fontSize: '1.75rem', fontWeight: 400 }}>{s.value}</p>
              <p className="text-[11px]" style={{ color: 'rgba(148,163,184,.6)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ RIGHT PANEL ═════════════════════════════════════════════════════ */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #f5f7fa 0%, #eef1f6 50%, #f0f4f8 100%)', minHeight: '100vh' }}
      >
        <div className="absolute inset-0 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle, rgba(100,116,139,.1) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        {/* Home button */}
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute', top: 20, left: 20, zIndex: 20,
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '8px 16px', borderRadius: 10,
            border: '1px solid rgba(226,232,240,.9)',
            background: 'rgba(255,255,255,.85)',
            backdropFilter: 'blur(12px)',
            fontSize: 13, fontWeight: 600, color: '#475569',
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 1px 3px rgba(15,23,42,.06)',
            transition: 'all .18s',
          }}
        >
          <Home size={14} /> Home
        </button>

        {/* Login card */}
        <div className="relative w-full z-10" style={{ maxWidth: 480, padding: '1.5rem' }}>
          <div className="relative overflow-hidden"
               style={{ borderRadius: 20, background: '#ffffff', border: '1px solid rgba(226,232,240,.85)', boxShadow: '0 2px 4px rgba(15,23,42,.04), 0 8px 20px rgba(15,23,42,.06), 0 28px 56px rgba(15,23,42,.08)' }}>

            {/* Teal accent stripe — removed for cleaner design */}

            <div style={{ padding: '32px 32px 36px' }}>

              {/* Logo — mobile only */}
              <div className="flex items-center gap-2.5 mb-6 lg:hidden">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
                  <Shield size={15} className="text-white" />
                </div>
                <span className="font-semibold text-slate-800 text-sm">Barangay Connect</span>
              </div>

              {/* Heading */}
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 6 }}>
                  Welcome back
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
                  Select your portal and sign in to continue.
                </p>
              </div>

              {/* Error banner */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 14px', marginBottom: 20,
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderLeft: '3px solid #ef4444', borderRadius: 10,
                }}>
                  <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: '0.8125rem', color: '#b91c1c', lineHeight: 1.5 }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Portal selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Select Portal
                  </label>
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8' }} />
                    <select
                      value={form.portal}
                      onChange={set('portal')}
                      required
                      style={{
                        ...inputStyle,
                        paddingLeft: 14,
                        paddingRight: 36,
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        cursor: 'pointer',
                        color: form.portal ? '#0f172a' : '#94a3b8',
                      }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    >
                      <option value="" disabled>Choose your portal…</option>
                      {PORTALS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* Portal description hint */}
                  {form.portal && (
                    <p style={{ fontSize: 11.5, color: '#64748b', marginTop: 6, paddingLeft: 2 }}>
                      {PORTALS.find(p => p.value === form.portal)?.sub}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: form.email ? '#14b8a6' : '#94a3b8', transition: 'color .15s' }} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@barangay.gov"
                      required
                      autoComplete="email"
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: form.password ? '#14b8a6' : '#94a3b8', transition: 'color .15s' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      style={{ ...inputStyle, paddingRight: 44 }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8',
                      }}
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%', height: 46, marginTop: 4,
                    borderRadius: 12, border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    fontSize: '0.9375rem', fontWeight: 700, color: '#fff', fontFamily: 'inherit',
                    background: isLoading
                      ? '#0d9488'
                      : 'linear-gradient(135deg, #1ac9b5 0%, #14b8a6 45%, #0d9488 100%)',
                    boxShadow: isLoading ? 'none' : '0 4px 16px rgba(20,184,166,.4)',
                    opacity: isLoading ? 0.8 : 1,
                    transition: 'all .18s',
                  }}
                  onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; }}
                >
                  {isLoading ? (
                    <>
                      <span style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: '2.5px solid rgba(255,255,255,.3)',
                        borderTopColor: '#fff', flexShrink: 0,
                        animation: 'spin .65s linear infinite',
                      }} />
                      Signing in…
                    </>
                  ) : (
                    <> Sign in <ArrowRight size={16} strokeWidth={2.5} /> </>
                  )}
                </button>
              </form>

              <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 24 }}>
                Barangay Connect · v4.2.1-stable · Barangay San Vicente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
