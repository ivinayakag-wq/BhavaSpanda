import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { isEarlyOffer, getEarlyOfferLimits, getPremiumLimits } from "./feature-flags";

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
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { user1_id: true, user2_id: true },
  });
  if (!match) return { ok: false, message: null, blocked: true };

  const receiverId =
    match.user1_id === senderId ? match.user2_id : match.user1_id;

  const profile = await prisma.profile.findUnique({
    where: { id: senderId },
    select: { tier: true, daily_messages_used: true, last_reset_date: true },
  });
  if (!profile) return { ok: false, message: null, blocked: true };

  const today = new Date();
  const lastReset = profile.last_reset_date;
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

  const message = await prisma.message.create({
    data: { match_id: matchId, sender_id: senderId, content: content.trim() },
  });

  await prisma.profile.update({
    where: { id: senderId },
    data: {
      daily_messages_used: isNewDay ? 1 : { increment: 1 },
      last_reset_date: new Date(),
    },
  });

  if (limits.canNotify) {
    const senderProfile = await prisma.profile.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    await prisma.notification.create({
      data: {
        user_id: receiverId,
        type: "message",
        title: "New Message",
        body: `${senderProfile?.name ?? "Someone"}: ${content.trim().slice(0, 80)}`,
        data: { matchId, senderId },
      },
    });
  }

  return { ok: true, message, blocked: false };
}

export async function getMessages(matchId: string) {
  return prisma.message.findMany({
    where: { match_id: matchId },
    orderBy: { created_at: "asc" },
  });
}

export async function getMatches(userId: string) {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ user1_id: userId }, { user2_id: userId }],
    },
    include: {
      messages: { take: 1, orderBy: { created_at: "desc" } },
    },
  });

  const otherIds = matches.map((m) =>
    m.user1_id === userId ? m.user2_id : m.user1_id,
  );

  const profiles = await prisma.profile.findMany({
    where: { id: { in: otherIds } },
    select: {
      id: true,
      name: true,
      age: true,
      location: true,
      photos: true,
      ai_archetype: true,
      tier: true,
    },
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return matches
    .map((m) => {
      const otherId = m.user1_id === userId ? m.user2_id : m.user1_id;
      const other = profileMap.get(otherId);
      const lastMsg = m.messages[0] ?? null;
      return {
        id: m.id,
        created_at: m.created_at,
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
