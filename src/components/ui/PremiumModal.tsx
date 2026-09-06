"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, Check, Loader2, Sparkles } from "lucide-react";

const PARTICLE_COUNT = 20;

export interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  onActivated?: () => void;
}

export default function PremiumModal({
  open,
  onClose,
  onActivated,
}: PremiumModalProps) {
  const [activating, setActivating] = useState(false);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: ((i * 17 + 5) * 7) % 100,
        delay: ((i * 3) % 8) / 10,
        duration: 4 + ((i * 7) % 6),
        size: 2 + ((i * 3) % 4),
        opacity: 0.3 + ((i * 5) % 5) / 10,
      })),
    [],
  );

  async function handleActivate() {
    setActivating(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      onActivated?.();
      window.location.reload();
    } catch {
    } finally {
      setActivating(false);
    }
  }

  const features = [
    { label: "Unlimited Swipes", icon: <Sparkles className="h-4 w-4" style={{ color: "#EC4899" }} /> },
    { label: "Unlimited Direct Messages", icon: <Sparkles className="h-4 w-4" style={{ color: "#EC4899" }} /> },
    { label: "See Full Soul Blueprints", icon: <Sparkles className="h-4 w-4" style={{ color: "#EC4899" }} /> },
    { label: "Exact Compatibility Scores", icon: <Sparkles className="h-4 w-4" style={{ color: "#EC4899" }} /> },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: "rgba(45,42,36,0.5)" }} />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  bottom: "-10px",
                  width: p.size,
                  height: p.size,
                  background: "#EC4899",
                  opacity: p.opacity,
                }}
                animate={{
                  y: [0, -(typeof window !== "undefined" ? window.innerHeight + 20 : 800)],
                  x: [0, ((p.id % 3) - 1) * 30],
                  opacity: [p.opacity, 0],
                }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Modal card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 mx-6 w-full max-w-sm"
            initial={{ y: 32, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 26, delay: 0.08 }}
          >
            <div
              className="relative overflow-hidden rounded-2xl border shadow-lg"
              style={{ borderColor: "#EBEBEB", background: "#FFFFFF" }}
            >
              <div className="flex flex-col items-center gap-6 px-8 py-10 text-center">
                {/* Close button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-4 right-4 rounded-full p-2 transition-colors"
                  style={{ color: "#8A8A8A" }}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Crown icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.15 }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: "rgba(236,103,27,0.1)" }}>
                    <Crown className="h-8 w-8" style={{ color: "#EC4899" }} />
                  </div>
                </motion.div>

                {/* Title */}
                <h2 className="font-name text-3xl" style={{ color: "#1A1A1A" }}>
                  Go Premium
                </h2>

                {/* Feature list */}
                <ul className="flex w-full flex-col gap-3 text-left">
                  {features.map((f, i) => (
                    <motion.li
                      key={f.label}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.06 }}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full"
                        style={{ background: "rgba(236,103,27,0.1)" }}>
                        <Check className="h-3.5 w-3.5" style={{ color: "#EC4899" }} />
                      </span>
                      <span className="text-sm" style={{ color: "#1A1A1A" }}>
                        {f.label}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* Price */}
                <p className="text-sm" style={{ color: "#8A8A8A" }}>
                  Just{" "}
                  <span className="font-name text-2xl" style={{ color: "#EC4899" }}>₹49</span>
                  <span className="text-xs">/month</span>
                </p>

                {/* Activate button */}
                <motion.button
                  type="button"
                  onClick={handleActivate}
                  disabled={activating}
                  whileTap={{ scale: 0.97 }}
                  className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-60"
                  style={{ background: "#EC4899" }}
                >
                  {activating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Crown className="h-4 w-4" />
                  )}
                  {activating ? "Activating…" : "Activate Premium"}
                </motion.button>

                {/* Dismiss */}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs underline transition-colors"
                  style={{ color: "#8A8A8A" }}
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
