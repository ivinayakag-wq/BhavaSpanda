"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, X, Loader2, RefreshCw, Sparkles, Lock, UserPlus } from "lucide-react";
import ProfileCard from "@/components/swipe/ProfileCard";
import PremiumModal from "@/components/ui/PremiumModal";

interface ProfileData {
  id: string;
  full_name: string | null;
  age: number | null;
  bio: string | null;
  zodiac: string | null;
  nakshatra: string | null;
  gotra: string | null;
  answers_to_questions: Record<string, unknown>;
  spiritual_practices: string[];
  ai_archetype: string | null;
  location: string | null;
  profile_pic_url: string | null;
}

interface SwipeStackProps {
  userId: string;
  isPremium: boolean;
  dailySwipesUsed: number;
  profileComplete: boolean;
  onSwipeProcessed: () => void;
  onCompleteProfile: () => void;
}

export default function SwipeStack({
  userId,
  isPremium,
  dailySwipesUsed,
  profileComplete,
  onSwipeProcessed,
  onCompleteProfile,
}: SwipeStackProps) {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPremium, setShowPremium] = useState(false);
  const activeSwipes = useRef(0);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/profiles/feed?userId=${userId}`);
      const data = await res.json();
      setProfiles((data.profiles ?? []).map((p: any) => ({
        id: p.id,
        full_name: p.name ?? "Unknown",
        age: p.age ?? 0,
        bio: p.bio ?? "",
        zodiac: p.sun_sign ?? null,
        nakshatra: null,
        gotra: null,
        answers_to_questions: {},
        spiritual_practices: p.spiritual_practices ?? [],
        ai_archetype: p.ai_archetype ?? null,
        location: p.location ?? "",
        profile_pic_url: p.photos?.[0] ?? null,
        profession: p.profession ?? null,
        spiritual_community: p.spiritual_community ?? null,
      })));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load profiles.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Desktop keyboard controls
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleSwipe("left");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleSwipe("right");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSwipe]);

  const handleSwipe = useCallback(
    async (dir: "left" | "right") => {
      if (!profileComplete) {
        onCompleteProfile();
        return;
      }
      if (profiles.length === 0) return;
      const target = profiles[0];
      if (!target) return;

      if (dir === "right" && !isPremium && dailySwipesUsed + activeSwipes.current >= 15) {
        setShowPremium(true);
        return;
      }

      setSwiping(true);
      activeSwipes.current += 1;

      try {
        const res = await fetch("/api/swipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetId: target.id, direction: dir === "right" }),
        });
        const data = await res.json();

        if (data.blocked) {
          setShowPremium(true);
          setSwiping(false);
          activeSwipes.current -= 1;
          return;
        }

        setProfiles((prev) => prev.slice(1));
        onSwipeProcessed();
      } catch { /* silent */ } finally {
        setSwiping(false);
        activeSwipes.current -= 1;
      }
    },
    [profiles, isPremium, dailySwipesUsed, profileComplete, onCompleteProfile, onSwipeProcessed],
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: "#EC4899", animation: "mandala-spin 1s linear infinite" }} />
          <div className="absolute inset-1.5 rounded-full border-2 border-transparent" style={{ borderBottomColor: "#FF6B6B", animation: "mandala-spin 1.5s linear infinite reverse" }} />
          <div className="absolute inset-3 rounded-full" style={{ background: "radial-gradient(circle, rgba(236,72,153,0.15), transparent 70%)" }} />
        </div>
        <p className="text-xs font-medium" style={{ color: "#8A8A8A" }}>Finding your path...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(239,68,68,0.06)" }}>
          <X className="h-5 w-5" style={{ color: "#DC2626" }} />
        </div>
        <p className="text-sm" style={{ color: "#DC2626" }}>{error}</p>
        <button type="button" onClick={fetchProfiles}
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white"
          style={{ background: "#EC4899" }}>
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.06)" }}>
          <Sparkles className="h-7 w-7" style={{ color: "#EC4899" }} />
        </div>
        <div>
          <h2 className="font-name text-xl font-bold" style={{ color: "#1A1A1A" }}>No More Profiles</h2>
          <p className="mt-1.5 max-w-xs text-sm" style={{ color: "#8A8A8A" }}>
            You&apos;ve seen everyone for now. Check back later!
          </p>
        </div>
        <button type="button" onClick={fetchProfiles}
          className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white"
          style={{ background: "#EC4899" }}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative mx-auto w-full" style={{ height: profileComplete ? 560 : 440 }}>
        {/* Incomplete profile overlay */}
        {!profileComplete && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-[20px]"
            style={{ background: "rgba(250,250,248,0.85)", backdropFilter: "blur(4px)" }}>
            <div className="flex flex-col items-center gap-4 rounded-[20px] px-8 py-10 text-center max-w-xs"
              style={{ background: "#FFFFFF", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.04)" }}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "rgba(236,72,153,0.06)" }}>
                <UserPlus className="h-7 w-7" style={{ color: "#EC4899" }} />
              </div>
              <p className="text-sm font-medium leading-relaxed" style={{ color: "#1A1A1A" }}>
                Complete your profile to like and connect with others
              </p>
              <button
                type="button"
                onClick={onCompleteProfile}
                className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-bold text-white"
                style={{ background: "#EC4899" }}
              >
                <Lock className="h-4 w-4" /> Complete Profile
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {profiles.slice(0, 3).map((p, i) => (
            <ProfileCard
              key={p.id}
              profile={p}
              index={i}
              viewerId={userId}
              viewerTier={isPremium ? "premium" : "free"}
              onSwipe={handleSwipe}
              onOpenPremium={() => setShowPremium(true)}
              profileComplete={profileComplete}
            />
          ))}
        </AnimatePresence>

        {/* Action buttons */}
        {profileComplete && (
          <>
            <div className="absolute -bottom-16 left-0 right-0 z-30 flex items-center justify-center gap-6">
              <motion.button
                type="button"
                onClick={() => handleSwipe("left")}
                disabled={swiping}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-md transition-all disabled:opacity-40"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid #EBEBEB", color: "#8A8A8A", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
              >
                <X className="h-5 w-5" strokeWidth={2.5} />
              </motion.button>

              <motion.button
                type="button"
                onClick={() => handleSwipe("right")}
                disabled={swiping}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex h-16 w-16 items-center justify-center rounded-full text-white transition-all disabled:opacity-40"
                style={{ background: "#FF6B6B", boxShadow: "0 6px 24px rgba(255,107,107,0.35)" }}
              >
                <Heart className="h-6 w-6" fill="white" />
              </motion.button>
            </div>
            {/* Desktop keyboard hint */}
            <div className="absolute -bottom-24 left-0 right-0 flex items-center justify-center gap-3 hidden sm:flex">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium"
                style={{ background: "rgba(0,0,0,0.04)", color: "#8A8A8A" }}>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded border text-[10px] font-bold"
                  style={{ background: "#FFFFFF", borderColor: "#E0E0E0", color: "#666" }}>←</span>
                Pass
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium"
                style={{ background: "rgba(0,0,0,0.04)", color: "#8A8A8A" }}>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded border text-[10px] font-bold"
                  style={{ background: "#FFFFFF", borderColor: "#E0E0E0", color: "#666" }}>→</span>
                Like
              </span>
            </div>
          </>
        )}
      </div>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
    </>
  );
}
