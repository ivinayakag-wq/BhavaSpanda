"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, MapPin, Heart, MessageCircle, X, BadgeCheck } from "lucide-react";

export interface ProfileDetail {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  location: string;
  bio: string;
  diet: string;
  alcohol: string;
  smoking: string;
  spiritual_practices: string[];
  zodiac: string;
  nakshatra: string;
  gotra: string;
  profile_pic_url: string | null;
  answers_to_questions?: Record<string, string>;
  ai_archetype?: string | null;
  is_profile_complete: boolean;
  tier: string;
  contact_visibility?: "nobody" | "matches" | "ultimate";
  show_phone?: boolean;
  show_email?: boolean;
  phone?: string;
  email?: string;
  verification_status?: "verified" | "pending" | "unverified";
  looking_for?: string;
}

interface Props {
  profile: ProfileDetail;
  viewerId: string;
  viewerTier: string;
  viewerZodiac?: string;
  open: boolean;
  onClose: () => void;
  onLike: () => void;
  onMessage: () => void;
  likesRemaining: number;
  messagesRemaining: number;
}

const C = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  primary: "#EC4899",
  primarySoft: "#F472B6",
  accent: "#FF6B6B",
  teal: "#1A3A4A",
  textPrimary: "#1A1A1A",
  textSecondary: "#8A8A8A",
  border: "#EBEBEB",
};

function VerificationBadge({ status }: { status: string }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
        style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}>
        <Shield className="h-2.5 w-2.5" /> Verified
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
        style={{ background: "rgba(234,179,8,0.1)", color: "#ca8a04" }}>
        <Shield className="h-2.5 w-2.5" /> Pending
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
      <Shield className="h-2.5 w-2.5" /> Unverified
    </span>
  );
}

export default function ProfileDetailModal({
  profile, viewerId, viewerTier, open, onClose, onLike, onMessage, likesRemaining, messagesRemaining,
}: Props) {
  if (!open) return null;

  const isFree = viewerTier === "free";

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-[20px]"
          style={{ background: C.card, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "90vh" }}
        >
          <button type="button" onClick={onClose} className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md"
            style={{ background: "rgba(0,0,0,0.3)", color: "#FFFFFF" }}>
            <X className="h-4 w-4" />
          </button>

          <div className="flex-1 overflow-y-auto">
            {/* Hero */}
            <div className="relative h-72 w-full overflow-hidden" style={{ background: "#F2F1EE" }}>
              {profile.profile_pic_url ? (
                <img src={profile.profile_pic_url} alt={profile.full_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center"><span className="text-7xl opacity-20">🕉️</span></div>
              )}
              <div className="absolute inset-0 gradient-overlay-bottom" />
              <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                <div className="flex items-center gap-2">
                  <h2 className="font-name text-[24px] font-bold drop-shadow-lg">{profile.full_name}, {profile.age}</h2>
                  <BadgeCheck className="h-5 w-5" fill="rgba(255,255,255,0.2)" />
                </div>
                {profile.location && (
                  <p className="mt-0.5 flex items-center gap-1 text-[13px] text-white/80 drop-shadow-md">
                    <MapPin className="h-3 w-3" /> {profile.location}
                  </p>
                )}
              </div>
            </div>

            <div className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <VerificationBadge status={profile.verification_status ?? "verified"} />
                {profile.ai_archetype && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: "rgba(236,72,153,0.06)", color: C.primary }}>
                    ✨ {profile.ai_archetype}
                  </span>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <Section title="About">
                  <p className="text-[13px] leading-relaxed" style={{ color: C.textSecondary }}>{profile.bio}</p>
                </Section>
              )}

              {/* Looking For */}
              {profile.looking_for && (
                <Section title="Looking For">
                  <p className="text-[13px]" style={{ color: C.textSecondary }}>{profile.looking_for.replace(/_/g, " ")}</p>
                </Section>
              )}

              {/* Spiritual Practices */}
              {profile.spiritual_practices?.length > 0 && (
                <Section title="Spiritual Practices">
                  <div className="flex flex-wrap gap-2">
                    {profile.spiritual_practices.map((p) => (
                      <span key={p} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
                        style={{ background: "rgba(236,72,153,0.05)", color: C.textPrimary, border: "1px solid rgba(236,72,153,0.08)" }}>
                        🧘 {p}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Astrology Quick */}
              {(profile.zodiac || profile.nakshatra || profile.gotra) && (
                <Section title="Vedic Profile">
                  <div className="flex flex-wrap gap-2">
                    {profile.zodiac && <TagChip label={`♈ ${profile.zodiac}`} />}
                    {profile.nakshatra && <TagChip label={`⭐ ${profile.nakshatra}`} />}
                    {profile.gotra && <TagChip label={` lineage: ${profile.gotra}`} />}
                  </div>
                </Section>
              )}

              {/* Lifestyle */}
              <Section title="Lifestyle">
                <div className="flex flex-wrap gap-2">
                  {profile.diet && <TagChip label={profile.diet} />}
                  {profile.alcohol && <TagChip label={profile.alcohol} />}
                  {profile.smoking && <TagChip label={profile.smoking === "yes" ? "Smoker" : "Non-smoker"} />}
                </div>
              </Section>

              {/* Answers to Questions */}
              {profile.answers_to_questions && Object.keys(profile.answers_to_questions).length > 0 && (
                <Section title="Answers">
                  <div className="space-y-3">
                    {Object.entries(profile.answers_to_questions).map(([q, a]) => (
                      <div key={q}>
                        <p className="text-[11px] font-semibold mb-1" style={{ color: C.textPrimary }}>{q}</p>
                        <p className="text-[12px]" style={{ color: C.textSecondary }}>{String(a)}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="flex gap-3 border-t px-5 py-4" style={{ borderColor: C.border }}>
            <motion.button type="button" onClick={onLike} whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white"
              style={{ background: C.accent }}>
              <Heart className="h-4 w-4" fill="white" /> Like
            </motion.button>
            <motion.button type="button" onClick={onMessage} whileTap={{ scale: 0.95 }}
              className="flex-1 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-bold"
              style={{ background: "rgba(236,72,153,0.06)", color: C.textPrimary, border: `1px solid ${C.border}` }}>
              <MessageCircle className="h-4 w-4" /> Message
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="mb-2.5 text-sm font-bold" style={{ color: C.textPrimary }}>{title}</h3>
      {children}
    </div>
  );
}

function TagChip({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium"
      style={{ background: "rgba(236,72,153,0.05)", color: C.textPrimary, border: "1px solid rgba(236,72,153,0.08)" }}>
      {icon} {label}
    </span>
  );
}
