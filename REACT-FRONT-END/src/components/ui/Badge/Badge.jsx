/**
 * Badge Component - Barangay San Vicente Design System
 * Reusable badge component for status indicators and labels
 */

import { forwardRef } from 'react';
import { cva } from '@/utils/variants';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  // Base styles
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800 border border-gray-200',
        primary: 'bg-primary-100 text-primary-800 border border-primary-200',
        secondary: 'bg-secondary-100 text-secondary-800 border border-secondary-200',
        success: 'bg-success-100 text-success-800 border border-success-200',
        warning: 'bg-warning-100 text-warning-800 border border-warning-200',
        error: 'bg-error-100 text-error-800 border border-error-200',
        info: 'bg-info-100 text-info-800 border border-info-200',
        outline: 'bg-transparent text-gray-700 border border-gray-300',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-base px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

/**
 * Badge Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Badge variant (default, primary, secondary, success, warning, error, info, outline)
 * @param {string} props.size - Badge size (sm, md, lg)
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.className - Additional CSS classes
 */
export const Badge = forwardRef(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
