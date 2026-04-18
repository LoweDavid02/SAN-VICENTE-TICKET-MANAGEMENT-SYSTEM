/**
 * Role-Based Access Control (RBAC) utilities.
 *
 * Usage:
 *   import { can, requireRole } from '../lib/rbac';
 *
 *   // Check permission
 *   if (can(user.role, 'ANALYTICS_DASHBOARD')) { ... }
 *
 *   // Guard a component
 *   const Guard = requireRole(['admin'])(AnalyticsDashboard);
 */

import { PERMISSIONS, ROLES } from '../constants/roles';

/**
 * Check if a role has permission for a feature.
 * @param {string} role - One of ROLES values
 * @param {string} feature - Key from PERMISSIONS
 * @returns {boolean}
 */
export function can(role, feature) {
  const allowed = PERMISSIONS[feature];
  if (!allowed) {
    console.warn(`[RBAC] Unknown feature: "${feature}"`);
    return false;
  }
  return allowed.includes(role);
}

/**
 * Check if a role is allowed to access a route path.
 * @param {string} role
 * @param {string} path - e.g. '/admin/analytics'
 * @returns {boolean}
 */
export function canAccessRoute(role, path) {
  if (path.startsWith('/admin')     && role !== ROLES.ADMIN)     return false;
  if (path.startsWith('/resident')  && role !== ROLES.RESIDENT)  return false;
  if (path.startsWith('/personnel') && role !== ROLES.PERSONNEL) return false;
  return true;
}

/**
 * Higher-order component: wraps a component with role guard.
 * Renders null (or a fallback) if the current user lacks permission.
 *
 * @param {string[]} allowedRoles
 * @param {React.ReactNode} [fallback=null]
 * @returns {(Component: React.ComponentType) => React.ComponentType}
 */
export function requireRole(allowedRoles, fallback = null) {
  return function withRoleGuard(Component) {
    return function RoleGuard({ currentRole, ...props }) {
      if (!allowedRoles.includes(currentRole)) return fallback;
      // eslint-disable-next-line react/jsx-filename-extension
      const React = require('react');
      return React.createElement(Component, props);
    };
  };
}

/**
 * React hook-friendly permission check.
 * Returns an object of boolean flags for common checks.
 *
 * @param {string} role
 * @returns {{ isAdmin, isResident, isPersonnel, can }}
 */
export function usePermissions(role) {
  return {
    isAdmin:     role === ROLES.ADMIN,
    isResident:  role === ROLES.RESIDENT,
    isPersonnel: role === ROLES.PERSONNEL,
    can: (feature) => can(role, feature),
  };
}
