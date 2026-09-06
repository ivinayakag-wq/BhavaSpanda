"use client";

import { useState, memo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { MapPin, BadgeCheck } from "lucide-react";

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
  ai_score?: number | null;
  profession?: string | null;
  spiritual_community?: string | null;
}

export default memo(function ProfileCard({
  profile,
  onSwipe,
  onOpenProfile,
  index,
  profileComplete = true,
  swipeEnabled = true,
}: {
  profile: ProfileData;
  viewerId: string;
  viewerTier: "free" | "premium";
  onSwipe: (direction: "left" | "right") => void;
  onOpenPremium: () => void;
  onOpenProfile?: () => void;
  index: number;
  profileComplete?: boolean;
  swipeEnabled?: boolean;
}) {
  if (!swipeEnabled) return <StaticCard profile={profile} onSwipe={onSwipe} onOpenProfile={onOpenProfile} index={index} />;
  return <DragCard profile={profile} onSwipe={onSwipe} onOpenProfile={onOpenProfile} index={index} />;
});

function DragCard({
  profile,
  onSwipe,
  onOpenProfile,
  index,
}: {
  profile: ProfileData;
  onSwipe: (direction: "left" | "right") => void;
  onOpenProfile?: () => void;
  index: number;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-400, 0, 400], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, 0], [1, 0]);

  const [dragging, setDragging] = useState(false);

  const primaryPractice = profile.spiritual_practices?.[0] ?? null;
  const community = profile.spiritual_community ?? null;

  function fireSwipe(dir: "left" | "right") {
    const dist = dir === "right" ? 600 : -600;
    animate(x, dist, { duration: 0.35, ease: [0.32, 0.72, 0, 1] }).then(() => onSwipe(dir));
  }

  return (
    <motion.div
      drag="x"
      dragElastic={1}
      onDragStart={() => setDragging(true)}
      onDragEnd={(_, info) => {
        setDragging(false);
        const threshold = 80;
        if (info.offset.x > threshold) {
          fireSwipe("right");
        } else if (info.offset.x < -threshold) {
          fireSwipe("left");
        } else {
          animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
        }
      }}
      onTap={() => { if (!dragging) onOpenProfile?.(); }}
      style={{ x, rotate, touchAction: "none", background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.04)" }}
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{
        x: x.get() > 0 ? 600 : -600,
        opacity: 0,
        rotate: x.get() > 0 ? 15 : -15,
        transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`absolute inset-0 select-none overflow-hidden rounded-[20px] ${
        index === 0
          ? "z-20 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
          : index === 1
            ? "z-10 scale-[0.96] -translate-y-2 opacity-70"
            : "z-0 scale-[0.92] -translate-y-4 opacity-40"
      }`}
    >
      <CardContent profile={profile} primaryPractice={primaryPractice} community={community} />
      <motion.div style={{ opacity: likeOpacity }}
        className="absolute inset-0 z-30 flex items-start justify-center pt-16 pointer-events-none">
        <span className="rounded-2xl border-4 border-green-400 px-6 py-2 text-3xl font-black text-green-400 rotate-[-15deg] drop-shadow-lg"
          style={{ background: "rgba(255,255,255,0.85)" }}>LIKE</span>
      </motion.div>
      <motion.div style={{ opacity: passOpacity }}
        className="absolute inset-0 z-30 flex items-start justify-center pt-16 pointer-events-none">
        <span className="rounded-2xl border-4 border-red-400 px-6 py-2 text-3xl font-black text-red-400 rotate-[15deg] drop-shadow-lg"
          style={{ background: "rgba(255,255,255,0.85)" }}>NOPE</span>
      </motion.div>
    </motion.div>
  );
}

function StaticCard({
  profile,
  onSwipe,
  onOpenProfile,
  index,
}: {
  profile: ProfileData;
  onSwipe: (direction: "left" | "right") => void;
  onOpenProfile?: () => void;
  index: number;
}) {
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const primaryPractice = profile.spiritual_practices?.[0] ?? null;
  const community = profile.spiritual_community ?? null;

  function fireSwipe(dir: "left" | "right") {
    setExiting(dir);
    setTimeout(() => onSwipe(dir), 350);
  }

  return (
    <div
      onClick={() => { if (!exiting) onOpenProfile?.(); }}
      style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.04)" }}
      className={`absolute inset-0 select-none overflow-hidden rounded-[20px] transition-all duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
        exiting === "right" ? "translate-x-[600px] -rotate-12 opacity-0" :
        exiting === "left" ? "-translate-x-[600px] rotate-12 opacity-0" :
        index === 0
          ? "z-20 shadow-[0_8px_40px_rgba(0,0,0,0.12)]"
          : index === 1
            ? "z-10 scale-[0.96] -translate-y-2 opacity-70"
            : "z-0 scale-[0.92] -translate-y-4 opacity-40"
      }`}
    >
      <CardContent profile={profile} primaryPractice={primaryPractice} community={community} />
      {exiting === "right" && (
        <div className="absolute inset-0 z-30 flex items-start justify-center pt-16 pointer-events-none">
          <span className="rounded-2xl border-4 border-green-400 px-6 py-2 text-3xl font-black text-green-400 rotate-[-15deg] drop-shadow-lg"
            style={{ background: "rgba(255,255,255,0.85)" }}>LIKE</span>
        </div>
      )}
      {exiting === "left" && (
        <div className="absolute inset-0 z-30 flex items-start justify-center pt-16 pointer-events-none">
          <span className="rounded-2xl border-4 border-red-400 px-6 py-2 text-3xl font-black text-red-400 rotate-[15deg] drop-shadow-lg"
            style={{ background: "rgba(255,255,255,0.85)" }}>NOPE</span>
        </div>
      )}
    </div>
  );
}

function CardContent({
  profile,
  primaryPractice,
  community,
}: {
  profile: ProfileData;
  primaryPractice: string | null;
  community: string | null;
}) {
  return (
    <>
      <div className="absolute inset-0 bg-[#F2F1EE]">
        {profile.profile_pic_url ? (
          <img
            src={profile.profile_pic_url}
            alt={profile.full_name ?? ""}
            className="h-full w-full object-cover"
            draggable={false}
            loading="eager"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-7xl opacity-20">🕉️</span>
          </div>
        )}
      </div>
      <div className="absolute inset-0 gradient-overlay-bottom" />
      {community && (
        <div className="absolute top-4 right-4 z-10">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold backdrop-blur-md"
            style={{ background: "rgba(255,107,107,0.9)", color: "#FFFFFF", boxShadow: "0 2px 12px rgba(255,107,107,0.3)" }}
          >
            🕉️ {community}
          </span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-5 pb-6">
        <div className="flex items-center gap-2 text-white">
          <h2 className="font-name text-[22px] font-bold leading-tight drop-shadow-lg">
            {profile.full_name ?? "Anonymous"}
          </h2>
          {profile.age && (
            <span className="text-base font-medium leading-tight drop-shadow-lg opacity-90">{profile.age}</span>
          )}
          <BadgeCheck className="h-4.5 w-4.5 text-white drop-shadow-lg" fill="rgba(255,255,255,0.2)" />
        </div>
        {profile.profession && (
          <p className="mt-1 text-xs font-medium text-white/80 drop-shadow-md">
            {profile.profession}
          </p>
        )}
        {profile.location && (
          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-white/70 drop-shadow-md">
            <MapPin className="h-3 w-3" /> {profile.location}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {primaryPractice && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.2)", color: "#FFFFFF" }}>
              🧘 {primaryPractice}
            </span>
          )}
          {profile.zodiac && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.2)", color: "#FFFFFF" }}>
              ♈ {profile.zodiac}
            </span>
          )}
          {profile.ai_archetype && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md"
              style={{ background: "rgba(255,107,107,0.3)", color: "#FFFFFF" }}>
              ✨ {profile.ai_archetype}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
