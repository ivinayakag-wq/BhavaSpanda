"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, X, Heart, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToMockSwipes, subscribeToMockMessages } from "@/lib/realtime";

interface Notification {
  id: string;
  type: "swipe" | "message";
  title: string;
  body: string;
  timestamp: number;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const addNotif = useCallback((n: Notification) => {
    setNotifications((prev) => [n, ...prev].slice(0, 20));
  }, []);

  const removeNotif = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    const unsubSwipe = subscribeToMockSwipes(({ fromName }) => {
      addNotif({
        id: `swipe-${Date.now()}`,
        type: "swipe",
        title: "New Interest",
        body: `${fromName} is interested in you!`,
        timestamp: Date.now(),
      });
    });
    const unsubMessage = subscribeToMockMessages(({ fromName, preview }) => {
      addNotif({
        id: `msg-${Date.now()}`,
        type: "message",
        title: `Message from ${fromName}`,
        body: preview,
        timestamp: Date.now(),
      });
    });
    return () => { unsubSwipe(); unsubMessage(); };
  }, [addNotif]);

  const unread = notifications.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors"
        style={{ background: "rgba(236,103,27,0.08)", color: "#EC4899" }}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
            style={{ background: "#EC4899" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute right-0 top-12 z-50 w-80 rounded-2xl border shadow-lg"
              style={{ borderColor: "#EBEBEB", background: "#FFFFFF" }}
            >
              <div className="border-b px-4 py-3" style={{ borderColor: "#EBEBEB" }}>
                <h3 className="font-body text-sm font-semibold" style={{ color: "#1A1A1A" }}>
                  Notifications
                </h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                    <Bell className="h-6 w-6" style={{ color: "rgba(236,103,27,0.3)" }} />
                    <p className="text-xs" style={{ color: "#8A8A8A" }}>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 border-b px-4 py-3 last:border-0"
                      style={{ borderColor: "#EBEBEB" }}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                        style={{ background: n.type === "swipe" ? "rgba(236,103,27,0.08)" : "rgba(249,168,108,0.2)" }}>
                        {n.type === "swipe" ? (
                          <Heart className="h-3.5 w-3.5" style={{ color: "#EC4899" }} />
                        ) : (
                          <MessageCircle className="h-3.5 w-3.5" style={{ color: "#EC4899" }} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>{n.title}</p>
                        <p className="truncate text-xs" style={{ color: "#8A8A8A" }}>{n.body}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNotif(n.id)}
                        className="flex-shrink-0"
                        style={{ color: "#8A8A8A" }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
