import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGroqClient } from "@/lib/groq";
import { requireUser } from "@/lib/auth";

function buildProfileText(profile: any): string {
  const sections: string[] = [];

  if (profile.name) sections.push(`Name: ${profile.name}`);
  if (profile.age) sections.push(`Age: ${profile.age}`);
  if (profile.gender) sections.push(`Gender: ${profile.gender}`);
  if (profile.location) sections.push(`Location: ${profile.location}`);
  if (profile.bio) sections.push(`Bio: ${profile.bio}`);
  if (profile.about_me) sections.push(`About Me: ${profile.about_me}`);
  if (profile.looking_for) sections.push(`Looking For: ${profile.looking_for}`);
  if (profile.non_negotiable) sections.push(`Non-Negotiables: ${profile.non_negotiable}`);
  if (profile.guru_connection) sections.push(`Guru Connection: ${profile.guru_connection}`);
  if (profile.spiritual_commitment) sections.push(`Spiritual Commitment: ${profile.spiritual_commitment}`);
  if (profile.life_goals) sections.push(`Life Goals: ${profile.life_goals}`);
  if (profile.profession) sections.push(`Profession: ${profile.profession}`);
  if (profile.education) sections.push(`Education: ${profile.education}`);
  if (profile.spiritual_community) sections.push(`Spiritual Community: ${profile.spiritual_community}`);
  if (profile.primary_practice) sections.push(`Primary Practice: ${profile.primary_practice}`);
  if (profile.practice_frequency) sections.push(`Practice Frequency: ${profile.practice_frequency}`);
  if (profile.diet) sections.push(`Diet: ${profile.diet}`);
  if (profile.exercise) sections.push(`Exercise: ${profile.exercise}`);
  if (profile.sun_sign) sections.push(`Sun Sign: ${profile.sun_sign}`);
  if (profile.ai_archetype) sections.push(`AI Archetype: ${profile.ai_archetype}`);

  return sections.join("\n");
}

function hasEnoughData(profile: any): boolean {
  const fields = [
    profile.bio, profile.about_me, profile.looking_for,
    profile.non_negotiable, profile.guru_connection,
    profile.spiritual_commitment, profile.life_goals,
  ];
  return fields.filter(Boolean).length >= 3;
}

function buildDataDrivenBlindspots(profile: any): any {
  const blindspots: any[] = [];
  const name = profile.name?.split(" ")[0] || "You";

  if (profile.looking_for && profile.non_negotiable) {
    blindspots.push({
      name: "Looking For vs Non-Negotiables Gap",
      description: `${name} says they're looking for "${profile.looking_for.substring(0, 120)}" but their non-negotiables are "${profile.non_negotiable.substring(0, 120)}". These may not always align — worth examining whether the ideal partner description matches the stated boundaries.`,
      suggestion: `Review whether your non-negotiables actually support or contradict what you say you're looking for.`,
    });
  }

  if (profile.spiritual_commitment && profile.practice_frequency) {
    blindspots.push({
      name: "Commitment vs Practice Alignment",
      description: `${name} describes their spiritual commitment as "${profile.spiritual_commitment}" but their practice frequency is "${profile.practice_frequency}". A gap here could create friction in a relationship with someone at a different level.`,
      suggestion: `Be honest about whether your practice matches your stated commitment level.`,
    });
  }

  if (blindspots.length === 0) {
    blindspots.push({
      name: "Incomplete Self-Profile",
      description: `${name} hasn't filled in enough detail (bio, looking_for, non-negotiables, life_goals) for a meaningful blindspot analysis.`,
      suggestion: `Complete more profile sections to unlock personalized relationship insights.`,
    });
  }

  return {
    blindspots,
    summary: blindspots.length > 0
      ? `Based on what ${name} has shared, these are the key areas to be aware of.`
      : `Complete your profile with bio, looking_for, non_negotiables, and life_goals to get personalized blindspot insights.`,
  };
}

export async function POST(req: NextRequest) {
  let profileId: string;
  try {
    const user = await requireUser();
    profileId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!hasEnoughData(profile)) {
      return NextResponse.json(buildDataDrivenBlindspots(profile));
    }

    // Check for existing insight (permanent, not 24h)
    const existing = await prisma.blindspotAnalysis.findUnique({ where: { profileId } }).catch(() => null);
    if (existing) {
      return NextResponse.json(existing.analysis as any);
    }

    const profileText = buildProfileText(profile);
    const name = profile.name?.split(" ")[0] || "this person";

    const prompt = `You are a direct, practical relationship psychologist. Analyze this person's profile and identify 2-3 RELATIONSHIP BLINDSPOTS — specific patterns in how they present themselves that could create friction in a partnership.

RULES:
- Every blindspot MUST reference a specific field from the profile
- Use this format: "Your [field] says [X], which suggests [Y pattern], and this could cause [Z] in a relationship"
- Never use generic phrases like "spiritual seekers often..." or "many people struggle with..."
- Be specific, direct, and practical — not gentle or vague
- Each blindspot must include: name, description (referencing the field), and one concrete suggestion
- If the profile has contradictory information (e.g., looking_for vs non_negotiables), highlight that
- This is not criticism — it's useful self-awareness

PROFILE DATA:
${profileText}

Generate 2-3 blindspots as JSON:
{
  "blindspots": [
    {
      "name": "Clear name for the pattern",
      "description": "Specific description referencing profile fields",
      "suggestion": "One concrete action"
    }
  ],
  "summary": "2-3 sentence summary referencing their specific profile"
}`;

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });

    const text = completion.choices[0]?.message?.content?.trim();

    let analysis: any;
    if (text) {
      try {
        const parsed = JSON.parse(text);
        analysis = {
          blindspots: parsed.blindspots ?? [],
          summary: parsed.summary ?? "",
        };
      } catch {
        analysis = buildDataDrivenBlindspots(profile);
      }
    } else {
      analysis = buildDataDrivenBlindspots(profile);
    }

    // Store permanently
    await prisma.blindspotAnalysis.upsert({
      where: { profileId },
      update: { analysis: analysis as any, generatedAt: new Date() },
      create: { profileId, analysis: analysis as any },
    }).catch((e: any) => console.warn("Could not persist blindspot (table may not exist):", e.message));

    return NextResponse.json(analysis);
  } catch (err: any) {
    console.error("Blindspot analysis error:", err);
    return NextResponse.json({ blindspots: [], summary: "Could not generate analysis at this time." });
  }
}

export async function GET(req: NextRequest) {
  let profileId: string;
  try {
    const user = await requireUser();
    profileId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const analysis = await prisma.blindspotAnalysis.findUnique({ where: { profileId } }).catch(() => null);

    if (!analysis) {
      return NextResponse.json({ blindspots: [], summary: "No analysis yet. Complete your profile to generate insights.", needsMoreData: true });
    }

    return NextResponse.json(analysis.analysis as any);
  } catch {
    return NextResponse.json({ blindspots: [], summary: "No analysis yet. Complete your profile to generate insights.", needsMoreData: true });
  }
}
