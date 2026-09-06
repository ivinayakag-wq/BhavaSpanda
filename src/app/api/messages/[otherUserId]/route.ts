import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
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

  const supabase = createAdminClient();

  const { data: match } = await supabase
    .from("match")
    .select("*")
    .or(`and(user1_id.eq.${userId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${userId})`)
    .maybeSingle();

  if (!match) {
    return NextResponse.json({ messages: [], otherProfile: null, viewerTier: "free", viewerId: userId });
  }

  const { data: messages } = await supabase
    .from("message")
    .select("*")
    .eq("match_id", match.id)
    .order("created_at", { ascending: true });

  if (pollOnly) {
    return NextResponse.json({ messages: messages ?? [], viewerId: userId });
  }

  const [otherProfileRes, myProfileRes] = await Promise.all([
    supabase.from("profile").select("*").eq("id", otherUserId).maybeSingle(),
    supabase.from("profile").select("tier").eq("id", userId).maybeSingle(),
  ]);

  return NextResponse.json({
    messages: messages ?? [],
    otherProfile: otherProfileRes.data,
    viewerTier: myProfileRes.data?.tier ?? "free",
    viewerId: userId,
  });
}
