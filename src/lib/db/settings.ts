import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { isEarlyOffer, getEarlyOfferLimits, getPremiumLimits } from "./feature-flags";

export interface SettingsInput {
  message_permission?: "mutual" | "anyone";
  contact_visibility?: "nobody" | "mutual" | "ultimate";
  phone_visible?: boolean;
  email_visible?: boolean;
  notifications_enabled?: boolean;
  swipe_gesture_enabled?: boolean;
}

export async function updateSettings(userId: string, settings: SettingsInput) {
  const data: Prisma.ProfileUpdateInput = {};
  if (settings.message_permission !== undefined) data.message_permission = settings.message_permission;
  if (settings.contact_visibility !== undefined) data.contact_visibility = settings.contact_visibility;
  if (settings.phone_visible !== undefined) data.phone_visible = settings.phone_visible;
  if (settings.email_visible !== undefined) data.email_visible = settings.email_visible;
  if (settings.notifications_enabled !== undefined) data.notifications_enabled = settings.notifications_enabled;
  if (settings.swipe_gesture_enabled !== undefined) data.swipe_gesture_enabled = settings.swipe_gesture_enabled;

  return prisma.profile.update({
    where: { id: userId },
    data,
    select: {
      message_permission: true,
      contact_visibility: true,
      phone_visible: true,
      email_visible: true,
      notifications_enabled: true,
      swipe_gesture_enabled: true,
    },
  });
}

const FALLBACK_TIER_LIMITS: Record<string, { maxLikes: number; maxMessages: number }> = {
  free: { maxLikes: 5, maxMessages: 3 },
  seeker: { maxLikes: 50, maxMessages: 10 },
  ultimate: { maxLikes: Infinity, maxMessages: Infinity },
};

async function getTierLimits(): Promise<Record<string, { maxLikes: number; maxMessages: number }>> {
  const earlyOffer = await isEarlyOffer();
  if (earlyOffer) {
    const earlyLimits = await getEarlyOfferLimits();
    return {
      free: { maxLikes: earlyLimits.likes, maxMessages: earlyLimits.messages },
      seeker: { maxLikes: earlyLimits.likes, maxMessages: earlyLimits.messages },
      ultimate: { maxLikes: Infinity, maxMessages: Infinity },
    };
  }
  const premiumLimits = await getPremiumLimits();
  return {
    free: { maxLikes: 5, maxMessages: 3 },
    seeker: { maxLikes: premiumLimits.likes, maxMessages: premiumLimits.messages },
    ultimate: { maxLikes: Infinity, maxMessages: Infinity },
  };
}

export async function checkDailyLimits(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { tier: true, daily_likes_used: true, daily_messages_used: true, last_reset_date: true },
  });
  if (!profile) return { likesRemaining: 0, messagesRemaining: 0, likesUsed: 0, messagesUsed: 0 };

  const today = new Date();
  const lastReset = profile.last_reset_date;
  const isNewDay =
    lastReset.getDate() !== today.getDate() ||
    lastReset.getMonth() !== today.getMonth() ||
    lastReset.getFullYear() !== today.getFullYear();

  if (isNewDay) {
    await prisma.profile.update({
      where: { id: userId },
      data: { daily_likes_used: 0, daily_messages_used: 0, last_reset_date: today },
    });

    const tierLimits = await getTierLimits();
    const limits = tierLimits[profile.tier] ?? tierLimits.free;
    return { likesRemaining: limits.maxLikes, messagesRemaining: limits.maxMessages, likesUsed: 0, messagesUsed: 0 };
  }

  const tierLimits = await getTierLimits();
  const limits = tierLimits[profile.tier] ?? tierLimits.free;
  return {
    likesRemaining: Math.max(0, limits.maxLikes - profile.daily_likes_used),
    messagesRemaining: Math.max(0, limits.maxMessages - profile.daily_messages_used),
    likesUsed: profile.daily_likes_used,
    messagesUsed: profile.daily_messages_used,
  };
}
