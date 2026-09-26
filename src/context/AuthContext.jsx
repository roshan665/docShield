// src/context/AuthContext.jsx
// Centralized Authentication and Role-Based Authorization Layer

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { ROLES, ROLE_DETAILS, normalizeRole } from '../constants/roles';
import { isPageAllowed, isActionAllowed, getDefaultPageForRole, getDefaultRouteForRole } from '../constants/permissions';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentRole, setCurrentRoleState] = useState(ROLES.INSPECTOR);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and restore authenticated session on page load
  useEffect(() => {
    let isMounted = true;
    let authListener = null;

    async function initAuth() {
      try {
        const session = await authService.getCurrentSession();
        if (session?.user && isMounted) {
          setUser(session.user);
          const userProfile = await authService.getUserProfile(session.user.id);
          if (userProfile && isMounted) {
            setProfile(userProfile);
            setCurrentRoleState(normalizeRole(userProfile.role));
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }

      // Attach Supabase auth state change subscription
      if (isSupabaseConfigured()) {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return;

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            if (session?.user) {
              setUser(session.user);
              const userProfile = await authService.getUserProfile(session.user.id);
              if (userProfile) {
                setProfile(userProfile);
                setCurrentRoleState(normalizeRole(userProfile.role));
              }
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            setCurrentRoleState(ROLES.INSPECTOR);
          }
        });
        authListener = data.subscription;
      }
    }

    initAuth();

    return () => {
      isMounted = false;
      authListener?.unsubscribe();
    };
  }, []);

  // Secure sign in handler
  const handleSignIn = async (email, password) => {
    setError(null);
    try {
      const result = await authService.signInWithEmail(email, password);
      if (result?.user) {
        setUser(result.user);
        if (result.profile) {
          setProfile(result.profile);
          setCurrentRoleState(normalizeRole(result.profile.role));
        }
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Secure sign out handler
  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (err) {
      console.warn('Sign out notice:', err.message);
    } finally {
      setUser(null);
      setProfile(null);
      setCurrentRoleState(ROLES.INSPECTOR);
      sessionStorage.clear();
      window.location.hash = '';
    }
  };

  // Type-safe role updater
  const handleSetRole = useCallback((newRole) => {
    const normalized = normalizeRole(newRole);
    setCurrentRoleState(normalized);
  }, []);

  // Route permission checker
  const checkRoutePermission = useCallback((page, roleToCheck) => {
    const effectiveRole = roleToCheck || currentRole;
    return isPageAllowed(page, effectiveRole);
  }, [currentRole]);

  // Action permission checker
  const checkActionPermission = useCallback((action, roleToCheck) => {
    const effectiveRole = roleToCheck || currentRole;
    return isActionAllowed(action, effectiveRole);
  }, [currentRole]);

  // Resolve active persona for UI display
  const activePersona = ROLE_DETAILS[currentRole] || ROLE_DETAILS[ROLES.INSPECTOR];

  const value = {
    user,
    profile,
    currentRole,
    userRole: profile?.role ? normalizeRole(profile.role) : null,
    setCurrentRole: handleSetRole,
    activePersona,
    loading,
    error,
    signIn: handleSignIn,
    signOut: handleSignOut,
    hasRoutePermission: checkRoutePermission,
    hasActionPermission: checkActionPermission,
    getDefaultPage: () => getDefaultPageForRole(currentRole),
    getDefaultRoute: () => getDefaultRouteForRole(currentRole),
    isConfigured: isSupabaseConfigured()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
