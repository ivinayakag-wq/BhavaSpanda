import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runCompletion } from "@/lib/groq";
import { getSunSignCompatibility, getElement, getNature } from "@/lib/astrology/compatibility";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let userId: string;
    try {
      const user = await requireUser();
      userId = user.id;
    } catch {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { user1_id, user2_id } = await req.json();
    if (!user1_id || !user2_id) {
      return NextResponse.json({ error: "Missing user1_id or user2_id" }, { status: 400 });
    }

    // Verify the requesting user is one of the two profiles
    if (userId !== user1_id && userId !== user2_id) {
      return NextResponse.json({ error: "You can only view compatibility for yourself" }, { status: 403 });
    }

    const [userA, userB] = await Promise.all([
      prisma.profile.findUnique({ where: { id: user1_id } }),
      prisma.profile.findUnique({ where: { id: user2_id } }),
    ]);
    if (!userA || !userB) {
      return NextResponse.json({ error: "One or both profiles not found" }, { status: 404 });
    }

    const sign1 = userA.sun_sign ?? "Unknown";
    const sign2 = userB.sun_sign ?? "Unknown";

    const { score, description: matrixDescription } = getSunSignCompatibility(sign1, sign2);
    const element1 = getElement(sign1);
    const element2 = getElement(sign2);

    const aName = userA.name ?? "User A";
    const bName = userB.name ?? "User B";

    const prompt = `You are a Vedic astrology storyteller. Two people have a Sun Sign compatibility score of ${score}/100.

${aName}: ${sign1} (${element1})
${bName}: ${sign2} (${element2})

Matrix description: ${matrixDescription}

Write 2-3 poetic, insightful sentences explaining their cosmic connection based on THIS score. Do NOT change or recalculate the score. Just narrate the energy between these two signs.

Return ONLY valid JSON — no markdown, no backticks, no extra text:
{
  "insight": "your poetic explanation here"
}`;

    const raw = await runCompletion(prompt);
    const cleaned = raw.replace(/```json?/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned) as { insight: string };

    return NextResponse.json({
      exact_score: String(score),
      insight: parsed.insight ?? matrixDescription,
    });
  } catch {
    const { user1_id, user2_id } = await req.json().catch(() => ({}));
    if (user1_id && user2_id) {
      const [userA, userB] = await Promise.all([
        prisma.profile.findUnique({ where: { id: user1_id } }),
        prisma.profile.findUnique({ where: { id: user2_id } }),
      ]);
      if (userA?.sun_sign && userB?.sun_sign) {
        const { score, description } = getSunSignCompatibility(userA.sun_sign, userB.sun_sign);
        return NextResponse.json({ exact_score: String(score), insight: description });
      }
    }
    return NextResponse.json(
      { exact_score: "50", insight: "Two souls on a shared path." },
      { status: 200 },
    );
  }
}
