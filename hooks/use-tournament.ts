"use client";

import { useEffect, useState } from "react";
import type { FullTournament, DashboardStats } from "@/types";

export function useTournament() {
  const [tournament, setTournament] = useState<FullTournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetch() {
    try {
      const res = await window.fetch("/api/tournament");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setTournament(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetch(); }, []);

  return { tournament, loading, error, refetch: fetch };
}

export function useStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.data))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
}
