import { NextRequest, NextResponse } from "next/server";
import { createProfile } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let authUser: { id: string; email?: string };
  try {
    authUser = await requireUser();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userId = authUser.id;
  const { phone, email } = await req.json().catch(() => ({}));

  const supabase = createAdminClient();

  let { data: profile } = await supabase
    .from("profile")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    profile = await createProfile(userId, {
      name: email?.split("@")[0] ?? phone ?? "User",
      email: email ?? authUser.email ?? null,
      tier: "free",
    } as any);
  }

  return NextResponse.json({ profile });
}
