"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface LockedActionButtonProps {
  label: string;
  icon?: ReactNode;
}

export function LockedActionButton({ label, icon }: LockedActionButtonProps) {
  const router = useRouter();

  return (
    <motion.button
      type="button"
      onClick={() => router.push("/onboarding")}
      whileTap={{ scale: 0.96 }}
      className="relative flex w-full items-center justify-center gap-2 rounded-pill bg-foreground/[0.03] border border-border px-6 py-3 text-sm text-muted cursor-not-allowed select-none transition-all hover:border-gold-faint hover:text-foreground"
      aria-label={`${label} — locked. Complete your Soul Profile to unlock.`}
    >
      <Lock className="h-4 w-4 text-gold" />
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}

export default LockedActionButton;
