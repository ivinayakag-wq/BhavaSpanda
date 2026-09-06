import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
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
    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("Profile")
      .select("*")
      .eq("id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const birth = parseBirthDetails(profile);
    if (!birth) {
      return NextResponse.json({ error: "Birth details incomplete" }, { status: 400 });
    }

    const kundali = await fetchKundali(birth);

    await supabase
      .from("Profile")
      .update({
        sun_sign: kundali.sunSign,
        moon_sign: kundali.moonSign,
        nakshatra: kundali.nakshatra,
      })
      .eq("id", userId);

    await supabase.from("AstrologicalData").upsert(
      {
        profileId: userId,
        sunSign: kundali.sunSign,
        moonSign: kundali.moonSign,
        nakshatra: kundali.nakshatra,
        risingSign: kundali.ascendant.sign,
        rawData: kundali.rawData as any,
      },
      { onConflict: "profileId" }
    );

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
