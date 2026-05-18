import { useNavigate } from 'react-router-dom';
import { Shield, Users, ArrowRight } from 'lucide-react';

const PORTALS = [
  {
    role: 'admin',
    path: '/admin/dashboard',
    icon: Shield,
    title: 'Command Center',
    sub: 'For administrators',
    desc: 'Monitor incidents, manage department workloads, and track performance metrics in real-time.',
    features: ['Live operations dashboard', 'Smart ticket assignment', 'Department analytics'],
    accent: '#14b8a6',
    accentBg: 'rgba(20,184,166,.12)',
  },
  {
    role: 'personnel',
    path: '/personnel/dashboard',
    icon: Users,
    title: 'Field Operations',
    sub: 'For field personnel',
    desc: 'Receive assigned tasks, update ticket statuses from the field, and document completed work.',
    features: ['Task management', 'Field status updates', 'Work documentation'],
    accent: '#f59e0b',
    accentBg: 'rgba(245,158,11,.12)',
  },
];

export default function PortalSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
         style={{ background:'linear-gradient(135deg,#102a43 0%,#243b53 100%)' }}>
      <div className="w-full max-w-3xl animate-fade-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
               style={{ background:'rgba(20,184,166,.15)', border:'1px solid rgba(20,184,166,.3)' }}>
            <Shield size={13} className="text-teal-400" />
            <span className="text-teal-400 text-xs font-semibold tracking-wide">San Vicente</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">BLINKED</h1>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Select your portal to continue. You can switch portals at any time from the sidebar.
          </p>
        </div>

        {/* Portal cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* eslint-disable-next-line no-unused-vars */}
          {PORTALS.map(({ role, path, icon: PortalIcon, title, sub, desc, features, accent, accentBg }) => (
            <button
              key={role}
              onClick={() => navigate(path)}
              className="text-left p-6 rounded-xl transition-all hover:-translate-y-1 group"
              style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = 'rgba(255,255,255,.09)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)'; e.currentTarget.style.background = 'rgba(255,255,255,.06)'; }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                     style={{ background: accentBg, border:`1px solid ${accent}40` }}>
                  <PortalIcon size={18} style={{ color: accent }} />
                </div>
                <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors mt-1" />
              </div>

              <p className="text-white font-semibold text-base mb-0.5">{title}</p>
              <p className="text-xs mb-3" style={{ color: accent }}>{sub}</p>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{desc}</p>

              <ul className="space-y-1.5">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: accent }} />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-600">
          BLINKED · v4.2.1-stable · Powered by modern technology
        </p>
      </div>
    </div>
  );
}
