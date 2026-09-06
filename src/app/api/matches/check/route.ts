import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
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

  const supabase = createAdminClient();
  const { data: match } = await supabase
    .from("match")
    .select("id")
    .or(`and(user1_id.eq.${viewerId},user2_id.eq.${profileId}),and(user1_id.eq.${profileId},user2_id.eq.${viewerId})`)
    .maybeSingle();

  return NextResponse.json({ isMatch: !!match });
}
