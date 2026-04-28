import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Menu, X, ChevronUp, ChevronLeft, ChevronRight, Users, FileText, CheckCircle, Zap, MapPin, Phone, Mail } from 'lucide-react';

const SLIDES = [
  { id:1, title:'Community-First Governance', desc:'Barangay San Vicente serves over 12,000 residents with transparent, responsive, technology-driven public service.', stat:'12,000+', statLabel:'Residents Served' },
  { id:2, title:'Submit Requests in Minutes', desc:'Report streetlight outages, road damage, drainage issues and more through a simple 4-step wizard with photo evidence.', stat:'4 Steps', statLabel:'To Submit a Request' },
  { id:3, title:'Real-Time Status Tracking', desc:'Every request is tracked from submission to completion. Residents receive live updates as field personnel work on issues.', stat:'14.2h', statLabel:'Avg. Resolution Time' },
  { id:4, title:'Field Personnel Coordination', desc:'Assigned barangay staff receive tasks on their dedicated portal, update statuses in the field, and document work digitally.', stat:'86', statLabel:'Active Field Personnel' },
  { id:5, title:'Admin Analytics Dashboard', desc:'Administrators monitor department workloads, resolution times, and incident heatmaps in real time for data-driven decisions.', stat:'98%', statLabel:'System Uptime' },
];

const FEATURES = [
  { icon:FileText,    color:'#2563eb', bg:'#eff6ff', title:'Easy Request Submission', desc:'Submit service requests with photos, location, and severity in under 2 minutes.' },
  { icon:Zap,         color:'#f59e0b', bg:'#fffbeb', title:'Instant Notifications',   desc:'Get notified at every stage from submission to completion in real time.' },
  { icon:Users,       color:'#14b8a6', bg:'#f0fdfa', title:'Three-Portal System',     desc:'Separate portals for Residents, Field Personnel, and Administrators.' },
  { icon:CheckCircle, color:'#059669', bg:'#ecfdf5', title:'Transparent Tracking',    desc:'Track every request with a live progress bar and status timeline.' },
  { icon:Shield,      color:'#8b5cf6', bg:'#f5f3ff', title:'Secure and Private',      desc:'Your data is encrypted and only accessible to authorized personnel.' },
  { icon:MapPin,      color:'#ef4444', bg:'#fef2f2', title:'Location-Based Routing',  desc:'Requests are automatically routed to the correct department by location.' },
];

const STATS = [
  { value:'1,284', label:'Tickets Resolved' },
  { value:'14.2h', label:'Avg Resolution'   },
  { value:'98%',   label:'System Uptime'    },
  { value:'86',    label:'Active Personnel' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [slide,     setSlide]     = useState(0);
  const [showLearn, setShowLearn] = useState(false);
  const [showTop,   setShowTop]   = useState(false);

  // Learn modal slide auto-advance
  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollTo = (id) => { setMenuOpen(false); document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' }); };

  const NAV = [{ label:'Home', href:'#hero' },{ label:'About', href:'#about' },{ label:'Features', href:'#features' },{ label:'Contact', href:'#contact' }];

  return (
    <div style={{ fontFamily:'var(--font-sans)', background:'#f8fafc', minHeight:'100vh', overflowX:'hidden' }}>

      {/* TOP NAV */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:200, background:'rgba(255,255,255,.92)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(226,232,240,.8)', boxShadow:'0 1px 12px rgba(15,23,42,.06)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#14b8a6,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(20,184,166,.3)' }}>
              <Shield size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:700, color:'#0f172a', lineHeight:1.1 }}>Barangay Connect</p>
              <p style={{ fontSize:10, color:'#94a3b8', letterSpacing:'0.05em' }}>San Vicente</p>
            </div>
          </div>

          {/* Desktop nav links — hidden on mobile via CSS */}
          <div className="land-nav-links" style={{ display:'flex', alignItems:'center', gap:4, flex:1, justifyContent:'center' }}>
            {NAV.map((l) => (
              <button key={l.label} onClick={() => scrollTo(l.href)} style={{ padding:'7px 14px', borderRadius:8, border:'none', background:'none', cursor:'pointer', fontSize:14, fontWeight:500, color:'#475569', fontFamily:'inherit', transition:'all .15s', whiteSpace:'nowrap' }} onMouseEnter={(e) => { e.currentTarget.style.background='#f1f5f9'; e.currentTarget.style.color='#0f172a'; }} onMouseLeave={(e) => { e.currentTarget.style.background='none'; e.currentTarget.style.color='#475569'; }}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Desktop actions — hidden on mobile via CSS */}
          <div className="land-nav-actions" style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <button onClick={() => navigate('/login')} style={{ height:36, padding:'0 16px', borderRadius:20, border:'1.5px solid #e2e8f0', background:'#fff', fontSize:13, fontWeight:600, color:'#334155', cursor:'pointer', fontFamily:'inherit', transition:'all .15s', whiteSpace:'nowrap' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor='#14b8a6'; e.currentTarget.style.color='#0d9488'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.color='#334155'; }}>Sign In</button>
            <button onClick={() => navigate('/login')} style={{ height:36, padding:'0 18px', borderRadius:20, border:'none', background:'linear-gradient(135deg,#14b8a6,#0d9488)', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(20,184,166,.35)', transition:'all .15s', whiteSpace:'nowrap' }} onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-1px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform=''; }}>Register</button>
          </div>

          {/* Burger button — shown on mobile via CSS */}
          <button onClick={() => setMenuOpen((v) => !v)} className="land-ham" style={{ width:44, height:44, borderRadius:8, border:'1px solid #e2e8f0', background:'#fff', cursor:'pointer', display:'none', alignItems:'center', justifyContent:'center', flexShrink:0 }} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X size={20} color="#475569" /> : <Menu size={20} color="#475569" />}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div style={{ borderTop:'1px solid #f1f5f9', background:'#fff', padding:'12px 16px 20px' }}>
            {NAV.map((l) => (<button key={l.label} onClick={() => scrollTo(l.href)} style={{ display:'block', width:'100%', textAlign:'left', padding:'12px 8px', border:'none', background:'none', fontSize:15, fontWeight:500, color:'#334155', cursor:'pointer', fontFamily:'inherit', borderBottom:'1px solid #f8fafc', minHeight:44 }}>{l.label}</button>))}
            <div style={{ display:'flex', gap:10, marginTop:14 }}>
              <button onClick={() => navigate('/login')} style={{ flex:1, height:44, borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', fontSize:14, fontWeight:600, color:'#334155', cursor:'pointer', fontFamily:'inherit' }}>Sign In</button>
              <button onClick={() => navigate('/login')} style={{ flex:1, height:44, borderRadius:10, border:'none', background:'linear-gradient(135deg,#14b8a6,#0d9488)', fontSize:14, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'inherit' }}>Register</button>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════════════════
          HERO — Building photo background, left-aligned layout
      ══════════════════════════════════════════════════════ */}
      <section id="hero" style={{ position:'relative', minHeight:'100vh', overflow:'hidden' }}>

        {/* Building photo */}
        <div style={{ position:'absolute', inset:0, backgroundImage:`url(/hero-bg.png)`, backgroundSize:'cover', backgroundPosition:'center 30%', backgroundRepeat:'no-repeat' }} />

        {/* Dark overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(4,20,28,.88) 0%, rgba(5,30,28,.82) 40%, rgba(4,18,24,.75) 70%, rgba(3,14,20,.65) 100%)' }} />

        {/* Dot grid texture */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'radial-gradient(circle, rgba(255,255,255,.045) 1px, transparent 1px)', backgroundSize:'28px 28px', opacity:.4 }} />

        {/* Live badge */}
        <div style={{ position:'absolute', top:88, left:'50%', transform:'translateX(-50%)', zIndex:10 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:99, background:'rgba(34,168,58,.15)', border:'1px solid rgba(34,168,58,.35)', backdropFilter:'blur(8px)' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#22a83a', display:'inline-block', animation:'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize:11.5, fontWeight:700, color:'#86efac', letterSpacing:'0.1em', textTransform:'uppercase', whiteSpace:'nowrap' }}>
              Barangay San Vicente · Apalit, Pampanga
            </span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ position:'relative', zIndex:10, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'120px 24px 80px', textAlign:'center', maxWidth:960, margin:'0 auto' }}>

          <h1 className="font-display" style={{ fontSize:'clamp(2.4rem,6vw,4.2rem)', fontWeight:700, color:'#fff', lineHeight:1.1, marginBottom:16, textShadow:'0 2px 20px rgba(0,0,0,.4)', animation:'heroFadeUp .7s ease-out both' }}>
            Serving Our Community
          </h1>

          <p style={{ fontSize:'clamp(1rem,2.2vw,1.2rem)', color:'rgba(226,232,240,.9)', lineHeight:1.6, marginBottom:12, textShadow:'0 1px 8px rgba(0,0,0,.3)', animation:'heroFadeUp .7s ease-out .1s both' }}>
            Barangay San Vicente, Apalit, Pampanga
          </p>

          <p style={{ fontSize:'clamp(.9rem,1.8vw,1.05rem)', color:'rgba(148,163,184,.8)', lineHeight:1.7, maxWidth:540, margin:'0 auto 40px', animation:'heroFadeUp .7s ease-out .2s both' }}>
            A unified platform connecting residents, field personnel, and administrators
            for real-time incident tracking and transparent community service.
          </p>

          {/* CTA buttons */}
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:56, animation:'heroFadeUp .7s ease-out .3s both' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 32px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#22a83a,#1a7a2e)', fontSize:15, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 20px rgba(34,168,58,.5)', transition:'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(34,168,58,.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 20px rgba(34,168,58,.5)'; }}
            >
              Get Started <ArrowRight size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setShowLearn(true)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 28px', borderRadius:14, border:'1.5px solid rgba(255,255,255,.3)', background:'rgba(255,255,255,.1)', backdropFilter:'blur(12px)', fontSize:15, fontWeight:600, color:'#fff', cursor:'pointer', fontFamily:'inherit', transition:'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.18)'; e.currentTarget.style.borderColor='rgba(255,255,255,.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.1)'; e.currentTarget.style.borderColor='rgba(255,255,255,.3)'; }}
            >
              Learn More
            </button>
          </div>

          {/* Stats strip */}
          <div className="land-stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,.12)', maxWidth:700, margin:'0 auto', background:'rgba(0,0,0,.35)', backdropFilter:'blur(16px)', animation:'heroFadeUp .7s ease-out .4s both' }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{ padding:'18px 12px', borderRight:i < 3 ? '1px solid rgba(255,255,255,.08)' : 'none', textAlign:'center' }}>
                <p className="font-display" style={{ fontSize:'1.5rem', fontWeight:700, color:'#22a83a', lineHeight:1, marginBottom:4 }}>{s.value}</p>
                <p style={{ fontSize:10, color:'rgba(148,163,184,.75)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', lineHeight:1.3 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position:'absolute', bottom:32, right:28, zIndex:20, display:'flex', flexDirection:'column', alignItems:'center', gap:6, opacity:.5 }}>
          <span style={{ fontSize:9, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:'.12em', writingMode:'vertical-rl' }}>Scroll</span>
          <div style={{ width:1, height:40, background:'linear-gradient(to bottom, #fff, transparent)' }} />
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ padding:'96px 24px', background:'#fff' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#14b8a6', textTransform:'uppercase', letterSpacing:'0.12em' }}>About the System</span>
            <h2 className="font-display" style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:400, color:'#0f172a', marginTop:10, lineHeight:1.2 }}>Three portals. One mission.</h2>
            <p style={{ fontSize:16, color:'#64748b', lineHeight:1.7, maxWidth:560, margin:'16px auto 0' }}>Barangay Connect bridges the gap between residents and local government through a unified digital platform.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {[
              { color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', title:'Resident Portal', desc:'Submit service requests, track progress in real time, and stay informed about community updates. Report issues with photos and location in minutes.' },
              { color:'#f59e0b', bg:'#fffbeb', border:'#fde68a', title:'Personnel Portal', desc:'Field staff receive assigned tasks, update ticket statuses from the field, and document completed work from a mobile-friendly interface.' },
              { color:'#14b8a6', bg:'#f0fdfa', border:'#99f6e4', title:'Admin Portal', desc:'Administrators oversee all operations, manage personnel, view analytics dashboards, and ensure no request falls through the cracks.' },
            ].map((p) => (
              <div key={p.title} style={{ padding:'28px 24px', borderRadius:20, background:p.bg, border:`1px solid ${p.border}`, transition:'transform .2s, box-shadow .2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(15,23,42,.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}>
                <h3 style={{ fontSize:18, fontWeight:700, color:p.color, marginBottom:10 }}>{p.title}</h3>
                <p style={{ fontSize:14, color:'#475569', lineHeight:1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding:'96px 24px', background:'#f8fafc' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#14b8a6', textTransform:'uppercase', letterSpacing:'0.12em' }}>Features</span>
            <h2 className="font-display" style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:400, color:'#0f172a', marginTop:10, lineHeight:1.2 }}>Everything you need.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} style={{ padding:'24px', borderRadius:16, background:'#fff', border:'1px solid #e2e8f0', boxShadow:'0 1px 3px rgba(15,23,42,.05)', transition:'all .2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(15,23,42,.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 1px 3px rgba(15,23,42,.05)'; }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:f.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                    <Icon size={20} style={{ color:f.color }} />
                  </div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'#0f172a', marginBottom:8 }}>{f.title}</h3>
                  <p style={{ fontSize:13.5, color:'#64748b', lineHeight:1.65 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding:'96px 24px', background:'#fff' }}>
        <div style={{ maxWidth:700, margin:'0 auto', textAlign:'center' }}>
          <span style={{ fontSize:12, fontWeight:700, color:'#14b8a6', textTransform:'uppercase', letterSpacing:'0.12em' }}>Contact</span>
          <h2 className="font-display" style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:400, color:'#0f172a', marginTop:10, marginBottom:16, lineHeight:1.2 }}>Get in touch.</h2>
          <p style={{ fontSize:16, color:'#64748b', lineHeight:1.7, marginBottom:40 }}>Have questions about Barangay Connect? Reach out to the Barangay San Vicente office.</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:40 }}>
            {[
              { icon:Phone, label:'Phone', value:'(02) 8123-4567' },
              { icon:Mail,  label:'Email', value:'info@bsv.gov.ph' },
              { icon:MapPin,label:'Address', value:'Barangay San Vicente, QC' },
            ].map(({ icon:Icon, label, value }) => (
              <div key={label} style={{ padding:'20px', borderRadius:14, background:'#f8fafc', border:'1px solid #e2e8f0' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:'#f0fdfa', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                  <Icon size={16} style={{ color:'#14b8a6' }} />
                </div>
                <p style={{ fontSize:11, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>{label}</p>
                <p style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>{value}</p>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/login')} style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'14px 36px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#14b8a6,#0d9488)', fontSize:15, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 20px rgba(20,184,166,.4)', transition:'all .2s' }} onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform=''; }}>
            Get Started Now <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#0f172a', padding:'48px 24px 32px', color:'rgba(148,163,184,.8)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:32, marginBottom:40 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#14b8a6,#0d9488)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Shield size={16} color="#fff" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>Barangay Connect</span>
              </div>
              <p style={{ fontSize:13, lineHeight:1.7 }}>Centralized Intelligence Platform for Barangay San Vicente. v4.2.1-stable.</p>
            </div>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Portals</p>
              {['Resident Portal','Personnel Portal','Admin Portal'].map((l) => (
                <button key={l} onClick={() => navigate('/login')} style={{ display:'block', background:'none', border:'none', cursor:'pointer', fontSize:13, color:'rgba(148,163,184,.8)', fontFamily:'inherit', padding:'4px 0', transition:'color .15s' }} onMouseEnter={(e) => { e.currentTarget.style.color='#14b8a6'; }} onMouseLeave={(e) => { e.currentTarget.style.color='rgba(148,163,184,.8)'; }}>{l}</button>
              ))}
            </div>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Quick Links</p>
              {[['Home','#hero'],['About','#about'],['Features','#features'],['Contact','#contact']].map(([l,h]) => (
                <button key={l} onClick={() => scrollTo(h)} style={{ display:'block', background:'none', border:'none', cursor:'pointer', fontSize:13, color:'rgba(148,163,184,.8)', fontFamily:'inherit', padding:'4px 0', transition:'color .15s' }} onMouseEnter={(e) => { e.currentTarget.style.color='#14b8a6'; }} onMouseLeave={(e) => { e.currentTarget.style.color='rgba(148,163,184,.8)'; }}>{l}</button>
              ))}
            </div>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'#fff', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Contact</p>
              <p style={{ fontSize:13, marginBottom:6 }}>Phone: (02) 8123-4567</p>
              <p style={{ fontSize:13, marginBottom:6 }}>Email: info@bsv.gov.ph</p>
              <p style={{ fontSize:13 }}>Barangay San Vicente, QC</p>
            </div>
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', paddingTop:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <p style={{ fontSize:12 }}>2025 Barangay San Vicente. All rights reserved.</p>
            <p style={{ fontSize:12 }}>Barangay Connect v4.2.1-stable</p>
          </div>
        </div>
      </footer>

      {/* SCROLL TO TOP */}
      {showTop && (
        <button onClick={scrollTop} style={{ position:'fixed', bottom:28, right:28, zIndex:300, width:44, height:44, borderRadius:'50%', border:'none', background:'linear-gradient(135deg,#14b8a6,#0d9488)', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(20,184,166,.45)', transition:'all .2s', animation:'fadeIn .3s ease-out both' }} onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-2px) scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform=''; }} aria-label="Scroll to top">
          <ChevronUp size={20} strokeWidth={2.5} />
        </button>
      )}

      {/* LEARN MORE MODAL */}
      {showLearn && (
        <div onClick={() => setShowLearn(false)} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(9,18,32,.75)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', animation:'fadeIn .2s ease-out both' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width:'100%', maxWidth:680, background:'#fff', borderRadius:24, overflow:'hidden', boxShadow:'0 4px 8px rgba(15,23,42,.06), 0 32px 72px rgba(15,23,42,.22)', animation:'scaleIn .25s cubic-bezier(.34,1.56,.64,1) both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid #f1f5f9', background:'linear-gradient(180deg,#fafbfc,#f8fafc)' }}>
              <div>
                <p style={{ fontSize:15, fontWeight:700, color:'#0f172a' }}>Learn About Barangay Connect</p>
                <p style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>Slide {slide + 1} of {SLIDES.length}</p>
              </div>
              <button onClick={() => setShowLearn(false)} style={{ width:32, height:32, borderRadius:8, border:'none', background:'#f1f5f9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', transition:'background .15s' }} onMouseEnter={(e) => { e.currentTarget.style.background='#e2e8f0'; }} onMouseLeave={(e) => { e.currentTarget.style.background='#f1f5f9'; }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding:'40px 40px 32px', minHeight:280, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
              <div style={{ width:72, height:72, borderRadius:20, background:'linear-gradient(135deg,#f0fdfa,#ccfbf1)', border:'1px solid #99f6e4', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Shield size={32} style={{ color:'#0d9488' }} />
              </div>
              <h3 className="font-display" style={{ fontSize:'1.625rem', fontWeight:400, color:'#0f172a', marginBottom:14, lineHeight:1.2 }}>{SLIDES[slide].title}</h3>
              <p style={{ fontSize:15, color:'#475569', lineHeight:1.75, maxWidth:480, marginBottom:28 }}>{SLIDES[slide].desc}</p>
              <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', padding:'14px 28px', borderRadius:14, background:'linear-gradient(135deg,#f0fdfa,#ccfbf1)', border:'1px solid #99f6e4' }}>
                <p style={{ fontSize:'2rem', fontWeight:800, color:'#0d9488', letterSpacing:'-0.03em', lineHeight:1 }}>{SLIDES[slide].stat}</p>
                <p style={{ fontSize:11, fontWeight:600, color:'#0d9488', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}>{SLIDES[slide].statLabel}</p>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderTop:'1px solid #f1f5f9', background:'#f8fafc' }}>
              <button onClick={() => setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, border:'1px solid #e2e8f0', background:'#fff', fontSize:13, fontWeight:600, color:'#334155', cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }} onMouseEnter={(e) => { e.currentTarget.style.background='#f1f5f9'; }} onMouseLeave={(e) => { e.currentTarget.style.background='#fff'; }}>
                <ChevronLeft size={15} /> Previous
              </button>
              <div style={{ display:'flex', gap:6 }}>
                {SLIDES.map((_,i) => (
                  <button key={i} onClick={() => setSlide(i)} style={{ width:i===slide?20:8, height:8, borderRadius:99, border:'none', background:i===slide?'#14b8a6':'#e2e8f0', cursor:'pointer', transition:'all .25s', padding:0 }} />
                ))}
              </div>
              {slide < SLIDES.length - 1 ? (
                <button onClick={() => setSlide((s) => s + 1)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, border:'none', background:'#14b8a6', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }} onMouseEnter={(e) => { e.currentTarget.style.background='#0d9488'; }} onMouseLeave={(e) => { e.currentTarget.style.background='#14b8a6'; }}>
                  Next <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={() => { setShowLearn(false); navigate('/login'); }} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#14b8a6,#0d9488)', fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 2px 8px rgba(20,184,166,.35)', transition:'all .15s' }} onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-1px)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform=''; }}>
                  Get Started <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Mobile: show burger, hide nav links + actions */
        @media (max-width: 767px) {
          .land-ham { display: flex !important; }
          .land-nav-links { display: none !important; }
          .land-nav-actions { display: none !important; }
          .land-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            max-width: 100% !important;
          }
          .land-stats-grid > div {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,.07);
          }
          .land-stats-grid > div:nth-child(odd) {
            border-right: 1px solid rgba(255,255,255,.07) !important;
          }
        }
        /* Tablet: show burger, hide nav links + actions */
        @media (min-width: 768px) and (max-width: 1023px) {
          .land-ham { display: flex !important; }
          .land-nav-links { display: none !important; }
          .land-nav-actions { display: none !important; }
        }

        /* Hero animations */
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: .6; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
