"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Heart,
  MessageCircle,
  User,
  Compass,
  Crown,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import SwipeStack from "@/components/swipe/SwipeStack";
import PremiumModal from "@/components/ui/PremiumModal";
import NotificationBell from "@/components/ui/NotificationBell";
import type { ProfileRow } from "@/types/internal";

interface Props {
  isGuest: boolean;
  profile: ProfileRow | null;
  archetypeFromUrl?: string | null;
}

export default function DashboardClient({ isGuest, profile, archetypeFromUrl }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [showPremium, setShowPremium] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showCompletePrompt, setShowCompletePrompt] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/messages/unread-count");
        const data = await res.json();
        if (!cancelled) setUnreadCount(data.count ?? 0);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // Guest handling
  if (isGuest || !profile) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#EBEBEB" }}>
          <h1 className="font-name text-xl text-foreground">Isha Connect</h1>
          <button type="button" onClick={() => router.push("/auth")}
            className="rounded-full px-4 py-1.5 text-xs font-semibold text-white"
            style={{ background: "#EC4899" }}>
            Sign In
          </button>
        </header>
        <main className="flex flex-1 items-center justify-center px-6">
          <div className="flex max-w-sm flex-col items-center gap-6 text-center">
            <Compass className="h-10 w-10" style={{ color: "#EC4899" }} />
            <h2 className="font-name text-2xl text-foreground">Sign In to Continue</h2>
            <p className="text-sm text-muted">Sign in to explore profiles and connect with the community.</p>
            <button type="button" onClick={() => router.push("/auth")}
              className="rounded-full px-8 py-3 text-sm font-semibold text-white"
              style={{ background: "#EC4899" }}>
              Sign In
            </button>
          </div>
        </main>
      </div>
    );
  }

  const profileComplete = profile.is_profile_complete;
  const isPremium = profile.tier === "premium";
  const today = new Date().toDateString();
  const lastReset = profile.last_reset_date
    ? new Date(profile.last_reset_date).toDateString()
    : "";
  const freshDay = today !== lastReset;
  const swipesUsed = freshDay ? 0 : (profile.daily_swipes_used ?? 0);
  const swipesLeft = isPremium ? Infinity : Math.max(0, 15 - swipesUsed);

  const navTabs = [
    { id: "swipe", label: "Swipe", icon: Compass, href: "/dashboard" },
    { id: "matches", label: "Matches", icon: Heart, href: "/matches" },
    { id: "messages", label: "Messages", icon: MessageCircle, href: "/messages", badge: unreadCount },
    { id: "profile", label: "Profile", icon: User, href: "/profile" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Incomplete profile banner */}
      {!profileComplete && (
        <div className="px-4 py-3 text-center text-sm font-medium"
          style={{ background: "rgba(236,103,27,0.08)", color: "#EC4899" }}>
          <AlertTriangle className="mr-1.5 inline h-4 w-4 align-text-bottom" />
          Complete your profile to like, send messages, or connect with others.
        </div>
      )}

      {/* Top bar */}
      <header className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "#EBEBEB" }}>
        <h1 className="font-name text-xl text-foreground">Isha Connect</h1>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            style={{ background: "rgba(236,103,27,0.08)", color: "#EC4899" }}
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-md">
          {/* Welcome + swipe counter */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-body text-lg font-semibold text-foreground">
                {profile.full_name ? `Welcome, ${profile.full_name.split(" ")[0]}` : "Welcome"}
              </h2>
              {!profileComplete && (
                <button
                  type="button"
                  onClick={() => router.push("/onboarding")}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium underline"
                  style={{ color: "#EC4899" }}
                >
                  Complete profile →
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3 w-3" style={{ color: "#EC4899" }} />
                {isPremium ? "∞" : profileComplete ? swipesLeft : "—"}
              </span>
              {/* Premium button hidden during early offer — enable with SHOW_PRICING flag */}
            </div>
          </div>

          {/* Swipe stack */}
          <SwipeStack
            userId={profile.id}
            isPremium={isPremium}
            dailySwipesUsed={swipesUsed}
            profileComplete={profileComplete}
            onSwipeProcessed={function noop() {}}
            onCompleteProfile={() => router.push("/onboarding")}
          />
        </div>
      </main>

      {/* Bottom Nav */}
      <nav
        className="flex items-center justify-around border-t bg-surface px-4 py-2"
        style={{ borderColor: "#EBEBEB" }}
      >
        {navTabs.map((tab) => {
          const active = pathname === tab.href || (tab.id === "swipe" && pathname === "/dashboard");
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => router.push(tab.href)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors"
              style={{ color: active ? "#EC4899" : "#8A8A8A" }}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
              {(tab as any).badge > 0 && (
                <span
                  className="absolute -top-0.5 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                  style={{ background: "#EC4899" }}
                >
                  {(tab as any).badge > 99 ? "99+" : (tab as any).badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
    </div>
  );
}
