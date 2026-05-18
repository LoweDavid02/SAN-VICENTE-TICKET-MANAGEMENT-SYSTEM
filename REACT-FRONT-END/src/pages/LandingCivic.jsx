/**
 * LandingCivic.jsx — BLINKED Public Service Portal
 * Minimal, editorial landing page — no decorative elements.
 * Design: serif headings, system sans UI, 0.5px borders, no shadows.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, ArrowRight, Menu, X, ChevronDown,
  Users, Award, MessageCircle,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   CSS VARIABLES — injected once at page level
   ───────────────────────────────────────────── */
const PAGE_VARS = `
  :root {
    --color-text-primary:          #111827;
    --color-text-secondary:        #4B5563;
    --color-text-tertiary:         #9CA3AF;
    --color-background-primary:    #FFFFFF;
    --color-background-secondary:  #F9FAFB;
    --color-border-tertiary:       #E5E7EB;
    --color-border-secondary:      #D1D5DB;
    --color-border-primary:        #1E2D4E;
    --color-text-success:          #065F46;
    --color-background-success:    #ECFDF5;
    --color-border-success:        #6EE7B7;
    --color-text-danger:           #991B1B;
    --color-background-danger:     #FEF2F2;
    --color-border-danger:         #FCA5A5;
    --font-serif:                  Georgia, 'Times New Roman', serif;
    --font-sans:                   -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  }
`;

/* ─────────────────────────────────────────────
   SCOPED OVERRIDES — defeat global !important
   ───────────────────────────────────────────── */
const SCOPED_CSS = `
  #blinked-landing * { box-sizing: border-box; }
  #blinked-landing h1,
  #blinked-landing h2,
  #blinked-landing h3,
  #blinked-landing h4 {
    color: var(--color-text-primary) !important;
    font-family: var(--font-serif) !important;
    font-weight: 400 !important;
  }
  #blinked-landing p,
  #blinked-landing li,
  #blinked-landing span,
  #blinked-landing label,
  #blinked-landing div {
    color: var(--color-text-secondary) !important;
    font-family: var(--font-sans) !important;
  }
  /* Hero overrides — white text on dark bg */
  #blinked-landing #home h1,
  #blinked-landing #home p,
  #blinked-landing #home span,
  #blinked-landing #home div { color: inherit !important; }
  /* Footer overrides */
  #blinked-landing footer,
  #blinked-landing footer *  { color: #ffffff !important; }
  #blinked-landing footer a:hover,
  #blinked-landing footer button:hover { color: #9CA3AF !important; }
  /* Nav overrides */
  #blinked-landing nav p,
  #blinked-landing nav span { color: inherit !important; }
  /* Form labels */
  #blinked-landing label { color: var(--color-text-primary) !important; font-weight: 500 !important; }
  /* Eyebrow spans */
  #blinked-landing .eyebrow { color: var(--color-text-tertiary) !important; }
  /* Success / danger banners */
  #blinked-landing .banner-success * { color: var(--color-text-success) !important; }
  #blinked-landing .banner-danger  * { color: var(--color-text-danger)  !important; }
  /* FAQ answer text */
  #blinked-landing .faq-answer p { color: var(--color-text-secondary) !important; }
  /* Benefits strip body */
  #blinked-landing .benefit-body { color: var(--color-text-secondary) !important; }
  /* Guideline items */
  #blinked-landing .gl-body { color: var(--color-text-secondary) !important; }
  /* Do/Don't items */
  #blinked-landing .do-item  { color: var(--color-text-success) !important; }
  #blinked-landing .dont-item { color: var(--color-text-danger) !important; }
  /* Responsive */
  @media (max-width: 768px) {
    .bl-nav-links, .bl-nav-actions { display: none !important; }
    .bl-ham { display: flex !important; }
    .bl-hero-trust { flex-wrap: wrap !important; }
    .bl-benefits-grid { grid-template-columns: 1fr !important; }
    .bl-gl-grid { grid-template-columns: 1fr !important; }
    .bl-form-grid { grid-template-columns: 1fr !important; }
    .bl-footer-cols { flex-direction: column !important; gap: 32px !important; }
  }
  @media (min-width: 769px) {
    .bl-ham { display: none !important; }
  }
`;

/* ─────────────────────────────────────────────
   DATA
   ───────────────────────────────────────────── */
const FAQS = [
  { q: 'Do I need an account to submit a request?', a: 'No. BLINKED is a guest submission system — you can submit a concern without registering. You will receive a unique tracking code after submission to monitor your request.' },
  { q: 'What types of concerns can I report?', a: 'You can report infrastructure issues (roads, streetlights, drainage), sanitation problems, public safety concerns, waste management, health & medical matters, public order issues, and other community concerns.' },
  { q: 'How long does it take to resolve a request?', a: 'Our average resolution time is 14.2 hours. Response time varies by category and severity — High severity requests are prioritized and typically addressed within 4–8 hours.' },
  { q: 'Can I attach photos to my report?', a: 'Yes. You can upload up to 3 photos when submitting a concern. Photos help field personnel assess and resolve issues faster.' },
  { q: 'What happens after I submit a request?', a: 'Your request is reviewed and assigned to the appropriate department. Field personnel are dispatched, and the ticket status updates from Pending → In Progress → Resolved. You can track every step with your tracking code.' },
  { q: 'Is my personal information kept private?', a: 'Yes. Your contact details are only accessible to authorized barangay personnel handling your request. Information is never shared publicly.' },
  { q: 'What if my concern is urgent or an emergency?', a: 'For life-threatening emergencies, call 911 immediately. For urgent community concerns, select "High" severity when submitting — these are flagged for priority response.' },
];

const BENEFITS = [
  { Icon: Users,         title: 'Direct to officials', body: 'Your concern reaches the right department immediately — not a passive inbox.' },
  { Icon: Award,         title: 'Transparent tracking', body: 'Permanent tracking code, real-time status updates, and a full resolution timeline.' },
  { Icon: MessageCircle, title: 'Personal response', body: 'Every submission gets a status update — resolved, in progress, or escalated.' },
];

const GUIDELINES = [
  { n: '01', title: 'Location accuracy', body: 'Provide the exact street address or use the map pin to mark the location.' },
  { n: '02', title: 'Clear description', body: 'Describe the issue in detail — what it is, how long it has been present, and any safety risks.' },
  { n: '03', title: 'Relevant category', body: 'Select the correct category so your request reaches the right department.' },
  { n: '04', title: 'Contact details', body: 'Provide a valid email or phone number so we can follow up if needed.' },
  { n: '05', title: 'Photo evidence', body: 'Attach up to 3 photos. Clear images help field personnel assess the issue faster.' },
  { n: '06', title: 'Severity level', body: 'Mark High only for urgent safety hazards. This ensures priority cases are handled first.' },
];

const TRUST = ['Free to submit', 'Avg. 14.2h resolution', '25,000+ residents served', '1,284 tickets resolved'];

/* ─────────────────────────────────────────────
   SHARED STYLES
   ───────────────────────────────────────────── */
const S = {
  eyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 12, display: 'block' },
  h1:      { fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,5vw,2.8rem)', fontWeight: 400, color: 'var(--color-text-primary)', lineHeight: 1.2, marginBottom: 20 },
  h2:      { fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem,3vw,1.75rem)', fontWeight: 400, color: 'var(--color-text-primary)', lineHeight: 1.25, marginBottom: 12 },
  h3:      { fontFamily: 'var(--font-serif)', fontSize: 13, fontWeight: 400, color: 'var(--color-text-primary)', letterSpacing: '.02em', marginBottom: 8 },
  body:    { fontSize: 15, lineHeight: 1.7, color: 'var(--color-text-secondary)' },
  muted:   { fontSize: 13, color: 'var(--color-text-tertiary)' },
  section: { padding: '72px 0' },
  wrap:    { maxWidth: 1040, margin: '0 auto', padding: '0 24px' },
  border:  '0.5px solid var(--color-border-tertiary)',
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 22px', borderRadius: 8, border: 'none',
    background: 'var(--color-text-primary)', color: '#fff',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'var(--font-sans)', transition: 'opacity .15s',
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 22px', borderRadius: 8,
    border: '0.5px solid var(--color-border-secondary)',
    background: 'transparent', color: 'var(--color-text-primary)',
    fontSize: 13, fontWeight: 500, cursor: 'pointer',
    fontFamily: 'var(--font-sans)', transition: 'border-color .15s',
  },
  input: {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '0.5px solid var(--color-border-tertiary)',
    background: 'var(--color-background-primary)',
    fontSize: 13, color: 'var(--color-text-primary)',
    fontFamily: 'var(--font-sans)', outline: 'none',
    transition: 'border-color .15s',
  },
  inputError: {
    borderColor: 'var(--color-border-danger)',
  },
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 6, fontFamily: 'var(--font-sans)' },
  errorText: { fontSize: 11, color: 'var(--color-text-danger)', marginTop: 4, display: 'block' },
  helper: { fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 4, display: 'block' },
};

/* ─────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────── */
export default function LandingCivic() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  // Form state
  const [form, setForm] = useState({ name: '', email: '', phone: '', category: '', description: '', severity: 'Medium' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const NAV = [
    { label: 'Guidelines', href: '#guidelines' },
    { label: 'FAQ',        href: '#faq' },
  ];

  /* ── Form validation ── */
  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Please enter your name.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.';
    if (!form.category) e.category = 'Please select a category.';
    if (!form.description.trim() || form.description.trim().length < 20) e.description = 'Please describe your concern (at least 20 characters).';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setSubmitStatus(null);
    try {
      await new Promise(r => setTimeout(r, 1200)); // simulate API
      navigate('/report');
    } catch {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  return (
    <div id="blinked-landing" style={{ fontFamily: 'var(--font-sans)', background: 'var(--color-background-primary)', minHeight: '100vh' }}>
      <style>{PAGE_VARS}{SCOPED_CSS}</style>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 56, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,1)',
        backdropFilter: scrolled ? 'blur(8px)' : 'none',
        borderBottom: S.border,
        transition: 'background .2s, backdrop-filter .2s',
      }}>
        <div style={{ ...S.wrap, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#1E2D4E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={14} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1E2D4E', lineHeight: 1, fontFamily: 'var(--font-sans)' }}>BLINKED</p>
              <p style={{ fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '.04em', fontFamily: 'var(--font-sans)' }}>Public Service Portal</p>
            </div>
          </div>

          {/* Desktop nav links */}
          <div className="bl-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {NAV.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.href)}
                style={{ padding: '6px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)', transition: 'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="bl-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button onClick={() => navigate('/track')}
              style={{ ...S.btnGhost, padding: '7px 16px', fontSize: 12 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-secondary)'}>
              Track Status
            </button>
            <button onClick={() => scrollTo('#form')}
              style={{ ...S.btnPrimary, padding: '7px 16px', fontSize: 12 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Submit work
            </button>
          </div>

          {/* Burger */}
          <button onClick={() => setMenuOpen(v => !v)} className="bl-ham"
            style={{ width: 36, height: 36, borderRadius: 6, border: S.border, background: '#fff', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            aria-label="Toggle menu">
            {menuOpen ? <X size={16} color="#4b5563" /> : <Menu size={16} color="#4b5563" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div style={{ background: '#fff', borderTop: S.border, padding: '12px 24px 20px' }}>
            {NAV.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.href)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 0', border: 'none', background: 'none', fontSize: 14, color: 'var(--color-text-primary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', borderBottom: S.border }}>
                {l.label}
              </button>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
              <button onClick={() => scrollTo('#form')} style={{ ...S.btnPrimary, justifyContent: 'center', width: '100%' }}>Submit work</button>
              <button onClick={() => navigate('/track')} style={{ ...S.btnGhost, justifyContent: 'center', width: '100%' }}>Track Status</button>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section id="home" style={{ paddingTop: 56, background: 'var(--color-background-primary)' }}>
        <div style={{ ...S.wrap, padding: '80px 24px 72px' }}>
          <span className="eyebrow" style={S.eyebrow}>Now accepting submissions</span>
          <h1 style={{ ...S.h1, maxWidth: 560 }}>
            Report community concerns<br />directly to local officials
          </h1>
          <p style={{ ...S.body, maxWidth: 480, marginBottom: 32 }}>
            BLINKED connects residents of San Vicente, Apalit, Pampanga with the right department — fast. Submit a concern, track its progress, and see it resolved. No account required.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
            <button onClick={() => scrollTo('#form')} style={S.btnPrimary}
              onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Submit your concern <ArrowRight size={14} aria-hidden="true" />
            </button>
            <button onClick={() => scrollTo('#guidelines')} style={S.btnGhost}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-border-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-secondary)'}>
              Read guidelines
            </button>
          </div>
          {/* Trust strip */}
          <div className="bl-hero-trust" style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
            {TRUST.map((t, i) => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{t}</span>
                {i < TRUST.length - 1 && <span style={{ margin: '0 12px', color: 'var(--color-border-secondary)', fontSize: 10 }}>·</span>}
              </span>
            ))}
          </div>
        </div>
        <div style={{ borderTop: S.border }} />
      </section>

      {/* ══════════════════════════════════════
          BENEFITS STRIP
      ══════════════════════════════════════ */}
      <section style={S.section}>
        <div style={S.wrap}>
          <span className="eyebrow" style={S.eyebrow}>Why use BLINKED</span>
          <div className="bl-benefits-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            border: S.border, borderRadius: 12, overflow: 'hidden',
          }}>
            {BENEFITS.map(({ Icon, title, body }, i) => (
              <div key={title} style={{
                padding: 28,
                borderRight: i < 2 ? S.border : 'none',
              }}>
                <Icon size={18} color="var(--color-text-tertiary)" strokeWidth={1.5} aria-hidden="true" style={{ marginBottom: 16, display: 'block' }} />
                <h3 style={S.h3}>{title}</h3>
                <p className="benefit-body" style={{ ...S.body, fontSize: 14 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          GUIDELINES
      ══════════════════════════════════════ */}
      <section id="guidelines" style={{ ...S.section, background: 'var(--color-background-secondary)', borderTop: S.border, borderBottom: S.border }}>
        <div style={S.wrap}>
          <span className="eyebrow" style={S.eyebrow}>Before you submit</span>
          <h2 style={S.h2}>Submission guidelines</h2>
          <p style={{ ...S.body, fontSize: 14, marginBottom: 40, color: 'var(--color-text-secondary)' }}>
            Read these carefully — they help us review your concern faster.
          </p>

          <div className="bl-gl-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Left — numbered list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {GUIDELINES.map((g, i) => (
                <div key={g.n} style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: i < GUIDELINES.length - 1 ? S.border : 'none' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', letterSpacing: '.05em', flexShrink: 0, paddingTop: 2 }}>{g.n}</span>
                  <div>
                    <h3 style={{ ...S.h3, marginBottom: 4 }}>{g.title}</h3>
                    <p className="gl-body" style={{ ...S.body, fontSize: 14 }}>{g.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — Do / Don't card */}
            <div style={{ border: S.border, borderRadius: 12, overflow: 'hidden', background: 'var(--color-background-primary)', alignSelf: 'start' }}>
              {/* DO */}
              <div style={{ padding: 24, borderBottom: S.border }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-text-success)', display: 'block', marginBottom: 14 }}>Do</span>
                {[
                  'Provide the exact location of the issue',
                  'Include clear photos when possible',
                  'Select the correct category and severity',
                  'Provide accurate contact details for follow-up',
                ].map(t => (
                  <div key={t} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <span className="do-item" style={{ fontSize: 13, color: 'var(--color-text-success)', flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span className="do-item" style={{ fontSize: 13, lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
              {/* DON'T */}
              <div style={{ padding: 24 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-text-danger)', display: 'block', marginBottom: 14 }}>Don't</span>
                {[
                  'Submit duplicate reports for the same issue',
                  'Use this form for life-threatening emergencies (call 911)',
                  'Submit vague descriptions without location details',
                  'Mark Low-priority issues as High severity',
                ].map(t => (
                  <div key={t} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <span className="dont-item" style={{ fontSize: 13, color: 'var(--color-text-danger)', flexShrink: 0, marginTop: 1 }}>✗</span>
                    <span className="dont-item" style={{ fontSize: 13, lineHeight: 1.5 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SUBMISSION FORM
      ══════════════════════════════════════ */}
      <section id="form" style={S.section}>
        <div style={S.wrap}>
          <span className="eyebrow" style={S.eyebrow}>Ready to report</span>
          <h2 style={S.h2}>Submit your concern</h2>
          <p style={{ ...S.body, fontSize: 14, marginBottom: 36 }}>
            Fill in the details below. We'll assign your request and respond within 14.2 hours on average.
          </p>

          <div style={{ border: S.border, borderRadius: 12, padding: 28, background: 'var(--color-background-secondary)' }}>

            {/* Error banner */}
            {submitStatus === 'error' && (
              <div className="banner-danger" style={{ padding: '12px 16px', borderRadius: 8, background: 'var(--color-background-danger)', border: '0.5px solid var(--color-border-danger)', marginBottom: 24 }}>
                <p style={{ fontSize: 13, margin: 0 }}>Something went wrong. Please try again or call (02) 8123-4567.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="bl-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* Full name */}
                <div>
                  <label htmlFor="f-name" style={S.label}>Full name</label>
                  <input id="f-name" type="text" placeholder="e.g. Juan dela Cruz" value={form.name}
                    onChange={e => setField('name', e.target.value)}
                    style={{ ...S.input, ...(errors.name ? S.inputError : {}) }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-border-primary)'}
                    onBlur={e => e.target.style.borderColor = errors.name ? 'var(--color-border-danger)' : 'var(--color-border-tertiary)'}
                    aria-describedby={errors.name ? 'f-name-err' : undefined} />
                  {errors.name && <span id="f-name-err" style={S.errorText}>{errors.name}</span>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="f-email" style={S.label}>Email address</label>
                  <input id="f-email" type="email" placeholder="juan@example.com" value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    style={{ ...S.input, ...(errors.email ? S.inputError : {}) }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-border-primary)'}
                    onBlur={e => e.target.style.borderColor = errors.email ? 'var(--color-border-danger)' : 'var(--color-border-tertiary)'}
                    aria-describedby={errors.email ? 'f-email-err' : undefined} />
                  {errors.email && <span id="f-email-err" style={S.errorText}>{errors.email}</span>}
                </div>

                {/* Phone (optional) */}
                <div>
                  <label htmlFor="f-phone" style={S.label}>Phone number <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 400 }}>(optional)</span></label>
                  <input id="f-phone" type="tel" placeholder="09XXXXXXXXX" value={form.phone}
                    onChange={e => setField('phone', e.target.value)}
                    style={S.input}
                    onFocus={e => e.target.style.borderColor = 'var(--color-border-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-border-tertiary)'} />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="f-category" style={S.label}>Category</label>
                  <select id="f-category" value={form.category}
                    onChange={e => setField('category', e.target.value)}
                    style={{ ...S.input, ...(errors.category ? S.inputError : {}), appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 32 }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-border-primary)'}
                    onBlur={e => e.target.style.borderColor = errors.category ? 'var(--color-border-danger)' : 'var(--color-border-tertiary)'}
                    aria-describedby={errors.category ? 'f-cat-err' : undefined}>
                    <option value="">— Select a category —</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="sanitation">Sanitation</option>
                    <option value="public_safety">Public Safety</option>
                    <option value="waste_management">Waste Management</option>
                    <option value="health_medical">Health &amp; Medical</option>
                    <option value="public_order">Public Order</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.category && <span id="f-cat-err" style={S.errorText}>{errors.category}</span>}
                </div>

                {/* Description — full width */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="f-desc" style={S.label}>Describe the concern</label>
                  <div style={{ position: 'relative' }}>
                    <textarea id="f-desc" rows={5}
                      placeholder="Describe the issue clearly — what it is, where exactly, how long it has been present, and any safety risks."
                      value={form.description}
                      onChange={e => setField('description', e.target.value)}
                      style={{ ...S.input, resize: 'vertical', minHeight: 120, ...(errors.description ? S.inputError : {}) }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-border-primary)'}
                      onBlur={e => e.target.style.borderColor = errors.description ? 'var(--color-border-danger)' : 'var(--color-border-tertiary)'}
                      aria-describedby={errors.description ? 'f-desc-err' : 'f-desc-help'} />
                    <span style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 11, color: 'var(--color-text-tertiary)', pointerEvents: 'none' }}>
                      {form.description.length} / 1000
                    </span>
                  </div>
                  {errors.description
                    ? <span id="f-desc-err" style={S.errorText}>{errors.description}</span>
                    : <span id="f-desc-help" style={S.helper}>Tip: include the exact street address and any visible hazards.</span>}
                </div>

                {/* Severity — full width */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={S.label}>Severity</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['Low', 'Medium', 'High'].map(s => (
                      <button key={s} type="button" onClick={() => setField('severity', s)}
                        style={{
                          padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all .15s',
                          border: form.severity === s ? '0.5px solid var(--color-border-primary)' : S.border,
                          background: form.severity === s ? '#1E2D4E' : 'var(--color-background-primary)',
                          color: form.severity === s ? '#fff' : 'var(--color-text-secondary)',
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <span style={S.helper}>Select High only for urgent safety hazards.</span>
                </div>

                {/* Submit — full width */}
                <div style={{ gridColumn: '1 / -1', paddingTop: 8 }}>
                  <button type="submit" disabled={submitting}
                    style={{ ...S.btnPrimary, padding: '11px 28px', fontSize: 14, opacity: submitting ? .6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                    onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '.85'; }}
                    onMouseLeave={e => { if (!submitting) e.currentTarget.style.opacity = '1'; }}>
                    {submitting ? 'Submitting…' : 'Submit my concern'}
                  </button>
                  <span style={{ ...S.helper, marginTop: 10, display: 'block' }}>
                    Or submit the full form at{' '}
                    <button type="button" onClick={() => navigate('/report')}
                      style={{ background: 'none', border: 'none', padding: 0, fontSize: 11, color: 'var(--color-text-primary)', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font-sans)' }}>
                      the detailed submission page
                    </button>
                    {' '}for photo uploads and map location.
                  </span>
                </div>

              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
      ══════════════════════════════════════ */}
      <section id="faq" style={{ ...S.section, borderTop: S.border, background: 'var(--color-background-secondary)' }}>
        <div style={S.wrap}>
          <span className="eyebrow" style={S.eyebrow}>Questions</span>
          <h2 style={{ ...S.h2, marginBottom: 36 }}>Frequently asked</h2>

          <div style={{ border: S.border, borderRadius: 12, overflow: 'hidden', background: 'var(--color-background-primary)' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? S.border : 'none' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 24px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)' }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>{faq.q}</span>
                  <span style={{ flexShrink: 0, display: 'inline-flex', transition: 'transform .2s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <ChevronDown size={16} color="var(--color-text-tertiary)" aria-hidden="true" />
                  </span>
                </button>
                <div className="faq-answer" style={{
                  maxHeight: openFaq === i ? 400 : 0,
                  overflow: 'hidden',
                  transition: 'max-height .25s ease',
                }}>
                  <p style={{ ...S.body, fontSize: 14, padding: '0 24px 20px', margin: 0 }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FINAL CTA BANNER
      ══════════════════════════════════════ */}
      <section style={{ ...S.section, borderTop: S.border, textAlign: 'center' }}>
        <div style={{ ...S.wrap, maxWidth: 560 }}>
          <h2 style={{ ...S.h2, fontSize: 'clamp(1.4rem,3vw,2rem)', marginBottom: 14 }}>Have a concern worth reporting?</h2>
          <p style={{ ...S.body, marginBottom: 28 }}>
            We're here to help. Submit your concern and our team will respond promptly.
          </p>
          <button onClick={() => scrollTo('#form')} style={{ ...S.btnPrimary, padding: '11px 28px', fontSize: 14 }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            Submit your concern <ArrowRight size={14} aria-hidden="true" />
          </button>
          <p style={{ ...S.muted, marginTop: 16 }}>
            Free to submit · Avg. 14.2h resolution · 25,000+ residents served
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer id="blinked-footer" style={{ background: '#1E2D4E', borderTop: S.border, padding: '48px 24px 32px' }}>
        <div style={{ ...S.wrap, maxWidth: 1040 }}>
          <div className="bl-footer-cols" style={{ display: 'flex', justifyContent: 'space-between', gap: 40, marginBottom: 40 }}>
            {/* Brand */}
            <div style={{ maxWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Shield size={16} color="#fff" strokeWidth={2.5} aria-hidden="true" />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-sans)' }}>BLINKED</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, fontFamily: 'var(--font-sans)' }}>
                Public service portal for San Vicente, Apalit, Pampanga.
              </p>
            </div>

            {/* Link columns */}
            <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14, fontFamily: 'var(--font-sans)' }}>For residents</p>
                {[['Submit concern', '/report'], ['Track status', '/track']].map(([label, path]) => (
                  <button key={label} onClick={() => navigate(path)}
                    style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#fff', fontFamily: 'var(--font-sans)', padding: '4px 0', textAlign: 'left', transition: 'color .15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    onMouseLeave={e => e.currentTarget.style.color = '#fff'}>
                    {label}
                  </button>
                ))}
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 14, fontFamily: 'var(--font-sans)' }}>Resources</p>
                {[['Guidelines', '#guidelines'], ['FAQ', '#faq']].map(([label, href]) => (
                  <button key={label} onClick={() => scrollTo(href)}
                    style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#fff', fontFamily: 'var(--font-sans)', padding: '4px 0', textAlign: 'left', transition: 'color .15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    onMouseLeave={e => e.currentTarget.style.color = '#fff'}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-sans)' }}>© 2026 BLINKED. All rights reserved.</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-sans)' }}>Public Service Portal v1.0</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
