import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createAdminClient();
  const { data: profiles } = await supabase
    .from("profile")
    .select("id, name, ai_archetype")
    .neq("id", userId)
    .ilike("name", `%${q}%`)
    .limit(10);

  return NextResponse.json({
    results: (profiles ?? []).map((p: any) => ({
      id: p.id,
      full_name: p.name,
      ai_archetype: p.ai_archetype,
    })),
  });
}
