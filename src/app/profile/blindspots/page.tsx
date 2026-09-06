"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, ArrowLeft, Lightbulb, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const C = {
  bg: "#FAFAF8", card: "#FFFFFF", primary: "#EC4899", accent: "#FF6B6B",
  textPrimary: "#1A1A1A", textSecondary: "#8A8A8A", border: "#EBEBEB",
};

interface Blindspot { name: string; description: string; suggestion: string; }
interface Analysis { blindspots: Blindspot[]; summary: string; needsMoreData?: boolean; }

export default function BlindspotsPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());
  const [journalEntries, setJournalEntries] = useState<Record<number, string>>({});

  async function fetchAnalysis() {
    const res = await fetch("/api/blindspots");
    const data = await res.json();
    setAnalysis(data);
    setLoading(false);
  }

  async function generateAnalysis() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/blindspots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      setAnalysis(data);
    } catch {}
    setRefreshing(false);
  }

  useEffect(() => { if (authUser) fetchAnalysis(); }, [authUser]);

  function toggleCard(index: number) {
    setRevealedCards((prev) => { const next = new Set(prev); if (next.has(index)) next.delete(index); else next.add(index); return next; });
  }

  const needsMoreData = analysis?.needsMoreData;

  return (
    <div className="min-h-dvh" style={{ background: C.bg }}>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b px-5 py-4" style={{ borderColor: C.border, background: C.bg }}>
        <button type="button" onClick={() => router.back()} className="flex items-center gap-1 text-sm font-medium" style={{ color: C.textSecondary }}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="font-name text-base font-bold" style={{ color: C.textPrimary }}>Blindspots</h1>
        <motion.button type="button" onClick={generateAnalysis} disabled={refreshing} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ border: `1px solid ${C.border}`, color: C.primary }}>
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </motion.button>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-4 py-24">
              <div className="relative h-10 w-10">
                <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{ borderTopColor: C.primary, animation: "mandala-spin 1s linear infinite" }} />
                <div className="absolute inset-1.5 rounded-full border-2 border-transparent" style={{ borderBottomColor: C.accent, animation: "mandala-spin 1.5s linear infinite reverse" }} />
              </div>
              <p className="text-xs font-medium" style={{ color: C.textSecondary }}>Reflecting on your patterns...</p>
            </motion.div>
          ) : needsMoreData ? (
            <motion.div key="needs-data" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4 rounded-2xl px-8 py-10 text-center"
              style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.06)" }}>
                <Lightbulb className="h-7 w-7" style={{ color: C.primary }} />
              </div>
              <div>
                <h2 className="font-name text-lg font-bold" style={{ color: C.textPrimary }}>Complete Your Profile</h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textSecondary }}>
                  {analysis?.summary || "Share more about yourself to get personalized blindspot insights."}
                </p>
              </div>
              <motion.button type="button" onClick={() => router.push("/profile/edit")} whileTap={{ scale: 0.95 }}
                className="rounded-full px-8 py-3 text-sm font-bold text-white" style={{ background: C.primary }}>
                Complete Profile
              </motion.button>
            </motion.div>
          ) : analysis ? (
            <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Summary */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.06)" }}>
                    <Sparkles className="h-4 w-4" style={{ color: C.primary }} />
                  </div>
                  <div>
                    <h2 className="font-name text-base font-bold" style={{ color: C.textPrimary }}>Your Relationship Blindspots</h2>
                    <p className="text-[10px] font-medium" style={{ color: C.textSecondary }}>AI-Generated — For self-reflection</p>
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: C.textSecondary }}>{analysis.summary}</p>
              </motion.div>

              {/* Blindspot cards with reveal */}
              {analysis.blindspots?.map((bs, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}
                  className="overflow-hidden rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <motion.div onClick={() => toggleCard(i)} className="flex cursor-pointer items-center justify-between px-5 py-4" whileTap={{ scale: 0.98 }}>
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: COLORS.primary }}>
                        {i + 1}
                      </span>
                      <h3 className="text-sm font-bold" style={{ color: C.textPrimary }}>{bs.name}</h3>
                    </div>
                    {revealedCards.has(i) ? <ChevronUp className="h-4 w-4" style={{ color: C.textSecondary }} /> : <ChevronDown className="h-4 w-4" style={{ color: C.primary }} />}
                  </motion.div>

                  <AnimatePresence>
                    {revealedCards.has(i) && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }} className="overflow-hidden">
                        <div className="px-5 pb-4 space-y-3">
                          <div className="rounded-xl px-4 py-3" style={{ background: "rgba(236,72,153,0.04)" }}>
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.textSecondary }}>
                              <Lightbulb className="h-3 w-3" style={{ color: C.primary }} /> Why This Matters
                            </p>
                            <p className="text-[13px] leading-relaxed" style={{ color: C.textPrimary }}>{bs.description}</p>
                          </div>
                          <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,107,107,0.04)" }}>
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.textSecondary }}>
                              💡 Gentle Suggestion
                            </p>
                            <p className="text-[13px] leading-relaxed" style={{ color: C.textPrimary }}>{bs.suggestion}</p>
                          </div>
                          <div className="rounded-xl px-4 py-3" style={{ background: "rgba(236,72,153,0.02)", border: `1px solid ${C.border}` }}>
                            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: C.textSecondary }}>
                              📝 Your Reflection
                            </p>
                            <textarea
                              value={journalEntries[i] ?? ""}
                              onChange={(e) => setJournalEntries((prev) => ({ ...prev, [i]: e.target.value }))}
                              placeholder="How does this resonate with you?"
                              rows={3}
                              className="w-full resize-none rounded-lg border-none bg-transparent text-[13px] leading-relaxed outline-none"
                              style={{ color: C.textPrimary }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              <div className="rounded-xl px-4 py-3 text-center" style={{ background: "rgba(236,72,153,0.04)" }}>
                <p className="text-[10px]" style={{ color: C.textSecondary }}>🤖 AI-Generated — For self-reflection only</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.06)" }}>
                <Sparkles className="h-7 w-7" style={{ color: C.primary }} />
              </div>
              <p className="text-sm" style={{ color: C.textSecondary }}>No insights yet. Tap Refresh to generate.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const COLORS = { primary: "#EC4899" };
