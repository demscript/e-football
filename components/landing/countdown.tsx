"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(0,87,255,0.2) 0%, rgba(0,87,255,0.05) 100%)",
          border: "1px solid rgba(0,87,255,0.3)",
          boxShadow: "0 0 20px rgba(0,87,255,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <span className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-blue/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-blue/20 to-transparent" />
      </motion.div>
      <span className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </span>
    </div>
  );
}

export function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (targetDate.getTime() <= Date.now()) {
      setStarted(true);
      return;
    }
    const id = setInterval(() => {
      const t = calculateTimeLeft(targetDate);
      setTimeLeft(t);
      if (t.days === 0 && t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        setStarted(true);
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (started) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-green-500/10 border border-green-500/30">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 font-bold text-xl font-display tracking-wide">
            🏆 TOURNAMENT IS LIVE!
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-4 sm:gap-6 justify-center">
      <TimeBlock value={timeLeft.days} label="Days" />
      <Separator />
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <Separator />
      <TimeBlock value={timeLeft.minutes} label="Minutes" />
      <Separator />
      <TimeBlock value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col gap-2 pb-6">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse delay-150" />
    </div>
  );
}
