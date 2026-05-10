import { cn, getStatusColor } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "status";
  status?: string;
  className?: string;
}

export function Badge({ children, variant = "default", status, className }: BadgeProps) {
  if (variant === "status" && status) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
          getStatusColor(status),
          className
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-dark-500 text-gray-300 border border-dark-300",
        className
      )}
    >
      {children}
    </span>
  );
}

export function ConsoleBadge({ console: c }: { console: string }) {
  const colors: Record<string, string> = {
    PS5: "text-blue-300 bg-blue-500/15 border-blue-500/30",
    PS4: "text-indigo-300 bg-indigo-500/15 border-indigo-500/30",
    PC: "text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
    MOBILE: "text-green-300 bg-green-500/15 border-green-500/30",
  };

  const labels: Record<string, string> = {
    PS5: "PS5",
    PS4: "PS4",
    PC: "PC",
    MOBILE: "📱 Mobile",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border",
        colors[c] ?? "text-gray-300 bg-gray-500/15 border-gray-500/30"
      )}
    >
      {labels[c] ?? c}
    </span>
  );
}
