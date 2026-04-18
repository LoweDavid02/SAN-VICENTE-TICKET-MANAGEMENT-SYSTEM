import { clsx } from 'clsx';

export function Input({ icon: Icon, className, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      )}
      <input
        className={clsx(
          'w-full rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400',
          'px-3.5 py-2.5 outline-none transition-all duration-150',
          'focus:border-teal-500 focus:bg-white focus:ring-3 focus:ring-teal-500/10',
          'hover:border-slate-300',
          Icon && 'pl-10',
          className
        )}
        {...props}
      />
    </div>
  );
}
