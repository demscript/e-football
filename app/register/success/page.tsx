"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, CheckCircle, Copy, ArrowLeft, Zap, MessageCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

function SuccessContent() {
  const params = useSearchParams();
  const playerId = params.get("id") ?? "EFB-???";
  const gamerTag = params.get("tag") ?? "Player";
  const [copied, setCopied] = useState(false);

  function copyId() {
    navigator.clipboard.writeText(playerId);
    setCopied(true);
    toast.success("Player ID copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative max-w-lg mx-auto text-center">
      {/* Glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-brand-blue/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative"
      >
        {/* Success icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-green-500/20 border border-green-500/30 mb-6 relative">
          <CheckCircle className="w-12 h-12 text-green-400" />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-3xl border-2 border-green-500/40"
          />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-black text-white font-display mb-2"
        >
          You&apos;re Registered!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 mb-8"
        >
          Welcome to the eFootball City Cup 2026,{" "}
          <span className="text-white font-semibold">{gamerTag}</span>! 🎮
        </motion.p>

        {/* Player ID Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-brand-blue/40 bg-dark-800/80 backdrop-blur-sm p-6 mb-6"
          style={{ boxShadow: "0 0 30px rgba(0,87,255,0.1)" }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent rounded-t-2xl" />

          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2 font-semibold">
            Your Player ID
          </p>
          <div className="text-4xl font-black text-brand-yellow font-display tracking-widest mb-4 neon-yellow">
            {playerId}
          </div>

          <button
            onClick={copyId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-600 hover:bg-dark-500 border border-dark-400 text-gray-300 hover:text-white text-sm transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy ID"}
          </button>

          <div className="mt-4 pt-4 border-t border-dark-600 text-left space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Status</span>
              <span className="text-yellow-400 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                Pending Approval
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Tournament Date</span>
              <span className="text-white font-semibold">May 11, 2026</span>
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-brand-yellow/5 border border-brand-yellow/20 p-4 mb-8 text-left"
        >
          <h3 className="font-bold text-brand-yellow text-sm mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            What happens next?
          </h3>
          <ul className="space-y-1.5 text-xs text-gray-400">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
              The admin will review and approve your registration
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
              Save your Player ID — you&apos;ll need it to check your status
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
              Check the Live Bracket page on May 11 for your first match
            </li>
          </ul>
        </motion.div>

        {/* WhatsApp CTA */}
        <motion.a
          href="https://chat.whatsapp.com/EJBpbO9w4aNI4L6L0GbG48?mode=gi_t"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex items-center gap-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 hover:border-[#25D366]/50 p-4 mb-6 transition-all group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-bold text-white">Join the WhatsApp Group</p>
            <p className="text-xs text-gray-400">Get updates, match schedules &amp; announcements</p>
          </div>
          <span className="text-[#25D366] text-xs font-semibold group-hover:underline">Join →</span>
        </motion.a>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/tournament"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-semibold transition-all hover:shadow-glow-sm"
          >
            <Trophy className="w-4 h-4" />
            View Live Bracket
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-dark-700 border border-dark-400 hover:border-dark-300 text-gray-300 hover:text-white font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-dark-900 flex items-center justify-center py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 grid-bg opacity-20" />
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
