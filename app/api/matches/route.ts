import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roundId = searchParams.get("roundId");
    const status = searchParams.get("status");

    const matches = await prisma.match.findMany({
      where: {
        ...(roundId ? { roundId } : {}),
        ...(status ? { status: status as never } : {}),
      },
      include: {
        player1: true,
        player2: true,
        winner: true,
        round: true,
      },
      orderBy: [{ round: { roundNumber: "asc" } }, { matchNumber: "asc" }],
    });

    return NextResponse.json({ data: matches });
  } catch {
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
