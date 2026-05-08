/**
 * className Utility - Barangay San Vicente Design System
 * Combines clsx and tailwind-merge for optimal className handling
 * 
 * Usage:
 * cn('base-class', condition && 'conditional-class', { 'class': condition })
 */

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes intelligently
 * - Handles conditional classes
 * - Resolves conflicting Tailwind utilities
 * - Maintains proper specificity
 * 
 * @param {...any} inputs - Class names, objects, or arrays
 * @returns {string} Merged className string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
