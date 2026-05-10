"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Swords, Trophy, Activity,
  LogOut, Menu, X, FileText,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/matches", label: "Matches", icon: Swords },
  { href: "/admin/bracket", label: "Bracket", icon: Trophy },
  { href: "/admin/logs", label: "Audit Logs", icon: FileText },
];

function NavLink({ item, active }: { item: (typeof navItems)[0]; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative overflow-hidden",
        active
          ? "bg-brand-blue/15 text-white border border-brand-blue/30"
          : "text-gray-500 hover:text-white hover:bg-dark-600"
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 bg-brand-blue/10 rounded-xl"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <Icon className={cn("w-4 h-4 relative z-10", active ? "text-brand-blue-light" : "")} />
      <span className="relative z-10">{item.label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-blue-light relative z-10" />
      )}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 h-16 flex items-center border-b border-dark-600">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center shadow-glow-sm">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-black text-white font-display text-sm tracking-wide">
              eFOOTBALL<span className="text-brand-yellow">CUP</span>
            </div>
            <div className="text-[10px] text-gray-600 uppercase tracking-widest -mt-0.5">
              Admin Panel
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}
      </nav>

      {/* Live indicator */}
      <div className="px-4 py-3 mx-3 mb-3 rounded-xl bg-green-500/5 border border-green-500/20">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          <div>
            <div className="text-xs font-semibold text-green-400">System Live</div>
            <div className="text-[10px] text-gray-600">Real-time updates active</div>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-dark-700 border border-dark-500 text-white"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-dark-800 border-r border-dark-600 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 flex flex-col bg-dark-800 border-r border-dark-600 z-50 lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
