import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { recordLike, recordPass } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { targetId, direction } = await req.json();
  if (!targetId || typeof direction !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Server-side profile completion check
  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from("profile")
    .select("profile_completeness")
    .eq("id", userId)
    .single();
  if (!user || (user.profile_completeness ?? 0) < 100) {
    return NextResponse.json({ error: "profile_incomplete", blocked: true }, { status: 403 });
  }

  if (!direction) {
    // Record pass in DB so feed can exclude it
    await recordPass(userId, targetId);
    return NextResponse.json({ ok: true, swiped: false, matchCreated: false, blocked: false });
  }

  const result = await recordLike(userId, targetId);
  return NextResponse.json({
    ok: result.liked,
    swiped: result.liked,
    matchCreated: result.matched,
    blocked: result.blocked,
  });
}
