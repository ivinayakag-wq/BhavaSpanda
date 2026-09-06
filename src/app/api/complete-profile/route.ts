import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: Record<string, unknown> = await req.json().catch(() => ({}));

  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = { profile_completeness: 100 };
  if (body.full_name != null) updateData.name = body.full_name;
  if (body.age != null) updateData.age = body.age;
  if (body.location != null) updateData.location = body.location;
  if (body.bio != null) updateData.bio = body.bio;
  if (body.diet != null) updateData.diet = body.diet;
  if (body.alcohol != null) updateData.alcohol = body.alcohol;
  if (body.smoking != null) updateData.smoking = body.smoking;
  if (body.zodiac != null) updateData.sun_sign = body.zodiac;
  if (body.spiritual_practices != null) updateData.spiritual_practices = body.spiritual_practices;

  await supabase.from("profile").update(updateData).eq("id", userId);

  return NextResponse.json({ ok: true });
}
