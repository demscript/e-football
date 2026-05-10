import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalPlayers, approvedPlayers, pendingPlayers, tournament, completedMatches, totalMatches] =
      await Promise.all([
        prisma.player.count(),
        prisma.player.count({ where: { status: "APPROVED" } }),
        prisma.player.count({ where: { status: "PENDING" } }),
        prisma.tournament.findFirst({ orderBy: { createdAt: "desc" } }),
        prisma.match.count({ where: { status: "COMPLETED" } }),
        prisma.match.count(),
      ]);

    return NextResponse.json({
      data: {
        totalPlayers,
        approvedPlayers,
        pendingPlayers,
        rejectedPlayers: totalPlayers - approvedPlayers - pendingPlayers,
        currentRound: tournament?.currentRound ?? 0,
        tournamentStatus: tournament?.status ?? "UPCOMING",
        completedMatches,
        totalMatches,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
