import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getProfiles, type FilterCriteria } from "@/lib/db";
import { checkDailyLimits } from "@/lib/db/settings";
import { getExcludedIds } from "@/lib/db/connections";
import { DEMO_PROFILES } from "@/lib/demo-profiles";
import { requireUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  let userId: string;
  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode") || "keyword";

  const [user, limits, excludedIds] = await Promise.all([
    getCurrentUser(userId),
    checkDailyLimits(userId),
    getExcludedIds(userId),
  ]);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (mode === "semantic") {
    try {
      const res = await fetch(
        `${req.nextUrl.origin}/api/matches/semantic?profileId=${userId}&limit=20`
      );
      const data = await res.json();
      return NextResponse.json({
        user,
        profiles: data.matches ?? [],
        likesRemaining: limits.likesRemaining,
        messagesRemaining: limits.messagesRemaining,
        semantic: data.semantic ?? false,
        matchMethod: data.method ?? "fallback",
      });
    } catch {
      // fall through to keyword matching
    }
  }

  const filters: FilterCriteria = {};
  const gender = searchParams.get("gender");
  const location = searchParams.get("location");
  const community = searchParams.get("community");
  const diet = searchParams.get("diet");
  const minAge = searchParams.get("minAge");
  const maxAge = searchParams.get("maxAge");

  if (gender) filters.gender = gender;
  if (location) filters.location = location;
  if (community) filters.community = community;
  if (diet) filters.diet = diet;
  if (minAge) filters.ageMin = parseInt(minAge);
  if (maxAge) filters.ageMax = parseInt(maxAge);

  let profiles = await getProfiles([userId, ...excludedIds], filters);

  // Always prepend demo profiles so there's rich content to browse
  const demoProfiles = DEMO_PROFILES as any;
  profiles = [...demoProfiles, ...profiles.filter((p: any) => !p.id?.startsWith("demo-"))];

  return NextResponse.json({
    user,
    profiles,
    likesRemaining: limits.likesRemaining,
    messagesRemaining: limits.messagesRemaining,
    semantic: false,
    matchMethod: "keyword",
  }, {
    headers: { "Cache-Control": "private, max-age=120" },
  });
}
