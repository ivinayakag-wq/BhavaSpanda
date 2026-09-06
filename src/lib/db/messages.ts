import { createAdminClient } from "@/lib/supabase-admin";
import { isEarlyOffer, getEarlyOfferLimits, getPremiumLimits } from "./feature-flags";

const supabase = createAdminClient();

async function getTierLimits(): Promise<Record<string, { maxMessages: number; canNotify: boolean }>> {
  const earlyOffer = await isEarlyOffer();
  if (earlyOffer) {
    const earlyLimits = await getEarlyOfferLimits();
    return {
      free: { maxMessages: earlyLimits.messages, canNotify: true },
      seeker: { maxMessages: earlyLimits.messages, canNotify: true },
      ultimate: { maxMessages: Infinity, canNotify: true },
    };
  }
  const premiumLimits = await getPremiumLimits();
  return {
    free: { maxMessages: 3, canNotify: false },
    seeker: { maxMessages: premiumLimits.messages, canNotify: true },
    ultimate: { maxMessages: Infinity, canNotify: true },
  };
}

export async function sendMessage(matchId: string, senderId: string, content: string) {
  const { data: match } = await supabase
    .from("Match")
    .select("user1_id, user2_id")
    .eq("id", matchId)
    .single();
  if (!match) return { ok: false, message: null, blocked: true };

  const receiverId = match.user1_id === senderId ? match.user2_id : match.user1_id;

  const { data: profile } = await supabase
    .from("Profile")
    .select("tier, daily_messages_used, last_reset_date")
    .eq("id", senderId)
    .single();
  if (!profile) return { ok: false, message: null, blocked: true };

  const today = new Date();
  const lastReset = new Date(profile.last_reset_date);
  const isNewDay =
    lastReset.getDate() !== today.getDate() ||
    lastReset.getMonth() !== today.getMonth() ||
    lastReset.getFullYear() !== today.getFullYear();

  const msgsUsed = isNewDay ? 0 : profile.daily_messages_used;
  const tierLimits = await getTierLimits();
  const limits = tierLimits[profile.tier] ?? tierLimits.free;

  if (msgsUsed >= limits.maxMessages) {
    return { ok: false, message: null, blocked: true };
  }

  const { data: message } = await supabase
    .from("Message")
    .insert({ match_id: matchId, sender_id: senderId, content: content.trim() })
    .select()
    .single();

  const newCount = isNewDay ? 1 : msgsUsed + 1;
  await supabase
    .from("Profile")
    .update({
      daily_messages_used: newCount,
      last_reset_date: new Date().toISOString(),
    })
    .eq("id", senderId);

  if (limits.canNotify) {
    const { data: senderProfile } = await supabase
      .from("Profile")
      .select("name")
      .eq("id", senderId)
      .single();

    await supabase.from("Notification").insert({
      user_id: receiverId,
      type: "message",
      title: "New Message",
      body: `${senderProfile?.name ?? "Someone"}: ${content.trim().slice(0, 80)}`,
      data: { matchId, senderId },
    });
  }

  return { ok: true, message, blocked: false };
}

export async function getMessages(matchId: string) {
  const { data } = await supabase
    .from("Message")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  return data ?? [];
}

export async function getMatches(userId: string) {
  const { data: matches } = await supabase
    .from("Match")
    .select(`
      id, created_at, user1_id, user2_id,
      messages:Message(id, content, created_at, sender_id)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (!matches || matches.length === 0) return [];

  const otherIds = matches.map((m: any) =>
    m.user1_id === userId ? m.user2_id : m.user1_id,
  );

  const { data: profiles } = await supabase
    .from("Profile")
    .select("id, name, age, location, photos, ai_archetype, tier")
    .in("id", otherIds);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));

  return matches
    .map((m: any) => {
      const otherId = m.user1_id === userId ? m.user2_id : m.user1_id;
      const other = profileMap.get(otherId);
      const msgs = (m.messages ?? []).sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      const lastMsg = msgs[0] ?? null;

      return {
        id: m.id,
        created_at: new Date(m.created_at),
        other_id: otherId,
        other_name: other?.name ?? null,
        other_age: other?.age ?? null,
        other_location: other?.location ?? null,
        other_photos: other?.photos ?? [],
        other_archetype: other?.ai_archetype ?? null,
        other_tier: other?.tier ?? null,
        last_message: lastMsg?.content ?? null,
        last_message_at: lastMsg?.created_at ?? null,
        last_message_sender_id: lastMsg?.sender_id ?? null,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.last_message_at ?? b.created_at).getTime() -
        new Date(a.last_message_at ?? a.created_at).getTime(),
    );
}
