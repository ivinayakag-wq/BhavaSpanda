"use client";

import { useRouter } from "next/navigation";

/* ───── Types ───── */

export type UpgradeVariant =
  | "likes-exhausted"
  | "message-exhausted"
  | "see-who-liked"
  | "see-who-viewed"
  | "full-profile"
  | "fomo";

interface Props {
  variant: UpgradeVariant;
  open: boolean;
  onClose: () => void;
  onUpgrade: (tier: "seeker" | "ultimate") => void;
}

/* ───── Config ───── */

const VARIANTS: Record<UpgradeVariant, {
  title: string;
  subtext: string;
  benefits: { icon: string; text: string }[];
  buttons: { label: string; tier?: "seeker" | "ultimate" }[];
}> = {
  "likes-exhausted": {
    title: "You've used all 5 likes today!",
    subtext: "5 people liked you that you haven't seen yet... 👀",
    benefits: [
      { icon: "👍", text: "50 likes/day with Seeker" },
      { icon: "👀", text: "See who liked you instantly" },
      { icon: "🔔", text: "Get notifications when someone likes you" },
    ],
    buttons: [
      { label: "Get Seeker (₹149/mo)", tier: "seeker" },
      { label: "Get Ultimate (₹499/mo)", tier: "ultimate" },
      { label: "Come back tomorrow" },
    ],
  },
  "message-exhausted": {
    title: "You've used your 1 message!",
    subtext: "Don't leave them waiting...",
    benefits: [
      { icon: "💬", text: "10 messages/day with Seeker" },
      { icon: "∞", text: "Unlimited messages with Ultimate" },
      { icon: "🔔", text: "Get notifications when they reply" },
    ],
    buttons: [
      { label: "Get Seeker (₹149/mo)", tier: "seeker" },
      { label: "Get Ultimate (₹499/mo)", tier: "ultimate" },
      { label: "Come back tomorrow" },
    ],
  },
  "see-who-liked": {
    title: "🔒 5 people liked you!",
    subtext: "Upgrade to see who's interested in you",
    benefits: [
      { icon: "👀", text: "See who liked you instantly" },
      { icon: "👍", text: "Unlimited likes" },
      { icon: "🔔", text: "Get notified on new likes" },
    ],
    buttons: [
      { label: "See Who Liked Me – ₹149/mo", tier: "seeker" },
      { label: "Get Everything – ₹499/mo", tier: "ultimate" },
      { label: "Maybe Later" },
    ],
  },
  "see-who-viewed": {
    title: "🔒 12 people viewed you today!",
    subtext: "Upgrade to see who's checking you out",
    benefits: [
      { icon: "👀", text: "See who viewed your profile" },
      { icon: "📊", text: "Profile analytics" },
      { icon: "🔔", text: "Get notified on new views" },
    ],
    buttons: [
      { label: "See Who Viewed Me – ₹149/mo", tier: "seeker" },
      { label: "Get Everything – ₹499/mo", tier: "ultimate" },
    ],
  },
  "full-profile": {
    title: "🔒 Full profile locked",
    subtext: "Upgrade to Ultimate to see complete profiles and contact details",
    benefits: [
      { icon: "👤", text: "See complete profile details" },
      { icon: "📞", text: "Access contact information" },
      { icon: "🕉️", text: "Full astrology compatibility" },
    ],
    buttons: [
      { label: "Get Ultimate – ₹499/mo", tier: "ultimate" },
      { label: "Maybe Later" },
    ],
  },
  fomo: {
    title: "50+ people are waiting for you!",
    subtext: "You've missed 50+ likes this week. Don't let them slip away.",
    benefits: [
      { icon: "💕", text: "See everyone who liked you" },
      { icon: "👍", text: "Unlimited likes & messages" },
      { icon: "🚀", text: "Priority visibility" },
    ],
    buttons: [
      { label: "See Who Liked Me – ₹149/mo", tier: "seeker" },
      { label: "Get Everything – ₹499/mo", tier: "ultimate" },
    ],
  },
};

/* ───── Component ───── */

const COLORS = {
  primary: "#EC4899",
  secondary: "#FF6B6B",
  textPrimary: "#1A1A1A",
  textSecondary: "#8A8A8A",
  border: "#EBEBEB",
  card: "#FFFFFF",
  inputBg: "#F5F5F3",
  shadow: "0 8px 30px rgba(236,72,153,0.08)",
};

export default function UpgradeModal({ variant, open, onClose, onUpgrade }: Props) {
  const config = VARIANTS[variant];
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-sm overflow-y-auto rounded-2xl p-8"
        style={{ background: COLORS.card, boxShadow: COLORS.shadow, maxHeight: "90vh" }}
      >
        {/* Title */}
        <h2 className="font-name text-xl font-semibold leading-snug" style={{ color: COLORS.textPrimary }}>
          {config.title}
        </h2>
        <p className="mt-2 text-sm" style={{ color: COLORS.textSecondary }}>
          {config.subtext}
        </p>

        {/* Benefits */}
        <ul className="mt-6 flex flex-col gap-3">
          {config.benefits.map((b) => (
            <li key={b.text} className="flex items-center gap-3 text-sm font-medium" style={{ color: COLORS.textPrimary }}>
              <span className="text-lg">{b.icon}</span>
              {b.text}
            </li>
          ))}
        </ul>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col gap-3">
          {config.buttons.map((btn) =>
            btn.tier ? (
              <button
                key={btn.label}
                type="button"
                onClick={() => onUpgrade(btn.tier!)}
                className="w-full rounded-full py-3 text-sm font-semibold text-white transition-all"
                style={{ background: btn.tier === "ultimate" ? COLORS.textPrimary : COLORS.primary }}
                onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.filter = "brightness(1.1)"; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.filter = "none"; }}
              >
                {btn.label}
              </button>
            ) : (
              <button
                key={btn.label}
                type="button"
                onClick={onClose}
                className="w-full rounded-full py-3 text-sm font-medium transition-all"
                style={{ background: COLORS.inputBg, color: COLORS.textSecondary }}
              >
                {btn.label}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
