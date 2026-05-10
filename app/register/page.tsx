"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Trophy, User, AtSign, Phone, Mail,
  ArrowLeft, CheckCircle, ChevronRight,
} from "lucide-react";
import { registrationSchema, type RegistrationInput } from "@/lib/validations";
import { Input, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CONSOLE_OPTIONS = [
  { value: "PS5", label: "PlayStation 5 (PS5)" },
  { value: "PS4", label: "PlayStation 4 (PS4)" },
  { value: "PC", label: "PC / Computer" },
  { value: "MOBILE", label: "Mobile Phone" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
  });

  async function onSubmit(data: RegistrationInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error ?? "Registration failed");
      }

      toast.success("Registration successful! 🎮");
      router.push(`/register/success?id=${result.data.playerId}&tag=${result.data.gamerTag}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-dark-900 py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative max-w-lg mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-blue/20 border border-brand-blue/30 mb-4 shadow-glow-sm">
            <Trophy className="w-8 h-8 text-brand-blue-light" />
          </div>
          <h1 className="text-3xl font-black text-white font-display tracking-tight">
            Join the Tournament
          </h1>
          <p className="mt-2 text-gray-400">
            Register now to compete in the eFootball City Cup 2025
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            Free Registration — No Entry Fee
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-dark-400/60 bg-dark-800/80 backdrop-blur-sm overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-dark-600">
            <h2 className="font-bold text-white text-lg">Player Information</h2>
            <p className="text-xs text-gray-500 mt-1">All fields marked * are required</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-5">
            <Input
              label="Full Name"
              placeholder="e.g. Chukwuemeka Obi"
              icon={<User className="w-4 h-4" />}
              error={errors.fullName?.message}
              required
              {...register("fullName")}
            />

            <Input
              label="Gamer Tag / Username"
              placeholder="e.g. EMEKAx10"
              icon={<AtSign className="w-4 h-4" />}
              error={errors.gamerTag?.message}
              hint="Your in-game username. No spaces allowed."
              required
              {...register("gamerTag")}
            />

            <Input
              label="Phone Number"
              placeholder="e.g. 08012345678"
              type="tel"
              icon={<Phone className="w-4 h-4" />}
              error={errors.phone?.message}
              hint="Nigerian phone number format"
              required
              {...register("phone")}
            />

            <Input
              label="Email Address"
              placeholder="your@email.com (optional)"
              type="email"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register("email")}
            />

            <Select
              label="Console Type"
              placeholder="Select your console..."
              options={CONSOLE_OPTIONS}
              error={errors.console?.message}
              required
              {...register("console")}
            />

            {/* Rules acknowledgment */}
            <div className="rounded-xl bg-dark-700/60 border border-dark-500/50 p-4 text-xs text-gray-400 space-y-2">
              <p className="font-semibold text-gray-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-blue-light" />
                By registering you agree to:
              </p>
              <ul className="space-y-1 ml-6 list-disc text-gray-500">
                <li>Follow all tournament rules and regulations</li>
                <li>Accept the admin&apos;s decisions as final</li>
                <li>Play fair and maintain sportsmanship</li>
                <li>Be available on the tournament date (May 11, 2025)</li>
              </ul>
            </div>

            <Button
              type="submit"
              variant="yellow"
              size="lg"
              loading={isSubmitting}
              className="w-full"
            >
              <Trophy className="w-5 h-5" />
              Register for the Tournament
              <ChevronRight className="w-4 h-4" />
            </Button>
          </form>
        </motion.div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Already registered?{" "}
          <a href="#" className="text-brand-blue-light hover:text-white transition-colors">
            Check your registration status
          </a>
        </p>
      </div>
    </main>
  );
}
