"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Sparkles, MapPin, Edit3, Lightbulb, ChevronRight, BadgeCheck } from "lucide-react";
import PremiumModal from "@/components/ui/PremiumModal";
import BottomNav from "@/components/BottomNav";

interface ProfileData {
  id: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  bio: string | null;
  diet: string | null;
  alcohol: string | null;
  smoking: string | null;
  spiritual_practices: string[];
  zodiac: string | null;
  nakshatra: string | null;
  gotra: string | null;
  profile_pic_url: string | null;
  answers_to_questions: Record<string, string>;
  ai_archetype: string | null;
  is_profile_complete: boolean;
  tier: "free" | "premium";
  premium_until: string | null;
  daily_swipes_used: number;
  daily_messages_used: number;
  last_reset_date: string;
}

const COLORS = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  primary: "#EC4899",
  accent: "#FF6B6B",
  textPrimary: "#1A1A1A",
  textSecondary: "#8A8A8A",
  border: "#EBEBEB",
};

export default function ProfilePageClient({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [showPremium, setShowPremium] = useState(false);
  const isPremium = profile.tier === "premium";

  const initials = (profile.full_name ?? "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <main className="min-h-dvh pb-24" style={{ background: COLORS.bg }}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-4" style={{ background: COLORS.bg }}>
        <button type="button" onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: COLORS.textSecondary }}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="font-name text-base font-bold" style={{ color: COLORS.textPrimary }}>Profile</h1>
        <motion.button type="button" onClick={() => router.push("/profile/edit")} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
          style={{ border: `1px solid ${COLORS.border}`, color: COLORS.primary }}>
          <Edit3 className="h-3.5 w-3.5" /> Edit
        </motion.button>
      </header>

      <div className="mx-auto max-w-lg px-5">
        {/* Hero */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="relative -mt-2 mb-6 flex flex-col items-center gap-4 pt-4">
          <div className="relative">
            {profile.profile_pic_url ? (
              <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-white" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <img src={profile.profile_pic_url!} alt={profile.full_name ?? ""} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full ring-4 ring-white"
                style={{ background: COLORS.primary, boxShadow: "0 4px 20px rgba(236,72,153,0.2)" }}>
                <span className="font-name text-2xl font-bold text-white">{initials}</span>
              </div>
            )}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                style={{ background: isPremium ? COLORS.primary : COLORS.textSecondary }}>
                <Crown className="h-2.5 w-2.5" /> {isPremium ? "Premium" : "Free"}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h1 className="font-name text-[22px] font-bold" style={{ color: COLORS.textPrimary }}>{profile.full_name ?? "Unknown"}</h1>
              <BadgeCheck className="h-5 w-5" style={{ color: COLORS.primary }} />
            </div>
            {profile.age && <p className="mt-0.5 text-sm" style={{ color: COLORS.textSecondary }}>{profile.age} years</p>}
          </div>

          {profile.ai_archetype && (
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2"
              style={{ background: "rgba(236,72,153,0.04)", border: `1px solid ${COLORS.border}` }}>
              <Sparkles className="h-3.5 w-3.5" style={{ color: COLORS.primary }} />
              <span className="text-sm font-semibold" style={{ color: COLORS.primary }}>{profile.ai_archetype}</span>
            </div>
          )}
        </motion.section>

        {/* Free-tier banner — hidden during early offer */}
        {/* {!isPremium && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mb-5 rounded-2xl px-4 py-3.5" style={{ background: "rgba(236,72,153,0.04)", border: `1px solid ${COLORS.border}` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>Upgrade for unlimited access</p>
                <p className="text-xs" style={{ color: COLORS.textSecondary }}>Remove all limits and see who likes you</p>
              </div>
              <motion.button type="button" onClick={() => setShowPremium(true)} whileTap={{ scale: 0.95 }}
                className="rounded-full px-4 py-2 text-xs font-bold text-white" style={{ background: COLORS.primary }}>
                <Crown className="mr-1 inline h-3 w-3" /> Upgrade
              </motion.button>
            </div>
          </motion.div>
        )} */}

        {/* Spiritual Blueprint */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-5">
          <h2 className="mb-3 text-sm font-bold" style={{ color: COLORS.textPrimary }}>Spiritual Blueprint</h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.zodiac && <ProfileTag icon="♈" label={profile.zodiac} />}
            {profile.nakshatra && <ProfileTag icon="🌙" label={profile.nakshatra} />}
            {profile.gotra && <ProfileTag icon="🧬" label={profile.gotra} />}
            {profile.diet && <ProfileTag icon="🍽️" label={profile.diet} />}
            {profile.spiritual_practices?.slice(0, 2).map((p) => <ProfileTag key={p} icon="🕉️" label={p} />)}
          </div>
        </motion.section>

        {/* Blindspots */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-5">
          <button type="button" onClick={() => router.push("/profile/blindspots")}
            className="flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all card-lift"
            style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.06)" }}>
              <Lightbulb className="h-5 w-5" style={{ color: COLORS.primary }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold" style={{ color: COLORS.textPrimary }}>Relationship Blindspots</p>
              <p className="mt-0.5 text-[11px]" style={{ color: COLORS.textSecondary }}>AI-powered self-awareness insights</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0" style={{ color: COLORS.textSecondary }} />
          </button>
        </motion.section>

        {/* Soul Questions */}
        {profile.answers_to_questions && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-5">
            <h2 className="mb-3 text-sm font-bold" style={{ color: COLORS.textPrimary }}>Soul Questions</h2>
            <div className="flex flex-col gap-2">
              {Object.entries(profile.answers_to_questions)
                .filter(([k]) => !["full_name", "age", "location", "bio", "diet", "alcohol", "smoking", "zodiac", "nakshatra", "gotra", "spiritual_practices"].includes(k))
                .map(([q, a]) => (
                  <div key={q} className="rounded-xl px-4 py-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: COLORS.primary }}>{q}</p>
                    <p className="mt-1 text-[13px]" style={{ color: COLORS.textPrimary }}>{String(a)}</p>
                  </div>
                ))}
            </div>
          </motion.section>
        )}

        {/* Bio */}
        {profile.bio && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-12">
            <h2 className="mb-2 text-sm font-bold" style={{ color: COLORS.textPrimary }}>About</h2>
            <p className="text-[13px] leading-relaxed" style={{ color: COLORS.textSecondary }}>{profile.bio}</p>
          </motion.section>
        )}
      </div>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
      <BottomNav />
    </main>
  );
}

function ProfileTag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
      style={{ background: "rgba(236,72,153,0.06)", color: "#7C3AED", border: "1px solid rgba(236,72,153,0.1)" }}>
      {icon} {label}
    </span>
  );
}
