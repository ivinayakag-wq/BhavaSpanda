/**
 * Server-side Web Push notification module.
 * Early offer mode: all users get notifications.
 * Premium mode: Seeker/Ultimate users get notifications.
 */

import { prisma } from "@/lib/prisma";
import { isEarlyOffer } from "./db/feature-flags";

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

async function getUserTier(userId: string): Promise<string> {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { tier: true },
  });
  return profile?.tier ?? "free";
}

export async function sendNotification(
  userId: string,
  payload: NotificationPayload,
): Promise<void> {
  const [tier, earlyOffer] = await Promise.all([getUserTier(userId), isEarlyOffer()]);

  // Early offer: all users get notifications
  if (earlyOffer) {
    console.log(`[NOTIFICATION] user:${userId} (${tier})`, payload);
    return;
  }

  // Premium mode: only non-free users
  if (tier === "free") {
    return;
  }

  console.log(`[NOTIFICATION] user:${userId} (${tier})`, payload);
}

export async function broadcastNotification(
  userIds: string[],
  payload: NotificationPayload,
): Promise<void> {
  for (const id of userIds) {
    await sendNotification(id, payload);
  }
}
