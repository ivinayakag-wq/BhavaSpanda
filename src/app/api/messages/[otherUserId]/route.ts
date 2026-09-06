import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ otherUserId: string }> },
) {
  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { otherUserId } = await params;
  const pollOnly = req.nextUrl.searchParams.get("poll") === "true";

  const match = await prisma.match.findFirst({
    where: {
      OR: [
        { user1_id: userId, user2_id: otherUserId },
        { user1_id: otherUserId, user2_id: userId },
      ],
    },
  });

  if (!match) {
    return NextResponse.json({ messages: [], otherProfile: null, viewerTier: "free", viewerId: userId });
  }

  const messages = await prisma.message.findMany({
    where: { match_id: match.id },
    orderBy: { created_at: "asc" },
  });

  if (pollOnly) {
    return NextResponse.json({ messages, viewerId: userId });
  }

  const [otherProfile, myProfile] = await Promise.all([
    prisma.profile.findUnique({ where: { id: otherUserId } }),
    prisma.profile.findUnique({ where: { id: userId } }),
  ]);

  return NextResponse.json({
    messages,
    otherProfile,
    viewerTier: myProfile?.tier ?? "free",
    viewerId: userId,
  });
}
