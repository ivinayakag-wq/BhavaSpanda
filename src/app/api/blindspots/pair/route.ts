import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGroqClient } from "@/lib/groq";
import { requireUser } from "@/lib/auth";

function buildProfileText(profile: any): string {
  const parts: string[] = [];
  if (profile.name) parts.push(`Name: ${profile.name}`);
  if (profile.age) parts.push(`Age: ${profile.age}`);
  if (profile.gender) parts.push(`Gender: ${profile.gender}`);
  if (profile.location) parts.push(`Location: ${profile.location}`);
  if (profile.profession) parts.push(`Profession: ${profile.profession}`);
  if (profile.bio) parts.push(`Bio: ${profile.bio}`);
  if (profile.looking_for) parts.push(`Looking For: ${profile.looking_for}`);
  if (profile.non_negotiable) parts.push(`Non-Negotiables: ${profile.non_negotiable}`);
  if (profile.life_goals) parts.push(`Life Goals: ${profile.life_goals}`);
  if (profile.spiritual_community) parts.push(`Spiritual Community: ${profile.spiritual_community}`);
  if (profile.primary_practice) parts.push(`Primary Practice: ${profile.primary_practice}`);
  if (profile.practice_frequency) parts.push(`Practice Frequency: ${profile.practice_frequency}`);
  if (profile.diet) parts.push(`Diet: ${profile.diet}`);
  if (profile.sun_sign) parts.push(`Sun Sign: ${profile.sun_sign}`);
  if (profile.guru_connection) parts.push(`Guru Connection: ${profile.guru_connection}`);
  if (profile.spiritual_commitment) parts.push(`Spiritual Commitment: ${profile.spiritual_commitment}`);
  return parts.join("\n");
}

function buildPairFallback(p1: any, p2: any): any {
  const p1Name = p1.name?.split(" ")[0] || "Person A";
  const p2Name = p2.name?.split(" ")[0] || "Person B";
  const blindspots: any[] = [];

  if (p1.looking_for && p2.life_goals) {
    blindspots.push({
      name: "Expectations vs Goals",
      description: `${p1Name} is looking for "${p1.looking_for.substring(0, 100)}" but ${p2Name}'s life goals are "${p2.life_goals.substring(0, 100)}". Whether these align needs direct conversation.`,
      suggestion: `Discuss early what each of you expects from this relationship.`,
    });
  }

  if (p1.spiritual_community && p2.spiritual_community && p1.spiritual_community !== p2.spiritual_community) {
    blindspots.push({
      name: "Different Spiritual Communities",
      description: `${p1Name} follows ${p1.spiritual_community} while ${p2Name} follows ${p2.spiritual_community}. Different communities can mean different practices, values, and expectations.`,
      suggestion: `Talk about how you'll navigate differences in spiritual practice and community involvement.`,
    });
  }

  if (blindspots.length === 0) {
    blindspots.push({
      name: "More Data Needed",
      description: `Both profiles need more detail (bio, looking_for, non_negotiables, life_goals) for a meaningful pair analysis.`,
      suggestion: `Both of you should complete your profiles to unlock relationship insights.`,
    });
  }

  return {
    blindspots,
    strengths: [],
    summary: `Based on what both profiles share, here are areas to be aware of.`,
  };
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
    return NextResponse.json({ error: "Both profile1Id and profile2Id required" }, { status: 400 });
  }

  // Verify the requesting user is one of the two profiles
  if (userId !== profile1Id && userId !== profile2Id) {
    return NextResponse.json({ error: "You can only view pair analysis for yourself" }, { status: 403 });
  }

  try {
    const profiles = await prisma.profile.findMany({
      where: { id: { in: [profile1Id, profile2Id] } },
    });

    if (profiles.length < 2) {
      return NextResponse.json({ blindspots: [], strengths: [], summary: "Both profiles needed." });
    }

    const p1 = profiles.find((p) => p.id === profile1Id)!;
    const p2 = profiles.find((p) => p.id === profile2Id)!;

    const cacheKey = [profile1Id, profile2Id].sort().join(":");

    // Check for cached analysis (permanent)
    const existing = await prisma.pairBlindspotAnalysis.findUnique({ where: { profilePair: cacheKey } }).catch(() => null);
    if (existing) {
      return NextResponse.json(existing.analysis);
    }

    const text1 = buildProfileText(p1);
    const text2 = buildProfileText(p2);
    const p1Name = p1.name?.split(" ")[0] || "Person A";
    const p2Name = p2.name?.split(" ")[0] || "Person B";

    const prompt = `You are a direct, practical relationship psychologist. Two people have matched. Analyze both profiles and identify 2-3 PAIR-SPECIFIC BLINDSPOTS — potential friction points based on their actual profile data.

RULES:
- Every blindspot MUST reference specific fields from BOTH profiles
- Use this format: "${p1Name}'s [field] says [X], while ${p2Name}'s [field] says [Y], which could create [Z]"
- Never use generic phrases like "couples often..." or "relationships require..."
- Be specific, direct, and practical
- Also identify 1-2 STRENGTHS based on shared or complementary data
- If profiles have contradictory information, highlight it
- This is not criticism — it's useful awareness for the relationship

${p1Name}'s PROFILE:
${text1}

${p2Name}'s PROFILE:
${text2}

Generate as JSON:
{
  "blindspots": [
    {
      "name": "Clear name",
      "description": "Specific description referencing both profiles' fields",
      "suggestion": "One concrete action"
    }
  ],
  "strengths": [
    "Specific strength referencing both profiles"
  ],
  "summary": "2-3 sentence overall assessment"
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
          strengths: parsed.strengths ?? [],
          summary: parsed.summary ?? "",
        };
      } catch {
        analysis = buildPairFallback(p1, p2);
      }
    } else {
      analysis = buildPairFallback(p1, p2);
    }

    // Store permanently
    await prisma.pairBlindspotAnalysis.upsert({
      where: { profilePair: cacheKey },
      update: { analysis: analysis as any },
      create: { profilePair: cacheKey, analysis: analysis as any },
    }).catch(() => {});

    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json({ blindspots: [], strengths: [], summary: "Could not generate pair analysis." });
  }
}
