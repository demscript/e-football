"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  glow?: boolean;
  gradient?: boolean;
  hover?: boolean;
  children?: ReactNode;
}

export function Card({ children, className, glow, gradient, hover, ...props }: CardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-2xl border border-dark-400/50 bg-dark-700/80 backdrop-blur-sm overflow-hidden",
        glow && "shadow-glow",
        gradient && "bg-card-gradient",
        hover && "hover:border-brand-blue/40 hover:shadow-glow-sm transition-all duration-300",
        className
      )}
      {...props}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-brand-yellow/5 pointer-events-none" />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-6 py-5 border-b border-dark-400/50", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-6 py-4 border-t border-dark-400/50", className)}>
      {children}
    </div>
  );
}

export function GlassCard({ children, className, ...props }: Omit<HTMLMotionProps<"div">, "children"> & { children?: ReactNode }) {
  return (
    <motion.div
      className={cn(
        "relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-glass overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </motion.div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  sub,
  color = "blue",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color?: "blue" | "yellow" | "green" | "red" | "purple";
}) {
  const colors = {
    blue: "from-brand-blue/20 to-brand-blue/5 border-brand-blue/30",
    yellow: "from-brand-yellow/20 to-brand-yellow/5 border-brand-yellow/30",
    green: "from-green-500/20 to-green-500/5 border-green-500/30",
    red: "from-red-500/20 to-red-500/5 border-red-500/30",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30",
  };

  const iconColors = {
    blue: "text-brand-blue-light bg-brand-blue/20",
    yellow: "text-brand-yellow bg-brand-yellow/20",
    green: "text-green-400 bg-green-500/20",
    red: "text-red-400 bg-red-500/20",
    purple: "text-purple-400 bg-purple-500/20",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-2xl border bg-gradient-to-br p-5 overflow-hidden",
        colors[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white font-display">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={cn("p-3 rounded-xl", iconColors[color])}>{icon}</div>
      </div>
    </motion.div>
  );
}
