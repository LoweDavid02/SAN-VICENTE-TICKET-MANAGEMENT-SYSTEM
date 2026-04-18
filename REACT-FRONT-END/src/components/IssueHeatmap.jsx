const SECTORS = [
  { name: 'Cubao',              incidents: 61, x: 72, y: 62 },
  { name: 'Quezon City Central',incidents: 52, x: 45, y: 55 },
  { name: 'Commonwealth',       incidents: 44, x: 60, y: 22 },
  { name: 'San Jose District',  incidents: 33, x: 30, y: 68 },
  { name: 'Novaliches Proper',  incidents: 38, x: 25, y: 18 },
  { name: 'Diliman',            incidents: 29, x: 42, y: 75 },
  { name: 'Batasan Hills',      incidents: 21, x: 75, y: 35 },
  { name: 'Fairview',           incidents: 17, x: 18, y: 42 },
];

function heatColor(n) {
  if (n >= 50) return { bg: '#dc2626', ring: 'rgba(220,38,38,.3)',  label: 'Critical', text: '#fff' };
  if (n >= 35) return { bg: '#f59e0b', ring: 'rgba(245,158,11,.3)', label: 'High',     text: '#fff' };
  if (n >= 20) return { bg: '#3b82f6', ring: 'rgba(59,130,246,.3)', label: 'Medium',   text: '#fff' };
  return              { bg: '#10b981', ring: 'rgba(16,185,129,.3)', label: 'Low',      text: '#fff' };
}

function bubbleSize(n) {
  if (n >= 50) return 52;
  if (n >= 35) return 44;
  if (n >= 20) return 38;
  return 32;
}

export default function IssueHeatmap() {
  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4"
           style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Incident Density Map</h2>
          <p className="text-xs text-slate-500 mt-0.5">Metro Quezon City region</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
          {[['#10b981','Low'],['#3b82f6','Med'],['#f59e0b','High'],['#dc2626','Crit']].map(([c,l]) => (
            <span key={l} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: c }} />{l}
            </span>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative mx-4 my-4 rounded-xl overflow-hidden"
           style={{ height: '260px', background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe,#f0fdf4)' }}>
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: .15 }}>
          {[20,40,60,80].map((p) => (
            <g key={p}>
              <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#64748b" strokeWidth=".5" />
              <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#64748b" strokeWidth=".5" />
            </g>
          ))}
        </svg>

        {/* Bubbles */}
        {SECTORS.map((s) => {
          const c    = heatColor(s.incidents);
          const size = bubbleSize(s.incidents);
          const isCrit = s.incidents >= 50;
          return (
            <div
              key={s.name}
              className="absolute group cursor-pointer"
              style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%,-50%)' }}
            >
              {isCrit && (
                <span className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: c.ring, animationDuration: '1.5s' }} />
              )}
              <div
                className="relative rounded-full flex items-center justify-center font-bold text-xs transition-transform duration-200 group-hover:scale-110"
                style={{ width: size, height: size, background: c.bg, color: c.text, boxShadow: `0 0 0 3px ${c.ring}` }}
              >
                {s.incidents}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 pointer-events-none">
                <div className="rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-lg"
                     style={{ background: 'var(--navy)', color: '#fff' }}>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-slate-400">{s.incidents} incidents · {c.label}</p>
                </div>
                <div className="w-2 h-2 mx-auto -mt-1 rotate-45" style={{ background: 'var(--navy)' }} />
              </div>
            </div>
          );
        })}

        <p className="absolute bottom-2 left-3 text-[10px] font-medium text-slate-400">
          Quezon City, Metro Manila
        </p>
      </div>

      {/* Top sectors */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        {[...SECTORS].sort((a,b) => b.incidents - a.incidents).slice(0,4).map((s) => {
          const c = heatColor(s.incidents);
          return (
            <div key={s.name} className="flex items-center justify-between px-3 py-2 rounded-lg"
                 style={{ background: 'var(--surface-3)' }}>
              <span className="text-xs font-medium text-slate-700 truncate">{s.name}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                    style={{ background: c.bg, color: c.text }}>
                {s.incidents}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
