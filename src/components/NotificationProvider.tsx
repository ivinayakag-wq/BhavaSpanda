"use client";

import { useEffect, useRef, type ReactNode } from "react";
import toast from "react-hot-toast";
import {
  requestNotificationPermission,
  registerServiceWorker,
  showNotification,
  onMockSwipe,
  onMockMessage,
  canNotify,
} from "@/lib/notifications";
import { Heart, MessageCircle } from "lucide-react";

interface Props {
  currentUserId: string | null;
  currentUserTier?: string | null;
  children: ReactNode;
}

export default function NotificationProvider({
  currentUserId,
  currentUserTier,
  children,
}: Props) {
  const inited = useRef(false);
  const tier = currentUserTier ?? null;

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;

    // Register SW + request permission (runs once regardless of tier)
    (async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
        await registerServiceWorker();
      }
    })();
  }, []);

  // Subscribe to events only if user is Seeker or Ultimate
  useEffect(() => {
    if (!currentUserId || !canNotify(tier)) return;

    const unsubSwipe = onMockSwipe(({ fromName }) => {
      showNotification("New Interest", {
        body: `${fromName} is interested in you!`,
        tag: "swipe",
      });
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <Heart className="h-4 w-4" style={{ color: "#EC4899" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>New Interest</p>
              <p className="text-xs" style={{ color: "#8A8A8A" }}>{fromName} is interested in you!</p>
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="ml-auto text-xs underline"
              style={{ color: "#EC4899" }}
            >
              View
            </button>
          </div>
        ),
        { duration: 5000, style: { padding: "12px 16px" } },
      );
    });

    const unsubMessage = onMockMessage(({ fromName, preview }) => {
      showNotification(`Message from ${fromName}`, {
        body: preview,
        tag: "message",
      });
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <MessageCircle className="h-4 w-4" style={{ color: "#EC4899" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>Message from {fromName}</p>
              <p className="text-xs" style={{ color: "#8A8A8A" }}>{preview}</p>
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="ml-auto text-xs underline"
              style={{ color: "#EC4899" }}
            >
              Dismiss
            </button>
          </div>
        ),
        { duration: 5000, style: { padding: "12px 16px" } },
      );
    });

    return () => {
      unsubSwipe();
      unsubMessage();
    };
  }, [currentUserId, tier]);

  return <>{children}</>;
}
