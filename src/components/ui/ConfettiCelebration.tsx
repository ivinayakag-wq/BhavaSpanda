"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const COLORS = ["#D4AF37", "#e0bd4f", "#F5F5F7", "#FFD700"];
const PARTICLE_COUNT = 48;

export default function ConfettiCelebration({
  archetype,
  onDone,
}: {
  archetype: string;
  onDone: () => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  const viewportHeight = useMemo(
    () => (typeof window !== "undefined" ? window.innerHeight : 800),
    [],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: ((i * 7 + 3) * 13) % 100,
        delay: ((i * 3 + 1) % 10) / 25,
        color: COLORS[i % COLORS.length],
        rotation: (i * 47) % 360,
        scale: 0.5 + ((i * 11) % 10) / 10,
      })),
    [],
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-bg/60 backdrop-blur-sm" />

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full"
                style={{
                  backgroundColor: p.color,
                  x: `calc(-50% + ${p.x - 50}vw)`,
                  rotate: p.rotation,
                  scale: p.scale,
                }}
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -viewportHeight * 0.7, opacity: 0 }}
                transition={{
                  duration: 1.6,
                  delay: p.delay,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          <motion.div
            className="relative z-10 flex flex-col items-center gap-4 px-8 text-center"
            initial={{ scale: 0.6, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.15 }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
            >
              <Sparkles className="h-14 w-14 text-gold" />
            </motion.div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Your Soul Archetype
            </p>
            <h1 className="font-name text-4xl text-gold tracking-tight drop-shadow-glow">
              {archetype}
            </h1>
            <p className="text-sm text-muted max-w-xs font-body">
              This is the cosmic essence the universe revealed for you.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
