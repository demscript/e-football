"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, ChevronRight, Zap } from "lucide-react";
import { Countdown } from "./countdown";
import { LivePlayerCount } from "./player-count";

const floatVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

export function HeroSection({
  playerCount,
  tournamentDate,
}: {
  playerCount: number;
  tournamentDate: Date;
}) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Animated orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand-blue/10 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-yellow/8 blur-3xl pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        {/* Badge */}
        <motion.div
          variants={floatVariants}
          initial="hidden"
          animate="visible"
          custom={0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue-light text-sm font-semibold mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          REGISTRATION NOW OPEN
          <span className="text-gray-500">•</span>
          MAY 11, 2025
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={floatVariants}
          initial="hidden"
          animate="visible"
          custom={1}
          className="text-5xl sm:text-7xl lg:text-8xl font-black text-white font-display tracking-tight leading-none mb-6"
        >
          eFOOTBALL
          <br />
          <span className="gradient-text-yellow neon-yellow">CITY CUP</span>
          <br />
          <span className="text-brand-blue-light neon-text">2025</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={floatVariants}
          initial="hidden"
          animate="visible"
          custom={2}
          className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The ultimate community eFootball tournament.{" "}
          <span className="text-white font-semibold">Compete. Win. Dominate.</span>
          <br />
          <span className="text-brand-yellow font-bold">₦18,000</span> in prizes up for grabs.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={floatVariants}
          initial="hidden"
          animate="visible"
          custom={3}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-yellow hover:bg-brand-yellow-dark text-dark-900 text-lg font-black transition-all hover:shadow-glow-yellow hover:scale-105"
          >
            <Trophy className="w-5 h-5" />
            Register Now — It&apos;s Free
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/tournament"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-dark-700/80 border border-dark-400 hover:border-brand-blue/50 text-white text-lg font-semibold transition-all hover:bg-dark-600/80 backdrop-blur-sm"
          >
            <Zap className="w-5 h-5 text-brand-blue-light" />
            Live Bracket
          </Link>
        </motion.div>

        {/* Player count */}
        <motion.div
          variants={floatVariants}
          initial="hidden"
          animate="visible"
          custom={4}
          className="flex justify-center mb-16"
        >
          <LivePlayerCount initial={playerCount} />
        </motion.div>

        {/* Countdown */}
        <motion.div
          variants={floatVariants}
          initial="hidden"
          animate="visible"
          custom={5}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gray-600 mb-6 font-semibold">
            Tournament Countdown
          </p>
          <Countdown targetDate={tournamentDate} />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-1 text-gray-600">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
