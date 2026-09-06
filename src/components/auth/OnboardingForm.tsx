"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Camera, Loader2 } from "lucide-react";

/* ─── Helpers ───── */

const COLORS = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  primary: "#EC4899",
  secondary: "#FF6B6B",
  textPrimary: "#1A1A1A",
  textSecondary: "#8A8A8A",
  border: "#EBEBEB",
  inputBg: "#F5F5F3",
};

const CITIES = [
  "Coimbatore", "Chennai", "Mumbai", "Delhi", "Bangalore",
  "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Jaipur",
  "Lucknow", "Chandigarh", "Goa", "Varanasi", "Other",
];

const COMMUNITIES = [
  "Isha Foundation", "ISKCON", "Osho", "Art of Living",
  "Brahma Kumaris", "Transcendental Meditation", "Other",
];

const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Occasionally"];

const TIMEZONES = [
  "UTC+5:30 (India)", "UTC+5:45 (Nepal)", "UTC+6 (Bangladesh)",
  "UTC+4 (Gulf)", "UTC+1 (Europe)", "UTC+0 (UK)", "UTC-5 (US East)",
  "UTC-8 (US West)", "Other",
];

/* ─── Component ───── */

export default function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 – Basic
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Step 2 – Spiritual
  const [community, setCommunity] = useState("");
  const [practice, setPractice] = useState("");
  const [frequency, setFrequency] = useState("");
  const [yearsPracticing, setYearsPracticing] = useState("");
  const [programs, setPrograms] = useState<string[]>([]);
  const [sacredSpace, setSacredSpace] = useState("");

  // Step 3 – Lifestyle
  const [diet, setDiet] = useState("");
  const [alcohol, setAlcohol] = useState("");
  const [smoking, setSmoking] = useState("No");
  const [bio, setBio] = useState("");
  const [lookingFor, setLookingFor] = useState("");

  // Step 4 – Astrology
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthLocation, setBirthLocation] = useState("");
  const [timezone, setTimezone] = useState("");

  // Step 5 – Verification
  const [idFile, setIdFile] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<string | null>(null);

  const slide = { type: "spring" as const, stiffness: 200, damping: 26 };

  function canGoNext(): boolean {
    switch (step) {
      case 1: return !!fullName.trim() && !!age && !!gender && !!location && !!profilePic;
      case 2: return !!community && !!practice && !!frequency && !!yearsPracticing && programs.length > 0;
      case 3: return !!diet && !!alcohol && !!bio.trim();
      case 4: return true; // optional
      case 5: return !!idFile && !!selfieFile;
      default: return true;
    }
  }

  function handlePicUpload(e: React.ChangeEvent<HTMLInputElement>, setter: (v: string | null) => void) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Image too large (max 5MB)."); return; }
    import("@/lib/image-compress").then(({ compressImage }) =>
      compressImage(file).then(compressed =>
        import("@/lib/upload-photo").then(({ uploadProfilePhoto }) =>
          uploadProfilePhoto(compressed.blob).then(setter)
        )
      )
    ).catch(() => setError("Failed to upload photo."));
  }

  async function handleVerify() {
    setVerifying(true);
    setVerifyError(false);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selfie_url: selfieFile,
          id_url: idFile,
          profile_data: {
            full_name: fullName.trim(),
            age: parseInt(age, 10),
            gender,
            location,
            bio: bio.trim(),
            spiritual_practices: practice ? [practice] : [],
            diet,
          },
        }),
      });
      const data = await res.json();
      if (data.status === "verified") {
        setVerified(true);
      } else {
        setVerifyError(true);
        setError(data.details?.message || "Verification failed. Please try again.");
      }
    } catch {
      setVerifyError(true);
      setError("Verification server unavailable. Please try again later.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          age: parseInt(age, 10),
          gender,
          location,
          profile_pic_url: profilePic,
          spiritual_practices: [practice],
          diet,
          alcohol: alcohol.toLowerCase(),
          smoking: smoking === "Yes" ? "occasionally" : "never",
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error("save failed");
      setCompleted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {!completed ? (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="rounded-2xl p-8"
          style={{ background: COLORS.card, boxShadow: "0 8px 30px rgba(236,103,27,0.08)" }}
        >
          {/* Progress bar */}
          <div className="mb-4 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className="h-1.5 flex-1 rounded-full transition-all duration-300"
                style={{ background: step >= s ? COLORS.primary : COLORS.border }}
              />
            ))}
          </div>
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
            Step {step} of 5:{" "}
            {step === 1 ? "Basic Details" : step === 2 ? "Spiritual Background" : step === 3 ? "Lifestyle & Bio" : step === 4 ? "Astrology Details" : "Verification"}
          </p>

          {/* ─── Step 1: Basic Details ─── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={slide} className="flex flex-col gap-5">
              <h2 className="font-name text-2xl font-semibold" style={{ color: COLORS.textPrimary }}>Tell Us About Yourself</h2>
              <p className="-mt-3 text-sm" style={{ color: COLORS.textSecondary }}>This helps us show you relevant profiles</p>

              {/* Photo */}
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2"
                  style={{ borderColor: COLORS.primary, background: profilePic ? "none" : "rgba(236,103,27,0.08)" }}>
                  {profilePic ? <img src={profilePic} alt="" className="h-full w-full object-cover" /> : <Camera className="h-6 w-6" style={{ color: COLORS.primary }} />}
                </div>
                <label className="cursor-pointer rounded-full px-4 py-2 text-xs font-medium text-white transition-all hover:brightness-110"
                  style={{ background: COLORS.primary }}>
                  Upload Photo <span style={{ color: COLORS.primary === "#EC4899" ? "#EC4899" : "white" }}></span>
                  <input type="file" accept="image/*" onChange={(e) => handlePicUpload(e, setProfilePic)} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" required />
                <Input label="Age" value={age} onChange={setAge} type="number" placeholder="25" min={18} max={80} required />
              </div>
              <Select label="Gender" value={gender} onChange={setGender} options={["Male", "Female", "Other"]} placeholder="Select gender" required />
              <Select label="Location" value={location} onChange={setLocation} options={CITIES} placeholder="Select your city" required />
            </motion.div>
          )}

          {/* ─── Step 2: Spiritual Background ─── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={slide} className="flex flex-col gap-5">
              <div>
                <h2 className="font-name text-2xl font-semibold" style={{ color: COLORS.textPrimary }}>Your Spiritual Journey</h2>
                <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>This helps us find your community</p>
              </div>

              <Select label="Spiritual Community" value={community} onChange={setCommunity} options={COMMUNITIES} placeholder="Select community" required />
              {community && (
                <Input label="Primary Practice" value={practice} onChange={setPractice} placeholder="e.g. Meditation, Bhakti, Yoga" required />
              )}
              <Select label="Practice Frequency" value={frequency} onChange={setFrequency} options={FREQUENCIES} placeholder="How often do you practice?" required />
              <Input label="Years Practicing" value={yearsPracticing} onChange={setYearsPracticing} type="number" placeholder="5" min={1} max={80} required />

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
                  Programs Completed <span style={{ color: COLORS.primary }}>*</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {["Inner Engineering", "Shambhavi", "Hatha Yoga", "Samyama", "Retreat", "Bhava Spandana", "Other"].map((p) => {
                    const active = programs.includes(p);
                    return (
                      <button key={p} type="button" onClick={() => setPrograms(active ? programs.filter((x) => x !== p) : [...programs, p])}
                        className="rounded-full border px-4 py-1.5 text-xs transition-all"
                        style={{ borderColor: active ? COLORS.primary : COLORS.border, background: active ? "rgba(236,103,27,0.08)" : "transparent", color: active ? COLORS.primary : COLORS.textSecondary }}>
                        {active && <Check className="mr-1 inline h-3 w-3" />}
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Input label="Favorite Sacred Space (optional)" value={sacredSpace} onChange={setSacredSpace} placeholder="e.g. Dhyanalinga, Vrindavan, Rishikesh" />
            </motion.div>
          )}

          {/* ─── Step 3: Lifestyle & Bio ─── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={slide} className="flex flex-col gap-5">
              <h2 className="font-name text-2xl font-semibold" style={{ color: COLORS.textPrimary }}>Your Lifestyle &amp; Bio</h2>
              <p className="-mt-3 text-sm" style={{ color: COLORS.textSecondary }}>Be honest, be yourself</p>

              <ButtonGroup label="Diet" options={["Vegetarian", "Vegan", "Non-Vegetarian", "Eggetarian"]} value={diet} onChange={setDiet} />
              <ButtonGroup label="Alcohol" options={["Never", "Occasionally", "Socially"]} value={alcohol} onChange={setAlcohol} />
              <ToggleSwitch label="Smoking" value={smoking === "Yes"} onChange={(v) => setSmoking(v ? "Yes" : "No")} />

              <Textarea label="Bio" value={bio} onChange={setBio} placeholder="Share your spiritual journey..." maxLength={500} required />
              <Textarea label="What are you looking for?" value={lookingFor} onChange={setLookingFor} placeholder="What kind of connection are you seeking?" maxLength={500} />
            </motion.div>
          )}

          {/* ─── Step 4: Astrology Details ─── */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={slide} className="flex flex-col gap-5">
              <div>
                <h2 className="font-name text-2xl font-semibold" style={{ color: COLORS.textPrimary }}>Astrological Details</h2>
                <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>Helps us provide compatibility insights</p>
              </div>

              <Input label="Birth Date" value={birthDate} onChange={setBirthDate} type="date" />
              <Input label="Birth Time" value={birthTime} onChange={setBirthTime} type="time" />
              <Input label="Birth Location" value={birthLocation} onChange={setBirthLocation} placeholder="City of birth" />
              <Select label="Birth Timezone" value={timezone} onChange={setTimezone} options={TIMEZONES} placeholder="Select timezone" />
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>This step is optional. You can skip it.</p>
            </motion.div>
          )}

          {/* ─── Step 5: Verification ─── */}
          {step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={slide} className="flex flex-col gap-5">
              <div>
                <h2 className="font-name text-2xl font-semibold" style={{ color: COLORS.textPrimary }}>Verify Your Identity</h2>
                <p className="mt-1 text-sm" style={{ color: COLORS.textSecondary }}>Build trust in the community. This is automated.</p>
              </div>

              {/* ID Upload */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
                  Government ID <span style={{ color: COLORS.primary }}>*</span>
                </p>
                {idFile ? (
                  <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: COLORS.border, background: COLORS.inputBg }}>
                    <Check className="h-5 w-5 shrink-0" style={{ color: COLORS.primary }} />
                    <span className="flex-1 truncate text-sm" style={{ color: COLORS.textPrimary }}>ID uploaded</span>
                    <button type="button" onClick={() => setIdFile(null)} className="text-xs underline" style={{ color: COLORS.textSecondary }}>Change</button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors hover:opacity-80"
                    style={{ borderColor: COLORS.border, background: COLORS.inputBg }}>
                    <span className="text-2xl">📄</span>
                    <span className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Tap to upload Aadhaar, Passport, or Driver&apos;s License</span>
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handlePicUpload(e, setIdFile)} className="hidden" />
                  </label>
                )}
              </div>

              {/* Selfie */}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
                  Selfie <span style={{ color: COLORS.primary }}>*</span>
                </p>
                {selfieFile ? (
                  <div className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: COLORS.border, background: COLORS.inputBg }}>
                    <img src={selfieFile} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <span className="flex-1 text-sm" style={{ color: COLORS.textPrimary }}>Selfie uploaded</span>
                    <button type="button" onClick={() => setSelfieFile(null)} className="text-xs underline" style={{ color: COLORS.textSecondary }}>Change</button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors hover:opacity-80"
                    style={{ borderColor: COLORS.border, background: COLORS.inputBg }}>
                    <span className="text-2xl">📸</span>
                    <span className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Take a selfie or upload one</span>
                    <input type="file" accept="image/*" onChange={(e) => handlePicUpload(e, setSelfieFile)} className="hidden" />
                  </label>
                )}
              </div>

              {/* Verify button / status */}
              {!verified && !verifyError && (
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying || !idFile || !selfieFile}
                  className="w-full rounded-full py-3 text-sm font-medium text-white transition-all disabled:opacity-50"
                  style={{ background: COLORS.primary }}
                >
                  {verifying ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</span>
                  ) : (
                    "Submit for Verification"
                  )}
                </button>
              )}
              {verifyError && (
                <div className="rounded-xl p-4 text-center text-sm font-medium" style={{ background: "rgba(236,103,27,0.08)", color: COLORS.primary }}>
                  ⚠️ Please retake photo. The image wasn&apos;t clear enough.
                </div>
              )}
              {verified && (
                <div className="rounded-xl p-4 text-center text-sm font-medium" style={{ background: "rgba(236,103,27,0.08)", color: COLORS.primary }}>
                  ✅ Verified!
                </div>
              )}
            </motion.div>
          )}

          {error && <p className="mt-3 text-center text-xs" style={{ color: COLORS.primary }}>{error}</p>}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <button type="button" onClick={() => (step > 1 ? setStep((s) => s - 1) : router.push("/dashboard"))}
              className="inline-flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: COLORS.textSecondary }}>
              ← {step === 1 ? "Back to Dashboard" : "Previous"}
            </button>
            {step < 5 && (
              <button type="button" onClick={() => { if (canGoNext()) setStep((s) => s + 1); }}
                disabled={!canGoNext()}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: COLORS.primary }}>
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            )}
            {step === 5 && verified && (
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: COLORS.primary }}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Complete Profile"}
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        /* ─── Completion Screen ─── */
        <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl p-12 text-center"
          style={{ background: COLORS.card, boxShadow: "0 8px 30px rgba(236,103,27,0.08)" }}>
          <Confetti />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(236,103,27,0.08)" }}>
              <Check className="h-8 w-8" style={{ color: COLORS.primary }} />
            </div>
            <h2 className="font-name text-2xl font-semibold md:text-3xl" style={{ color: COLORS.textPrimary }}>
              Namaskaram! Your profile is now complete.
            </h2>
            <p className="max-w-sm text-sm" style={{ color: COLORS.textSecondary }}>
              You can now send likes and messages.
            </p>
            <button type="button" onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white transition-all"
              style={{ background: COLORS.primary }}>
              Start Exploring <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Sub-components ─── */

function Input({ label, value, onChange, placeholder, type = "text", min, max, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; min?: number; max?: number; required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
        {label} {required && <span style={{ color: COLORS.primary }}>*</span>}
      </span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} min={min} max={max}
        className="rounded-xl border px-4 py-3 text-base outline-none transition-colors"
        style={{ borderColor: COLORS.border, background: COLORS.inputBg, color: COLORS.textPrimary }} required={required} />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder, maxLength, required }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number; required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
        {label} {required && <span style={{ color: COLORS.primary }}>*</span>}
      </span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} rows={3}
        className="resize-none rounded-xl border px-4 py-3 text-base outline-none transition-colors"
        style={{ borderColor: COLORS.border, background: COLORS.inputBg, color: COLORS.textPrimary }} required={required} />
      {maxLength && <span className="text-right text-xs" style={{ color: COLORS.textSecondary }}>{value.length}/{maxLength}</span>}
    </label>
  );
}

function Select({ label, value, onChange, options, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
        {label} {required && <span style={{ color: COLORS.primary }}>*</span>}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border px-4 py-3 text-base outline-none transition-colors appearance-none"
        style={{ borderColor: COLORS.border, background: COLORS.inputBg, color: value ? COLORS.textPrimary : COLORS.textSecondary }} required={required}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function ButtonGroup({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>{label} <span style={{ color: COLORS.primary }}>*</span></span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => onChange(opt)}
            className="rounded-full border px-5 py-2 text-sm transition-all"
            style={{
              borderColor: value === opt ? COLORS.primary : COLORS.border,
              background: value === opt ? COLORS.primary : COLORS.card,
              color: value === opt ? "#FFFFFF" : COLORS.textSecondary,
            }}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border px-4 py-3"
      style={{ borderColor: COLORS.border, background: COLORS.inputBg }}>
      <span className="text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors`}
        style={{ background: value ? COLORS.primary : COLORS.border }}>
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

/* ─── Confetti ─── */

function Confetti() {
  const colors = [COLORS.primary, COLORS.secondary, COLORS.primary, COLORS.secondary];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 0.5,
    duration: 0.8 + Math.random() * 1.2, color: colors[i % colors.length], size: 6 + Math.random() * 8,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full"
          style={{ left: `${p.left}%`, width: p.size, height: p.size, background: p.color }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }} />
      ))}
    </div>
  );
}
