import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
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

  const supabase = createAdminClient();

  const { data: matches } = await supabase
    .from("match")
    .select("id, user1_id, user2_id")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  const matchIds = (matches ?? []).map((m: any) => m.id);

  const { count } = await supabase
    .from("message")
    .select("id", { count: "exact", head: true })
    .in("match_id", matchIds)
    .neq("sender_id", userId)
    .eq("is_read", false);

  return NextResponse.json({ count: count ?? 0 });
}
