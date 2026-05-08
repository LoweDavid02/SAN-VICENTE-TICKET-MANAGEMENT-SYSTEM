/**
 * Shadow System - Barangay San Vicente Design System
 * Centralized shadow definitions for depth and elevation
 */

export const shadows = {
  // Base shadows
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  
  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // Semantic shadows
  card: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  button: '0 2px 4px rgba(0, 88, 190, 0.2)',
  'button-hover': '0 4px 8px rgba(0, 88, 190, 0.3)',
  
  // Focus shadows
  'focus-primary': '0 0 0 3px rgba(59, 130, 246, 0.5)',
  'focus-error': '0 0 0 3px rgba(239, 68, 68, 0.5)',
  'focus-success': '0 0 0 3px rgba(34, 197, 94, 0.5)',
};
