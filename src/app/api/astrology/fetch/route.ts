import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchKundali, parseBirthDetails } from "@/lib/astrology/api";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({ where: { id: userId } });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const birth = parseBirthDetails(profile);
    if (!birth) {
      return NextResponse.json({ error: "Birth details incomplete" }, { status: 400 });
    }

    const kundali = await fetchKundali(birth);

    await prisma.profile.update({
      where: { id: userId },
      data: {
        sun_sign: kundali.sunSign,
        moon_sign: kundali.moonSign,
        nakshatra: kundali.nakshatra,
      },
    });

    await prisma.astrologicalData.upsert({
      where: { profileId: userId },
      update: {
        sunSign: kundali.sunSign,
        moonSign: kundali.moonSign,
        nakshatra: kundali.nakshatra,
        risingSign: kundali.ascendant.sign,
        rawData: kundali.rawData as any,
      },
      create: {
        profileId: userId,
        sunSign: kundali.sunSign,
        moonSign: kundali.moonSign,
        nakshatra: kundali.nakshatra,
        risingSign: kundali.ascendant.sign,
        rawData: kundali.rawData as any,
      },
    });

    return NextResponse.json({
      success: true,
      sunSign: kundali.sunSign,
      moonSign: kundali.moonSign,
      nakshatra: kundali.nakshatra,
      risingSign: kundali.ascendant.sign,
    });
  } catch (err: any) {
    console.error("Astrology fetch error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch astrology data" }, { status: 500 });
  }
}
