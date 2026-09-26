// src/constants/permissions.js
// DocShield Centralized Role Permission Matrix & Authorization Rules
// Strictly adheres to Task 3 (Role-Based Routing) and Task 4 (Role-Based UI Permissions)

import { ROLES, normalizeRole } from './roles.js';

/**
 * Complete map of allowed pages per role.
 * Exactly matches Task 3 specifications.
 */
export const ROLE_PAGE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'dashboard',
    'adminDashboard',
    'users',
    'cases',
    'documents',
    'evidence',
    'forensic',
    'chargeSheets',
    'courtFilings',
    'custody',
    'auditLogs',
    'settings'
  ],
  [ROLES.INSPECTOR]: [
    'dashboard',
    'cases',
    'documents',
    'evidence',
    'forensic',
    'chargeSheets',
    'courtFilings',
    'custody',
    'auditLogs'
  ],
  [ROLES.LEGAL]: [
    'dashboard',
    'cases',
    'documents',
    'evidence',
    'forensic',
    'chargeSheets',
    'courtFilings',
    'custody',
    'auditLogs'
  ],
  [ROLES.FORENSIC]: [
    'dashboard',
    'cases',
    'evidence',
    'documents',
    'forensic',
    'custody',
    'auditLogs'
  ]
};

/**
 * Functional action permissions per role.
 * Corresponds directly to Supabase RLS database policies.
 */
export const ROLE_ACTION_PERMISSIONS = {
  [ROLES.ADMIN]: {
    canCreateCase: true,
    canUploadDocuments: true,
    canLogEvidence: true,
    canUpdateEvidence: true,
    canDraftForensicReports: true,
    canManageChargeSheets: true,
    canManageCourtFilings: true,
    canManageUsers: true,
    canManageSettings: true,
    canViewAuditLogs: true,
    canExportCustody: true
  },
  [ROLES.INSPECTOR]: {
    canCreateCase: true,
    canUploadDocuments: true,
    canLogEvidence: true,
    canUpdateEvidence: true,
    canDraftForensicReports: false,
    canManageChargeSheets: true,
    canManageCourtFilings: true,
    canManageUsers: false,
    canManageSettings: false,
    canViewAuditLogs: true,
    canExportCustody: true
  },
  [ROLES.LEGAL]: {
    canCreateCase: false,
    canUploadDocuments: false,
    canLogEvidence: false,
    canUpdateEvidence: false,
    canDraftForensicReports: false,
    canManageChargeSheets: true, // Legal scrutiny / review
    canManageCourtFilings: true,  // Judicial submission
    canManageUsers: false,
    canManageSettings: false,
    canViewAuditLogs: true,
    canExportCustody: true
  },
  [ROLES.FORENSIC]: {
    canCreateCase: false,
    canUploadDocuments: true,  // Forensic attachments
    canLogEvidence: false,     // Field seizure is Inspector's duty
    canUpdateEvidence: true,   // Lab analysis & custody receipt
    canDraftForensicReports: true, // RFSL scientific reports
    canManageChargeSheets: false,
    canManageCourtFilings: false,
    canManageUsers: false,
    canManageSettings: false,
    canViewAuditLogs: true,
    canExportCustody: true
  }
};

/**
 * Verifies whether a given role is allowed to view a specific page.
 *
 * @param {string} page - The canonical page identifier
 * @param {string} role - The user's role (string or enum)
 * @returns {boolean}
 */
export function isPageAllowed(page, role) {
  const normalized = normalizeRole(role);
  const allowedPages = ROLE_PAGE_PERMISSIONS[normalized] || [];
  
  // Dashboard aliasing
  if (page === 'adminDashboard' && normalized === ROLES.ADMIN) return true;
  if (page === 'dashboard') return true;

  return allowedPages.includes(page);
}

/**
 * Verifies whether a given role has permission to execute an action.
 *
 * @param {string} action - Action key from ROLE_ACTION_PERMISSIONS
 * @param {string} role - The user's role
 * @returns {boolean}
 */
export function isActionAllowed(action, role) {
  const normalized = normalizeRole(role);
  const permissions = ROLE_ACTION_PERMISSIONS[normalized];
  if (!permissions) return false;
  return Boolean(permissions[action]);
}

/**
 * Returns the default authorized landing page for a role.
 */
export function getDefaultPageForRole(role) {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.ADMIN) return 'adminDashboard';
  return 'dashboard';
}

/**
 * Returns the canonical URL hash for a role's default page.
 */
export function getDefaultRouteForRole(role) {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case ROLES.ADMIN:
      return '#/admin/dashboard';
    case ROLES.LEGAL:
      return '#/legal/dashboard';
    case ROLES.FORENSIC:
      return '#/forensic/dashboard';
    case ROLES.INSPECTOR:
    default:
      return '#/inspector/dashboard';
  }
}
