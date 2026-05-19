/**
 * LandingCivic.jsx — BLINKED Public Service Portal
 * Minimal, professional civic landing page with FAQ section
 */

import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Phone, MapPin, FileText, Menu, X, ChevronDown, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';
import blinkedLogo from '../assets/BLINKED.png';

const FAQS = [
  {
    q: 'Do I need an account to submit a request?',
    a: 'No. BLINKED is a guest submission system — you can submit a concern without registering. You will receive a unique tracking code after submission to monitor your request.',
  },
  {
    q: 'What types of concerns can I report?',
    a: 'You can report infrastructure issues (roads, streetlights, drainage), sanitation problems, public safety concerns, waste management, health & medical matters, public order issues, and other community concerns.',
  },
  {
    q: 'How do I track my submitted request?',
    a: 'After submitting, you receive a unique tracking code via the confirmation screen. Go to the "Track My Request" page, enter your code, and view real-time updates on your request.',
  },
  {
    q: 'How long does it take to resolve a request?',
    a: 'Our average resolution time is 14.2 hours. Response time varies by category and severity — High severity requests are prioritized and typically addressed within 4–8 hours.',
  },
  {
    q: 'Can I attach photos to my report?',
    a: 'Yes. You can upload up to 3 photos when submitting a concern. Photos help field personnel assess and resolve issues faster.',
  },
  {
    q: 'What happens after I submit a request?',
    a: 'Your request is reviewed and assigned to the appropriate department. Field personnel are dispatched, and the ticket status updates from Pending → In Progress → Resolved. You can track every step with your tracking code.',
  },
  {
    q: 'Is my personal information kept private?',
    a: 'Yes. Your contact details are only accessible to authorized barangay personnel handling your request. Information is never shared publicly.',
  },
  {
    q: 'What if my concern is urgent or an emergency?',
    a: 'For life-threatening emergencies, call 911 immediately. For urgent community concerns, select "High" severity when submitting — these are flagged for priority response.',
  },
];

const STEPS = [
  { icon: FileText, step: '01', title: 'Submit Your Concern', desc: 'Fill out the short form with your concern details, location, and optional photos. No account needed.' },
  { icon: Clock,    step: '02', title: 'We Assign & Respond', desc: 'Your request is reviewed and assigned to the right department. Field personnel are dispatched promptly.' },
  { icon: CheckCircle, step: '03', title: 'Track to Resolution', desc: 'Use your tracking code to follow real-time status updates from submission to completion.' },
];

const STATS = [
  { value: '98%',    label: 'Resolution Rate' },
  { value: '1,284',  label: 'Tickets Resolved' },
  { value: '14.2h',  label: 'Avg Resolution Time' },
  { value: '25,000+',label: 'Residents Served' },
];

export default function LandingCivic() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const NAV = [
    { label: 'Home',     href: '#home' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'FAQ',      href: '#faq' },
    { label: 'Contact',  href: '#contact' },
  ];

  return (
    <div id="lc-page" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      {/* Scoped style: override global !important rules for this page */}
      <style>{`
        /* ── Light sections: dark text on white/gray backgrounds ── */
        #lc-page h1, #lc-page h2, #lc-page h3, #lc-page h4 { color: #1E2D4E !important; }
        #lc-page p  { color: #4b5563 !important; }
        #lc-page span:not(.lc-badge-text) { color: inherit !important; }
        #lc-page label { color: #374151 !important; }

        /* ── Hero: white text on dark overlay ── */
        #lc-page #home h1,
        #lc-page #home p  { color: #ffffff !important; }
        #lc-page #home .lc-stat-value { color: #4ade80 !important; }
        #lc-page #home .lc-stat-label { color: rgba(148,163,184,0.85) !important; }

        /* ── FAQ CTA dark card: white text ── */
        #lc-page .lc-faq-cta p { color: #ffffff !important; }
        #lc-page .lc-faq-cta .lc-faq-sub { color: rgba(255,255,255,0.7) !important; }

        /* ── Footer: white text — defined here so it wins over #lc-page p ── */
        #civic-footer h1, #civic-footer h2, #civic-footer h3,
        #civic-footer h4, #civic-footer p, #civic-footer span,
        #civic-footer div, #civic-footer a, #civic-footer button,
        #civic-footer * { color: #ffffff !important; }
        #civic-footer button:hover { color: #5eead4 !important; }

        /* ── Navbar text ── */
        #lc-page nav p { color: inherit !important; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .lc-nav-links, .lc-nav-actions { display: none !important; }
          .lc-ham { display: flex !important; }
        }
        @media (min-width: 769px) {
          .lc-ham { display: none !important; }
        }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 64, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e7eb', zIndex: 1000 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <img 
              src={blinkedLogo} 
              alt="BLINKED Logo" 
              style={{ width: 36, height: 36, objectFit: 'contain' }}
            />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1E2D4E', lineHeight: 1.1 }}>BLINKED</p>
              <p style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.05em' }}>Public Service Portal</p>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="lc-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.href)} style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#4b5563', fontFamily: 'inherit', transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1E2D4E'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#4b5563'; }}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="lc-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button onClick={() => navigate('/track')} style={{ height: 38, padding: '0 14px', border: 'none', background: 'none', fontSize: 13, fontWeight: 500, color: '#4b5563', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#1E2D4E'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#4b5563'; }}>
              Track My Request
            </button>
            <button onClick={() => navigate('/report')} style={{ height: 38, padding: '0 20px', borderRadius: 9, border: 'none', background: '#1E2D4E', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#2A3F6B'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#1E2D4E'; }}>
              Submit a Concern
            </button>
          </div>

          {/* Burger */}
          <button onClick={() => setMenuOpen(v => !v)} className="lc-ham" style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-label="Toggle menu">
            {menuOpen ? <X size={18} color="#4b5563" /> : <Menu size={18} color="#4b5563" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #f1f5f9', padding: '12px 24px 20px' }}>
            {NAV.map(l => (
              <button key={l.label} onClick={() => scrollTo(l.href)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 8px', border: 'none', background: 'none', fontSize: 15, fontWeight: 500, color: '#1f2937', cursor: 'pointer', fontFamily: 'inherit', borderBottom: '1px solid #f8fafc' }}>{l.label}</button>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              <button onClick={() => navigate('/report')} style={{ height: 46, borderRadius: 10, border: 'none', background: '#1E2D4E', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>Submit a Concern</button>
              <button onClick={() => navigate('/track')} style={{ height: 42, border: 'none', background: 'none', fontSize: 14, fontWeight: 500, color: '#4b5563', cursor: 'pointer', fontFamily: 'inherit' }}>Track My Request</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section id="home" style={{ position: 'relative', minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', paddingTop: 64 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/hero-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.35)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(30,45,78,0.92) 0%, rgba(13,148,136,0.4) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 760, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#ffffff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>San Vicente, Apalit, Pampanga</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
            Report. Track. Resolve.
          </h1>
          <p style={{ fontSize: 'clamp(1rem,2vw,1.15rem)', color: 'rgba(226,232,240,0.9)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>
            Submit community concerns directly to local officials and track every update — no account required.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
            <button onClick={() => navigate('/report')} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 12, border: 'none', background: '#1E2D4E', fontSize: 15, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(30,45,78,0.35)', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#2A3F6B'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,45,78,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = '#1E2D4E'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,45,78,0.35)'; }}>
              Submit a Concern <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/track')} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)', fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(8px)', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
              Track My Request
            </button>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(16px)', maxWidth: 640, margin: '0 auto' }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ padding: '16px 10px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none', textAlign: 'center' }}>
                <p className="lc-stat-value" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#4ade80', lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
                <p className="lc-stat-label" style={{ fontSize: 10, color: 'rgba(148,163,184,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '96px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Process</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 700, color: '#1E2D4E', marginTop: 8, lineHeight: 1.2 }}>How it works</h2>
            <p style={{ fontSize: 15, color: '#6b7280', marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>Three simple steps from concern to resolution.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} style={{ padding: '32px 28px', borderRadius: 16, background: '#f8fafc', border: '1px solid #e5e7eb', position: 'relative', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(30,45,78,0.08)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                  <span style={{ position: 'absolute', top: 20, right: 24, fontSize: 11, fontWeight: 700, color: '#d1d5db', letterSpacing: '0.05em' }}>{s.step}</span>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <Icon size={22} color="#0D9488" />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E2D4E', marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: '96px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.12em' }}>FAQ</span>
            <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 700, color: '#1E2D4E', marginTop: 8, lineHeight: 1.2 }}>Frequently asked questions</h2>
            <p style={{ fontSize: 15, color: '#6b7280', marginTop: 12 }}>Everything you need to know about submitting and tracking requests.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderRadius: 12, border: '1px solid', borderColor: openFaq === i ? '#cbd5e1' : '#e5e7eb', background: '#fff', overflow: 'hidden', transition: 'all .2s' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 22px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1E2D4E', lineHeight: 1.4 }}>{faq.q}</span>
                  <ChevronDown size={18} color="#9ca3af" style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }} />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 22px 20px' }}>
                    <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA below FAQ */}
          <div className="lc-faq-cta" style={{ marginTop: 48, padding: '32px', borderRadius: 16, background: '#1E2D4E', textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Still have questions?</p>
            <p className="lc-faq-sub" style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>Contact the San Vicente office directly or submit your concern and we'll get back to you.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => scrollTo('#contact')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.25)', background: 'transparent', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}>
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────────────────── */}
      <section id="contact" style={{ padding: '96px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0D9488', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Contact</span>
          <h2 style={{ fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 700, color: '#1E2D4E', marginTop: 8, marginBottom: 12, lineHeight: 1.2 }}>Get in touch</h2>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 48, lineHeight: 1.7 }}>Have questions about BLINKED? Reach out to the San Vicente office directly.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {[
              { icon: Phone, label: 'Phone', value: '(02) 8123-4567' },
              { icon: MapPin, label: 'Address', value: 'San Vicente, Apalit, Pampanga' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ padding: '24px 20px', borderRadius: 14, background: '#f8fafc', border: '1px solid #e5e7eb', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(30,45,78,0.08)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Icon size={18} color="#0D9488" />
                </div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#1E2D4E' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer id="civic-footer" style={{ background: '#1E2D4E', padding: '56px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 36, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <img 
                  src={blinkedLogo} 
                  alt="BLINKED Logo" 
                  style={{ width: 20, height: 20, objectFit: 'contain' }}
                />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>BLINKED</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: '#fff' }}>Serving the community of San Vicente, Apalit, Pampanga with integrity and care.</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Quick Links</p>
              <button onClick={() => navigate('/report')} style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#fff', fontFamily: 'inherit', padding: '4px 0', textAlign: 'left', transition: 'color .15s' }}>Submit a Concern</button>
              <button onClick={() => navigate('/track')} style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#fff', fontFamily: 'inherit', padding: '4px 0', textAlign: 'left', transition: 'color .15s' }}>Track My Request</button>
              <button onClick={() => scrollTo('#faq')} style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#fff', fontFamily: 'inherit', padding: '4px 0', textAlign: 'left', transition: 'color .15s' }}>FAQ</button>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Contact</p>
              <p style={{ fontSize: 13, marginBottom: 6, color: '#fff' }}>Phone: (02) 8123-4567</p>
              <p style={{ fontSize: 13, color: '#fff' }}>San Vicente, Apalit, Pampanga</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: '#fff' }}>© 2026 BLINKED. All rights reserved.</p>
            <p style={{ fontSize: 12, color: '#fff' }}>Public Service Portal v1.0</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
