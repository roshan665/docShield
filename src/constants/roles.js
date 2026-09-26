// src/constants/roles.js
// DocShield Centralized Role Architecture & Definitions

export const ROLES = {
  ADMIN: 'admin',
  INSPECTOR: 'inspector',
  LEGAL: 'legal_officer',
  LEGAL_OFFICER: 'legal_officer',
  FORENSIC: 'forensic_officer',
  FORENSIC_OFFICER: 'forensic_officer'
};

// Normalized aliases to support existing UI route identifiers seamlessly
export const ROLE_ALIASES = {
  admin: ROLES.ADMIN,
  inspector: ROLES.INSPECTOR,
  legal: ROLES.LEGAL,
  legal_officer: ROLES.LEGAL,
  forensic: ROLES.FORENSIC,
  forensic_officer: ROLES.FORENSIC
};

export const ROLE_DETAILS = {
  [ROLES.ADMIN]: {
    id: ROLES.ADMIN,
    name: 'Administrator',
    title: 'System Administrator',
    badge: 'Root Admin ID: ADM-SYS-01',
    organization: 'Madhya Pradesh Police Headquarters, IT Security Division',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
  },
  [ROLES.INSPECTOR]: {
    id: ROLES.INSPECTOR,
    name: 'Insp. Rajesh Kumar',
    title: 'Police Inspector / Station House Officer',
    badge: 'Badge ID: INSP-BH-104',
    organization: 'Bhopal Central Police Station',
    avatar: '/assets/inspector_avatar.jpg'
  },
  [ROLES.LEGAL]: {
    id: ROLES.LEGAL,
    name: 'Adv. Arvind Joshi',
    title: 'Legal Officer / District Public Prosecutor (DPO)',
    badge: 'DPO ID: DPO-BPL-204',
    organization: 'Directorate of Public Prosecutions, M.P.',
    avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=120'
  },
  [ROLES.FORENSIC]: {
    id: ROLES.FORENSIC,
    name: 'Dr. K.S. Rathore',
    title: 'Evidence / Forensic Officer (Senior Scientific Officer)',
    badge: 'SSO ID: RFSL-BPL-048',
    organization: 'Regional Forensic Science Laboratory (RFSL), Bhopal',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=120'
  }
};

/**
 * Normalizes any role input string to a canonical ROLES constant.
 */
export function normalizeRole(role) {
  if (!role) return ROLES.INSPECTOR;
  return ROLE_ALIASES[role.toLowerCase()] || ROLES.INSPECTOR;
}

/**
 * Checks if a user has sufficient administrative privileges.
 */
export function isAdmin(role) {
  return normalizeRole(role) === ROLES.ADMIN;
}

/**
 * Checks if a user has inspector permissions.
 */
export function isInspector(role) {
  return normalizeRole(role) === ROLES.INSPECTOR;
}

/**
 * Checks if a user has legal officer permissions.
 */
export function isLegalOfficer(role) {
  return normalizeRole(role) === ROLES.LEGAL;
}

/**
 * Checks if a user has forensic officer permissions.
 */
export function isForensicOfficer(role) {
  return normalizeRole(role) === ROLES.FORENSIC;
}
