/**
 * Centralized route path constants.
 * Prevents magic strings scattered across the codebase.
 */

export const ROUTES = {
  ROOT:   '/',
  LOGIN:  '/login',
  PORTAL: '/portal',

  // Admin
  ADMIN: {
    ROOT:       '/admin',
    DASHBOARD:  '/admin/dashboard',
    ANALYTICS:  '/admin/analytics',
    PERSONNEL:  '/admin/personnel',
    TASKS:      '/admin/tasks',
    TICKETS:    '/admin/tickets',
    SETTINGS:   '/admin/settings',
    PROFILE:    '/admin/profile',
  },

  // Resident
  RESIDENT: {
    ROOT:       '/resident',
    DASHBOARD:  '/resident/dashboard',
    REQUEST:    '/resident/request',
    PROFILE:    '/resident/profile',
  },

  // Personnel
  PERSONNEL: {
    ROOT:       '/personnel',
    DASHBOARD:  '/personnel/dashboard',
    TASKS:      '/personnel/tasks',
    HISTORY:    '/personnel/history',
    PROFILE:    '/personnel/profile',
  },
};
