import { createAdminClient } from "@/lib/supabase-admin";
import { isEarlyOffer } from "./db/feature-flags";

function supabase() { return createAdminClient(); }

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

async function getUserTier(userId: string): Promise<string> {
  const { data: profile } = await supabase()
    .from("Profile")
    .select("tier")
    .eq("id", userId)
    .single();
  return profile?.tier ?? "free";
}

export async function sendNotification(
  userId: string,
  payload: NotificationPayload,
): Promise<void> {
  const [tier, earlyOffer] = await Promise.all([getUserTier(userId), isEarlyOffer()]);

  if (earlyOffer) {
    console.log(`[NOTIFICATION] user:${userId} (${tier})`, payload);
    return;
  }

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
