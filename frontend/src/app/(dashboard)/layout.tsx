"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-slate-900 flex flex-col antialiased relative">
      {/* Ambient Watermark Background for Enterprise Command Center */}
      <div
        className="fixed inset-0 bg-center bg-no-repeat bg-contain opacity-[0.022] pointer-events-none select-none z-0"
        style={{ backgroundImage: "url('/images/docshield-bg.jpg')" }}
      />

      {/* Desktop Sidebar (visible lg+) */}
      <Sidebar />

      {/* Mobile Drawer (visible on toggle) */}
      <MobileDrawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 z-10">
        <Header onOpenMobileDrawer={() => setMobileDrawerOpen(true)} />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Quick Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

