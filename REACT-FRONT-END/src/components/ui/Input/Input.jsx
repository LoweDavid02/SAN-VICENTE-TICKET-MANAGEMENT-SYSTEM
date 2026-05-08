/**
 * Input Component - Barangay San Vicente Design System
 * Reusable input component with variants, sizes, and states
 */

import { forwardRef } from 'react';
import { cva } from '@/utils/variants';
import { cn } from '@/utils/cn';

const inputVariants = cva(
  // Base styles
  'w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
        error: 'border-error-500 focus:border-error-500 focus:ring-error-500 bg-error-50',
        success: 'border-success-500 focus:border-success-500 focus:ring-success-500 bg-success-50',
      },
      size: {
        sm: 'h-8 text-xs px-2',
        md: 'h-10 text-sm px-3',
        lg: 'h-12 text-base px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

/**
 * Input Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Input variant (default, error, success)
 * @param {string} props.size - Input size (sm, md, lg)
 * @param {boolean} props.error - Whether input has an error
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.className - Additional CSS classes
 */
export const Input = forwardRef(
  ({ className, variant, size, error, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          inputVariants({
            variant: error ? 'error' : variant,
            size,
            className,
          })
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
