import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
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

  await prisma.profile.update({
    where: { id: userId },
    data: {
      name: body.full_name as string ?? undefined,
      age: body.age as number ?? undefined,
      location: body.location as string ?? undefined,
      bio: body.bio as string ?? undefined,
      diet: body.diet as string ?? undefined,
      alcohol: body.alcohol as string ?? undefined,
      smoking: body.smoking as string ?? undefined,
      sun_sign: body.zodiac as string ?? undefined,
      spiritual_practices: (body.spiritual_practices as string[]) ?? undefined,
      profile_completeness: 100,
    },
  });

  return NextResponse.json({ ok: true });
}
