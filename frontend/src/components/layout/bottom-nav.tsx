"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderLock, FileText, Boxes, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cases", href: "/cases", icon: FolderLock },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Evidence", href: "/evidence", icon: Boxes },
  { name: "Search", href: "/search", icon: Search },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t border-slate-200 bg-white/95 backdrop-blur px-2 py-1 md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-2.5 rounded-lg text-[10px] font-medium transition-colors min-w-[56px]",
                isActive
                  ? "text-blue-600 font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 mb-0.5 transition-transform",
                  isActive && "scale-110 text-blue-600"
                )}
              />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
