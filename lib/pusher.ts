import Pusher from "pusher";
import PusherJS from "pusher-js";

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Client-side Pusher instance (singleton)
let pusherClient: PusherJS | null = null;

export function getPusherClient(): PusherJS {
  if (!pusherClient) {
    pusherClient = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  return pusherClient;
}

// Channel names
export const CHANNELS = {
  TOURNAMENT: "tournament",
  PLAYERS: "players",
  MATCHES: "matches",
} as const;

// Event names
export const EVENTS = {
  PLAYER_REGISTERED: "player-registered",
  PLAYER_STATUS_CHANGED: "player-status-changed",
  MATCH_UPDATED: "match-updated",
  TOURNAMENT_UPDATED: "tournament-updated",
  BRACKET_GENERATED: "bracket-generated",
  ROUND_ADVANCED: "round-advanced",
} as const;
