import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMessage } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { receiverId, content } = await req.json();
  if (!receiverId || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: "Message too long (max 2000)" }, { status: 400 });
  }
  if (receiverId === userId) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  // Server-side profile completion check
  const user = await prisma.profile.findUnique({
    where: { id: userId },
    select: { profile_completeness: true },
  });
  if (!user || (user.profile_completeness ?? 0) < 100) {
    return NextResponse.json({ error: "profile_incomplete", blocked: true }, { status: 403 });
  }

  const match = await prisma.match.findFirst({
    where: {
      OR: [
        { user1_id: userId, user2_id: receiverId },
        { user1_id: receiverId, user2_id: userId },
      ],
    },
  });

  if (!match) {
    return NextResponse.json({ error: "not matched" }, { status: 403 });
  }

  const result = await sendMessage(match.id, userId, content);
  if (result.blocked) return NextResponse.json({ blocked: true, reason: "daily_limit" }, { status: 200 });
  if (!result.ok || !result.message) return NextResponse.json({ error: "send failed" }, { status: 500 });

  return NextResponse.json({ ok: true, message: result.message });
}
