export const dynamic = "force-dynamic";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy, Zap, Shield, ChevronRight, Gamepad2,
  Star, Users, Award, Target, CheckCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Countdown } from "@/components/landing/countdown";
import { LivePlayerCount } from "@/components/landing/player-count";
import { FAQ } from "@/components/landing/faq";
import { HeroSection } from "@/components/landing/hero-section";

async function getPlayerCount() {
  try {
    return await prisma.player.count({ where: { status: "APPROVED" } });
  } catch {
    return 0;
  }
}

const prizes = [
  {
    place: "1st",
    amount: "₦10,000",
    icon: "🥇",
    color: "from-brand-yellow/30 to-brand-yellow/5",
    border: "border-brand-yellow/40",
    glow: "shadow-glow-yellow",
    label: "Champion",
    size: "scale-110",
  },
  {
    place: "2nd",
    amount: "₦5,000",
    icon: "🥈",
    color: "from-gray-400/20 to-gray-400/5",
    border: "border-gray-400/30",
    glow: "",
    label: "Runner-Up",
    size: "scale-100",
  },
  {
    place: "3rd",
    amount: "₦3,000",
    icon: "🥉",
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
    glow: "",
    label: "3rd Place",
    size: "scale-95",
  },
];

const rules = [
  { icon: <Gamepad2 className="w-5 h-5" />, title: "Game Format", desc: "Standard match settings. No custom squads. Online play required." },
  { icon: <Target className="w-5 h-5" />, title: "Single Elimination", desc: "One loss and you're out. Every match matters — come ready to win." },
  { icon: <Zap className="w-5 h-5" />, title: "Disconnect Rules", desc: "Pre-kickoff disconnect → rematch. Mid-game disconnect → reconnect. Repeat → auto loss." },
  { icon: <Shield className="w-5 h-5" />, title: "Admin Authority", desc: "Admin decisions are final and cannot be appealed. Fair play is mandatory." },
  { icon: <CheckCircle className="w-5 h-5" />, title: "Fair Play", desc: "No glitch abuse, pause spam, or unsportsmanlike conduct. Violations = disqualification." },
  { icon: <Trophy className="w-5 h-5" />, title: "Prize Payout", desc: "Prizes paid within 24 hours of tournament completion. Winners must verify identity." },
];

const sponsors = ["LEVEL UP GAMING", "ARENA PRO", "DIGITAL CLASH", "APEX GEAR", "NET PLAY"];

export default async function HomePage() {
  const playerCount = await getPlayerCount();
  const tournamentDate = new Date("2026-05-11T10:00:00Z");

  return (
    <main className="min-h-screen bg-dark-900 overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-dark-600/80 bg-dark-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center shadow-glow-sm">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white font-display text-lg tracking-wide">
              eFOOTBALL<span className="text-brand-yellow">CUP</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {["About", "Prizes", "Rules", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
              >
                {item}
              </a>
            ))}
            <a
              href="/tournament"
              className="text-sm text-gray-400 hover:text-brand-blue-light transition-colors font-medium"
            >
              Live Bracket
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
              Admin
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold transition-all hover:shadow-glow-sm"
            >
              Register Now
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <HeroSection playerCount={playerCount} tournamentDate={tournamentDate} />

      {/* Prizes Section */}
      <section id="prizes" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-sm font-semibold mb-4">
              <Trophy className="w-4 h-4" />
              PRIZE POOL — ₦18,000 TOTAL
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white font-display tracking-tight">
              Play Hard. Win Big.
            </h2>
            <p className="mt-4 text-gray-400 text-lg max-w-xl mx-auto">
              Real money on the line. Every match counts. Only the best will walk away with the prize.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-0 sm:items-end">
            {/* 2nd Place */}
            <div className="w-full sm:w-64 sm:mb-0 order-2 sm:order-1">
              <PrizeCard prize={prizes[1]} />
            </div>
            {/* 1st Place */}
            <div className="w-full sm:w-72 order-1 sm:order-2 sm:-mx-2 z-10">
              <PrizeCard prize={prizes[0]} featured />
            </div>
            {/* 3rd Place */}
            <div className="w-full sm:w-64 order-3">
              <PrizeCard prize={prizes[2]} />
            </div>
          </div>
        </div>
      </section>

      {/* Countdown */}
      <section className="py-16 px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue-light text-sm font-semibold mb-8">
            <Zap className="w-4 h-4" />
            TOURNAMENT STARTS IN
          </div>
          <Countdown targetDate={tournamentDate} />
          <p className="mt-6 text-gray-500 text-sm">May 11, 2026 • 10:00 AM</p>
        </div>
      </section>

      {/* Rules */}
      <section id="rules" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/30 text-brand-blue-light text-sm font-semibold mb-4">
              <Shield className="w-4 h-4" />
              RULES & REGULATIONS
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white font-display tracking-tight">
              Know the Game
            </h2>
            <p className="mt-4 text-gray-400 text-lg">
              Read the rules carefully before registering. Ignorance is no excuse.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((rule, i) => (
              <RuleCard key={i} rule={rule} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* About / Stats */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-sm font-semibold mb-6">
              <Star className="w-4 h-4" />
              ABOUT THE TOURNAMENT
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white font-display tracking-tight mb-6">
              The City&apos;s Biggest
              <span className="block gradient-text-yellow">eFootball Event</span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              The eFootball City Cup 2026 is a community-organised, locally-run tournament for passionate gamers. This is NOT an official Konami or eFootball event — it&apos;s built by the community, for the community.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              Whether you&apos;re a weekend warrior or a serious competitor, this is your chance to prove your skills, earn bragging rights, and take home real cash prizes.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold transition-all hover:shadow-glow"
              >
                Register Free
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tournament"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-transparent border border-dark-400 hover:border-brand-blue/50 text-gray-300 hover:text-white font-semibold transition-all"
              >
                View Bracket
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <Users className="w-6 h-6" />, value: "32", label: "Max Players", color: "blue" },
              { icon: <Trophy className="w-6 h-6" />, value: "₦18K", label: "Prize Pool", color: "yellow" },
              { icon: <Award className="w-6 h-6" />, value: "5", label: "Rounds Max", color: "purple" },
              { icon: <Zap className="w-6 h-6" />, value: "100%", label: "Free Entry", color: "green" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-dark-700/60 border border-dark-400/50 hover:border-brand-blue/30 transition-all group"
              >
                <div className="mb-3 text-brand-blue-light group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white font-display">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-12 px-4 border-y border-dark-600/50 bg-dark-800/30">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-gray-600 mb-8">
            Community Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {sponsors.map((s, i) => (
              <span
                key={i}
                className="text-gray-600 hover:text-gray-400 font-bold text-sm tracking-widest transition-colors cursor-default"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-600 border border-dark-400 text-gray-400 text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white font-display tracking-tight">
              Got Questions?
            </h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-transparent to-brand-yellow/5" />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-4xl sm:text-6xl font-bold text-white font-display tracking-tight mb-6">
            Ready to
            <span className="block gradient-text-yellow">Dominate?</span>
          </h2>
          <p className="text-gray-400 text-xl mb-8 max-w-xl mx-auto">
            Registration is FREE. Spots are limited. Don&apos;t miss your shot at the title.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-brand-yellow hover:bg-brand-yellow-dark text-dark-900 text-lg font-bold transition-all hover:shadow-glow-yellow"
            >
              <Trophy className="w-5 h-5" />
              Register for Free
            </Link>
            <Link
              href="/tournament"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-transparent border border-dark-400 hover:border-brand-blue/50 text-white text-lg font-semibold transition-all"
            >
              <Zap className="w-5 h-5" />
              Watch Live Bracket
            </Link>
          </div>
          <div className="mt-8">
            <LivePlayerCount initial={playerCount} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-dark-600/50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-blue flex items-center justify-center">
              <Trophy className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-400 font-display text-sm">
              eFOOTBALL<span className="text-brand-yellow">CUP</span> 2026
            </span>
          </div>
          <p className="text-xs text-gray-600 text-center">
            Community tournament. Not affiliated with Konami or eFootball officially.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/tournament" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Live Bracket
            </Link>
            <Link href="/register" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Register
            </Link>
            <Link href="/login" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Admin
            </Link>
            <a
              href="https://twitter.com/demscript"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:text-brand-blue-light transition-colors"
            >
              Designed by <span className="font-semibold">Demscript</span>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PrizeCard({
  prize,
  featured,
}: {
  prize: (typeof prizes)[0];
  featured?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border bg-gradient-to-b ${prize.color} ${prize.border} ${featured ? "shadow-glow-yellow" : ""} p-6 ${featured ? "py-8" : ""} text-center transition-all hover:scale-105`}
    >
      {featured && (
        <div className="absolute -top-3 inset-x-0 flex justify-center">
          <span className="px-3 py-1 rounded-full bg-brand-yellow text-dark-900 text-xs font-bold">
            ⭐ TOP PRIZE
          </span>
        </div>
      )}
      <div className="text-5xl mb-3">{prize.icon}</div>
      <div className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-1">
        {prize.label}
      </div>
      <div
        className={`font-bold font-display ${featured ? "text-5xl text-brand-yellow neon-yellow" : "text-4xl text-white"}`}
      >
        {prize.amount}
      </div>
      <div className="text-xs text-gray-600 mt-2">{prize.place} Place</div>
    </div>
  );
}

function RuleCard({
  rule,
  index,
}: {
  rule: (typeof rules)[0];
  index: number;
}) {
  return (
    <div className="group p-6 rounded-2xl border border-dark-400/50 bg-dark-800/60 hover:border-brand-blue/30 hover:bg-dark-700/60 transition-all duration-300">
      <div className="mb-4 inline-flex p-2.5 rounded-xl bg-brand-blue/10 text-brand-blue-light group-hover:bg-brand-blue/20 transition-colors">
        {rule.icon}
      </div>
      <h3 className="font-bold text-white mb-2 font-display">{rule.title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{rule.desc}</p>
    </div>
  );
}
