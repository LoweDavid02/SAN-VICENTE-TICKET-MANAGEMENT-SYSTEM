export default function StatCard({ title, value, subtext, subtextColor = 'text-slate-500', icon, accent = '#14b8a6' }) {
  return (
    <div className="card p-5 relative overflow-hidden" style={{ borderTop: `3px solid ${accent}` }}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-900 leading-none mb-2">{value}</p>
          {subtext && <p className={`text-xs font-medium ${subtextColor}`}>{subtext}</p>}
        </div>
        {icon && (
          <div className="ml-3 p-2.5 rounded-lg flex-shrink-0"
               style={{ background: `${accent}15` }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
