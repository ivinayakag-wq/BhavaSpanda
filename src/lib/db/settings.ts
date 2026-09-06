import { createAdminClient } from "@/lib/supabase-admin";
import { isEarlyOffer, getEarlyOfferLimits, getPremiumLimits } from "./feature-flags";

const supabase = createAdminClient();

export interface SettingsInput {
  message_permission?: "mutual" | "anyone";
  contact_visibility?: "nobody" | "mutual" | "ultimate";
  phone_visible?: boolean;
  email_visible?: boolean;
  notifications_enabled?: boolean;
  swipe_gesture_enabled?: boolean;
}

export async function updateSettings(userId: string, settings: SettingsInput) {
  const data: Record<string, any> = {};
  if (settings.message_permission !== undefined) data.message_permission = settings.message_permission;
  if (settings.contact_visibility !== undefined) data.contact_visibility = settings.contact_visibility;
  if (settings.phone_visible !== undefined) data.phone_visible = settings.phone_visible;
  if (settings.email_visible !== undefined) data.email_visible = settings.email_visible;
  if (settings.notifications_enabled !== undefined) data.notifications_enabled = settings.notifications_enabled;
  if (settings.swipe_gesture_enabled !== undefined) data.swipe_gesture_enabled = settings.swipe_gesture_enabled;

  const { data: updated } = await supabase
    .from("Profile")
    .update(data)
    .eq("id", userId)
    .select("message_permission, contact_visibility, phone_visible, email_visible, notifications_enabled, swipe_gesture_enabled")
    .single();

  return updated;
}

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
  const { data: profile } = await supabase
    .from("Profile")
    .select("tier, daily_likes_used, daily_messages_used, last_reset_date")
    .eq("id", userId)
    .single();

  if (!profile) return { likesRemaining: 0, messagesRemaining: 0, likesUsed: 0, messagesUsed: 0 };

  const today = new Date();
  const lastReset = new Date(profile.last_reset_date);
  const isNewDay =
    lastReset.getDate() !== today.getDate() ||
    lastReset.getMonth() !== today.getMonth() ||
    lastReset.getFullYear() !== today.getFullYear();

  if (isNewDay) {
    await supabase
      .from("Profile")
      .update({
        daily_likes_used: 0,
        daily_messages_used: 0,
        last_reset_date: today.toISOString(),
      })
      .eq("id", userId);

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
