"use client";

import { useEffect } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (c) => c.charCodeAt(0));
}

/**
 * Registers the service worker for offline caching.
 * In early offer mode, all users get push notifications.
 * In premium mode, only seeker/ultimate users get push notifications.
 */
export default function PwaRegister({ userTier, earlyOffer = true }: { userTier?: string | null; earlyOffer?: boolean }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        if (cancelled) return;

        // Early offer: all users get push notifications
        if (earlyOffer) {
          // Continue to request permission and subscribe
        } else {
          // Premium mode: only seeker/ultimate/premium get push notifications
          if (!userTier || userTier === "free") return;
          const allowed = userTier === "seeker" || userTier === "ultimate" || userTier === "premium";
          if (!allowed) return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted" || cancelled) return;

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) return;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        }).catch(() => {});
      } catch {
        // PWA is a progressive enhancement
      }
    };

    register();
    return () => { cancelled = true; };
  }, [userTier, earlyOffer]);

  return null;
}
