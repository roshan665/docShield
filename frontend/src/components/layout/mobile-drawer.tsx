"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  FolderLock,
  FileText,
  Boxes,
  Search,
  Settings,
  LayoutDashboard,
  ShieldAlert,
  X,
  Lock,
  ChevronRight,
  LogOut,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { getRoleLabel } from "./sidebar";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const baseNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cases", href: "/cases", icon: FolderLock },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Evidence Vault", href: "/evidence", icon: Boxes },
  { name: "Search & Intelligence", href: "/search", icon: Search },
  { name: "System Settings", href: "/settings", icon: Settings },
];

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navigation = [...baseNavigation];
  if (user?.role === "system_admin") {
    navigation.splice(navigation.length - 1, 0, {
      name: "Security Monitoring",
      href: "/security",
      icon: ShieldAlert,
    });
  }

  // Get user initials
  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "OF";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Dark Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Drawer */}
      <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-[#0B1930] text-white shadow-2xl transition-transform animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4 bg-[#081426]">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 rounded-xl bg-gradient-to-b from-blue-500/20 to-blue-900/30 p-0.5 ring-1 ring-blue-400/30 shadow-md">
              <Image
                src="/images/docshield-logo.png"
                alt="DocShield Emblem"
                fill
                sizes="40px"
                className="object-contain rounded-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold tracking-tight text-white uppercase font-sans">
                  DOCS SHIELD
                </h2>
              </div>
              <p className="text-[10px] text-blue-400 font-medium leading-tight">
                Secure Evidence. Trusted Records.
              </p>
              <p className="text-[9px] text-slate-400 font-mono tracking-wider mt-0.5">
                FAST. AUDITABLE.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1.5 px-3 py-5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3.5">
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-transform group-hover:translate-x-0.5" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Drawer Bottom Status & User Profile */}
        <div className="border-t border-slate-800/80 p-4 bg-[#081426] space-y-3">
          {/* System Secure Pill */}
          <div className="flex items-center justify-between rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Secure</span>
            </div>
            <Shield className="h-4 w-4 text-emerald-400" />
          </div>

          {/* User Card */}
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between rounded-xl bg-slate-800/60 border border-slate-700/60 p-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-950 text-blue-300 border border-blue-800 font-mono font-bold text-xs">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {user.full_name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {getRoleLabel(user.role, user.role_display_name)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <UserCheck className="h-4 w-4" />
              <span>Sign In to Session</span>
            </Link>
          )}

          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1">
            <span>NCIB &bull; NMH INDIA</span>
            <span>SEC-65B BSA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
