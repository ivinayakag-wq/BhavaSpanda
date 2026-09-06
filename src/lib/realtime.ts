"use client";

import { createClient } from "@/lib/supabase-client";
import { onMockSwipe, onMockMessage } from "@/lib/notifications";

/* ------------------------------------------------------------------ */
/*  Phase 2: Real Supabase Realtime subscriptions                     */
/*  (Skeleton — active when NEXT_PUBLIC_SUPABASE_URL is real)         */
/* ------------------------------------------------------------------ */

export function subscribeToSwipes(
  userId: string,
  onNewSwipe: (payload: { swiper_id: string; direction: boolean }) => void,
) {
  const supabase = createClient();

  const channel = supabase
    .channel("swipes-channel")
    .on(
      "postgres_changes" as never,
      {
        event: "INSERT",
        schema: "public",
        table: "swipes",
        filter: `swiped_id=eq.${userId}`,
      },
      (payload: { new: { swiper_id: string; direction: boolean } }) => {
        onNewSwipe(payload.new);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToMessages(
  userId: string,
  onNewMessage: (payload: { sender_id: string; content: string }) => void,
) {
  const supabase = createClient();

  const channel = supabase
    .channel("messages-channel")
    .on(
      "postgres_changes" as never,
      {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
        filter: `receiver_id=eq.${userId}`,
      },
      (payload: { new: { sender_id: string; content: string } }) => {
        onNewMessage(payload.new);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/* ------------------------------------------------------------------ */
/*  Phase 1: Mock notification listeners (used while no real DB)     */
/* ------------------------------------------------------------------ */

/** Subscribes to mock swipe events for the current user.
 *  Returns unsubscribe function. */
export function subscribeToMockSwipes(
  cb: (data: { fromUserId: string; fromName: string }) => void,
) {
  return onMockSwipe(cb);
}

/** Subscribes to mock message events for the current user.
 *  Returns unsubscribe function. */
export function subscribeToMockMessages(
  cb: (data: { fromUserId: string; fromName: string; preview: string }) => void,
) {
  return onMockMessage(cb);
}
