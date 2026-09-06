import { createAdminClient } from "@/lib/supabase-admin";
import { isEarlyOffer, getEarlyOfferLimits, getPremiumLimits } from "./feature-flags";

function supabase() { return createAdminClient(); }

export interface LikeResult {
  liked: boolean;
  matched: boolean;
  blocked: boolean;
}

async function getTierLimits(): Promise<Record<string, { maxLikes: number; canNotify: boolean }>> {
  const earlyOffer = await isEarlyOffer();
  if (earlyOffer) {
    const earlyLimits = await getEarlyOfferLimits();
    return {
      free: { maxLikes: earlyLimits.likes, canNotify: true },
      seeker: { maxLikes: earlyLimits.likes, canNotify: true },
      ultimate: { maxLikes: Infinity, canNotify: true },
    };
  }
  const premiumLimits = await getPremiumLimits();
  return {
    free: { maxLikes: 5, canNotify: false },
    seeker: { maxLikes: premiumLimits.likes, canNotify: true },
    ultimate: { maxLikes: Infinity, canNotify: true },
  };
}

async function checkAndResetDaily(userId: string) {
  const { data: profile } = await supabase()
    .from("Profile")
    .select("tier, daily_likes_used, last_reset_date")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  const today = new Date();
  const lastReset = new Date(profile.last_reset_date);
  const isNewDay =
    lastReset.getDate() !== today.getDate() ||
    lastReset.getMonth() !== today.getMonth() ||
    lastReset.getFullYear() !== today.getFullYear();

  const likesUsed = isNewDay ? 0 : profile.daily_likes_used;
  const tierLimits = await getTierLimits();
  const limits = tierLimits[profile.tier] ?? tierLimits.free;

  return { profile, isNewDay, likesUsed, limits };
}

export async function recordLike(fromUserId: string, toUserId: string): Promise<LikeResult> {
  const reset = await checkAndResetDaily(fromUserId);
  if (!reset) return { liked: false, matched: false, blocked: true };

  if (reset.likesUsed >= reset.limits.maxLikes) {
    return { liked: false, matched: false, blocked: true };
  }

  if (fromUserId === toUserId) {
    return { liked: false, matched: false, blocked: true };
  }

  const { data: existing } = await supabase()
    .from("Connection")
    .select("id, status")
    .eq("from_user_id", fromUserId)
    .eq("to_user_id", toUserId)
    .single();

  if (existing) {
    return { liked: false, matched: false, blocked: false };
  }

  await supabase().from("Connection").insert({
    from_user_id: fromUserId,
    to_user_id: toUserId,
    status: "pending",
  });

  let matched = false;

  const { data: reverseConnection } = await supabase()
    .from("Connection")
    .select("id, status")
    .eq("from_user_id", toUserId)
    .eq("to_user_id", fromUserId)
    .single();

  if (reverseConnection && reverseConnection.status === "pending") {
    matched = true;

    await supabase()
      .from("Connection")
      .update({ status: "accepted" })
      .eq("id", reverseConnection.id);

    const { data: forwardConn } = await supabase()
      .from("Connection")
      .select("id")
      .eq("from_user_id", fromUserId)
      .eq("to_user_id", toUserId)
      .single();

    if (forwardConn) {
      await supabase()
        .from("Connection")
        .update({ status: "accepted" })
        .eq("id", forwardConn.id);
    }

    await supabase().from("Match").insert({
      user1_id: fromUserId,
      user2_id: toUserId,
    });

    const [{ data: fromProfile }, { data: toProfile }] = await Promise.all([
      supabase().from("Profile").select("name").eq("id", fromUserId).single(),
      supabase().from("Profile").select("name").eq("id", toUserId).single(),
    ]);

    await supabase().from("Notification").insert([
      {
        user_id: fromUserId,
        type: "match",
        title: "It's a Match!",
        body: `You and ${toProfile?.name ?? "someone"} have liked each other.`,
        data: { matchedUserId: toUserId },
      },
      {
        user_id: toUserId,
        type: "match",
        title: "It's a Match!",
        body: `You and ${fromProfile?.name ?? "someone"} have liked each other.`,
        data: { matchedUserId: fromUserId },
      },
    ]);
  } else if (reset.limits.canNotify) {
    const { data: fromProfile } = await supabase()
      .from("Profile")
      .select("name")
      .eq("id", fromUserId)
      .single();

    await supabase().from("Notification").insert({
      user_id: toUserId,
      type: "like",
      title: "New Like",
      body: `${fromProfile?.name ?? "Someone"} liked you.`,
      data: { fromUserId },
    });
  }

  const newCount = reset.isNewDay ? 1 : reset.likesUsed + 1;
  await supabase()
    .from("Profile")
    .update({
      daily_likes_used: newCount,
      last_reset_date: new Date().toISOString(),
    })
    .eq("id", fromUserId);

  return { liked: true, matched, blocked: false };
}

export async function recordPass(fromUserId: string, toUserId: string): Promise<void> {
  if (fromUserId === toUserId) return;

  const { data: existing } = await supabase()
    .from("Connection")
    .select("id, status")
    .eq("from_user_id", fromUserId)
    .eq("to_user_id", toUserId)
    .single();

  if (existing) {
    if (existing.status === "pending") {
      await supabase()
        .from("Connection")
        .update({ status: "declined" })
        .eq("id", existing.id);
    }
    return;
  }

  await supabase().from("Connection").insert({
    from_user_id: fromUserId,
    to_user_id: toUserId,
    status: "declined",
  });
}

export async function getExcludedIds(userId: string): Promise<string[]> {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: liked }, { data: passed }, { data: matches }] = await Promise.all([
    supabase()
      .from("Connection")
      .select("to_user_id")
      .eq("from_user_id", userId)
      .eq("status", "pending"),
    supabase()
      .from("Connection")
      .select("to_user_id")
      .eq("from_user_id", userId)
      .eq("status", "declined")
      .gt("created_at", threeDaysAgo),
    supabase()
      .from("Match")
      .select("user1_id, user2_id")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`),
  ]);

  const likedIds = (liked ?? []).map((c: any) => c.to_user_id);
  const passedIds = (passed ?? []).map((c: any) => c.to_user_id);
  const matchIds = (matches ?? [])
    .flatMap((m: any) => [m.user1_id, m.user2_id])
    .filter((id: string) => id !== userId);

  return [...new Set([...likedIds, ...passedIds, ...matchIds])];
}

export async function getLikesCount(userId: string): Promise<number> {
  const { count } = await supabase()
    .from("Connection")
    .select("id", { count: "exact", head: true })
    .eq("to_user_id", userId)
    .eq("status", "pending");

  return count ?? 0;
}

export async function getLikesList(userId: string) {
  const { data: connections } = await supabase()
    .from("Connection")
    .select(`
      id, created_at,
      from_user:Profile!Connection_from_user_id_fkey(
        id, name, age, gender, location, photos, bio, ai_archetype,
        spiritual_community, spiritual_practices, practice_frequency,
        profession, diet, alcohol, smoking, looking_for,
        sun_sign, moon_sign, nakshatra, gotra,
        answers_to_questions, profile_completeness, tier,
        contact_visibility, phone_visible, email_visible, verification_status
      )
    `)
    .eq("to_user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (connections ?? []).map((c: any) => c.from_user);
}
