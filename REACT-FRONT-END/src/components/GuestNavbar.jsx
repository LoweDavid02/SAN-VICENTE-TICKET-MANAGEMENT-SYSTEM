/**
 * GuestNavbar.jsx — Minimal navigation for guest pages (submission & tracking)
 * 
 * Shows only essential navigation without auth buttons to keep focus on the guest flow.
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Home, Search, FileText } from 'lucide-react';

export default function GuestNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 200,
      background: 'rgba(255,255,255,.95)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(226,232,240,.8)',
      boxShadow: '0 1px 12px rgba(15,23,42,.06)'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 20px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16
      }}>
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg,#14b8a6,#0d9488)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(20,184,166,.3)'
          }}>
            <Shield size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <p style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#0f172a',
              lineHeight: 1.1,
              textAlign: 'left'
            }}>
              BLINKED
            </p>
            <p style={{
              fontSize: 10,
              color: '#94a3b8',
              letterSpacing: '0.05em',
              textAlign: 'left'
            }}>
              San Vicente
            </p>
          </div>
        </button>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: 1,
          justifyContent: 'center'
        }}>
          <NavButton
            icon={<Home size={16} />}
            label="Home"
            onClick={() => navigate('/')}
            active={isActive('/')}
          />
          <NavButton
            icon={<FileText size={16} />}
            label="Submit Request"
            onClick={() => navigate('/submit')}
            active={isActive('/submit')}
          />
          <NavButton
            icon={<Search size={16} />}
            label="Track Request"
            onClick={() => navigate('/track')}
            active={isActive('/track') || location.pathname.startsWith('/track/')}
          />
        </div>

        {/* Staff Login (Secondary) */}
        <button
          onClick={() => navigate('/login')}
          style={{
            height: 36,
            padding: '0 16px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            fontSize: 13,
            fontWeight: 500,
            color: '#64748b',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all .15s',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.color = '#475569';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          Staff Login
        </button>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .nav-label {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}

function NavButton({ icon, label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 8,
        border: 'none',
        background: active ? 'rgba(20,184,166,0.1)' : 'transparent',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        color: active ? '#0d9488' : '#64748b',
        fontFamily: 'inherit',
        transition: 'all .15s',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#f8fafc';
          e.currentTarget.style.color = '#475569';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#64748b';
        }
      }}
    >
      {icon}
      <span className="nav-label">{label}</span>
    </button>
  );
}
