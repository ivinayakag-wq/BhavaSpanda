"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, MessageCircle, Heart, User } from "lucide-react";

const navTabs = [
  { id: "home", label: "Home", icon: Home, href: "/dashboard" },
  { id: "messages", label: "Messages", icon: MessageCircle, href: "/messages" },
  { id: "likes", label: "Likes", icon: Heart, href: "/likes" },
  { id: "profile", label: "Profile", icon: User, href: "/profile" },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/messages/unread-count");
        const data = await res.json();
        setUnreadCount(data.count ?? 0);
      } catch {}
    })();
  }, []);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 30, delay: 0.1 }}
        className="pointer-events-auto flex items-center gap-1 rounded-full px-2 py-2"
        style={{
          background: "#1A3A4A",
          boxShadow: "0 8px 32px rgba(26,58,74,0.3)",
          maxWidth: "calc(100vw - 2rem)",
        }}
      >
        {navTabs.map((tab) => {
          const active = isActive(tab.href);
          const badge = tab.id === "messages" ? unreadCount : 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => router.push(tab.href)}
              className="relative flex flex-col items-center gap-0.5 rounded-full px-5 py-2 text-[10px] font-medium transition-colors"
              style={{ color: active ? "#FFFFFF" : "rgba(255,255,255,0.5)", minWidth: "60px" }}
            >
              {active && (
                <motion.div
                  layoutId="activeNavBubble"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <div className="relative flex items-center justify-center">
                <tab.icon className="h-5 w-5" style={{ strokeWidth: active ? 2.5 : 2 }} />
                {badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                    style={{ background: "#FF6B6B" }}
                  >
                    {badge > 99 ? "99+" : badge}
                  </motion.span>
                )}
              </div>
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
}
