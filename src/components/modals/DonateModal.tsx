"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Copy, Check } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PRESET_AMOUNTS = [100, 200, 500, 1000];

export default function DonateModal({ open, onClose }: Props) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(200);
  const [customAmount, setCustomAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const upiId = "ishaconnect@upi"; // Placeholder — replace with real UPI ID
  const amount = customAmount ? parseInt(customAmount, 10) : selectedAmount;

  function handleCopyUpi() {
    navigator.clipboard.writeText(upiId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="relative z-10 w-full max-w-sm overflow-hidden rounded-[20px]"
          style={{ background: "#FFFFFF", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(236,72,153,0.08)" }}>
                <Heart className="h-4.5 w-4.5" style={{ color: "#EC4899" }} fill="#EC4899" />
              </div>
              <h2 className="font-name text-lg font-bold" style={{ color: "#1A1A1A" }}>Support Us</h2>
            </div>
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100" style={{ color: "#8A8A8A" }}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 pb-5">
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "#6B655A" }}>
              BhavaSpanda is free for everyone. If you find value, consider supporting us to keep the platform running.
            </p>

            {/* Preset amounts */}
            <div className="mt-5 grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                  className="rounded-xl py-2.5 text-sm font-semibold transition-all"
                  style={{
                    background: selectedAmount === amt && !customAmount ? "#EC4899" : "rgba(236,72,153,0.06)",
                    color: selectedAmount === amt && !customAmount ? "#FFFFFF" : "#1A1A1A",
                    border: `1px solid ${selectedAmount === amt && !customAmount ? "#EC4899" : "#EBEBEB"}`,
                  }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="mt-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: "#8A8A8A" }}>₹</span>
                <input
                  type="number"
                  placeholder="Other amount"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  className="w-full rounded-xl border py-2.5 pl-7 pr-4 text-sm outline-none transition-colors"
                  style={{ borderColor: "#EBEBEB", background: "#FAFAF8", color: "#1A1A1A" }}
                />
              </div>
            </div>

            {/* UPI Section */}
            <div className="mt-5 rounded-xl p-4" style={{ background: "#FAFAF8", border: "1px solid #EBEBEB" }}>
              <p className="text-xs font-semibold" style={{ color: "#1A1A1A" }}>Pay via UPI</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 rounded-lg px-3 py-2 text-sm font-mono" style={{ background: "#FFFFFF", color: "#1A1A1A", border: "1px solid #EBEBEB" }}>
                  {upiId}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
                  style={{ background: copied ? "#16a34a" : "rgba(236,72,153,0.08)", color: copied ? "#FFFFFF" : "#EC4899" }}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-2 text-[11px]" style={{ color: "#8A8A8A" }}>
                Scan QR or use UPI ID in your payment app
              </p>
            </div>

            {/* Donate button */}
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-full py-3 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: "#EC4899", boxShadow: "0 4px 20px rgba(236,72,153,0.35)" }}
            >
              {amount ? `Donate ₹${amount}` : "Donate"}
            </button>

            <p className="mt-3 text-center text-[11px]" style={{ color: "#8A8A8A" }}>
              Every contribution helps us build better connections 🙏
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
