"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Heart, MapPin, User, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  full_name: string | null;
  age: number | null;
  location: string | null;
  bio: string | null;
  profile_pic_url: string | null;
  spiritual_practices: string[];
  ai_archetype: string | null;
  diet: string | null;
  alcohol: string | null;
  smoking: string | null;
  answers_to_questions: Record<string, unknown>;
}

export default function ProfileViewModal({
  profile,
  open,
  onClose,
}: {
  profile: Profile | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleConnect = useCallback(async () => {
    if (!profile) return;
    await fetch("/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: profile.id, direction: true }),
    });
    onClose();
  }, [profile, onClose]);

  if (!profile) return null;

  const initials = (profile.full_name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const programs = (profile.answers_to_questions?.programs_completed as string[] | undefined) ?? [];
  const favoriteSpace = profile.answers_to_questions?.favorite_isha_space as string | undefined;
  const lifeChange = profile.answers_to_questions?.isha_life_change as string | undefined;
  const nonNegotiable = profile.answers_to_questions?.non_negotiable as string | undefined;
  const threeWords = profile.answers_to_questions?.three_words as string | undefined;
  const funFact = profile.answers_to_questions?.fun_fact as string | undefined;
  const lookingFor = profile.answers_to_questions?.looking_for as string | undefined;
  const practices = profile.spiritual_practices ?? [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
          style={{ background: "rgba(45,42,36,0.5)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-surface sm:mx-4 sm:max-w-md sm:rounded-3xl"
            style={{ background: "#FFFFFF" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Hero image — 60% */}
            <div className="relative h-[55vh] min-h-[320px] w-full overflow-hidden bg-gradient-to-b from-rose-subtle to-surface">
              {profile.profile_pic_url ? (
                <img
                  src={profile.profile_pic_url}
                  alt={profile.full_name ?? ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="font-name text-7xl text-rose/30">{initials}</span>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Name + Age + Location overlay */}
              <div className="absolute bottom-6 left-5 right-5 z-10 text-white">
                <div className="flex items-end gap-2">
                  <h2 className="font-name text-3xl leading-tight drop-shadow-lg">
                    {profile.full_name ?? "Anonymous"}
                  </h2>
                  {profile.age && (
                    <span className="text-xl leading-tight drop-shadow-lg">{profile.age}</span>
                  )}
                </div>
                {profile.location && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-white/80 drop-shadow-lg">
                    <MapPin className="h-3.5 w-3.5" /> {profile.location}
                  </p>
                )}
              </div>

              {/* Practice badge */}
              {practices.length > 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: "#FF6B6B", color: "#EC4899" }}
                  >
                    {practices[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-5" style={{ background: "#FFFFFF" }}>
              {/* Archetype */}
              {profile.ai_archetype && (
                <div className="mb-5 flex items-center gap-2 text-sm" style={{ color: "#EC4899" }}>
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">{profile.ai_archetype}</span>
                </div>
              )}

              {/* Section: Their Isha Journey */}
              <Section title="Their Isha Journey">
                {programs.length > 0 && (
                  <p className="text-sm text-foreground">
                    <span className="font-medium text-muted">Programs: </span>
                    {programs.join(", ")}
                  </p>
                )}
                {favoriteSpace && (
                  <p className="text-sm text-foreground">
                    <span className="font-medium text-muted">Favorite Space: </span>
                    {favoriteSpace}
                  </p>
                )}
                {lifeChange && (
                  <p className="mt-2 rounded-lg p-3 text-sm italic" style={{ background: "#FAFAF8", color: "#8A8A8A" }}>
                    "{lifeChange}"
                  </p>
                )}
              </Section>

              {/* Section: Lifestyle */}
              <Section title="Lifestyle">
                <div className="flex flex-wrap gap-3 text-sm text-foreground">
                  {profile.diet && (
                    <span className="rounded-full border px-3 py-1" style={{ borderColor: "#EBEBEB" }}>
                      🥗 {profile.diet}
                    </span>
                  )}
                  {profile.alcohol && (
                    <span className="rounded-full border px-3 py-1" style={{ borderColor: "#EBEBEB" }}>
                      🍷 {profile.alcohol}
                    </span>
                  )}
                  {profile.smoking && (
                    <span className="rounded-full border px-3 py-1" style={{ borderColor: "#EBEBEB" }}>
                      🚬 {profile.smoking}
                    </span>
                  )}
                </div>
              </Section>

              {/* Section: What They're Looking For */}
              <Section title="What They're Looking For">
                {lookingFor && (
                  <p className="text-sm text-foreground">
                    <span className="font-medium text-muted">Intent: </span>
                    {lookingFor}
                  </p>
                )}
                {nonNegotiable && (
                  <p className="mt-2 rounded-lg p-3 text-sm italic" style={{ background: "#FAFAF8", color: "#8A8A8A" }}>
                    "What's non-negotiable: {nonNegotiable}"
                  </p>
                )}
              </Section>

              {/* Section: About Them */}
              <Section title="About Them">
                {threeWords && (
                  <p className="text-sm text-foreground">
                    <span className="font-medium text-muted">In 3 words: </span>
                    {threeWords}
                  </p>
                )}
                {funFact && (
                  <p className="text-sm text-foreground">
                    <span className="font-medium text-muted">Fun fact: </span>
                    {funFact}
                  </p>
                )}
              </Section>
            </div>

            {/* Sticky bottom button */}
            <div className="border-t px-5 py-4" style={{ borderColor: "#EBEBEB", background: "#FFFFFF" }}>
              <button
                type="button"
                onClick={handleConnect}
                className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
                style={{ background: "#EC4899" }}
              >
                <Heart className="h-4 w-4" /> Connect
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 font-name text-lg text-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
