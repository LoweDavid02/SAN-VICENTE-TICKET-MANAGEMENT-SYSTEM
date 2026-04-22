/**
 * Preloader — full-screen animated transition shown on login and logout.
 *
 * Features:
 * - San Vicente barangay seal logo with layered pulse + spin animations
 * - Color scheme from the official barangay seal (green, orange, red)
 * - Portal name only — no extra words
 * - Smooth progress bar and fade-out
 */

import { useEffect, useState } from 'react';
import Portal from './Portal';
import SanVicenteLogo from './SanVicenteLogo';

// Color scheme from the barangay seal
const PORTAL_CONFIG = {
  admin: {
    label:    'Admin Portal',
    color:    '#22a83a',   // green
    accent:   '#f5a623',   // orange
    gradient: 'linear-gradient(160deg, #071a0f 0%, #0d2e18 40%, #0a2010 75%, #061208 100%)',
    orb1:     'rgba(34,168,58,.22)',
    orb2:     'rgba(245,166,35,.12)',
  },
  resident: {
    label:    'Resident Portal',
    color:    '#22a83a',
    accent:   '#f5a623',
    gradient: 'linear-gradient(160deg, #071a0f 0%, #0d2e18 40%, #0a2010 75%, #061208 100%)',
    orb1:     'rgba(34,168,58,.22)',
    orb2:     'rgba(245,166,35,.12)',
  },
  personnel: {
    label:    'Personnel Portal',
    color:    '#22a83a',
    accent:   '#f5a623',
    gradient: 'linear-gradient(160deg, #071a0f 0%, #0d2e18 40%, #0a2010 75%, #061208 100%)',
    orb1:     'rgba(34,168,58,.22)',
    orb2:     'rgba(245,166,35,.12)',
  },
  logout: {
    label:    'Barangay San Vicente',
    color:    '#22a83a',
    accent:   '#f5a623',
    gradient: 'linear-gradient(160deg, #071a0f 0%, #0d2e18 40%, #0a2010 75%, #061208 100%)',
    orb1:     'rgba(34,168,58,.18)',
    orb2:     'rgba(245,166,35,.1)',
  },
};

export default function Preloader({ portal = 'admin', userName = '', onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase,    setPhase]    = useState('enter'); // enter | exit
  const cfg = PORTAL_CONFIG[portal] || PORTAL_CONFIG.admin;

  useEffect(() => {
    const start    = Date.now();
    const duration = 1600;

    const raf = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - start;
      const pct     = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setPhase('exit');
          setTimeout(() => onDone?.(), 450);
        }, 180);
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <Portal>
      <div
        style={{
          position:   'fixed',
          inset:      0,
          zIndex:     999999,
          background: cfg.gradient,
          display:    'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity:    phase === 'exit' ? 0 : 1,
          transition: phase === 'exit' ? 'opacity .45s ease' : 'opacity .3s ease',
          overflow:   'hidden',
        }}
      >
        {/* Dot grid texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Ambient orbs */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: 500, height: 500, borderRadius: '50%',
          background: `radial-gradient(circle, ${cfg.orb1} 0%, transparent 70%)`,
          filter: 'blur(4px)', pointerEvents: 'none',
          animation: 'float 9s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', left: '-80px',
          width: 380, height: 380, borderRadius: '50%',
          background: `radial-gradient(circle, ${cfg.orb2} 0%, transparent 70%)`,
          pointerEvents: 'none',
          animation: 'float 11s ease-in-out infinite reverse',
        }} />

        {/* ── Main content ── */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 0,
        }}>

          {/* ── Animated logo stack ── */}
          <div style={{ position: 'relative', marginBottom: 36 }}>

            {/* Outermost slow-spin ring */}
            <div style={{
              position: 'absolute',
              inset: -22,
              borderRadius: '50%',
              border: `1.5px dashed ${cfg.color}`,
              opacity: 0.25,
              animation: 'preloaderSpin 12s linear infinite',
            }} />

            {/* Outer pulse ring */}
            <div style={{
              position: 'absolute',
              inset: -14,
              borderRadius: '50%',
              border: `2px solid ${cfg.color}`,
              opacity: 0.35,
              animation: 'preloaderPulse 2s ease-in-out infinite',
            }} />

            {/* Middle ring — counter-spin */}
            <div style={{
              position: 'absolute',
              inset: -7,
              borderRadius: '50%',
              border: `1.5px solid ${cfg.accent}`,
              opacity: 0.45,
              animation: 'preloaderSpin 8s linear infinite reverse',
            }} />

            {/* Logo — scale bounce on enter */}
            <div style={{
              animation: 'preloaderBounce .6s cubic-bezier(.34,1.56,.64,1) both',
              filter: `drop-shadow(0 0 24px ${cfg.color}50) drop-shadow(0 0 48px ${cfg.color}25)`,
            }}>
              <SanVicenteLogo size={110} />
            </div>

            {/* Glow halo behind logo */}
            <div style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${cfg.color}20 0%, transparent 70%)`,
              animation: 'preloaderPulse 2.4s ease-in-out infinite .6s',
              pointerEvents: 'none',
            }} />
          </div>

          {/* ── Portal name only ── */}
          <h1 style={{
            fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.01em',
            marginBottom: 4,
            textAlign: 'center',
            animation: 'fadeUp .5s ease-out .2s both',
          }}>
            {cfg.label}
          </h1>

          {/* ── "Barangay San Vicente" subtitle ── */}
          <p style={{
            fontSize: 12,
            fontWeight: 600,
            color: `${cfg.color}cc`,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 44,
            animation: 'fadeUp .5s ease-out .35s both',
          }}>
            Barangay San Vicente
          </p>

          {/* ── Progress bar ── */}
          <div style={{
            width: 200,
            height: 3,
            borderRadius: 99,
            background: 'rgba(255,255,255,.08)',
            overflow: 'hidden',
            marginBottom: 14,
            animation: 'fadeUp .4s ease-out .5s both',
          }}>
            <div style={{
              height: '100%',
              borderRadius: 99,
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color}, ${cfg.accent})`,
              transition: 'width .05s linear',
              boxShadow: `0 0 10px ${cfg.color}70`,
            }} />
          </div>

          {/* ── Loading dots ── */}
          <div style={{
            display: 'flex', gap: 6,
            animation: 'fadeUp .4s ease-out .6s both',
          }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                width: 5, height: 5,
                borderRadius: '50%',
                background: cfg.color,
                opacity: 0.6,
                animation: `preloaderDot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div>

        {/* ── Keyframes ── */}
        <style>{`
          @keyframes preloaderPulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50%       { opacity: 0.75; transform: scale(1.06); }
          }
          @keyframes preloaderSpin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes preloaderBounce {
            from { opacity: 0; transform: scale(0.6); }
            to   { opacity: 1; transform: scale(1); }
          }
          @keyframes preloaderDot {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40%           { transform: scale(1.2); opacity: 1; }
          }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%   { transform: translateY(0px) scale(1); }
            50%  { transform: translateY(-24px) scale(1.04); }
            100% { transform: translateY(0px) scale(1); }
          }
        `}</style>
      </div>
    </Portal>
  );
}
