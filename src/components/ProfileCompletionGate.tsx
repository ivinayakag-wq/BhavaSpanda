"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, ArrowRight } from "lucide-react";

const C = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  primary: "#EC4899",
  textPrimary: "#1A1A1A",
  textSecondary: "#8A8A8A",
  border: "#EBEBEB",
};

export default function ProfileCompletionGate({ completeness }: { completeness: number }) {
  const router = useRouter();
  const percent = Math.min(100, Math.max(0, completeness));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: C.bg }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-3xl p-8 text-center"
        style={{ background: C.card, boxShadow: "0 12px 40px rgba(0,0,0,0.08)" }}
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.08)" }}>
          <User className="h-7 w-7" style={{ color: C.primary }} />
        </div>
        <h2 className="font-name text-xl font-bold" style={{ color: C.textPrimary }}>Complete your profile</h2>
        <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
          You need to complete your profile before you can interact with others.
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs font-medium" style={{ color: C.textSecondary }}>
            <span>Progress</span>
            <span style={{ color: C.primary }}>{percent}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(236,72,153,0.1)" }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ background: C.primary }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition-all"
          style={{ background: C.primary }}
        >
          Complete Profile <ArrowRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-3 w-full py-2 text-xs font-medium"
          style={{ color: C.textSecondary }}
        >
          Maybe later
        </button>
      </motion.div>
    </div>
  );
}
