"use client";

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
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const baseNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cases", href: "/cases", icon: FolderLock },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Evidence Vault", href: "/evidence", icon: Boxes },
  { name: "Search & Intelligence", href: "/search", icon: Search },
  { name: "System Settings", href: "/settings", icon: Settings },
];

const ROLE_LABELS: Record<string, string> = {
  investigator: "Investigator",
  forensic_expert: "Forensic Expert",
  legal_officer: "Legal Officer",
  supervisor: "Supervisor",
  system_admin: "System Administrator",
};

export function getRoleLabel(role?: string | null, displayName?: string | null): string {
  if (displayName) return displayName;
  if (!role) return "—";
  return ROLE_LABELS[role] || role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navigation = [...baseNavigation];
  if (user?.role === "system_admin") {
    navigation.splice(navigation.length - 1, 0, {
      name: "Security Monitoring",
      href: "/security",
      icon: ShieldAlert,
    });
  }

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-slate-800 bg-[#0B1930] text-white shadow-xl">
      {/* Brand Header - Shield Above DOCS SHIELD */}
      <div className="flex flex-col border-b border-slate-800/80 px-5 py-5 bg-[#081426] text-center">
        <div className="mx-auto mb-2 flex items-center justify-center">
          <div className="relative h-14 w-14 drop-shadow-[0_4px_16px_rgba(37,99,235,0.5)] hover:scale-105 transition-transform duration-200">
            <Image
              src="/images/docshield-shield.png"
              alt="DocShield Emblem"
              fill
              sizes="56px"
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-1.5">
          <h1 className="text-base font-black tracking-tight uppercase font-sans">
            <span className="text-white">DOCS</span>
            <span className="text-blue-500">SHIELD</span>
          </h1>
          <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 bg-blue-950/80 border border-blue-800/60 text-[8px] font-mono font-medium text-blue-300">
            <Lock className="h-2 w-2" /> OFFICIAL
          </span>
        </div>
        <p className="text-[10px] text-blue-400 font-medium leading-tight mt-0.5">
          Secure Evidence. Trusted Records.
        </p>
        <p className="text-[9px] text-slate-400 font-mono tracking-wider mt-0.5">
          Faster Justice.
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2 text-[9px] font-mono tracking-wider text-slate-400">
          <span>NCRB &bull; MHA INDIA</span>
          <span className="text-slate-500">SEC-65B BSA</span>
        </div>
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
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30 pl-4"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Security Badge */}
      <div className="border-t border-slate-800/80 p-4 bg-[#081426]">
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-xs shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-emerald-400 text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Zero-Trust Protected
            </div>
            <span
              className={cn(
                "text-[9px] font-mono px-1.5 py-0.5 rounded border",
                isAuthenticated
                  ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-300"
                  : "bg-amber-950/60 border-amber-800/60 text-amber-300"
              )}
            >
              {isAuthenticated ? "Authenticated" : "Session Req"}
            </span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/70 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Role:</span>
            <span className="font-semibold text-slate-200">
              {getRoleLabel(user?.role, user?.role_display_name)}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Argon2id &bull; JTI</span>
            <span>v2.1.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

