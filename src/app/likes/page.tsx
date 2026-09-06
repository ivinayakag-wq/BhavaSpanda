"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Heart, MessageCircle, MapPin, FileText, ShieldCheck, Loader2, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ProfileCompletionGate from "@/components/ProfileCompletionGate";
import { useAuth } from "@/context/AuthContext";

const ProfileDetailModal = dynamic(() => import("@/components/modals/ProfileDetailModal"), { ssr: false });
const MatchInsights = dynamic(() => import("@/components/modals/MatchInsights"), { ssr: false });

const C = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  primary: "#EC4899",
  accent: "#FF6B6B",
  textPrimary: "#1A1A1A",
  textSecondary: "#8A8A8A",
  border: "#EBEBEB",
};

interface LikerProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  photos: string[];
  bio: string;
  community: string;
  photo_verified?: boolean;
  ai_archetype?: string | null;
  spiritual_community?: string | null;
  spiritual_practices?: string[];
  profession?: string;
  diet?: string;
  alcohol?: string;
  smoking?: boolean;
  looking_for?: string;
  sun_sign?: string;
  moon_sign?: string;
  nakshatra?: string;
  gotra?: string;
  answers_to_questions?: Record<string, string>;
  profile_completeness?: number;
  tier?: string;
  contact_visibility?: string;
  phone_visible?: boolean;
  email_visible?: boolean;
  verification_status?: string;
}

function toDetailProfile(p: LikerProfile) {
  return {
    id: p.id,
    full_name: p.name ?? "Unknown",
    age: p.age ?? 0,
    gender: p.gender ?? "",
    location: p.location ?? "",
    bio: p.bio ?? "",
    diet: p.diet ?? "",
    alcohol: p.alcohol ?? "",
    smoking: p.smoking ? "yes" : "no",
    spiritual_practices: p.spiritual_practices ?? [],
    zodiac: p.sun_sign ?? "",
    nakshatra: p.nakshatra ?? "",
    gotra: p.gotra ?? "",
    profile_pic_url: p.photos?.[0] ?? null,
    answers_to_questions: p.answers_to_questions ?? {},
    ai_archetype: p.ai_archetype ?? null,
    is_profile_complete: (p.profile_completeness ?? 0) >= 100,
    tier: p.tier ?? "free",
    contact_visibility: (p.contact_visibility as any) ?? "nobody",
    show_phone: p.phone_visible ?? false,
    show_email: p.email_visible ?? false,
    phone: "",
    email: "",
    verification_status: p.verification_status === "approved" ? "verified" : "pending",
    looking_for: p.looking_for ?? "",
  };
}

export default function LikesPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"likes" | "top-picks">("likes");
  const [likers, setLikers] = useState<LikerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [filters, setFilters] = useState({ nearby: false, hasBio: false, verified: false });
  const [selectedProfile, setSelectedProfile] = useState<LikerProfile | null>(null);
  const [insightsTarget, setInsightsTarget] = useState<{ id: string; name: string; pic: string | null; age: number } | null>(null);

  useEffect(() => {
    if (!authUser) return;
    (async () => {
      try {
        const res = await fetch("/api/likes");
        const data = await res.json();
        setLikers(data.list ?? []);
        setMe(data.user ?? null);
      } catch {}
      setLoading(false);
    })();
  }, [authUser]);

  const filtered = likers.filter((p) => {
    if (filters.nearby && !p.location) return false;
    if (filters.hasBio && !p.bio) return false;
    if (filters.verified && !p.photo_verified) return false;
    return true;
  });

  const profileComplete = (me?.profile_completeness ?? 0) >= 100;

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center" style={{ background: C.bg }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: C.primary }} />
      </div>
    );
  }

  if (!profileComplete) {
    return <ProfileCompletionGate completeness={me?.profile_completeness ?? 0} />;
  }

  return (
    <div className="min-h-dvh pb-24" style={{ background: C.bg }}>
      <header className="sticky top-0 z-20 px-5 pt-5" style={{ background: C.bg }}>
        <div className="flex items-center justify-center gap-8 border-b" style={{ borderColor: C.border }}>
          <button
            type="button"
            onClick={() => setActiveTab("likes")}
            className="relative pb-3 text-sm font-bold transition-colors"
            style={{ color: activeTab === "likes" ? C.primary : C.textSecondary }}
          >
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" fill={activeTab === "likes" ? C.primary : "none"} /> LIKES
            </span>
            {activeTab === "likes" && (
              <motion.div layoutId="likesTab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: C.primary }} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("top-picks")}
            className="relative pb-3 text-sm font-bold transition-colors"
            style={{ color: activeTab === "top-picks" ? C.primary : C.textSecondary }}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> TOP PICKS
            </span>
            {activeTab === "top-picks" && (
              <motion.div layoutId="likesTab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: C.primary }} />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 py-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <button type="button" className="flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
            style={{ borderColor: filters.nearby ? C.primary : C.border, background: filters.nearby ? "rgba(236,72,153,0.06)" : C.card, color: filters.nearby ? C.primary : C.textSecondary }}
            onClick={() => setFilters((f) => ({ ...f, nearby: !f.nearby }))}>
            <MapPin className="h-3 w-3" /> Nearby
          </button>
          <button type="button" className="flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
            style={{ borderColor: filters.hasBio ? C.primary : C.border, background: filters.hasBio ? "rgba(236,72,153,0.06)" : C.card, color: filters.hasBio ? C.primary : C.textSecondary }}
            onClick={() => setFilters((f) => ({ ...f, hasBio: !f.hasBio }))}>
            <FileText className="h-3 w-3" /> Has a Bio
          </button>
          <button type="button" className="flex items-center gap-1.5 shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
            style={{ borderColor: filters.verified ? C.primary : C.border, background: filters.verified ? "rgba(236,72,153,0.06)" : C.card, color: filters.verified ? C.primary : C.textSecondary }}
            onClick={() => setFilters((f) => ({ ...f, verified: !f.verified }))}>
            <ShieldCheck className="h-3 w-3" /> Photo Verified
          </button>
        </div>
      </header>

      <main className="px-5 py-4">
        {likers.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="relative mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.08)" }}>
                <Heart className="h-8 w-8" style={{ color: C.primary }} />
              </div>
            </div>
            <h2 className="font-name text-xl font-bold" style={{ color: C.textPrimary }}>No likes yet</h2>
            <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: C.textSecondary }}>
              Complete your profile and keep swiping to attract more attention.
            </p>
            <button type="button" onClick={() => router.push("/onboarding")}
              className="mt-6 rounded-full px-6 py-2.5 text-sm font-bold text-white"
              style={{ background: C.primary }}>
              Edit Profile
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <p className="text-sm" style={{ color: C.textSecondary }}>No profiles match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((profile, i) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="overflow-hidden rounded-2xl border transition-all hover:shadow-lg"
                style={{ borderColor: C.border, background: C.card }}
              >
                <div
                  className="aspect-square overflow-hidden relative cursor-pointer"
                  onClick={() => setSelectedProfile(profile)}
                >
                  {profile.photos?.[0] ? (
                    <img src={profile.photos[0]} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center" style={{ background: "rgba(236,72,153,0.06)" }}>
                      <span className="text-4xl">🕉️</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-2 left-2.5 right-2.5">
                    <p className="text-sm font-bold text-white drop-shadow-lg">{profile.name}, {profile.age}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 px-3 py-2.5">
                  <button type="button" onClick={(e) => {
                    e.stopPropagation();
                    setInsightsTarget({ id: profile.id, name: profile.name, pic: profile.photos?.[0] ?? null, age: profile.age });
                  }}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90"
                    style={{ background: C.primary, color: "#FFFFFF", boxShadow: "0 2px 6px rgba(236,72,153,0.25)" }}>
                    <Sparkles className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile(profile);
                  }}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90"
                    style={{ background: "rgba(236,72,153,0.06)", color: C.primary }}>
                    <Heart className="h-4 w-4" fill={C.primary} />
                  </button>
                  <button type="button" onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/messages/${profile.id}`);
                  }}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90"
                    style={{ background: "rgba(236,72,153,0.06)", color: C.primary }}>
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {selectedProfile && (
        <ProfileDetailModal
          profile={toDetailProfile(selectedProfile) as any}
          viewerId={authUser?.id ?? ""}
          viewerTier={me?.tier ?? "ultimate"}
          viewerZodiac={me?.sun_sign ?? ""}
          open={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onLike={() => setSelectedProfile(null)}
          onMessage={() => { const id = selectedProfile.id; setSelectedProfile(null); router.push(`/messages/${id}`); }}
          likesRemaining={50}
          messagesRemaining={100}
        />
      )}

      {insightsTarget && (
        <MatchInsights
          open={!!insightsTarget}
          onClose={() => setInsightsTarget(null)}
          viewerId={authUser?.id ?? ""}
          profileId={insightsTarget.id}
          profileName={insightsTarget.name}
          profilePic={insightsTarget.pic}
          profileAge={insightsTarget.age}
        />
      )}

      <BottomNav />
    </div>
  );
}
