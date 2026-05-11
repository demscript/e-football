"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface PinModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  action?: string;
}

export function PinModal({ open, onClose, onSuccess, action = "this action" }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPin("");
      setShake(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  async function verify() {
    if (pin.length < 4 || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.valid) {
        onSuccess();
        onClose();
        setPin("");
      } else {
        setShake(true);
        setPin("");
        setTimeout(() => setShake(false), 600);
        toast.error("Incorrect PIN");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  }

  function pressKey(key: number | "⌫") {
    if (key === "⌫") {
      setPin((p) => p.slice(0, -1));
    } else {
      setPin((p) => (p.length < 6 ? p + key : p));
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: shake ? [0, -10, 10, -10, 10, -6, 6, 0] : 0,
            }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative w-full max-w-xs rounded-2xl border border-dark-400/70 bg-dark-800 shadow-2xl overflow-hidden"
          >
            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-yellow/70 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-600">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-brand-yellow/10 border border-brand-yellow/20">
                  <KeyRound className="w-4 h-4 text-brand-yellow" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">PIN Required</div>
                  <div className="text-xs text-gray-500 capitalize truncate max-w-[160px]">{action}</div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-dark-600 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PIN dots */}
            <div className="px-5 pt-5">
              <div className="flex justify-center gap-2.5 mb-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-9 h-10 rounded-xl border flex items-center justify-center transition-all duration-150",
                      pin.length > i
                        ? "border-brand-yellow/60 bg-brand-yellow/10 shadow-[0_0_8px_rgba(251,191,36,0.15)]"
                        : pin.length === i
                        ? "border-brand-yellow/30 bg-dark-700"
                        : "border-dark-500 bg-dark-700/60"
                    )}
                  >
                    {pin[i] ? (
                      <div className="w-2 h-2 rounded-full bg-brand-yellow" />
                    ) : (
                      <div
                        className={cn(
                          "w-1 h-1 rounded-full",
                          pin.length === i ? "bg-brand-yellow/50 animate-pulse" : "bg-dark-500"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Hidden real input for keyboard support */}
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setPin(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") verify();
                  if (e.key === "Escape") onClose();
                }}
                className="sr-only"
                aria-label="Enter PIN"
              />

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, "⌫" as const].map((key, i) => {
                  if (key === null) {
                    return <div key={i} />;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => pressKey(key as number | "⌫")}
                      className={cn(
                        "h-12 rounded-xl text-sm font-bold border transition-all active:scale-95 select-none",
                        key === "⌫"
                          ? "bg-dark-700 border-dark-500 text-gray-400 hover:bg-dark-600 hover:text-white"
                          : "bg-dark-700 border-dark-500 text-white hover:bg-dark-600 hover:border-dark-400"
                      )}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>

              {/* Confirm */}
              <button
                onClick={verify}
                disabled={pin.length < 4 || loading}
                className={cn(
                  "w-full py-3 rounded-xl font-bold text-sm transition-all mb-5",
                  pin.length >= 4 && !loading
                    ? "bg-brand-yellow text-black hover:bg-brand-yellow/90 shadow-[0_4px_20px_rgba(251,191,36,0.25)]"
                    : "bg-dark-700 text-gray-600 cursor-not-allowed"
                )}
              >
                {loading ? "Verifying…" : "Confirm"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
