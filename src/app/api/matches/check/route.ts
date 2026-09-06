import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  let viewerId: string;
  try {
    const user = await requireUser();
    viewerId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const profileId = req.nextUrl.searchParams.get("profileId");

  if (!profileId) {
    return NextResponse.json({ isMatch: false });
  }

  const match = await prisma.match.findFirst({
    where: {
      OR: [
        { user1_id: viewerId, user2_id: profileId },
        { user1_id: profileId, user2_id: viewerId },
      ],
    },
    select: { id: true },
  }).catch(() => null);

  return NextResponse.json({ isMatch: !!match });
}
