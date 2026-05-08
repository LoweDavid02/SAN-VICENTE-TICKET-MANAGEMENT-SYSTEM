/**
 * Alert Component - Barangay San Vicente Design System
 * Reusable alert component for notifications and messages
 */

import { forwardRef } from 'react';
import { cva } from '@/utils/variants';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const alertVariants = cva(
  // Base styles
  'relative w-full rounded-lg border p-4 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-gray-50 border-gray-200 text-gray-900',
        info: 'bg-info-50 border-info-200 text-info-900',
        success: 'bg-success-50 border-success-200 text-success-900',
        warning: 'bg-warning-50 border-warning-200 text-warning-900',
        error: 'bg-error-50 border-error-200 text-error-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap = {
  default: Info,
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

/**
 * Alert Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Alert variant (default, info, success, warning, error)
 * @param {string} props.title - Alert title
 * @param {boolean} props.dismissible - Whether alert can be dismissed
 * @param {function} props.onDismiss - Callback when alert is dismissed
 * @param {React.ReactNode} props.children - Alert content
 * @param {string} props.className - Additional CSS classes
 */
export const Alert = forwardRef(
  ({ className, variant = 'default', title, dismissible, onDismiss, children, ...props }, ref) => {
    const Icon = iconMap[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant, className }))}
        {...props}
      >
        <div className="flex gap-3">
          {Icon && (
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            {title && (
              <h5 className="mb-1 font-semibold leading-none tracking-tight">
                {title}
              </h5>
            )}
            <div className="text-sm [&_p]:leading-relaxed">
              {children}
            </div>
          </div>
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 transition-colors"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
