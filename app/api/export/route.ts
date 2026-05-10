import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const players = await prisma.player.findMany({
    include: { _count: { select: { wonMatches: true } } },
    orderBy: { createdAt: "asc" },
  });

  const headers = ["Player ID", "Full Name", "Gamer Tag", "Phone", "Email", "Console", "Status", "Wins", "Joined"];
  const rows = players.map((p) => [
    p.playerId,
    p.fullName,
    p.gamerTag,
    p.phone,
    p.email ?? "",
    p.console,
    p.status,
    p._count.wonMatches,
    p.createdAt.toISOString(),
  ]);

  const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="efootball-players-${Date.now()}.csv"`,
    },
  });
}
