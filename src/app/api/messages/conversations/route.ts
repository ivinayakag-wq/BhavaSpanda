import { NextResponse } from "next/server";
import { getMatches } from "@/lib/db";
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

  const matches = await getMatches(userId);

  const conversations = matches.map((m) => ({
    otherUserId: m.other_id,
    otherProfile: {
      id: m.other_id,
      full_name: m.other_name,
      age: m.other_age,
      location: m.other_location,
      profile_pic_url: m.other_photos?.[0] ?? null,
      tier: m.other_tier,
    },
    lastMessage: m.last_message,
    lastMessageAt: m.last_message_at?.toISOString() ?? m.created_at.toISOString(),
    unreadCount: 0,
  }));

  return NextResponse.json({ conversations });
}
