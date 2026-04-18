/**
 * Preloader — full-screen animated transition shown on login and logout.
 *
 * Features:
 * - Animated teal gradient background with floating orbs
 * - Barangay Connect logo with pulse animation
 * - Smooth fade-in / fade-out
 * - Portal-specific greeting text
 * - Progress bar that fills over the duration
 */

import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import Portal from './Portal';

const PORTAL_CONFIG = {
  admin: {
    label:    'Admin Portal',
    sub:      'System Oversight',
    greeting: 'Welcome back, Administrator',
    color:    '#14b8a6',
    gradient: 'linear-gradient(160deg, #060d1a 0%, #0c1f35 40%, #0a2e2a 75%, #071a16 100%)',
    orb1:     'rgba(20,184,166,.25)',
    orb2:     'rgba(13,148,136,.15)',
  },
  resident: {
    label:    'Resident Portal',
    sub:      'Barangay San Vicente',
    greeting: 'Welcome back',
    color:    '#3b82f6',
    gradient: 'linear-gradient(160deg, #060d1a 0%, #0c1835 40%, #0a1e3a 75%, #071020 100%)',
    orb1:     'rgba(59,130,246,.25)',
    orb2:     'rgba(37,99,235,.15)',
  },
  personnel: {
    label:    'Personnel Portal',
    sub:      'Field Operations',
    greeting: 'Welcome back',
    color:    '#f59e0b',
    gradient: 'linear-gradient(160deg, #0f172a 0%, #1c1917 50%, #1a1207 100%)',
    orb1:     'rgba(245,158,11,.25)',
    orb2:     'rgba(217,119,6,.15)',
  },
  logout: {
    label:    'Barangay Connect',
    sub:      'Signing out securely…',
    greeting: 'See you soon',
    color:    '#14b8a6',
    gradient: 'linear-gradient(160deg, #060d1a 0%, #0c1f35 40%, #0a2e2a 75%, #071a16 100%)',
    orb1:     'rgba(20,184,166,.2)',
    orb2:     'rgba(13,148,136,.12)',
  },
};

export default function Preloader({ portal = 'admin', userName = '', onDone }) {
  const [progress,  setProgress]  = useState(0);
  const [phase,     setPhase]     = useState('enter'); // enter | hold | exit
  const cfg = PORTAL_CONFIG[portal] || PORTAL_CONFIG.admin;

  useEffect(() => {
    // Phase 1: progress bar fills over 1.2s
    const start = Date.now();
    const duration = 1400;
    const raf = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        // Phase 2: hold briefly then fade out
        setTimeout(() => {
          setPhase('exit');
          setTimeout(() => onDone?.(), 400);
        }, 200);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <Portal>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 999999,
          background: cfg.gradient,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          opacity:    phase === 'exit' ? 0 : 1,
          transition: phase === 'exit' ? 'opacity .4s ease' : 'opacity .3s ease',
          overflow: 'hidden',
        }}
      >
        {/* Dot grid texture */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.055) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Ambient orbs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${cfg.orb1} 0%, transparent 70%)`, filter: 'blur(2px)', pointerEvents: 'none', animation: 'float 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${cfg.orb2} 0%, transparent 70%)`, pointerEvents: 'none', animation: 'float 10s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', top: '40%', left: '10%', width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${cfg.orb2} 0%, transparent 70%)`, pointerEvents: 'none', animation: 'float 12s ease-in-out infinite' }} />

        {/* Main content */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

          {/* Logo ring */}
          <div style={{ position: 'relative', marginBottom: 32 }}>
            {/* Outer pulse ring */}
            <div style={{
              position: 'absolute', inset: -12,
              borderRadius: '50%',
              border: `2px solid ${cfg.color}`,
              opacity: 0.3,
              animation: 'preloaderPulse 1.8s ease-in-out infinite',
            }} />
            {/* Middle ring */}
            <div style={{
              position: 'absolute', inset: -6,
              borderRadius: '50%',
              border: `1.5px solid ${cfg.color}`,
              opacity: 0.5,
              animation: 'preloaderPulse 1.8s ease-in-out infinite .3s',
            }} />
            {/* Logo circle */}
            <div style={{
              width: 72, height: 72,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}15)`,
              border: `2px solid ${cfg.color}60`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 40px ${cfg.color}30, 0 0 80px ${cfg.color}15`,
            }}>
              <Shield size={30} style={{ color: cfg.color }} strokeWidth={1.8} />
            </div>
          </div>

          {/* App name */}
          <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>
            Barangay Connect
          </p>

          {/* Portal label */}
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: 6, textAlign: 'center' }}>
            {cfg.label}
          </h1>

          {/* Greeting */}
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', marginBottom: 48, textAlign: 'center' }}>
            {cfg.greeting}{userName ? `, ${userName}` : ''}
          </p>

          {/* Progress bar track */}
          <div style={{ width: 220, height: 3, borderRadius: 99, background: 'rgba(255,255,255,.1)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{
              height: '100%',
              borderRadius: 99,
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`,
              transition: 'width .05s linear',
              boxShadow: `0 0 8px ${cfg.color}60`,
            }} />
          </div>

          {/* Sub label */}
          <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {cfg.sub}
          </p>
        </div>

        {/* Version badge */}
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 99, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, animation: 'preloaderPulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '0.08em' }}>v4.2.1-stable</span>
        </div>

        <style>{`
          @keyframes preloaderPulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50%       { opacity: 0.8; transform: scale(1.05); }
          }
        `}</style>
      </div>
    </Portal>
  );
}
