import { clsx } from 'clsx';

const BASE = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[.97]';

const VARIANTS = {
  primary:   'bg-teal-500 text-white hover:bg-teal-600 shadow-sm hover:shadow-md',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
  ghost:     'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
  danger:    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
  outline:   'border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300',
};

const SIZES = {
  sm:  'text-xs px-3 py-1.5 h-7',
  md:  'text-sm px-4 py-2 h-9',
  lg:  'text-sm px-5 py-2.5 h-10',
  xl:  'text-base px-6 py-3 h-12',
  icon:'p-2 h-9 w-9',
};

export function Button({ children, variant = 'primary', size = 'md', loading, className, ...props }) {
  return (
    <button className={clsx(BASE, VARIANTS[variant], SIZES[size], className)} disabled={loading || props.disabled} {...props}>
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" />
      )}
      {children}
    </button>
  );
}
