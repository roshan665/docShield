"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Lock, UserCheck, LogOut, LogIn, Menu, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getRoleLabel } from "./sidebar";

interface HeaderProps {
  onOpenMobileDrawer?: () => void;
}

export function Header({ onOpenMobileDrawer }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();

  // Get user initials
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "OF";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur shadow-sm">
      {/* Mobile Left: Hamburger Trigger */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          onClick={onOpenMobileDrawer}
          className="p-2 -ml-1.5 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Center Branding (visible only on mobile/tablet) */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <div className="relative h-8 w-8 rounded-lg p-0.5 bg-gradient-to-b from-blue-500/20 to-blue-900/30 ring-1 ring-blue-400/30 shadow-sm">
          <Image
            src="/images/docshield-logo.png"
            alt="DocShield Emblem"
            fill
            sizes="32px"
            className="object-contain rounded-md"
          />
        </div>
        <span className="text-sm font-bold tracking-tight text-slate-950 uppercase font-sans">
          DOCS<span className="text-blue-600 font-extrabold">SHIELD</span>
        </span>
      </div>

      {/* Desktop Left: Government Identity */}
      <div className="hidden lg:flex items-center gap-3">
        <Badge
          variant="outline"
          className="gap-1.5 border-blue-300 bg-blue-50/90 text-blue-900 font-mono text-[11px] font-semibold uppercase tracking-wider shadow-none"
        >
          <Lock className="h-3 w-3 text-blue-700" /> OFFICIAL USE ONLY
        </Badge>
        <div className="h-4 w-px bg-slate-200" />
        <span className="text-xs text-slate-600 font-medium tracking-tight">
          NCRB &bull; MHA INDIA &bull; National Digital Evidence Platform
        </span>
      </div>

      {/* Right Controls (Mobile & Desktop) */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Security Session Indicator (Desktop only) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors bg-slate-50 border-slate-200">
          {isAuthenticated ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 font-semibold">Secure Session</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-amber-700 font-semibold">Session Required</span>
            </>
          )}
        </div>

        {/* Notifications Icon */}
        <button
          aria-label="Notifications"
          className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="System Notifications"
        >
          <Bell className="h-5 w-5 sm:h-4 sm:w-4" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        {/* User Identity / Login CTA */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2 sm:gap-3 sm:border-l sm:border-slate-200 sm:pl-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-900">
                {user.full_name}
              </p>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                  {user.employee_id}
                </span>
                <span className="text-[10px] text-slate-300">&bull;</span>
                <span className="text-[10px] font-medium text-blue-600">
                  {getRoleLabel(user.role, user.role_display_name)}
                </span>
              </div>
            </div>

            {/* Mobile User Avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shadow-sm font-semibold text-xs font-mono">
              {initials}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="hidden sm:flex h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              title="Sign Out / Revoke Session"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
            <Link href="/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white h-8 text-xs gap-1.5 font-medium shadow-sm rounded-lg px-3">
                <LogIn className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

