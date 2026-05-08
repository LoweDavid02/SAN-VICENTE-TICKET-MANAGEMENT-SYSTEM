/**
 * Variant System Utilities - Barangay San Vicente Design System
 * Re-exports class-variance-authority for component variant management
 * 
 * Usage:
 * const buttonVariants = cva('base-classes', {
 *   variants: {
 *     variant: {
 *       primary: 'primary-classes',
 *       secondary: 'secondary-classes',
 *     },
 *     size: {
 *       sm: 'small-classes',
 *       md: 'medium-classes',
 *     },
 *   },
 *   defaultVariants: {
 *     variant: 'primary',
 *     size: 'md',
 *   },
 * });
 */

export { cva, type VariantProps } from 'class-variance-authority';
