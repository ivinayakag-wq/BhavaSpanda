import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getLikesCount, getLikesList } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [user, count, list] = await Promise.all([
    getCurrentUser(userId),
    getLikesCount(userId),
    getLikesList(userId),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user, count, list }, {
    headers: { "Cache-Control": "private, max-age=60" },
  });
}
