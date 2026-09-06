import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

  const profiles = await prisma.profile.findMany({
    where: {
      id: { not: userId },
      name: { contains: q, mode: "insensitive" },
    },
    select: { id: true, name: true, ai_archetype: true },
    take: 10,
  });

  return NextResponse.json({
    results: profiles.map((p) => ({
      id: p.id,
      full_name: p.name,
      ai_archetype: p.ai_archetype,
    })),
  });
}
