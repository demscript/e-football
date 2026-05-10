import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registrationSchema } from "@/lib/validations";
import { generatePlayerId } from "@/lib/utils";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const players = await prisma.player.findMany({
      where: {
        ...(status ? { status: status as never } : {}),
        ...(q
          ? {
              OR: [
                { gamerTag: { contains: q, mode: "insensitive" } },
                { fullName: { contains: q, mode: "insensitive" } },
                { playerId: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: players });
  } catch {
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registrationSchema.parse(body);

    // Check duplicates
    const existing = await prisma.player.findFirst({
      where: {
        OR: [
          { gamerTag: { equals: data.gamerTag, mode: "insensitive" } },
          { phone: data.phone },
          ...(data.email ? [{ email: { equals: data.email, mode: "insensitive" as const } }] : []),
        ],
      },
    });

    if (existing) {
      const field =
        existing.gamerTag.toLowerCase() === data.gamerTag.toLowerCase()
          ? "gamer tag"
          : existing.phone === data.phone
          ? "phone number"
          : "email";
      return NextResponse.json(
        { error: `A player with this ${field} is already registered.` },
        { status: 409 }
      );
    }

    // Generate player ID
    const count = await prisma.player.count();
    const playerId = generatePlayerId(count + 1);

    const player = await prisma.player.create({
      data: {
        playerId,
        fullName: data.fullName,
        gamerTag: data.gamerTag,
        phone: data.phone,
        email: data.email || null,
        console: data.console as never,
        status: "PENDING",
      },
    });

    // Broadcast to realtime
    const totalCount = await prisma.player.count({ where: { status: "APPROVED" } });
    await pusherServer.trigger(CHANNELS.PLAYERS, EVENTS.PLAYER_REGISTERED, {
      player,
      totalCount,
    });

    return NextResponse.json({ data: player }, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: err.errors[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
