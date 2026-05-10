"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Trophy, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
        return;
      }

      toast.success("Welcome back, Admin!");
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Back link */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Site
      </Link>

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-blue/20 border border-brand-blue/30 mb-4 shadow-glow-sm">
              <Trophy className="w-8 h-8 text-brand-blue-light" />
            </div>
            <h1 className="text-2xl font-black text-white font-display">Admin Portal</h1>
            <p className="text-gray-500 text-sm mt-1">eFootball City Cup 2025</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-dark-400/60 bg-dark-800/90 backdrop-blur-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-600 bg-dark-700/40">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-gray-600 font-mono">admin — secure login</span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@efootball.local"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                required
                {...register("email")}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  required
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                Sign In to Admin Panel
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-gray-700 mt-6">
            This area is restricted to tournament administrators only.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
