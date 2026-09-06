import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { isEarlyOffer, getEarlyOfferLimits, getPremiumLimits } from "./feature-flags";

export interface LikeResult {
  liked: boolean;
  matched: boolean;
  blocked: boolean;
}

const FALLBACK_TIER_LIMITS: Record<string, { maxLikes: number; canNotify: boolean }> = {
  free: { maxLikes: 5, canNotify: false },
  seeker: { maxLikes: 50, canNotify: true },
  ultimate: { maxLikes: Infinity, canNotify: true },
};

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
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { tier: true, daily_likes_used: true, last_reset_date: true },
  });
  if (!profile) return null;

  const today = new Date();
  const lastReset = profile.last_reset_date;
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

  const existing = await prisma.connection.findUnique({
    where: { from_user_id_to_user_id: { from_user_id: fromUserId, to_user_id: toUserId } },
  });

  if (existing) {
    return { liked: false, matched: false, blocked: false };
  }

  await prisma.connection.create({
    data: { from_user_id: fromUserId, to_user_id: toUserId, status: "pending" },
  });

  let matched = false;

  const reverseConnection = await prisma.connection.findUnique({
    where: { from_user_id_to_user_id: { from_user_id: toUserId, to_user_id: fromUserId } },
  });

  if (reverseConnection && reverseConnection.status === "pending") {
    matched = true;

    await prisma.$transaction([
      prisma.connection.update({
        where: { id: reverseConnection.id },
        data: { status: "accepted" },
      }),
      prisma.connection.update({
        where: { from_user_id_to_user_id: { from_user_id: fromUserId, to_user_id: toUserId } },
        data: { status: "accepted" },
      }),
      prisma.match.create({
        data: { user1_id: fromUserId, user2_id: toUserId },
      }),
    ]);

    const [fromProfile, toProfile] = await Promise.all([
      prisma.profile.findUnique({ where: { id: fromUserId }, select: { name: true } }),
      prisma.profile.findUnique({ where: { id: toUserId }, select: { name: true } }),
    ]);

    const notifications: Prisma.NotificationCreateManyInput[] = [
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
    ];

    await prisma.notification.createMany({ data: notifications });
  } else if (reset.limits.canNotify) {
    const fromProfile = await prisma.profile.findUnique({
      where: { id: fromUserId },
      select: { name: true },
    });

    await prisma.notification.create({
      data: {
        user_id: toUserId,
        type: "like",
        title: "New Like",
        body: `${fromProfile?.name ?? "Someone"} liked you.`,
        data: { fromUserId },
      },
    });
  }

  await prisma.profile.update({
    where: { id: fromUserId },
    data: {
      daily_likes_used: reset.isNewDay ? 1 : { increment: 1 },
      last_reset_date: new Date(),
    },
  });

  return { liked: true, matched, blocked: false };
}

export async function recordPass(fromUserId: string, toUserId: string): Promise<void> {
  if (fromUserId === toUserId) return;

  const existing = await prisma.connection.findUnique({
    where: { from_user_id_to_user_id: { from_user_id: fromUserId, to_user_id: toUserId } },
  });

  if (existing) {
    if (existing.status === "pending") {
      await prisma.connection.update({
        where: { id: existing.id },
        data: { status: "declined" },
      });
    }
    return;
  }

  await prisma.connection.create({
    data: { from_user_id: fromUserId, to_user_id: toUserId, status: "declined" },
  });
}

export async function getExcludedIds(userId: string): Promise<string[]> {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const [liked, passed, matches] = await Promise.all([
    prisma.connection.findMany({
      where: { from_user_id: userId, status: "pending" },
      select: { to_user_id: true },
    }),
    prisma.connection.findMany({
      where: {
        from_user_id: userId,
        status: "declined",
        created_at: { gt: threeDaysAgo },
      },
      select: { to_user_id: true },
    }),
    prisma.match.findMany({
      where: { OR: [{ user1_id: userId }, { user2_id: userId }] },
      select: { user1_id: true, user2_id: true },
    }),
  ]);

  const likedIds = liked.map((c) => c.to_user_id);
  const passedIds = passed.map((c) => c.to_user_id);
  const matchIds = matches.flatMap((m) => [m.user1_id, m.user2_id]).filter((id) => id !== userId);

  return [...new Set([...likedIds, ...passedIds, ...matchIds])];
}

export async function getLikesCount(userId: string): Promise<number> {
  return prisma.connection.count({
    where: { to_user_id: userId, status: "pending" },
  });
}

export async function getLikesList(userId: string) {
  const connections = await prisma.connection.findMany({
    where: { to_user_id: userId, status: "pending" },
    include: {
      from_user: {
        select: {
          id: true,
          name: true,
          age: true,
          gender: true,
          location: true,
          photos: true,
          bio: true,
          ai_archetype: true,
          spiritual_community: true,
          spiritual_practices: true,
          practice_frequency: true,
          profession: true,
          diet: true,
          alcohol: true,
          smoking: true,
          looking_for: true,
          sun_sign: true,
          moon_sign: true,
          nakshatra: true,
          gotra: true,
          answers_to_questions: true,
          profile_completeness: true,
          tier: true,
          contact_visibility: true,
          phone_visible: true,
          email_visible: true,
          verification_status: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return connections.map((c) => c.from_user);
}
