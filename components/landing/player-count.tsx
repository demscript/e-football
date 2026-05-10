"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import type { PlayerRegisteredEvent } from "@/types";

export function LivePlayerCount({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(CHANNELS.PLAYERS);

    channel.bind(EVENTS.PLAYER_REGISTERED, (data: PlayerRegisteredEvent) => {
      setCount(data.totalCount);
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNELS.PLAYERS);
    };
  }, []);

  return (
    <motion.div
      animate={{ scale: pulse ? [1, 1.05, 1] : 1 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-dark-700/80 border border-dark-400/50 backdrop-blur-sm"
    >
      <div className="relative">
        <Users className="w-5 h-5 text-brand-blue-light" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
      </div>
      <div>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="text-2xl font-bold text-white font-display"
          >
            {count}
          </motion.span>
        </AnimatePresence>
        <span className="text-sm text-gray-400 ml-2">Players Registered</span>
      </div>
      <div className="flex items-center gap-1.5 pl-3 border-l border-dark-400">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs text-green-400 font-semibold">LIVE</span>
      </div>
    </motion.div>
  );
}
