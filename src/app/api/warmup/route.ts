import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminClient();
  await supabase.from("profile").select("id", { count: "exact", head: true });
  return NextResponse.json({ ok: true });
}
