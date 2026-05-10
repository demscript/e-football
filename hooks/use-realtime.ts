"use client";

import { useEffect, useCallback } from "react";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import type { PlayerRegisteredEvent, MatchUpdatedEvent, TournamentUpdatedEvent } from "@/types";

export function useRealtimePlayers(onUpdate: (event: PlayerRegisteredEvent) => void) {
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(CHANNELS.PLAYERS);
    channel.bind(EVENTS.PLAYER_REGISTERED, onUpdate);
    channel.bind(EVENTS.PLAYER_STATUS_CHANGED, onUpdate);
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNELS.PLAYERS);
    };
  }, [onUpdate]);
}

export function useRealtimeMatches(onUpdate: (event: MatchUpdatedEvent) => void) {
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(CHANNELS.MATCHES);
    channel.bind(EVENTS.MATCH_UPDATED, onUpdate);
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNELS.MATCHES);
    };
  }, [onUpdate]);
}

export function useRealtimeTournament(onUpdate: (event: TournamentUpdatedEvent) => void) {
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(CHANNELS.TOURNAMENT);
    channel.bind(EVENTS.TOURNAMENT_UPDATED, onUpdate);
    channel.bind(EVENTS.BRACKET_GENERATED, onUpdate);
    channel.bind(EVENTS.ROUND_ADVANCED, onUpdate);
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(CHANNELS.TOURNAMENT);
    };
  }, [onUpdate]);
}

export function usePlayerCount(initial: number) {
  const [count, setCount] = [initial, useCallback((n: number) => n, [])];
  useRealtimePlayers((event) => {
    void count;
    setCount(event.totalCount);
  });
}
