import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens and apostrophes"),
  gamerTag: z
    .string()
    .min(2, "Gamer tag must be at least 2 characters")
    .max(20, "Gamer tag must be 20 characters or less")
    .regex(/^[a-zA-Z0-9_-]+$/, "Gamer tag can only contain letters, numbers, underscores and hyphens"),
  phone: z
    .string()
    .regex(/^(\+234|0)[789]\d{9}$/, "Enter a valid Nigerian phone number (e.g. 08012345678)"),
  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  console: z.enum(["PS4", "PS5", "PC", "MOBILE"]).default("MOBILE"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const scoreSchema = z.object({
  score1: z.number().int().min(0).max(20),
  score2: z.number().int().min(0).max(20),
  // winnerId must be a non-empty cuid — validated server-side against match participants
  winnerId: z.string().min(1, "Winner is required"),
  notes: z.string().max(500).optional(),
});

export const incidentSchema = z.object({
  matchId: z.string(),
  playerId: z.string().optional(),
  type: z.enum(["DISCONNECT", "REPEATED_DISCONNECT", "DISPUTE", "TECHNICAL_ISSUE", "OTHER"]),
  description: z.string().min(5, "Please describe the incident"),
  resolution: z.string().optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ScoreInput = z.infer<typeof scoreSchema>;
export type IncidentInput = z.infer<typeof incidentSchema>;
