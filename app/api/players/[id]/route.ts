import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { z } from "zod";
import { ZodError } from "zod";

// EFB-006: same validation rules as registration POST
const playerPatchSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "DISQUALIFIED"]).optional(),
  fullName: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens and apostrophes")
    .optional(),
  gamerTag: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/, "Gamer tag can only contain letters, numbers, underscores and hyphens")
    .optional(),
});

async function getSession() {
  return auth();
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();

    // EFB-006/EFB-007: validate and allowlist writable fields
    let parsed: z.infer<typeof playerPatchSchema>;
    try {
      parsed = playerPatchSchema.parse({
        status: body.status,
        fullName: body.fullName,
        gamerTag: body.gamerTag,
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid data" }, { status: 400 });
      }
      throw err;
    }

    const { status, fullName, gamerTag } = parsed;

    const updateData: Record<string, string> = {};
    if (status) updateData.status = status;
    if (fullName) updateData.fullName = fullName;
    if (gamerTag) updateData.gamerTag = gamerTag;

    const player = await prisma.player.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id ?? "",
        action: status ? `Player ${status.toLowerCase()}` : "Player updated",
        entity: "Player",
        entityId: id,
        metadata: updateData,
      },
    });

    // Broadcast status changes (non-fatal if Pusher not configured)
    if (status) {
      try {
        await pusherServer.trigger(CHANNELS.PLAYERS, EVENTS.PLAYER_STATUS_CHANGED, {
          playerId: id,
          status,
          player,
        });

        if (status === "APPROVED") {
          const totalCount = await prisma.player.count({ where: { status: "APPROVED" } });
          await pusherServer.trigger(CHANNELS.PLAYERS, EVENTS.PLAYER_REGISTERED, {
            player,
            totalCount,
          });
        }
      } catch {
        // Pusher failure must not block the response
      }
    }

    return NextResponse.json({ data: player });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.player.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: session.user?.id ?? "",
        action: "Player removed",
        entity: "Player",
        entityId: id,
      },
    });

    return NextResponse.json({ message: "Player removed" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
