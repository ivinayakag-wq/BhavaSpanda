import { NextRequest, NextResponse } from "next/server";
import { createProfile } from "@/lib/db";
import { prisma } from "@/lib/prisma";
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

  let profile = await prisma.profile.findUnique({ where: { id: userId } });

  if (!profile) {
    profile = await createProfile(userId, {
      name: email?.split("@")[0] ?? phone ?? "User",
      email: email ?? authUser.email ?? null,
      tier: "free",
    } as any);
  }

  return NextResponse.json({ profile });
}
