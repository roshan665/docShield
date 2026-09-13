"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole, LoginRequest } from "@/types";
import {
  getCurrentUser,
  getStoredToken,
  login as apiLogin,
  logout as apiLogout,
  refreshToken as apiRefreshToken,
  removeStoredToken,
} from "./api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUserProfile = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      // If token expired, try silent refresh
      try {
        await apiRefreshToken();
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        removeStoredToken();
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (token) {
        await refreshUserProfile();
      }
      setIsLoading(false);
    };
    initAuth();
  }, [refreshUserProfile]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(credentials);
      setUser(res.user);
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
    } catch {
      // Ignore errors on logout
    } finally {
      setUser(null);
      setIsLoading(false);
      router.push("/login");
    }
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // System Admin has blanket access
    if (user.role === "system_admin") return true;
    return user.permissions?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
        hasPermission,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

