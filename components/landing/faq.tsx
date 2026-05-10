"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Who can participate in the tournament?",
    a: "Anyone is welcome! The tournament is open to all skill levels. Whether you're a seasoned eFootball veteran or just getting started, there's a place for you. You just need a compatible console (PS4, PS5, PC, or Mobile).",
  },
  {
    q: "How much does it cost to register?",
    a: "Registration is completely FREE! There's no entry fee to join the tournament. Simply sign up, get approved by the admin, and you're ready to compete for the prize pool.",
  },
  {
    q: "When does the tournament start?",
    a: "The eFootball City Cup 2025 kicks off on May 11, 2025. Make sure you register before then to secure your spot. Registration closes once the bracket is generated.",
  },
  {
    q: "What are the prizes?",
    a: "The prize pool is ₦18,000 total: 1st Place wins ₦10,000, 2nd Place wins ₦5,000, and 3rd Place wins ₦3,000. Prizes are paid out within 24 hours of the tournament ending.",
  },
  {
    q: "What happens if I disconnect during a match?",
    a: "If you disconnect before kickoff, a rematch is granted automatically. If you disconnect mid-game and can reconnect, the match continues from where it left off. Repeated disconnects may result in a loss — the admin's decision is final.",
  },
  {
    q: "What format is the tournament?",
    a: "It's a single-elimination tournament. This means one loss and you're out, so bring your A-game! The bracket is randomly generated and supports up to 32 players.",
  },
  {
    q: "Can I change my gamer tag after registering?",
    a: "Your gamer tag is locked after registration approval. Please make sure your tag is exactly how you want it before submitting your registration.",
  },
  {
    q: "How do I know if I've been approved?",
    a: "After registering, you'll receive your unique Player ID (e.g., EFB-001). You can check your registration status on the registration success page using your Player ID. The admin will approve players before the tournament starts.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className={cn(
            "rounded-2xl border overflow-hidden transition-all duration-300",
            open === i
              ? "border-brand-blue/40 bg-dark-700/80"
              : "border-dark-400/50 bg-dark-800/50 hover:border-dark-300/70"
          )}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left"
          >
            <span className="font-semibold text-white pr-4">{faq.q}</span>
            <motion.div
              animate={{ rotate: open === i ? 180 : 0 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "flex-shrink-0 p-1 rounded-lg transition-colors",
                open === i ? "text-brand-blue-light bg-brand-blue/10" : "text-gray-500"
              )}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <p className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-dark-600 pt-4">
                  {faq.a}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
