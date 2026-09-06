"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { type ReactNode, type ButtonHTMLAttributes } from "react";

const C = {
  rose: "#EC4899",
  roseSoft: "#FF6B6B",
  textPrimary: "#1A1A1A",
  textSecondary: "#8A8A8A",
  border: "#EBEBEB",
};

/* ───────────────────────── Glass Card ───────────────────────── */
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "soft" | "dark";
  hover?: "lift" | "glow" | "none";
  onClick?: () => void;
}

export function GlassCard({ children, className = "", variant = "default", hover = "none", onClick }: GlassCardProps) {
  const base = variant === "soft" ? "glass-soft" : variant === "dark" ? "glass-dark" : "glass";
  const hoverClass = hover === "lift" ? "card-lift cursor-pointer" : hover === "glow" ? "transition-all duration-500 hover:shadow-[var(--shadow-glow)] cursor-pointer" : "";

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-[--radius-xl] ${base} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── Aura Badge ──────────────────────── */
interface AuraBadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "rose" | "gold" | "gradient" | "soft";
  icon?: ReactNode;
}

export function AuraBadge({ children, className = "", variant = "rose", icon }: AuraBadgeProps) {
  const styles: Record<string, string> = {
    rose: "bg-[rgba(236,72,153,0.08)] text-[#EC4899] border border-[rgba(236,72,153,0.15)]",
    gold: "bg-[rgba(255,107,107,0.08)] text-[#FF6B6B] border border-[rgba(255,107,107,0.15)]",
    gradient: "gradient-border !bg-[rgba(236,72,153,0.06)] text-[#EC4899]",
    soft: "bg-[#FF6B6B]/15 text-[#EC4899] border border-[#FF6B6B]/30",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${styles[variant]} ${className}`}>
      {icon}
      {children}
    </span>
  );
}

/* ───────────────────────── Glow Button ─────────────────────── */
interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GlowButton({ children, variant = "primary", size = "md", className = "", onClick, ...props }: GlowButtonProps) {
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-3.5 text-sm",
  };

  const variants = {
    primary: "text-white bg-[#EC4899] hover:bg-[#BE185D] shadow-[0_4px_16px_rgba(236,72,153,0.25)] hover:shadow-[0_8px_30px_rgba(236,72,153,0.35)]",
    secondary: "text-[#EC4899] bg-[rgba(236,72,153,0.06)] border border-[rgba(236,72,153,0.2)] hover:bg-[rgba(236,72,153,0.1)]",
    ghost: "text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#EBEBEB]",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: variant === "ghost" ? 0 : -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={onClick}
      className={`rounded-full font-semibold transition-colors ${sizes[size]} ${variants[variant]} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}

/* ───────────────────────── Mandala Loader ─────────────────── */
export function MandalaLoader({ size = 48, label }: { size?: number; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer rotating ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent, rgba(236,72,153,0.15), transparent, rgba(255,107,107,0.2), transparent)`,
            animation: "mandala-spin 2s linear infinite",
          }}
        />
        {/* Inner pulsing glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: size * 0.25,
            background: `radial-gradient(circle, rgba(236,72,153,0.25), transparent 70%)`,
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Center dot */}
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: C.rose }} />
      </div>
      {label && (
        <p className="text-xs" style={{ color: C.textSecondary }}>{label}</p>
      )}
    </div>
  );
}

/* ───────────────────────── Section Title ──────────────────── */
export function SectionTitle({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-4">
      {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
      <h3 className="font-name text-lg font-semibold" style={{ color: C.textPrimary }}>{children}</h3>
    </div>
  );
}

/* ───────────────────────── Glow Card (Score Display) ──────── */
export function ScoreRing({ score, max, size = 100, label }: { score: number; max: number; size?: number; label?: string }) {
  const percentage = Math.min(100, (score / max) * 100);
  const strokeWidth = 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" style={{ filter: "drop-shadow(0 0 8px rgba(236,72,153,0.2))" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(236,72,153,0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ strokeDasharray: circumference }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#FF6B6B" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-name text-2xl font-bold" style={{ color: C.rose }}>
          {score}
        </span>
        {label && (
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: C.textSecondary }}>{label}</span>
        )}
      </div>
    </div>
  );
}
