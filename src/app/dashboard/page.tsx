"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, SlidersHorizontal, Menu, X, ChevronRight, Crown, User, Heart, Bell, MessageCircle, Settings } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import PwaRegister from "@/components/PwaRegister";
import BottomNav from "@/components/BottomNav";
import ProfileCard from "@/components/swipe/ProfileCard";
import ProfileCompletionGate from "@/components/ProfileCompletionGate";
import { useAuth } from "@/context/AuthContext";

const ProfileDetailModal = dynamic(() => import("@/components/modals/ProfileDetailModal"), { ssr: false });
const DonateModal = dynamic(() => import("@/components/modals/DonateModal"), { ssr: false });
const UpgradeModal = dynamic(() => import("@/components/modals/UpgradeModal"), { ssr: false }) as any;

type UpgradeVariant = "likes-exhausted" | "message-exhausted" | "see-who-liked" | "see-who-viewed" | "full-profile" | "fomo";

const SHOW_PRICING = false; // Flip to true to re-enable premium/pricing UI

const COLORS = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  primary: "#EC4899",
  primarySoft: "#F472B6",
  accent: "#FF6B6B",
  textPrimary: "#1A1A1A",
  textSecondary: "#8A8A8A",
  border: "#EBEBEB",
};

function toCardProfile(p: any) {
  return {
    id: p.id,
    full_name: p.name ?? "Unknown",
    age: p.age ?? 0,
    gender: p.gender ?? "",
    location: p.location ?? "",
    profile_pic_url: p.photos?.[0] ?? null,
    spiritual_practices: p.spiritual_practices ?? [],
    tier: p.tier ?? "free",
    profession: p.profession ?? "",
    zodiac: p.sun_sign ?? null,
    ai_archetype: p.ai_archetype ?? null,
    bio: p.bio ?? "",
    nakshatra: null,
    gotra: null,
    answers_to_questions: {},
    spiritual_community: p.spiritual_community ?? null,
  };
}

function toDetailProfile(p: any) {
  return {
    id: p.id,
    full_name: p.name ?? "Unknown",
    age: p.age ?? 0,
    gender: p.gender ?? "Other",
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
    contact_visibility: p.contact_visibility ?? "nobody",
    show_phone: p.phone_visible ?? false,
    show_email: p.email_visible ?? false,
    phone: "",
    email: "",
    verification_status: p.verification_status === "approved" ? "verified" : "pending",
    looking_for: p.looking_for ?? "",
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [upgradeVariant, setUpgradeVariant] = useState<UpgradeVariant | null>(null);
  const [selectedProfileRaw, setSelectedProfileRaw] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ gender: "", location: "", community: "", diet: "", minAge: "", maxAge: "" });
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [likesRemaining, setLikesRemaining] = useState(0);
  const [messagesRemaining, setMessagesRemaining] = useState(0);

  const userId = authUser?.id ?? null;
  const { unreadCount } = useNotifications(me?.id ?? null, me?.tier ?? null);

  function buildQuery() {
    const params = new URLSearchParams();
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.location) params.set("location", filters.location);
    if (filters.community) params.set("community", filters.community);
    if (filters.diet) params.set("diet", filters.diet);
    if (filters.minAge) params.set("minAge", filters.minAge);
    if (filters.maxAge) params.set("maxAge", filters.maxAge);
    return params.toString();
  }

  const fetchFeed = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/profiles/feed?${buildQuery()}`);
      const data = await res.json();
      setMe(data.user);
      setProfiles(data.profiles ?? []);
      setLikesRemaining(data.likesRemaining ?? 0);
      setMessagesRemaining(data.messagesRemaining ?? 0);
    } catch {}
    setLoading(false);
  }, [filters, userId]);

  useEffect(() => { if (userId) fetchFeed(); }, [fetchFeed, userId]);

  const completeness = me?.profile_completeness ?? 0;
  const isProfileComplete = completeness >= 100;

  async function handleLike(profileId: string) {
    if (!isProfileComplete) { setShowCompleteModal(true); return; }
    if ((me?.tier ?? "free") === "free" && likesRemaining <= 0) { setUpgradeVariant("likes-exhausted"); return; }
    setProfiles((prev) => prev.slice(1));
    setLikesRemaining((c) => Math.max(0, c - 1));
    try {
      const res = await fetch("/api/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: profileId, direction: true }),
      });
      const result = await res.json();
      if (result.blocked) { setUpgradeVariant("likes-exhausted"); return; }
    } catch {}
  }

  function handlePass() {
    setProfiles((prev) => prev.slice(1));
  }

  function handleMessage(profileId: string) {
    if (!isProfileComplete) { setShowCompleteModal(true); return; }
    if ((me?.tier ?? "free") === "free" && messagesRemaining <= 0) { setUpgradeVariant("message-exhausted"); return; }
    setMessagesRemaining((c) => Math.max(0, c - 1));
  }

  const hasActiveFilters = filters.gender || filters.location || filters.community || filters.diet || filters.minAge || filters.maxAge;
  const profileCards = useMemo(() => profiles.map(toCardProfile), [profiles]);
  const completenessPercent = isProfileComplete ? 100 : 20;

  return (
    <div className="min-h-dvh pb-24" style={{ background: COLORS.bg }}>
      <PwaRegister userTier={me?.tier ?? null} />

      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-5 py-4" style={{ background: COLORS.bg }}>
        <h1 className="font-name text-xl font-bold" style={{ color: COLORS.textPrimary }}>
          Isha Connect
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDonate(true)}
            className="shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #EC4899, #FF6B6B)", boxShadow: "0 2px 12px rgba(236,72,153,0.3)" }}
          >
            <Heart className="h-3 w-3" fill="white" /> Donate
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="shrink-0 relative flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            style={{ color: hasActiveFilters ? COLORS.primary : COLORS.textSecondary }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {hasActiveFilters && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white" style={{ background: COLORS.accent }} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            style={{ color: COLORS.textSecondary }}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Filter side panel */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed right-0 top-0 z-[70] flex h-full w-72 flex-col overflow-y-auto"
              style={{ background: COLORS.card, boxShadow: "-4px 0 20px rgba(0,0,0,0.08)", borderLeft: `1px solid ${COLORS.border}` }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-2">
                <span className="font-name text-lg font-bold" style={{ color: COLORS.textPrimary }}>Filters</span>
                <button type="button" onClick={() => setShowFilters(false)} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ color: COLORS.textSecondary }}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4 px-5 py-4">
                {[{ label: "Gender", key: "gender", options: ["All", "Male", "Female", "Other"] },
                  { label: "Location", key: "location", options: ["All", "Coimbatore", "Chennai", "Mumbai", "Delhi", "Bangalore"] },
                  { label: "Community", key: "community", options: ["All", "Isha", "ISKCON", "Osho", "Art of Living"] },
                  { label: "Diet", key: "diet", options: ["All", "Vegetarian", "Vegan", "Non_Vegetarian", "Eggetarian"] },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>{label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {options.map((o) => {
                        const val = o === "All" ? "" : o;
                        const active = (filters as any)[key] === val;
                        return (
                          <button key={o} type="button"
                            onClick={() => setFilters((f) => ({ ...f, [key]: val }))}
                            className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all"
                            style={{
                              background: active ? COLORS.primary : "rgba(0,0,0,0.04)",
                              color: active ? "#FFFFFF" : COLORS.textSecondary,
                            }}
                          >{o}</button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>Age</p>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={filters.minAge} onChange={(e) => setFilters((f) => ({ ...f, minAge: e.target.value }))}
                      className="w-1/2 rounded-xl border px-3 py-2.5 text-xs font-medium outline-none"
                      style={{ borderColor: COLORS.border, background: COLORS.bg, color: COLORS.textPrimary }} />
                    <input type="number" placeholder="Max" value={filters.maxAge} onChange={(e) => setFilters((f) => ({ ...f, maxAge: e.target.value }))}
                      className="w-1/2 rounded-xl border px-3 py-2.5 text-xs font-medium outline-none"
                      style={{ borderColor: COLORS.border, background: COLORS.bg, color: COLORS.textPrimary }} />
                  </div>
                </div>
              </div>

              <div className="mt-auto flex gap-3 px-5 py-4 border-t" style={{ borderColor: COLORS.border }}>
                <button type="button" onClick={() => { setFilters({ gender: "", location: "", community: "", diet: "", minAge: "", maxAge: "" }); }}
                  className="flex-1 rounded-full py-2.5 text-xs font-bold" style={{ border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary }}>Clear All</button>
                <button type="button" onClick={() => setShowFilters(false)}
                  className="flex-1 rounded-full py-2.5 text-xs font-bold text-white" style={{ background: COLORS.primary }}>Apply</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile completion banner */}
      {!isProfileComplete && me && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed left-0 right-0 z-30 px-5 py-3"
          style={{ top: "64px", background: "rgba(236,72,153,0.06)", borderBottom: "1px solid rgba(236,72,153,0.1)" }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium" style={{ color: COLORS.primary }}>Complete your profile to connect</p>
              <div className="mt-1 h-1 w-32 overflow-hidden rounded-full" style={{ background: "rgba(236,72,153,0.1)" }}>
                <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${completenessPercent}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} style={{ background: COLORS.primary }} />
              </div>
            </div>
            <button type="button" onClick={() => router.push("/profile/edit")}
              className="shrink-0 rounded-full px-4 py-1.5 text-xs font-bold text-white"
              style={{ background: COLORS.primary }}>Complete</button>
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <main className="relative mx-auto max-w-lg px-5" style={{ paddingTop: !isProfileComplete ? "120px" : "80px", paddingBottom: "88px" }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: COLORS.primary, animation: "mandala-spin 1s linear infinite" }} />
              <div className="absolute inset-1.5 rounded-full border-2 border-transparent" style={{ borderBottomColor: COLORS.accent, animation: "mandala-spin 1.5s linear infinite reverse" }} />
            </div>
            <p className="text-xs font-medium" style={{ color: COLORS.textSecondary }}>Finding your path...</p>
          </div>
        ) : profileCards.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.06)" }}>
              <Filter className="h-7 w-7" style={{ color: "rgba(236,72,153,0.3)" }} />
            </div>
            <div>
              <h3 className="font-name text-lg font-bold" style={{ color: COLORS.textPrimary }}>No profiles found</h3>
              <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>Try adjusting your filters</p>
            </div>
            <button type="button" onClick={() => setFilters({ gender: "", location: "", community: "", diet: "", minAge: "", maxAge: "" })}
              className="rounded-full px-6 py-2.5 text-xs font-bold text-white"
              style={{ background: COLORS.primary }}>Clear filters</button>
          </div>
        ) : (
          <>
          <div className="relative" style={{ height: "440px", touchAction: "pan-y" }}>
            {/* Swipeable card stack */}
            <AnimatePresence>
              {profileCards.slice(0, 3).map((profile, i) => (
                <motion.div
                  key={profile.id}
                  className="absolute inset-0"
                  style={i === 0 ? { touchAction: "none" } : { touchAction: "none", pointerEvents: "none" }}
                >
                  <ProfileCard
                    profile={profile}
                    index={i}
                    viewerId={userId ?? ""}
                    viewerTier={(me?.tier ?? "free") as any}
                    onSwipe={(dir) => {
                      if (dir === "right") handleLike(profile.id);
                      else if (dir === "left") handlePass();
                    }}
                    onOpenPremium={() => {}}
                    onOpenProfile={async () => {
                      const res = await fetch(`/api/profiles/${profile.id}`);
                      const data = await res.json();
                      setSelectedProfileRaw(data.profile ?? profile);
                    }}
                    profileComplete={isProfileComplete}
                    swipeEnabled={me?.swipe_gesture_enabled ?? true}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Action buttons — tight between card and nav */}
          {profileCards.length > 0 && (
            <div className="relative mt-3 flex items-center justify-center gap-5">
              <motion.button
                type="button"
                onClick={(e) => { e.stopPropagation(); handlePass(); }}
                disabled={loading}
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex h-12 w-12 items-center justify-center rounded-full transition-all disabled:opacity-40"
                style={{ background: "#FFFFFF", border: "1px solid #EBEBEB", color: "#8A8A8A", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <X className="h-5 w-5" strokeWidth={2.5} />
              </motion.button>

              <motion.button
                type="button"
                onClick={(e) => { e.stopPropagation(); if (profileCards[0]) handleLike(profileCards[0].id); }}
                disabled={loading}
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex h-14 w-14 items-center justify-center rounded-full text-white transition-all disabled:opacity-40"
                style={{ background: "#FF6B6B", boxShadow: "0 4px 16px rgba(255,107,107,0.3)" }}
              >
                <Heart className="h-6 w-6" fill="white" />
              </motion.button>
            </div>
          )}
          </>
        )}
      </main>

      <BottomNav />

      {/* Menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed right-0 top-0 z-[70] flex h-full w-72 flex-col overflow-y-auto"
              style={{ background: COLORS.card, boxShadow: "-4px 0 20px rgba(0,0,0,0.08)", borderLeft: `1px solid ${COLORS.border}` }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-2">
                <span className="font-name text-lg font-bold" style={{ color: COLORS.textPrimary }}>Menu</span>
                <button type="button" onClick={() => setMenuOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ color: COLORS.textSecondary }}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl px-4 py-3" style={{ background: "rgba(236,72,153,0.04)", border: `1px solid ${COLORS.border}` }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: COLORS.primary }}>
                  {me?.name?.charAt(0) ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold" style={{ color: COLORS.textPrimary }}>{me?.name ?? "User"}</p>
                  <span className="text-[11px] font-medium" style={{ color: me?.tier !== "free" ? COLORS.primary : COLORS.textSecondary }}>
                    {me?.tier === "free" ? "Free" : me?.tier === "ultimate" ? "Ultimate" : "Seeker"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-0.5 px-3">
                {[
                  { label: "My Profile", icon: User, action: () => router.push("/profile") },
                  { label: "Messages", icon: MessageCircle, action: () => router.push("/messages") },
                  { label: "Notifications", icon: Bell, action: () => {} },
                  { label: "Settings", icon: Settings, action: () => router.push("/settings") },
                  ...(SHOW_PRICING ? [{ label: "Plans & Pricing", icon: Crown, action: () => { setShowPlans(true); setMenuOpen(false); } }] : []),
                  { label: "Donate", icon: Heart, action: () => { setShowDonate(true); setMenuOpen(false); } },
                ].map((item, i) => (
                  <motion.button key={item.label} type="button" onClick={item.action}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-[#F2F1EE]"
                    style={{ color: COLORS.textPrimary }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(236,72,153,0.06)", color: COLORS.primary }}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    {item.label}
                  </motion.button>
                ))}
              </div>

              {/* Quick swipe toggle */}
              <div className="mx-3 mt-3 flex items-center justify-between rounded-xl border px-4 py-3"
                style={{ borderColor: COLORS.border, background: "rgba(236,72,153,0.03)" }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: COLORS.textPrimary }}>Swipe Gestures</p>
                  <p className="text-[10px]" style={{ color: COLORS.textSecondary }}>Off = button-only mode</p>
                </div>
                <button type="button" onClick={async () => {
                  const newVal = !(me?.swipe_gesture_enabled ?? true);
                  setMe((prev: any) => ({ ...prev, swipe_gesture_enabled: newVal }));
                  await fetch("/api/profile/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ swipe_gesture_enabled: newVal }),
                  });
                }}
                  className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                  style={{ background: me?.swipe_gesture_enabled ?? true ? COLORS.primary : COLORS.border }}>
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${(me?.swipe_gesture_enabled ?? true) ? "translate-x-5" : ""}`} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Plans modal — only shown when SHOW_PRICING is true */}
      {SHOW_PRICING && showPlans && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowPlans(false)} />
          <div className="relative z-10 w-full max-w-3xl overflow-y-auto rounded-2xl p-6" style={{ background: COLORS.card, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh" }}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-name text-xl font-bold" style={{ color: COLORS.textPrimary }}>Choose Your Path</h2>
              <button type="button" onClick={() => setShowPlans(false)} className="text-xl" style={{ color: COLORS.textSecondary }}>✕</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="p-2 font-semibold" style={{ color: COLORS.textPrimary }}>Feature</th>
                    <th className="p-2 text-center font-semibold" style={{ color: COLORS.textPrimary }}>Free</th>
                    <th className="p-2 text-center font-semibold" style={{ color: COLORS.primary }}>Seeker</th>
                    <th className="p-2 text-center font-semibold" style={{ color: COLORS.textPrimary }}>Ultimate</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Likes per day", free: "5", seeker: "50", ultimate: "Unlimited" },
                    { feature: "Messages per day", free: "3", seeker: "10", ultimate: "Unlimited" },
                    { feature: "AI Match Score", free: "✗", seeker: "✓", ultimate: "✓" },
                    { feature: "Vedic Compatibility", free: "✗", seeker: "✓", ultimate: "✓" },
                    { feature: "Blindspot Analysis", free: "✗", seeker: "✗", ultimate: "✓" },
                  ].map((row) => (
                    <tr key={row.feature} className="border-t" style={{ borderColor: COLORS.border }}>
                      <td className="p-2 font-medium" style={{ color: COLORS.textPrimary }}>{row.feature}</td>
                      <td className="p-2 text-center" style={{ color: COLORS.textSecondary }}>{row.free}</td>
                      <td className="p-2 text-center font-semibold" style={{ color: COLORS.primary }}>{row.seeker}</td>
                      <td className="p-2 text-center" style={{ color: COLORS.textSecondary }}>{row.ultimate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => { setShowPlans(false); }}
                className="flex-1 rounded-full py-3 text-sm font-bold text-white" style={{ background: COLORS.primary }}>
                Seeker — ₹499/mo
              </button>
              <button type="button" onClick={() => { setShowPlans(false); }}
                className="flex-1 rounded-full py-3 text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #EC4899, #F472B6)" }}>
                Ultimate — ₹999/mo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile detail modal */}
      {selectedProfileRaw && (
        <ProfileDetailModal
          profile={toDetailProfile(selectedProfileRaw) as any}
          viewerId={userId ?? ""}
          viewerTier={me?.tier ?? "free"}
          viewerZodiac={me?.sun_sign ?? ""}
          open={!!selectedProfileRaw}
          onClose={() => setSelectedProfileRaw(null)}
          onLike={() => { const id = selectedProfileRaw?.id; setSelectedProfileRaw(null); handleLike(id); }}
          onMessage={() => { const id = selectedProfileRaw?.id; setSelectedProfileRaw(null); handleMessage(id); }}
          likesRemaining={likesRemaining}
          messagesRemaining={messagesRemaining}
        />
      )}

      {upgradeVariant && (
        <UpgradeModal open={!!upgradeVariant} onClose={() => setUpgradeVariant(null)} variant={upgradeVariant} onUpgrade={() => setUpgradeVariant(null)} />
      )}

      <DonateModal open={showDonate} onClose={() => setShowDonate(false)} />

      {showCompleteModal && (
        <ProfileCompletionGate completeness={completeness} />
      )}
    </div>
  );
}
