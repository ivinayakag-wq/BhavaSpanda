"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Heart, MessageCircle } from "lucide-react";
import { canNotify, onMockSwipe, onMockMessage } from "@/lib/notifications";

const COLORS = {
  primary: "#EC4899",
  textPrimary: "#1A1A1A",
  textSecondary: "#8A8A8A",
};

export function useNotifications(userId: string | null, tier: string | null | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId || !canNotify(tier)) return;

    const unsubSwipe = onMockSwipe(({ fromName }) => {
      setUnreadCount((c) => c + 1);
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <Heart className="h-4 w-4" style={{ color: COLORS.primary }} />
            <div>
              <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>New Interest</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>{fromName} is interested in you!</p>
            </div>
            <button type="button" onClick={() => toast.dismiss(t.id)}
              className="ml-auto text-xs underline" style={{ color: COLORS.primary }}>View</button>
          </div>
        ),
        { duration: 5000, style: { padding: "12px 16px" } },
      );
    });

    const unsubMessage = onMockMessage(({ fromName, preview }) => {
      setUnreadCount((c) => c + 1);
      toast(
        (t) => (
          <div className="flex items-center gap-3">
            <MessageCircle className="h-4 w-4" style={{ color: COLORS.primary }} />
            <div>
              <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>Message from {fromName}</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>{preview}</p>
            </div>
            <button type="button" onClick={() => toast.dismiss(t.id)}
              className="ml-auto text-xs underline" style={{ color: COLORS.primary }}>Dismiss</button>
          </div>
        ),
        { duration: 5000, style: { padding: "12px 16px" } },
      );
    });

    return () => { unsubSwipe(); unsubMessage(); };
  }, [userId, tier]);

  return { unreadCount };
}
