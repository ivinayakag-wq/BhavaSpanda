"use client";

const SW_PATH = "/sw.js";

/** Request browser notification permission. Returns true if granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/** Show a browser notification. Silently fails if permission denied. */
export function showNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, options);
  } catch {
    // fallback safe
  }
}

/** Register the service worker for push + background notifications. */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
    await navigator.serviceWorker.ready;
    return reg;
  } catch {
    return null;
  }
}

/* ───── Tier check ───── */

/** In early offer mode, all tiers can notify. In premium mode, only non-free. */
export function canNotify(tier: string | null | undefined, earlyOffer: boolean = true): boolean {
  if (earlyOffer) return tier !== null && tier !== undefined;
  return tier !== "free" && tier !== null && tier !== undefined;
}

/* ───── Mock notification event bus (Phase 1: no real Supabase) ─── */

const MOCK_SWIPE_EVENT = "mock:swipe";
const MOCK_MESSAGE_EVENT = "mock:message";

/** Dispatch a mock "new swipe" event (called by mockStore on like). */
export function dispatchMockSwipe(fromUserId: string, fromName: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(MOCK_SWIPE_EVENT, { detail: { fromUserId, fromName } }),
  );
}

/** Dispatch a mock "new message" event (called by mockStore on send). */
export function dispatchMockMessage(fromUserId: string, fromName: string, preview: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(MOCK_MESSAGE_EVENT, { detail: { fromUserId, fromName, preview } }),
  );
}

/** Listen for mock swipe events. Returns an unsubscribe function. */
export function onMockSwipe(cb: (data: { fromUserId: string; fromName: string }) => void) {
  const handler = (e: Event) => cb((e as CustomEvent).detail);
  window.addEventListener(MOCK_SWIPE_EVENT, handler);
  return () => window.removeEventListener(MOCK_SWIPE_EVENT, handler);
}

/** Listen for mock message events. Returns an unsubscribe function. */
export function onMockMessage(
  cb: (data: { fromUserId: string; fromName: string; preview: string }) => void,
) {
  const handler = (e: Event) => cb((e as CustomEvent).detail);
  window.addEventListener(MOCK_MESSAGE_EVENT, handler);
  return () => window.removeEventListener(MOCK_MESSAGE_EVENT, handler);
}
