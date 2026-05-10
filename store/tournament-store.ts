"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { FullTournament, DashboardStats } from "@/types";

interface TournamentStore {
  tournament: FullTournament | null;
  stats: DashboardStats | null;
  playerCount: number;
  isLoading: boolean;
  setTournament: (t: FullTournament | null) => void;
  setStats: (s: DashboardStats | null) => void;
  setPlayerCount: (n: number) => void;
  setLoading: (b: boolean) => void;
  updateMatch: (matchId: string, data: Partial<FullTournament["rounds"][0]["matches"][0]>) => void;
}

export const useTournamentStore = create<TournamentStore>()(
  subscribeWithSelector((set, get) => ({
    tournament: null,
    stats: null,
    playerCount: 0,
    isLoading: false,

    setTournament: (tournament) => set({ tournament }),
    setStats: (stats) => set({ stats }),
    setPlayerCount: (playerCount) => set({ playerCount }),
    setLoading: (isLoading) => set({ isLoading }),

    updateMatch: (matchId, data) => {
      const { tournament } = get();
      if (!tournament) return;
      const updatedRounds = tournament.rounds.map((round) => ({
        ...round,
        matches: round.matches.map((match) =>
          match.id === matchId ? { ...match, ...data } : match
        ),
      }));
      set({ tournament: { ...tournament, rounds: updatedRounds } });
    },
  }))
);
