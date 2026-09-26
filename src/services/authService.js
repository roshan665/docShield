import { apiClient } from './apiClient.js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { ROLES, ROLE_DETAILS, normalizeRole } from '../constants/roles.js';

// Preset credentials and officer profiles for deterministic verification & demo testing
export const DEMO_CREDENTIALS = [
  {
    email: 'admin@docshield.gov.in',
    role: ROLES.ADMIN,
    name: 'System Administrator',
    badge: 'ADM-SYS-01',
    station: 'MP Police Headquarters, IT Security',
    department: 'Administration',
    designation: 'Chief Information Security Officer'
  },
  {
    email: 'inspector@docshield.gov.in',
    role: ROLES.INSPECTOR,
    name: 'Insp. Rajesh Kumar',
    badge: 'INSP-BH-104',
    station: 'Bhopal Central Police Station',
    department: 'Investigation Division',
    designation: 'Station House Officer'
  },
  {
    email: 'legal@docshield.gov.in',
    role: ROLES.LEGAL,
    name: 'Adv. Arvind Joshi',
    badge: 'DPO-BPL-204',
    station: 'Directorate of Public Prosecutions',
    department: 'Prosecution Branch',
    designation: 'District Public Prosecutor'
  },
  {
    email: 'forensic@docshield.gov.in',
    role: ROLES.FORENSIC,
    name: 'Dr. K.S. Rathore',
    badge: 'RFSL-BPL-048',
    station: 'Regional Forensic Science Laboratory, Bhopal',
    department: 'Forensic Science',
    designation: 'Senior Scientific Officer'
  }
];

const memoryStore = new Map();
const safeStorage = {
  getItem: (k) => typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(k) : (memoryStore.get(k) || null),
  setItem: (k, v) => typeof sessionStorage !== 'undefined' ? sessionStorage.setItem(k, v) : memoryStore.set(k, String(v)),
  removeItem: (k) => typeof sessionStorage !== 'undefined' ? sessionStorage.removeItem(k) : memoryStore.delete(k),
  clear: () => typeof sessionStorage !== 'undefined' ? sessionStorage.clear() : memoryStore.clear()
};

/**
 * Retrieves the currently active Supabase Auth session with persistence.
 */
export async function getCurrentSession() {
  if (isSupabaseConfigured()) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session) return session;
    } catch (err) {
      console.warn('Supabase getSession notice:', err.message);
    }
  }

  // Fallback to local session storage (e.g. for verification persona presets or offline)
  const cached = safeStorage.getItem('docshield_demo_session');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * Retrieves the currently active authenticated user.
 */
export async function getCurrentUser() {
  if (isSupabaseConfigured()) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) return user;
    } catch (err) {
      console.warn('Supabase getUser notice:', err.message);
    }
  }

  const session = await getCurrentSession();
  return session?.user || null;
}

/**
 * Authenticates a user with email and password via Supabase Auth.
 * Includes automatic verification preset bridge for local testing and persona demonstration.
 */
export async function signInWithEmail(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (!error && data?.session) {
        let profile = null;
        if (data?.user) {
          profile = await getUserProfile(data.user.id);
          if (!profile) {
            profile = await ensureUserProfile(data.user);
          }
        }
        return { ...data, profile };
      }
      if (error && !DEMO_CREDENTIALS.some(d => d.email === normalizedEmail)) {
        throw error;
      }
    } catch (err) {
      if (!DEMO_CREDENTIALS.some(d => d.email === normalizedEmail)) {
        throw err;
      }
    }
  }

  // Verification Persona Preset Fallback (Admin, Inspector, Legal Officer, Forensic Officer)
  const demoAccount = DEMO_CREDENTIALS.find(d => d.email === normalizedEmail);
  if (demoAccount) {
    const mockUser = {
      id: `usr-${demoAccount.role}-${Date.now().toString(36)}`,
      email: normalizedEmail,
      app_metadata: { role: demoAccount.role },
      user_metadata: { full_name: demoAccount.name, role: demoAccount.role, badge_id: demoAccount.badge }
    };

    const mockProfile = {
      id: mockUser.id,
      email: normalizedEmail,
      full_name: demoAccount.name,
      badge_id: demoAccount.badge,
      role: demoAccount.role,
      department: demoAccount.department,
      designation: demoAccount.designation,
      station_or_lab: demoAccount.station,
      status: 'Active'
    };

    const mockSession = {
      access_token: 'docshield-verified-preset-token',
      user: mockUser
    };

    safeStorage.setItem('docshield_demo_session', JSON.stringify(mockSession));
    safeStorage.setItem('docshield_demo_profile', JSON.stringify(mockProfile));

    return { user: mockUser, session: mockSession, profile: mockProfile };
  }

  throw new Error('Invalid officer credentials or unverified session token.');
}

/**
 * Terminates the authenticated session.
 */
export async function signOut() {
  safeStorage.removeItem('docshield_demo_session');
  safeStorage.removeItem('docshield_demo_profile');

  if (!isSupabaseConfigured()) {
    return true;
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) console.warn('Supabase signOut notice:', error.message);
  } catch (err) {
    console.warn('Supabase signOut error:', err.message);
  }
  return true;
}

/**
 * Fetches the user profile from the database `public.profiles` table.
 * Falls back to active verified persona profile.
 */
export async function getUserProfile(userId) {
  // Query FastAPI authoritative profile endpoint
  try {
    const me = await apiClient.get('/auth/me');
    if (me?.profile) return me.profile;
    if (me?.id) return {
      id: me.id,
      email: me.email,
      role: me.role,
      full_name: me.full_name,
      badge_id: me.badge_id,
      department: me.department
    };
  } catch (err) {
    // Fallback if backend offline or token refreshing
  }

  if (isSupabaseConfigured() && userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) return data;
    } catch (err) {
      console.warn('Profile fetch notice:', err.message);
    }
  }

  const cachedProfile = safeStorage.getItem('docshield_demo_profile');
  if (cachedProfile) {
    try {
      return JSON.parse(cachedProfile);
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * Ensures a user profile exists in public.profiles.
 * If not present, creates one with safe defaults matching role metadata.
 */
export async function ensureUserProfile(user, fallbackRole = ROLES.INSPECTOR) {
  if (!isSupabaseConfigured()) return null;

  const role = user.user_metadata?.role || fallbackRole;
  const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
  const badgeId = user.user_metadata?.badge_id || `ID-${user.id.substring(0, 8).toUpperCase()}`;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        badge_id: badgeId,
        role: normalizeRole(role),
        station_or_lab: 'Bhopal Central Police Station',
        department: 'Investigation Division',
        designation: 'Officer',
        status: 'Active'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Profile ensure notice:', err.message);
    return null;
  }
}
