"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export interface GlassModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  dismissible?: boolean;
}

export function GlassModal({
  open,
  onClose,
  title,
  children,
  footer,
  dismissible = true,
}: GlassModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-bg/70 backdrop-blur-md"
            onClick={() => dismissible && onClose?.()}
            tabIndex={-1}
          />

          {/* Glass card — ui-ux-pro-max glassmorphism */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="glass-modal-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gold-faint shadow-glow"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            {/* Frosted glass surface */}
            <div className="absolute inset-0 bg-surface/40 backdrop-blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-gold-faint/40 via-transparent to-bg/30" />
            <div className="absolute -top-px left-8 right-8 h-px bg-gold/40" />

            <div className="relative flex flex-col gap-5 p-6">
              <div className="flex items-start justify-between gap-4">
                {title && (
                  <h2
                    id="glass-modal-title"
                    className="font-name text-2xl text-gold"
                  >
                    {title}
                  </h2>
                )}
                {dismissible && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full bg-foreground/5 p-2 text-muted transition-colors hover:text-gold"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="text-base text-muted leading-relaxed font-body">
                {children}
              </div>

              {footer && (
                <div className="flex flex-col gap-3 pt-2">{footer}</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GlassModal;
