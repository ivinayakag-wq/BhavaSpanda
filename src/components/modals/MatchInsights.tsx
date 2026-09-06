"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Star, Sun, Moon, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const C = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  primary: "#EC4899",
  textPrimary: "#1A1A1A",
  textSecondary: "#8A8A8A",
  border: "#EBEBEB",
};

interface Props {
  open: boolean;
  onClose: () => void;
  viewerId: string;
  profileId: string;
  profileName: string;
  profilePic?: string | null;
  profileAge?: number;
}

export default function MatchInsights({ open, onClose, viewerId, profileId, profileName, profilePic, profileAge }: Props) {
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [astro, setAstro] = useState<any>(null);
  const [astroLoading, setAstroLoading] = useState(true);
  const [showKootas, setShowKootas] = useState(false);

  useEffect(() => {
    if (!open || !viewerId || !profileId) return;

    setInsight(null);
    setInsightLoading(true);
    setAstro(null);
    setAstroLoading(true);

    fetch("/api/match-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile1Id: viewerId, profile2Id: profileId }),
    })
      .then((r) => r.json())
      .then((d) => { setInsight(d.insight ?? null); setInsightLoading(false); })
      .catch(() => setInsightLoading(false));

    fetch("/api/astrology/compatibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile1Id: viewerId, profile2Id: profileId }),
    })
      .then((r) => r.json())
      .then((d) => { setAstro(d); setAstroLoading(false); })
      .catch(() => setAstroLoading(false));
  }, [open, viewerId, profileId]);

  if (!open) return null;

  const gunaScore = astro?.gunaScore;
  const gunaMax = astro?.gunaMax ?? 36;
  const gunaRec = astro?.gunaRecommendation;
  const kootas = astro?.kootas ?? {};
  const sunCompat = astro?.sunCompatibility;
  const moonCompat = astro?.moonCompatibility;
  const p1 = astro?.p1;
  const p2 = astro?.p2;
  const gunaPercent = gunaScore != null ? Math.round((gunaScore / gunaMax) * 100) : null;

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
          {/* Header */}
          <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: C.border }}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full" style={{ border: `2px solid ${C.primary}` }}>
              {profilePic ? (
                <img src={profilePic} alt="" className="h-full w-full object-cover" />
              ) : (
                <Sparkles className="h-5 w-5" style={{ color: C.primary }} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-name text-base font-bold" style={{ color: C.textPrimary }}>
                {profileName}{profileAge ? `, ${profileAge}` : ""}
              </h2>
              <p className="text-xs" style={{ color: C.textSecondary }}>Match Insights</p>
            </div>
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100" style={{ color: C.textSecondary }}>
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Vedic Compatibility */}
            <Section title="Vedic Compatibility">
              {astroLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.primary }} />
                  <span className="ml-2 text-xs" style={{ color: C.textSecondary }}>Calculating birth charts...</span>
                </div>
              ) : gunaPercent != null ? (
                <div className="space-y-4">
                  {/* Guna Milan Score */}
                  <div className="rounded-xl p-4" style={{ background: "rgba(236,72,153,0.04)" }}>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.textSecondary }}>
                      <Star className="h-3 w-3" style={{ color: C.primary }} /> Guna Milan
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <p className="font-name text-3xl font-bold" style={{ color: C.textPrimary }}>{gunaScore}</p>
                      <span className="text-lg" style={{ color: C.textSecondary }}>/</span>
                      <p className="font-name text-lg font-medium" style={{ color: C.textSecondary }}>{gunaMax}</p>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(236,72,153,0.1)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${gunaPercent}%`, background: gunaPercent >= 75 ? "#16a34a" : gunaPercent >= 50 ? C.primary : "#f59e0b" }} />
                    </div>
                    <p className="mt-2 text-xs font-medium text-center" style={{ color: gunaPercent >= 75 ? "#16a34a" : gunaPercent >= 50 ? C.textPrimary : "#f59e0b" }}>
                      {gunaRec}
                    </p>
                  </div>

                  {/* Sun + Moon Sign Match */}
                  <div className="grid grid-cols-2 gap-3">
                    {sunCompat && (
                      <div className="rounded-xl p-3 text-center" style={{ background: "rgba(236,72,153,0.04)" }}>
                        <Sun className="mx-auto h-4 w-4 mb-1" style={{ color: C.primary }} />
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textSecondary }}>Sun Sign</p>
                        <p className="font-name text-xl font-bold mt-1" style={{ color: C.textPrimary }}>{sunCompat.score}%</p>
                        <p className="text-[10px] mt-0.5" style={{ color: C.textSecondary }}>{p1?.sunSign} ⟷ {p2?.sunSign}</p>
                      </div>
                    )}
                    {moonCompat && (
                      <div className="rounded-xl p-3 text-center" style={{ background: "rgba(236,72,153,0.04)" }}>
                        <Moon className="mx-auto h-4 w-4 mb-1" style={{ color: C.primary }} />
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textSecondary }}>Moon Sign</p>
                        <p className="font-name text-xl font-bold mt-1" style={{ color: C.textPrimary }}>{moonCompat.score}%</p>
                        <p className="text-[10px] mt-0.5" style={{ color: C.textSecondary }}>{p1?.moonSign} ⟷ {p2?.moonSign}</p>
                      </div>
                    )}
                  </div>

                  {/* Rising + Nakshatra */}
                  {(p1?.risingSign || p1?.nakshatra) && (
                    <div className="grid grid-cols-2 gap-3">
                      {p1?.risingSign && p2?.risingSign && (
                        <div className="rounded-xl p-3 text-center" style={{ background: "rgba(236,72,153,0.04)" }}>
                          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textSecondary }}>Rising Sign</p>
                          <p className="text-xs font-medium mt-1" style={{ color: C.textPrimary }}>{p1.risingSign} ⟷ {p2.risingSign}</p>
                        </div>
                      )}
                      {p1?.nakshatra && p2?.nakshatra && (
                        <div className="rounded-xl p-3 text-center" style={{ background: "rgba(236,72,153,0.04)" }}>
                          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: C.textSecondary }}>Nakshatra</p>
                          <p className="text-xs font-medium mt-1" style={{ color: C.textPrimary }}>{p1.nakshatra} ⟷ {p2.nakshatra}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Koota breakdown */}
                  {Object.keys(kootas).length > 0 && (
                    <div>
                      <button type="button" onClick={() => setShowKootas(!showKootas)}
                        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold transition-colors hover:bg-gray-50"
                        style={{ color: C.textPrimary, background: "rgba(236,72,153,0.04)" }}>
                        <span>Ashtakoota Breakdown ({Object.keys(kootas).length} Kootas)</span>
                        {showKootas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <AnimatePresence>
                        {showKootas && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden">
                            <div className="space-y-1.5 pt-2">
                              {Object.entries(kootas).map(([name, k]: [string, any]) => (
                                <div key={name} className="flex items-center justify-between rounded-lg px-3 py-2 text-xs"
                                  style={{ background: "rgba(236,72,153,0.02)" }}>
                                  <span className="font-medium" style={{ color: C.textPrimary }}>{name}</span>
                                  <span style={{ color: C.textSecondary }}>{k.score}/{k.maximum}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-center py-4" style={{ color: C.textSecondary }}>
                  Birth data needed for detailed compatibility. Both profiles need date of birth, time, and birth location.
                </p>
              )}
            </Section>

            {/* Why You Match */}
            <Section title="Why You Match">
              {insightLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin" style={{ color: C.primary }} />
                </div>
              ) : insight ? (
                <div className="rounded-xl p-4" style={{ background: "rgba(236,72,153,0.04)" }}>
                  <p className="text-[13px] leading-relaxed" style={{ color: C.textSecondary, whiteSpace: "pre-wrap" }}>{insight}</p>
                  <p className="mt-2 text-[10px]" style={{ color: C.textSecondary }}>AI-Generated Insight</p>
                </div>
              ) : (
                <p className="text-xs text-center py-4" style={{ color: C.textSecondary }}>
                  Complete more of both profiles to generate a personalized insight.
                </p>
              )}
            </Section>
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
