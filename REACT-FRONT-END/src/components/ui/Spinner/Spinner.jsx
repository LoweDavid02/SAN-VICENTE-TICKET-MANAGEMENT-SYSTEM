/**
 * Spinner Component - Barangay San Vicente Design System
 * Reusable loading spinner component
 */

import { forwardRef } from 'react';
import { cva } from '@/utils/variants';
import { cn } from '@/utils/cn';

const spinnerVariants = cva(
  // Base styles
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        default: 'text-gray-600',
        primary: 'text-primary-600',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

/**
 * Spinner Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (xs, sm, md, lg, xl)
 * @param {string} props.variant - Spinner variant (default, primary, white)
 * @param {string} props.className - Additional CSS classes
 */
export const Spinner = forwardRef(
  ({ className, size, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn(spinnerVariants({ size, variant, className }))}
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';
