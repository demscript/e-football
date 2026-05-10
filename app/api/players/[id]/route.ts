import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";

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
    const { status, fullName, gamerTag } = body;

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

    // Broadcast status changes
    if (status) {
      await pusherServer.trigger(CHANNELS.PLAYERS, EVENTS.PLAYER_STATUS_CHANGED, {
        playerId: id,
        status,
        player,
      });

      // Update player count if approved
      if (status === "APPROVED") {
        const totalCount = await prisma.player.count({ where: { status: "APPROVED" } });
        await pusherServer.trigger(CHANNELS.PLAYERS, EVENTS.PLAYER_REGISTERED, {
          player,
          totalCount,
        });
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
