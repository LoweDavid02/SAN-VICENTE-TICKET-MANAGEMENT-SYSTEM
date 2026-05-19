import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Shield, AlertCircle,
  Mail, Lock, ArrowRight, Home, ChevronDown,
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import api from '../lib/axios';
import blinkedLogo from '../assets/BLINKED.png';

const STATS = [
  { value: '1,284', label: 'Tickets resolved' },
  { value: '14.2h', label: 'Avg resolution'   },
  { value: '98%',   label: 'System uptime'    },
];

const PORTALS = [
  { value: 'admin',     label: 'Admin Portal',     sub: 'System administration & oversight'  },
  { value: 'personnel', label: 'Personnel Portal', sub: 'Field operations & task management' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [form,     setForm]     = useState({ email: '', password: '', portal: '' });
  const [showPass, setShowPass] = useState(false);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    // Validate stored token against the server before redirecting.
    // This prevents stale/expired tokens from bouncing the user to the dashboard.
    const token = localStorage.getItem('auth_token');
    const stored = localStorage.getItem('auth_user');

    if (token && stored) {
      api.get('/auth/me')
        .then((res) => {
          // Token is valid — redirect to the user's portal
          const u = res.data?.data || JSON.parse(stored);
          if (u?.portal) {
            navigate(`/${u.portal}/dashboard`, { replace: true });
          }
        })
        .catch(() => {
          // Token is invalid/expired — clear it and stay on login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
          document.documentElement.classList.remove('dark');
          setTimeout(() => setReady(true), 80);
        });
      return; // don't setReady yet — wait for the /me check
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
    borderRadius: 12, fontSize: '0.875rem', color: '#111827',
    background: '#ffffff', border: '1.5px solid #d1d5db',
    outline: 'none', transition: 'all .18s', fontFamily: 'inherit',
    boxSizing: 'border-box',
  };
  const onFocus = (e) => {
    e.target.style.borderColor = '#1E2D4E';
    e.target.style.boxShadow   = '0 0 0 3px rgba(30,45,78,.12)';
    e.target.style.background  = '#ffffff';
  };
  const onBlur = (e) => {
    e.target.style.borderColor = '#d1d5db';
    e.target.style.boxShadow   = 'none';
    e.target.style.background  = '#ffffff';
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
      {/* Scoped style: force white text on the dark left panel, overriding any global CSS */}
      <style>{`
        #login-left-panel,
        #login-left-panel * {
          color: #ffffff !important;
        }
        #login-left-panel .lp-gradient-text {
          color: #3B82F6 !important;
        }
      `}</style>
      <div
        id="login-left-panel"
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between"
        style={{
          padding: '52px 56px',
          background: '#060d1a',
        }}
      >
        {/* Building photo background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
        }} />
        {/* Dark overlay for text readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(4,18,28,.88) 0%, rgba(5,28,26,.82) 40%, rgba(4,16,22,.78) 70%, rgba(3,12,18,.72) 100%)',
        }} />
        {/* Subtle noise texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .25,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <img 
            src={blinkedLogo} 
            alt="BLINKED Logo" 
            style={{ width: 40, height: 40, objectFit: 'contain' }}
          />
          <div>
            <p className="text-white font-semibold text-sm tracking-wide leading-none" style={{ color: '#ffffff' }}>BLINKED</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#ffffff' }}>v4.2.1-stable</p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-7"
               style={{ background: 'rgba(30,45,78,.1)', border: '1px solid rgba(30,45,78,.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3B82F6' }} />
            <span className="text-[10.5px] font-semibold tracking-[0.1em] uppercase" style={{ color: '#ffffff' }}>
              San Vicente, Apalit, Pampanga
            </span>
          </div>
          <h1 className="font-display leading-[1.1] mb-5"
              style={{ fontSize: 'clamp(2.4rem, 3.8vw, 3.2rem)', fontWeight: 400, color: '#ffffff' }}>
            Smarter local<br />
            <span className="lp-gradient-text" style={{
              color: '#3B82F6', fontStyle: 'italic',
            }}>
              governance
            </span>
            <br />starts here.
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#ffffff', lineHeight: 1.7, maxWidth: 320 }}>
            A unified platform for real-time incident tracking, department workload management,
            and citizen service requests.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl"
                 style={{ padding: '16px 18px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
              <p className="font-display leading-none mb-1.5" style={{ fontSize: '1.75rem', fontWeight: 400, color: '#ffffff' }}>{s.value}</p>
              <p className="text-[11px]" style={{ color: '#ffffff' }}>{s.label}</p>
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
                <img 
                  src={blinkedLogo} 
                  alt="BLINKED Logo" 
                  style={{ width: 32, height: 32, objectFit: 'contain' }}
                />
                <span className="font-semibold text-slate-800 text-sm">BLINKED</span>
              </div>

              {/* Heading */}
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', marginBottom: 6 }}>
                  Welcome back
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.5 }}>
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
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8125rem', color: '#b91c1c', lineHeight: 1.5 }}>{error}</p>
                    {(error.includes('taking too long') || error.includes('connect')) && (
                      <button
                        type="button"
                        onClick={() => { clearError(); }}
                        style={{ marginTop: 6, fontSize: 11.5, fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontFamily: 'inherit' }}
                      >
                        Dismiss and try again
                      </button>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Portal selector */}
                <div>
                  <label htmlFor="portal-select" style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Select Portal
                  </label>
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={14} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6b7280' }} />
                    <select
                      id="portal-select"
                      name="portal"
                      value={form.portal}
                      onChange={set('portal')}
                      required
                      aria-label="Select your portal"
                      style={{
                        ...inputStyle,
                        paddingLeft: 14,
                        paddingRight: 36,
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        cursor: 'pointer',
                        color: form.portal ? '#111827' : '#6b7280',
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
                    <p style={{ fontSize: 11.5, color: '#6b7280', marginTop: 6, paddingLeft: 2 }}>
                      {PORTALS.find(p => p.value === form.portal)?.sub}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email-input" style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: form.email ? '#1E2D4E' : '#6b7280', transition: 'color .15s' }} />
                    <input
                      id="email-input"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@barangay.gov"
                      required
                      autoComplete="email"
                      aria-label="Email address"
                      style={inputStyle}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password-input" style={{ display: 'block', fontSize: '10.5px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: form.password ? '#1E2D4E' : '#6b7280', transition: 'color .15s' }} />
                    <input
                      id="password-input"
                      name="password"
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      aria-label="Password"
                      style={{ ...inputStyle, paddingRight: 44 }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                      aria-controls="password-input"
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280',
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
                    background: isLoading ? '#2A3F6B' : '#1E2D4E',
                    boxShadow: isLoading ? 'none' : '0 4px 16px rgba(30,45,78,.4)',
                    opacity: isLoading ? 0.8 : 1,
                    transition: 'all .18s',
                  }}
                  onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.background = '#2A3F6B'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = '#1E2D4E'; }}
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

              <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 24 }}>
                BLINKED · v4.2.1-stable · San Vicente, Apalit, Pampanga
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
