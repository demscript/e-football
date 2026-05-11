// EFB-012: server-only — never import this in client components or pages
// Use @/lib/pusher-client for browser-side Pusher access
import "server-only";
import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

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
