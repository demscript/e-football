import type {
  Player,
  Tournament,
  Match,
  Round,
  Incident,
  AuditLog,
  User,
} from "@prisma/client";

// Extended types with relations
export type PlayerWithMatches = Player & {
  matchesAsP1: Match[];
  matchesAsP2: Match[];
  wonMatches: Match[];
};

export type MatchWithPlayers = Match & {
  player1: Player | null;
  player2: Player | null;
  winner: Player | null;
  round: Round;
};

export type RoundWithMatches = Round & {
  matches: MatchWithPlayers[];
};

export type TournamentWithRounds = Tournament & {
  rounds: RoundWithMatches[];
};

export type FullTournament = Tournament & {
  rounds: (Round & {
    matches: MatchWithPlayers[];
  })[];
};

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalPlayers: number;
  approvedPlayers: number;
  pendingPlayers: number;
  rejectedPlayers: number;
  totalMatches: number;
  completedMatches: number;
  currentRound: number;
  tournamentStatus: string;
}

// Bracket node
export interface BracketNode {
  match: MatchWithPlayers;
  round: number;
  position: number;
}

// Pusher event payloads
export interface PlayerRegisteredEvent {
  player: Player;
  totalCount: number;
}

export interface MatchUpdatedEvent {
  match: MatchWithPlayers;
}

export interface TournamentUpdatedEvent {
  tournament: Tournament;
}

// Re-export Prisma types for convenience
export type { Player, Tournament, Match, Round, Incident, AuditLog, User };
