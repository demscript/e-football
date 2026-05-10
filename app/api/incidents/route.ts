import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { incidentSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = incidentSchema.parse(body);

    const incident = await prisma.incident.create({
      data: {
        matchId: data.matchId,
        playerId: data.playerId ?? null,
        type: data.type as never,
        description: data.description,
        resolution: data.resolution ?? null,
      },
      include: { player: true, match: true },
    });

    return NextResponse.json({ data: incident }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to log incident" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const incidents = await prisma.incident.findMany({
    include: { player: true, match: { include: { round: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: incidents });
}
