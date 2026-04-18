/**
 * Centralized ticket status constants.
 * Single source of truth — import from here everywhere.
 */

export const TICKET_STATUS = {
  PENDING:      'Pending',
  UNDER_REVIEW: 'Under Review',
  IN_PROGRESS:  'In Progress',
  COMPLETED:    'Completed',
  REJECTED:     'Rejected',
};

/** Ordered flow — personnel can only move forward */
export const STATUS_FLOW = [
  TICKET_STATUS.PENDING,
  TICKET_STATUS.UNDER_REVIEW,
  TICKET_STATUS.IN_PROGRESS,
  TICKET_STATUS.COMPLETED,
];

/** Visual config for each status */
export const STATUS_CFG = {
  [TICKET_STATUS.PENDING]: {
    color: '#ef4444', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444',
    badge: 'badge-red', label: 'Pending',
  },
  [TICKET_STATUS.UNDER_REVIEW]: {
    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', dot: '#3b82f6',
    badge: 'badge-blue', label: 'Under Review',
  },
  [TICKET_STATUS.IN_PROGRESS]: {
    color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b',
    badge: 'badge-amber', label: 'In Progress',
  },
  [TICKET_STATUS.COMPLETED]: {
    color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', dot: '#10b981',
    badge: 'badge-green', label: 'Completed',
  },
  [TICKET_STATUS.REJECTED]: {
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', dot: '#8b5cf6',
    badge: 'badge-slate', label: 'Rejected',
  },
};

export const SEVERITY = {
  HIGH:   'High',
  MEDIUM: 'Medium',
  LOW:    'Low',
};

export const SEVERITY_CFG = {
  [SEVERITY.HIGH]:   { color: '#ef4444', bg: 'rgba(239,68,68,.08)',  label: 'Urgent'     },
  [SEVERITY.MEDIUM]: { color: '#d97706', bg: 'rgba(217,119,6,.08)',  label: 'Moderate'   },
  [SEVERITY.LOW]:    { color: '#059669', bg: 'rgba(5,150,105,.08)',  label: 'Non-urgent' },
};

export const TICKET_CATEGORIES = [
  { id: 'streetlight', label: 'Streetlight Outage', icon: '💡', dept: 'Infrastructure' },
  { id: 'drainage',    label: 'Drainage / Flood',   icon: '💧', dept: 'Public Works'   },
  { id: 'road',        label: 'Road Damage',         icon: '🛣️', dept: 'Infrastructure' },
  { id: 'waste',       label: 'Waste Management',    icon: '🗑️', dept: 'Sanitation'     },
  { id: 'water',       label: 'Water Supply',        icon: '💦', dept: 'Utilities'      },
  { id: 'other',       label: 'Other Issues',        icon: '📋', dept: 'General'        },
];
