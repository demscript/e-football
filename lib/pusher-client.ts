// Client-side Pusher — safe to import in browser bundles
// EFB-012: server SDK (pusher) must never be imported from this file
import PusherJS from "pusher-js";

let pusherClient: PusherJS | null = null;

export function getPusherClient(): PusherJS {
  if (!pusherClient) {
    pusherClient = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return pusherClient;
}

// Re-export constants so client components only need one import
export const CHANNELS = {
  TOURNAMENT: "tournament",
  PLAYERS: "players",
  MATCHES: "matches",
} as const;

export const EVENTS = {
  PLAYER_REGISTERED: "player-registered",
  PLAYER_STATUS_CHANGED: "player-status-changed",
  MATCH_UPDATED: "match-updated",
  TOURNAMENT_UPDATED: "tournament-updated",
  BRACKET_GENERATED: "bracket-generated",
  ROUND_ADVANCED: "round-advanced",
} as const;
