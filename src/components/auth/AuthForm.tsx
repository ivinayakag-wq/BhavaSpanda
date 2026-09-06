"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2, Eye } from "lucide-react";

const contactSchema = z.object({
  contact: z
    .string()
    .min(1, "Email or phone is required")
    .refine(
      (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\+?[\d\s\-()]{7,15}$/.test(v),
      "Enter a valid email or phone number",
    ),
});

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Only digits allowed"),
});

type ContactData = z.infer<typeof contactSchema>;
type OtpData = z.infer<typeof otpSchema>;

export default function AuthForm() {
  const router = useRouter();
  const [step, setStep] = useState<"contact" | "otp">("contact");
  const [contactValue, setContactValue] = useState("");
  const [loading, setLoading] = useState(false);

  const contactForm = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { contact: "" },
  });

  const otpForm = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  async function onSendOtp(data: ContactData) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setContactValue(data.contact);
    setStep("otp");
    setLoading(false);
  }

  async function onVerifyOtp(data: OtpData) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    sessionStorage.setItem("karmic_just_logged_in", "1");
    router.push("/dashboard");
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Branding */}
      <div className="text-center">
        <h1 className="font-name text-3xl text-foreground">Welcome Back</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to connect with the Isha community
        </p>
      </div>

      {/* Step 1: Contact */}
      {step === "contact" && (
        <motion.form
          onSubmit={contactForm.handleSubmit(onSendOtp)}
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              Email or Phone Number
            </span>
            <input
              {...contactForm.register("contact")}
              placeholder="you@example.com / +91XXXXXXXXXX"
              className="rounded-xl border px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-rose"
              style={{ borderColor: "#EDE8E0", background: "#FDFBF9" }}
            />
          </label>
          {contactForm.formState.errors.contact && (
            <p className="text-xs text-red-500">
              {contactForm.formState.errors.contact.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: "#EC671B" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send OTP
          </button>
        </motion.form>
      )}

      {/* Step 2: OTP */}
      {step === "otp" && (
        <motion.form
          onSubmit={otpForm.handleSubmit(onVerifyOtp)}
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-muted">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{contactValue}</span>.
          </p>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              One-Time Code
            </span>
            <input
              {...otpForm.register("otp")}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              className="rounded-xl border px-4 py-3 text-center text-2xl tracking-[0.4em] text-foreground outline-none transition-colors placeholder:text-muted/30 focus:border-rose"
              style={{ borderColor: "#EDE8E0", background: "#FDFBF9" }}
            />
          </label>
          {otpForm.formState.errors.otp && (
            <p className="text-xs text-red-500">
              {otpForm.formState.errors.otp.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: "#EC671B" }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("contact");
              otpForm.reset();
            }}
            className="text-xs text-muted underline transition-colors hover:text-foreground"
          >
            Use a different email or number
          </button>
        </motion.form>
      )}

      {/* Divider + Guest */}
      <div className="flex flex-col items-center gap-3">
        <div className="h-px w-full" style={{ background: "#EDE8E0" }} />
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("karmic_guest", "1");
            router.push("/dashboard");
          }}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-rose"
        >
          <Eye className="h-3.5 w-3.5" /> Explore as Guest
        </button>
      </div>
    </div>
  );
}
