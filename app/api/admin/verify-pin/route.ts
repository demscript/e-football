import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { pin } = await req.json();

    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ error: "PIN required" }, { status: 400 });
    }

    // PIN is stored server-side only — never exposed to the client
    const correctPin = process.env.ACTION_PIN ?? "707373";
    const valid = pin === correctPin;

    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
