"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KeyRound, Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = newPassword.length === 0 ? null
    : newPassword.length < 8 ? "weak"
    : newPassword.length < 12 ? "fair"
    : /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? "strong"
    : "fair";

  const strengthColor = { weak: "bg-red-500", fair: "bg-yellow-500", strong: "bg-green-500" }[strength ?? "weak"];
  const strengthWidth = { weak: "w-1/3", fair: "w-2/3", strong: "w-full" }[strength ?? "weak"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update password");

      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-black text-white font-display">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your admin account</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dark-400/50 bg-dark-800/60 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-dark-600 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-brand-blue-light" />
          </div>
          <div>
            <h2 className="font-bold text-white">Change Password</h2>
            <p className="text-xs text-gray-500">Use a strong password to protect your admin account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Current password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter your current password"
                className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-blue/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Min. 8 characters"
                className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-blue/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength bar */}
            {strength && (
              <div className="space-y-1">
                <div className="h-1 bg-dark-600 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strengthColor} ${strengthWidth}`} />
                </div>
                <p className={`text-xs font-semibold capitalize ${
                  strength === "strong" ? "text-green-400" : strength === "fair" ? "text-yellow-400" : "text-red-400"
                }`}>
                  {strength} password
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat new password"
                className={`w-full bg-dark-700 border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "border-red-500/50 focus:border-red-500/70"
                    : confirmPassword && confirmPassword === newPassword
                    ? "border-green-500/50 focus:border-green-500/70"
                    : "border-dark-500 focus:border-brand-blue/50"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-400">Passwords do not match</p>
            )}
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            variant="yellow"
            disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          >
            <KeyRound className="w-4 h-4" />
            Update Password
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
