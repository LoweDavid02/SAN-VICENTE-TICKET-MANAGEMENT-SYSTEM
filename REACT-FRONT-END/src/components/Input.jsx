import { clsx } from 'clsx';
import { useId } from 'react';

export function Input({ icon: Icon, className, id, name, 'aria-label': ariaLabel, ...props }) {
  // Generate a unique ID if not provided
  const generatedId = useId();
  const inputId = id || generatedId;
  
  // Use name if provided, otherwise derive from id
  const inputName = name || inputId;
  
  // Ensure aria-label is set for accessibility
  const inputAriaLabel = ariaLabel || props.placeholder || 'Input field';

  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
      )}
      <input
        id={inputId}
        name={inputName}
        aria-label={inputAriaLabel}
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
