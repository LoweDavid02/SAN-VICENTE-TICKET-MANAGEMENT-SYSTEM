/**
 * Role constants and permission definitions.
 * Used by RBAC to gate access to features and routes.
 */

export const ROLES = {
  ADMIN:     'admin',
  RESIDENT:  'resident',
  PERSONNEL: 'personnel',
};

/**
 * Feature permission map.
 * Each key is a feature identifier; value is the array of roles that can access it.
 */
export const PERMISSIONS = {
  // Admin-only features
  ANALYTICS_DASHBOARD:   [ROLES.ADMIN],
  MANAGE_PERSONNEL:      [ROLES.ADMIN],
  VIEW_ALL_TICKETS:      [ROLES.ADMIN],
  EXPORT_REPORTS:        [ROLES.ADMIN],
  SYSTEM_SETTINGS:       [ROLES.ADMIN],

  // Personnel features
  FIELDWORK_TASK:        [ROLES.PERSONNEL],
  UPDATE_TICKET_STATUS:  [ROLES.PERSONNEL, ROLES.ADMIN],
  VIEW_ASSIGNED_TASKS:   [ROLES.PERSONNEL],
  TASK_HISTORY:          [ROLES.PERSONNEL],

  // Resident features
  SUBMIT_REQUEST:        [ROLES.RESIDENT],
  VIEW_OWN_TICKETS:      [ROLES.RESIDENT],
  TRACK_REQUEST:         [ROLES.RESIDENT],

  // Shared
  VIEW_PROFILE:          [ROLES.ADMIN, ROLES.RESIDENT, ROLES.PERSONNEL],
  VIEW_NOTIFICATIONS:    [ROLES.ADMIN, ROLES.RESIDENT, ROLES.PERSONNEL],
};

/** Portal home routes per role */
export const ROLE_HOME = {
  [ROLES.ADMIN]:     '/admin/dashboard',
  [ROLES.RESIDENT]:  '/resident/dashboard',
  [ROLES.PERSONNEL]: '/personnel/dashboard',
};

/** Demo credentials — mirrors Login.jsx */
export const DEMO_USERS = [
  {
    email: 'admin@barangay.gov',
    password: 'admin123',
    role: ROLES.ADMIN,
    name: 'San Vicente Admin',
    dept: 'Administration',
    avatar: 'SA',
  },
  {
    email: 'resident@sv.gov',
    password: 'resident',
    role: ROLES.RESIDENT,
    name: 'Maria Santos',
    dept: null,
    avatar: 'MS',
  },
  {
    email: 'personnel@barangay.gov',
    password: 'field123',
    role: ROLES.PERSONNEL,
    name: 'Engr. Elias Santos',
    dept: 'Infrastructure',
    avatar: 'ES',
  },
];
