export default function Header({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 flex-shrink-0"
          style={{ background: 'var(--brand)', boxShadow: 'var(--shadow-sm)' }}
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}
