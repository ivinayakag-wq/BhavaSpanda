import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGroqClient } from "@/lib/groq";
import { requireUser } from "@/lib/auth";

function buildProfileSummary(profile: any): string {
  const parts: string[] = [];

  if (profile.name) parts.push(`Name: ${profile.name}`);
  if (profile.age) parts.push(`Age: ${profile.age}`);
  if (profile.gender) parts.push(`Gender: ${profile.gender}`);
  if (profile.location) parts.push(`Location: ${profile.location}`);
  if (profile.profession) parts.push(`Profession: ${profile.profession}`);
  if (profile.education) parts.push(`Education: ${profile.education}`);

  if (profile.spiritual_community) parts.push(`Spiritual Community: ${profile.spiritual_community}`);
  if (profile.primary_practice) parts.push(`Primary Practice: ${profile.primary_practice}`);
  if (profile.practice_frequency) parts.push(`Practice Frequency: ${profile.practice_frequency}`);
  if (profile.years_practicing) parts.push(`Years Practicing: ${profile.years_practicing}`);
  if (profile.guru_connection) parts.push(`Guru Connection: ${profile.guru_connection}`);
  if (profile.spiritual_commitment) parts.push(`Spiritual Commitment: ${profile.spiritual_commitment}`);
  if (profile.life_goals) parts.push(`Life Goals: ${profile.life_goals}`);

  if (profile.bio) parts.push(`Bio: ${profile.bio}`);
  if (profile.looking_for) parts.push(`Looking For: ${profile.looking_for}`);
  if (profile.non_negotiable) parts.push(`Non-Negotiables: ${profile.non_negotiable}`);

  if (profile.diet) parts.push(`Diet: ${profile.diet}`);
  if (profile.alcohol) parts.push(`Alcohol: ${profile.alcohol}`);
  if (profile.smoking !== undefined) parts.push(`Smoking: ${profile.smoking ? "Yes" : "No"}`);
  if (profile.exercise) parts.push(`Exercise: ${profile.exercise}`);

  if (profile.sun_sign) parts.push(`Sun Sign: ${profile.sun_sign}`);
  if (profile.moon_sign) parts.push(`Moon Sign: ${profile.moon_sign}`);
  if (profile.nakshatra) parts.push(`Nakshatra: ${profile.nakshatra}`);
  if (profile.ai_archetype) parts.push(`AI Archetype: ${profile.ai_archetype}`);

  return parts.join("\n");
}

function buildDataDrivenFallback(p1: any, p2: any): string {
  const parts: string[] = [];

  const p1Name = p1.name?.split(" ")[0] || "Person A";
  const p2Name = p2.name?.split(" ")[0] || "Person B";

  // Shared traits
  const shared: string[] = [];
  if (p1.spiritual_community && p1.spiritual_community === p2.spiritual_community) shared.push(`both follow ${p1.spiritual_community}`);
  if (p1.diet && p1.diet === p2.diet) shared.push(`both are ${p1.diet.toLowerCase()}`);
  if (p1.location && p1.location === p2.location) shared.push(`both are in ${p1.location}`);
  if (p1.sun_sign && p1.sun_sign === p2.sun_sign) shared.push(`both are ${p1.sun_sign}`);

  if (shared.length > 0) {
    parts.push(`${p1Name} and ${p2Name} share ${shared.join(", ")}. This creates a natural foundation of shared values and lifestyle compatibility.`);
  }

  // Practice differences
  if (p1.primary_practice && p2.primary_practice && p1.primary_practice !== p2.primary_practice) {
    parts.push(`${p1Name}'s practice is ${p1.primary_practice} while ${p2Name}'s is ${p2.primary_practice}. Different practices can enrich a relationship if both are curious about each other's path.`);
  }

  // Looking for alignment
  if (p1.looking_for && p2.life_goals) {
    parts.push(`${p1Name} is looking for ${p1.looking_for.substring(0, 100)}, and ${p2Name}'s life goals include ${p2.life_goals.substring(0, 100)}. Whether these align is worth exploring early.`);
  }

  if (parts.length === 0) {
    parts.push(`Both profiles have limited data filled in. Complete more of your profiles to get a deeper, more personalized insight into your compatibility.`);
  }

  return parts.join(" ");
}

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { profile1Id, profile2Id } = await req.json();

  if (!profile1Id || !profile2Id) {
    return NextResponse.json({ error: "Both profile1Id and profile2Id are required" }, { status: 400 });
  }

  // Verify the requesting user is one of the two profiles
  if (userId !== profile1Id && userId !== profile2Id) {
    return NextResponse.json({ error: "You can only view insights for yourself" }, { status: 403 });
  }

  try {
    const profiles = await prisma.profile.findMany({
      where: { id: { in: [profile1Id, profile2Id] } },
    });

    if (profiles.length < 2) {
      return NextResponse.json({ insight: "Both profiles need to be visible to generate an insight." });
    }

    const p1 = profiles.find((p) => p.id === profile1Id)!;
    const p2 = profiles.find((p) => p.id === profile2Id)!;

    // Check for cached insight
    const cacheKey = [profile1Id, profile2Id].sort().join(":");
    const existing = await prisma.matchInsight.findUnique({ where: { profilePair: cacheKey } }).catch(() => null);
    if (existing) {
      return NextResponse.json({ insight: existing.insight });
    }

    const summary1 = buildProfileSummary(p1);
    const summary2 = buildProfileSummary(p2);
    const p1Name = p1.name?.split(" ")[0] || "Person A";
    const p2Name = p2.name?.split(" ")[0] || "Person B";

    const prompt = `You are a grounded relationship psychologist. You have two profile summaries. Write a 5-6 sentence insight about why these two people could work together — or where they might struggle.

RULES:
- Every sentence MUST reference a specific field from the profiles (bio, practice, looking_for, profession, location, diet, life_goals, etc.)
- Use this format: "[Name]'s [field] says [X], while [Name]'s [field] says [Y]..."
- Start with what they share (if anything), then what's different, then one practical concern
- Never use generic phrases like "spiritual seekers often..." or "conscious relationships require..."
- If a field is missing, skip it — do not invent or assume
- Be direct, practical, and honest — not fluffy

USER A (${p1Name}):
${summary1}

USER B (${p2Name}):
${summary2}

Write the insight:`;

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    });

    const text = completion.choices[0]?.message?.content?.trim();

    const insight = text || buildDataDrivenFallback(p1, p2);

    // Cache permanently
    await prisma.matchInsight.upsert({
      where: { profilePair: cacheKey },
      update: { insight },
      create: { profilePair: cacheKey, insight },
    }).catch(() => {});

    return NextResponse.json({ insight });
  } catch {
    return NextResponse.json({ insight: "Could not generate insight at this time." });
  }
}
