import { NextRequest, NextResponse } from "next/server";
import { updateProfile } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { ...data } = body;

  if (data.photos?.length) {
    const photo = data.photos[0];
    if (!photo.startsWith("http")) {
      return NextResponse.json({ error: "Invalid photo URL" }, { status: 400 });
    }
  }

  const profile = await updateProfile(userId, data);
  return NextResponse.json({ profile });
}
