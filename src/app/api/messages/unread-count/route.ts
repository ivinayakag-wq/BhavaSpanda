import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ user1_id: userId }, { user2_id: userId }],
    },
    select: { id: true, user1_id: true, user2_id: true },
  });

  const matchIds = matches.map((m) => m.id);

  const count = await prisma.message.count({
    where: {
      match_id: { in: matchIds },
      sender_id: { not: userId },
      is_read: false,
    },
  });

  return NextResponse.json({ count });
}
