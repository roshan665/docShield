// src/types/auth.d.ts
// DocShield Type Definitions for Authentication & Role-Based Access Control (RBAC)

export type AppRole = 'admin' | 'inspector' | 'legal_officer' | 'forensic_officer';

export type UserStatus = 'Active' | 'Inactive' | 'Pending Approval';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  badge_id: string;
  role: AppRole;
  department: string;
  designation: string;
  station_or_lab: string;
  phone?: string | null;
  avatar_url?: string | null;
  status: UserStatus;
  permissions?: string[];
  last_active_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  currentRole: AppRole;
  setCurrentRole: (role: string) => void;
  userRole: AppRole | null;
  activePersona: {
    id: AppRole;
    name: string;
    title: string;
    badge: string;
    organization: string;
    avatar: string;
  };
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ user: any; session: any }>;
  signOut: () => Promise<void>;
  hasRoutePermission: (page: string, role?: string) => boolean;
  hasActionPermission: (action: string, role?: string) => boolean;
  isConfigured: boolean;
}

export interface RolePermissions {
  allowedPages: string[];
  canCreateCase: boolean;
  canUploadDocuments: boolean;
  canLogEvidence: boolean;
  canDraftForensicReports: boolean;
  canManageChargeSheets: boolean;
  canManageCourtFilings: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewAuditLogs: boolean;
}
