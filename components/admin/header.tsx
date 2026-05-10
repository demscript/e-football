"use client";

import { motion } from "framer-motion";
import { Bell, ExternalLink, User } from "lucide-react";
import Link from "next/link";
import type { Session } from "next-auth";

export function AdminHeader({ user }: { user: Session["user"] }) {
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  return (
    <header className="h-16 border-b border-dark-600 bg-dark-800/60 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 ml-10 lg:ml-0">
        <div className="h-4 w-px bg-dark-500 hidden lg:block" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <span className="text-xs text-gray-600 hidden sm:block">Tournament Management</span>
          <span className="text-xs text-gray-600 hidden sm:block">•</span>
          <span className="text-xs font-semibold text-gray-400">eFootball City Cup 2026</span>
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-600 hover:bg-dark-500 text-gray-400 hover:text-white text-xs transition-all border border-dark-500"
        >
          <ExternalLink className="w-3 h-3" />
          View Site
        </Link>

        <button className="relative p-2 rounded-xl hover:bg-dark-600 text-gray-500 hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-dark-600">
          <div className="w-8 h-8 rounded-xl bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-brand-blue-light text-xs font-bold">
            {initials}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-white">{user?.name ?? "Admin"}</div>
            <div className="text-[10px] text-gray-600">{user?.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
