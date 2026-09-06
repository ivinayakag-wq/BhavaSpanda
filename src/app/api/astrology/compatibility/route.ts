import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchKundali, fetchAshtakoot, parseBirthDetails } from "@/lib/astrology/api";
import { getSunSignCompatibility } from "@/lib/astrology/compatibility";
import { getGroqClient } from "@/lib/groq";
import { requireUser } from "@/lib/auth";

function buildKundaliSummary(kundali: any, label: string): string {
  const parts: string[] = [`${label}:`];
  parts.push(`Sun Sign: ${kundali.sunSign}`);
  parts.push(`Moon Sign: ${kundali.moonSign}`);
  parts.push(`Nakshatra: ${kundali.nakshatra}`);
  parts.push(`Ascendant: ${kundali.ascendant.sign} (Lord: ${kundali.ascendant.signLord})`);

  if (kundali.planets?.length) {
    parts.push(`Planets:`);
    for (const p of kundali.planets) {
      parts.push(`  ${p.name}: ${p.sign} (House ${p.house}, Nakshatra ${p.nakshatra}, Lord ${p.nakshatraLord}${p.isRetro ? ", Retrograde" : ""})`);
    }
  }
  return parts.join("\n");
}

function buildKootaSummary(kootas: Record<string, any>): string {
  return Object.entries(kootas)
    .map(([name, k]: [string, any]) => `${name}: ${k.score}/${k.maximum} (Bride: ${k.brideValue}, Groom: ${k.groomValue})`)
    .join("\n");
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
    return NextResponse.json({ error: "You can only view compatibility for yourself" }, { status: 403 });
  }

  const cacheKey = [profile1Id, profile2Id].sort().join(":");

  try {
    // ─── Layer 1: Check full pair cache ───
    const cached = await prisma.pairCompatibility.findUnique({ where: { profilePair: cacheKey } }).catch(() => null);
    if (cached) {
      return NextResponse.json(cached.result);
    }

    // ─── Layer 2: Fetch profiles ───
    const profiles = await prisma.profile.findMany({
      where: { id: { in: [profile1Id, profile2Id] } },
    });

    if (profiles.length < 2) {
      return NextResponse.json({
        error: "One or both profiles not found",
        gunaScore: null,
        gunaMax: 36,
        sunCompatibility: null,
        psychologicalInsight: "Both profiles need to be visible for compatibility analysis.",
      }, { status: 404 });
    }

    const p1 = profiles.find((p) => p.id === profile1Id)!;
    const p2 = profiles.find((p) => p.id === profile2Id)!;

    const p1Birth = parseBirthDetails(p1);
    const p2Birth = parseBirthDetails(p2);

    let gunaScore: number | null = null;
    let gunaMax = 36;
    let gunaRecommendation = "Data unavailable";
    let kootas: Record<string, any> = {};
    let p1Astro: any = {};
    let p2Astro: any = {};
    let kundali1Data: any = null;
    let kundali2Data: any = null;

    if (p1Birth && p2Birth) {
      // ─── Layer 3: Check per-profile kundali cache ───
      const [cached1, cached2] = await Promise.all([
        prisma.astrologicalData.findUnique({ where: { profileId: p1.id } }).catch(() => null),
        prisma.astrologicalData.findUnique({ where: { profileId: p2.id } }).catch(() => null),
      ]);

      // Only call Navamsha API for profiles without cached kundali
      let kundali1Promise: Promise<any> = Promise.resolve(cached1?.rawData ?? null);
      let kundali2Promise: Promise<any> = Promise.resolve(cached2?.rawData ?? null);

      if (!cached1?.rawData) {
        kundali1Promise = fetchKundali(p1Birth).catch((err) => {
          console.error("Navamsha API error (p1):", err);
          return null;
        });
      }
      if (!cached2?.rawData) {
        kundali2Promise = fetchKundali(p2Birth).catch((err) => {
          console.error("Navamsha API error (p2):", err);
          return null;
        });
      }

      // Ashtakoot always needs fresh calculation (pair-specific)
      const ashtakootPromise = fetchAshtakoot(p1Birth, p2Birth).catch((err) => {
        console.error("Navamsha Ashtakoot API error:", err);
        return null;
      });

      const [kundali1Raw, kundali2Raw, ashtakoot] = await Promise.all([
        kundali1Promise,
        kundali2Promise,
        ashtakootPromise,
      ]);

      // Process kundali results
      if (kundali1Raw && !cached1?.rawData) {
        // Fresh kundali from API — process and cache
        kundali1Data = kundali1Raw;
        p1Astro = { sunSign: kundali1Data.sunSign, moonSign: kundali1Data.moonSign, nakshatra: kundali1Data.nakshatra, risingSign: kundali1Data.ascendant.sign };

        // Save to per-profile cache
        prisma.astrologicalData.upsert({
          where: { profileId: p1.id },
          update: { sunSign: kundali1Data.sunSign, moonSign: kundali1Data.moonSign, nakshatra: kundali1Data.nakshatra, risingSign: kundali1Data.ascendant.sign, rawData: kundali1Data.rawData },
          create: { profileId: p1.id, sunSign: kundali1Data.sunSign, moonSign: kundali1Data.moonSign, nakshatra: kundali1Data.nakshatra, risingSign: kundali1Data.ascendant.sign, rawData: kundali1Data.rawData },
        }).catch(() => {});

        // Also update profile signs
        prisma.profile.update({
          where: { id: p1.id },
          data: { sun_sign: kundali1Data.sunSign, moon_sign: kundali1Data.moonSign, nakshatra: kundali1Data.nakshatra },
        }).catch(() => {});
      } else if (cached1?.rawData) {
        // Use cached kundali — reconstruct KundaliResult shape
        kundali1Data = {
          sunSign: cached1.sunSign || "",
          moonSign: cached1.moonSign || "",
          nakshatra: cached1.nakshatra || "",
          ascendant: { sign: cached1.risingSign || "", signLord: "", nakshatra: "", nakshatraPada: 0, degree: 0 },
          planets: [],
          rawData: cached1.rawData,
        };
        p1Astro = { sunSign: cached1.sunSign, moonSign: cached1.moonSign, nakshatra: cached1.nakshatra, risingSign: cached1.risingSign };
      }

      if (kundali2Raw && !cached2?.rawData) {
        kundali2Data = kundali2Raw;
        p2Astro = { sunSign: kundali2Data.sunSign, moonSign: kundali2Data.moonSign, nakshatra: kundali2Data.nakshatra, risingSign: kundali2Data.ascendant.sign };

        prisma.astrologicalData.upsert({
          where: { profileId: p2.id },
          update: { sunSign: kundali2Data.sunSign, moonSign: kundali2Data.moonSign, nakshatra: kundali2Data.nakshatra, risingSign: kundali2Data.ascendant.sign, rawData: kundali2Data.rawData },
          create: { profileId: p2.id, sunSign: kundali2Data.sunSign, moonSign: kundali2Data.moonSign, nakshatra: kundali2Data.nakshatra, risingSign: kundali2Data.ascendant.sign, rawData: kundali2Data.rawData },
        }).catch(() => {});

        prisma.profile.update({
          where: { id: p2.id },
          data: { sun_sign: kundali2Data.sunSign, moon_sign: kundali2Data.moonSign, nakshatra: kundali2Data.nakshatra },
        }).catch(() => {});
      } else if (cached2?.rawData) {
        kundali2Data = {
          sunSign: cached2.sunSign || "",
          moonSign: cached2.moonSign || "",
          nakshatra: cached2.nakshatra || "",
          ascendant: { sign: cached2.risingSign || "", signLord: "", nakshatra: "", nakshatraPada: 0, degree: 0 },
          planets: [],
          rawData: cached2.rawData,
        };
        p2Astro = { sunSign: cached2.sunSign, moonSign: cached2.moonSign, nakshatra: cached2.nakshatra, risingSign: cached2.risingSign };
      }

      if (ashtakoot) {
        gunaScore = ashtakoot.effectiveTotalScore;
        gunaRecommendation = ashtakoot.recommendation;
        kootas = ashtakoot.kootas;
      }
    }

    const p1Sun = p1Astro.sunSign || p1.sun_sign || "";
    const p2Sun = p2Astro.sunSign || p2.sun_sign || "";

    let sunCompat = null;
    if (p1Sun && p2Sun) {
      sunCompat = getSunSignCompatibility(p1Sun, p2Sun);
    }

    const p1Moon = p1Astro.moonSign || p1.moon_sign || "";
    const p2Moon = p2Astro.moonSign || p2.moon_sign || "";

    let moonCompat = null;
    if (p1Moon && p2Moon) {
      moonCompat = getSunSignCompatibility(p1Moon, p2Moon);
    }

    // Generate psychological insight using STRUCTURED kundali data
    let psychologicalInsight = "Birth data needed for detailed psychological insight.";

    if (kundali1Data && kundali2Data) {
      try {
        const kundaliSummary1 = buildKundaliSummary(kundali1Data, p1.name?.split(" ")[0] || "Person A");
        const kundaliSummary2 = buildKundaliSummary(kundali2Data, p2.name?.split(" ")[0] || "Person B");
        const kootaSummary = buildKootaSummary(kootas);
        const p1Name = p1.name?.split(" ")[0] || "Person A";
        const p2Name = p2.name?.split(" ")[0] || "Person B";

        const prompt = `You are a Vedic astrology interpreter. You have the STRUCTURED kundali data for two people. Your job is to interpret what this data means for their relationship dynamics.

RULES:
- You are interpreting DATA, not generating astrology. The kundali data is already computed.
- Reference specific planet positions: "${p1Name}'s Moon is in [X nakshatra, House Y], while ${p2Name}'s Moon is in [X nakshatra, House Y]"
- Explain behavioral implications, not planetary positions
- Use the ashtakoot koota scores to explain specific compatibility dimensions
- Never say "Vedic astrology suggests..." — say what the DATA shows
- Be specific: "The Tara koota score is 3/3, meaning [specific implication]"
- 4-5 sentences, grounded and practical

KUNDALI DATA:
${kundaliSummary1}

${kundaliSummary2}

ASHTAKOOT SCORES (Total: ${gunaScore}/${gunaMax}):
${kootaSummary}

Interpret what this means for their relationship:`;

        const groq = getGroqClient();
        const completion = await groq.chat.completions.create({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 500,
        });

        const text = completion.choices[0]?.message?.content?.trim();
        if (text) psychologicalInsight = text;
      } catch {
        psychologicalInsight = `Guna Milan score is ${gunaScore}/${gunaMax} (${gunaRecommendation}). Sun compatibility: ${sunCompat?.score ?? "N/A"}%. Moon compatibility: ${moonCompat?.score ?? "N/A"}%. Both profiles need to be fully complete for deeper analysis.`;
      }
    }

    const result = {
      gunaScore,
      gunaMax,
      gunaRecommendation,
      kootas,
      sunCompatibility: sunCompat,
      moonCompatibility: moonCompat,
      p1: { sunSign: p1Sun, moonSign: p1Moon, nakshatra: p1Astro.nakshatra || p1.nakshatra || "", risingSign: p1Astro.risingSign || "" },
      p2: { sunSign: p2Sun, moonSign: p2Moon, nakshatra: p2Astro.nakshatra || p2.nakshatra || "", risingSign: p2Astro.risingSign || "" },
      psychologicalInsight,
    };

    // ─── Save to pair cache ───
    prisma.pairCompatibility.upsert({
      where: { profilePair: cacheKey },
      update: { result },
      create: { profilePair: cacheKey, result },
    }).catch(() => {});

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Astrology compatibility error:", err);
    return NextResponse.json({
      error: err.message || "Failed to compute compatibility",
      gunaScore: null,
      gunaMax: 36,
      psychologicalInsight: "Could not compute compatibility at this time.",
    }, { status: 500 });
  }
}
