"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Camera, ChevronDown, Heart, Sparkles, Moon, Star, Users, Smile, Check } from "lucide-react";
import { validateFileSize, compressImage } from "@/lib/image-compress";
import { uploadProfilePhoto } from "@/lib/upload-photo";
import { useAuth } from "@/context/AuthContext";

const C = {
  bg: "#FAFAF8", card: "#FFFFFF", primary: "#EC4899", secondary: "#FF6B6B",
  textPrimary: "#1A1A1A", textSecondary: "#8A8A8A", border: "#EBEBEB", inputBg: "#F5F5F3",
};

const INDIAN_CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune", "Jaipur", "Lucknow", "Chandigarh", "Bhopal", "Indore", "Nagpur", "Coimbatore", "Kochi", "Goa", "Varanasi", "Rishikesh", "Other"];

const COMMUNITIES = ["Isha", "ISKCON", "Osho", "Art of Living", "Brahma Kumaris", "TM", "Other"];

const PRIMARY_PRACTICES: Record<string, string[]> = {
  Isha: ["Yoga", "Meditation", "Inner Engineering", "Shambhavi Mahamudra", "Surya Kriya", "Bhakti Sadhana"],
  ISKCON: ["Kirtan", "Bhajan", "Deity Worship", "Bhagavad Gita Study", "Harinaam", "Prasadam"],
  Osho: ["Dynamic Meditation", "Kundalini Meditation", "Vipassana", "Sufi Whirling", "Therapy Groups"],
  "Art of Living": ["Sudarshan Kriya", "Pranayama", "Sahaj Samadhi", "Yes!+ Course", "Sri Sri Yoga"],
  "Brahma Kumaris": ["Rajyoga Meditation", "Murli Study", "Silence Retreat", "Peace Education"],
  TM: ["Transcendental Meditation", "Yoga Nidra", "Advanced TM Sidhis"],
};

const PROFESSIONS = ["Engineer", "Doctor", "Teacher", "Business", "Student", "Homemaker", "Other"];
const INCOME_RANGES = ["₹0-3L", "₹3-6L", "₹6-10L", "₹10-20L", "₹20L+"];
const EDUCATION = ["High School", "Graduate", "Post Graduate", "Doctorate"];
const FAMILY_STATUS = ["Nuclear", "Joint", "Living with Parents", "Other"];
const FAMILY_VALUES = ["Traditional", "Modern", "Progressive", "Mixed"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "Occasionally"];
const PRACTICE_HOURS = ["<1 hour", "1-2 hours", "2-3 hours", "3+ hours"];
const SACRED_SPACES = ["Dhyanalinga", "Adiyogi", "Temple", "Ashram", "Home", "Nature", "Other"];
const LOOKING_FOR = ["Life_Partner", "Spiritual_Companion", "Friend", "Community_Connection"];
const LOCATION_PREF = ["Same_City", "Same_State", "Anywhere"];
const COMMUNITY_PREF = ["Same_Community", "Any_Community"];
const EXERCISE = ["Daily", "Weekly", "Occasionally", "Never"];
const TIMEZONES = ["IST (UTC+5:30)", "EST (UTC-5:00)", "PST (UTC-8:00)", "GMT (UTC+0:00)", "Other"];
const DIET = ["Vegetarian", "Vegan", "Non_Vegetarian", "Eggetarian"];
const ALCOHOL = ["Never", "Occasionally", "Socially"];
const LIFESTYLE_OPTIONS = ["Vegetarian", "Non-smoker", "Non-drinker", "Morning Person", "Meditator", "Yoga Practitioner"];

function SectionFrame({ icon: Icon, title, subtitle, open, onToggle, children }: any) {
  return (
    <div className="mb-4 rounded-2xl border" style={{ borderColor: C.border, background: C.card }}>
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-5 py-4 text-left">
        <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(236,103,27,0.08)" }}>
          <Icon className="h-4 w-4" style={{ color: C.primary }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold" style={{ color: C.textPrimary }}>{title}</h3>
          <p className="text-xs" style={{ color: C.textSecondary }}>{subtitle}</p>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: C.textSecondary }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} className="overflow-visible">
            <div className="space-y-4 px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProfileEditPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const dragIndex = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [me, setMe] = useState<any>(null);
  const [openSection, setOpenSection] = useState("about");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<any>({});
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    fetch("/api/profiles/feed")
      .then((r) => r.json())
      .then((data) => {
        const u = data.user;
        if (!u) return;
        setMe(u);
        setForm({
          full_name: u.name ?? "",
          age: String(u.age ?? ""),
          gender: u.gender ?? "",
          location: u.location ?? "",
          diet: u.diet ?? "Vegetarian",
          alcohol: u.alcohol ?? "Never",
          smoking: u.smoking ? "Yes" : "No",
          photos: u.photos ?? [],
          main_photo_index: 0,
          profession: u.profession ?? "",
          income_range: u.income_range ?? "",
          education: u.education ?? "",
          family_status: u.family_status ?? "",
          family_values: u.family_values ?? "",
          community: u.spiritual_community ?? "",
          community_other: u.spiritual_community_other ?? "",
          primary_practice: u.primary_practice ?? "",
          practice_frequency: u.practice_frequency ?? "",
          practice_hours: u.practice_hours ?? "",
          years_active: String(u.years_practicing ?? ""),
          favorite_space: u.favorite_space ?? "",
          guru_connection: u.guru_connection ?? "",
          spiritual_commitment: u.spiritual_commitment ?? "",
          life_goals: u.life_goals ?? "",
          looking_for: u.looking_for ?? "",
          age_range_min: String(u.partner_age_min ?? ""),
          age_range_max: String(u.partner_age_max ?? ""),
          location_preference: u.partner_location ?? "",
          community_preference: u.partner_community ?? "",
          lifestyle_match: u.partner_lifestyle ?? [],
          morning_person: u.morning_person ?? false,
          exercise: u.exercise ?? "",
          birth_date: u.birth_date ?? "",
          birth_time: u.birth_time ?? "",
          birth_location: u.birth_location ?? "",
          timezone: u.birth_timezone ?? "",
        });
      });
  }, [authUser]);

  function set(field: string, value: any) {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  }

  function toggleLifestyle(opt: string) {
    const current = form.lifestyle_match ?? [];
    set("lifestyle_match", current.includes(opt) ? current.filter((x: string) => x !== opt) : [...current, opt]);
  }

  function addPhotoUrl(url: string) {
    set("photos", [url]);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    const validationError = validateFileSize(file);
    if (validationError) {
      setPhotoError(validationError);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setUploading(true);
      const publicUrl = await uploadProfilePhoto(compressed.blob);
      addPhotoUrl(publicUrl);
    } catch (err: any) {
      setPhotoError(err.message || "Failed to upload photo.");
    }
    setCompressing(false);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto() {
    set("photos", []);
  }

  async function handleSave() {
    setSaving(true);
    const payload: any = {
      name: form.full_name,
      age: parseInt(form.age) || 0,
      gender: form.gender,
      location: form.location,
      diet: form.diet,
      alcohol: form.alcohol,
      smoking: form.smoking === "Yes",
      photos: form.photos,
      profile_completeness: 100,
      spiritual_community: form.community === "Other" ? form.community_other : form.community,
      spiritual_community_other: form.community === "Other" ? form.community_other : undefined,
      primary_practice: form.primary_practice,
      practice_frequency: form.practice_frequency,
      practice_hours: form.practice_hours,
      years_practicing: parseInt(form.years_active) || 0,
      favorite_space: form.favorite_space,
      guru_connection: form.guru_connection,
      spiritual_commitment: form.spiritual_commitment,
      life_goals: form.life_goals,
      looking_for: form.looking_for,
      partner_age_min: parseInt(form.age_range_min) || 18,
      partner_age_max: parseInt(form.age_range_max) || 80,
      partner_location: form.location_preference,
      partner_community: form.community_preference,
      partner_lifestyle: form.lifestyle_match,
      morning_person: form.morning_person,
      exercise: form.exercise,
      profession: form.profession,
      income_range: form.income_range,
      education: form.education,
      family_status: form.family_status,
      family_values: form.family_values,
      birth_date: form.birth_date || undefined,
      birth_time: form.birth_time || undefined,
      birth_location: form.birth_location || undefined,
      birth_timezone: form.timezone || undefined,
    };

    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      fetch("/api/embeddings/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).catch(() => {});

      setSaving(false);
      setSaved(true);
      setTimeout(() => router.push("/profile"), 800);
    } catch {
      setSaving(false);
    }
  }

  if (!me) {
    return (
      <div className="flex min-h-dvh items-center justify-center" style={{ background: C.bg }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: C.primary }} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh" style={{ background: C.bg }}>
      <header className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: C.border, background: C.card }}>
        <button type="button" onClick={() => router.back()} className="text-sm font-medium" style={{ color: C.textSecondary }}>← Back</button>
        <h1 className="font-name text-base font-semibold" style={{ color: C.textPrimary }}>Edit Profile</h1>
        <div className="w-10" />
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6 pb-32">
        <SectionFrame icon={Camera} title="Your Photo" subtitle="One clear photo of yourself" open={openSection === "photos"} onToggle={() => setOpenSection(openSection === "photos" ? "" : "photos")}>
          <div>
            <p className="mb-3 text-sm" style={{ color: C.textSecondary }}>Upload one clear photo. Images are compressed automatically to keep the app fast.</p>
            {(form.photos ?? []).length > 0 ? (
              <div className="relative mx-auto w-40">
                <div className="aspect-square overflow-hidden rounded-2xl border-2" style={{ borderColor: C.primary }}>
                  <img src={form.photos[0]} alt="" className="h-full w-full object-cover" />
                </div>
                <button type="button" onClick={removePhoto}
                  className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md"
                  style={{ background: "#EF4444" }}>
                  ✕
                </button>
                <p className="mt-2 text-center text-[10px]" style={{ color: C.textSecondary }}>
                  Stored in cloud
                </p>
              </div>
            ) : (
              <label className="mx-auto flex w-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors hover:bg-[#EBEBEB]"
                style={{ borderColor: compressing || uploading ? C.primary : C.border, background: C.inputBg, aspectRatio: "1" }}>
                {compressing || uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: C.primary }} />
                ) : (
                  <>
                    <Camera className="h-8 w-8" style={{ color: C.textSecondary }} />
                    <span className="mt-2 text-xs font-medium" style={{ color: C.textSecondary }}>Tap to upload</span>
                    <span className="mt-1 text-[10px]" style={{ color: C.textSecondary }}>Max 5MB · JPG/PNG</span>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} className="hidden" />
              </label>
            )}
            {photoError && (
              <p className="mt-2 text-center text-xs font-medium" style={{ color: "#EF4444" }}>{photoError}</p>
            )}
          </div>
        </SectionFrame>

        <SectionFrame icon={Smile} title="About You" subtitle="The little things that make you, you" open={openSection === "about"} onToggle={() => setOpenSection(openSection === "about" ? "" : "about")}>
          <Input label="Full Name" value={form.full_name} onChange={(v: string) => set("full_name", v)} placeholder="What should we call you?" />
          <Input label="Age" value={form.age} onChange={(v: string) => set("age", v)} type="number" placeholder="Your age" />
          <Select label="Gender" value={form.gender} onChange={(v: string) => set("gender", v)} options={["", "Male", "Female", "Other"]} />
          <Select label="Location" value={form.location} onChange={(v: string) => set("location", v)} options={["", ...INDIAN_CITIES]} placeholder="Select your city" />
        </SectionFrame>

        <SectionFrame icon={Users} title="Professional Life" subtitle="Your worldly journey" open={openSection === "professional"} onToggle={() => setOpenSection(openSection === "professional" ? "" : "professional")}>
          <Select label="Profession" value={form.profession} onChange={(v: string) => set("profession", v)} options={["", ...PROFESSIONS]} />
          <Select label="Income Range" value={form.income_range} onChange={(v: string) => set("income_range", v)} options={["", ...INCOME_RANGES]} />
          <Select label="Education" value={form.education} onChange={(v: string) => set("education", v)} options={["", ...EDUCATION]} />
          <Select label="Family Status" value={form.family_status} onChange={(v: string) => set("family_status", v)} options={["", ...FAMILY_STATUS]} />
          <Select label="Family Values" value={form.family_values} onChange={(v: string) => set("family_values", v)} options={["", ...FAMILY_VALUES]} />
        </SectionFrame>

        <SectionFrame icon={Sparkles} title="Spiritual Identity" subtitle="Your inner landscape" open={openSection === "spiritual"} onToggle={() => setOpenSection(openSection === "spiritual" ? "" : "spiritual")}>
          <Select label="Community" value={form.community} onChange={(v: string) => set("community", v)} options={["", ...COMMUNITIES]} />
          {form.community === "Other" && <Input label="Specify Your Community" value={form.community_other} onChange={(v: string) => set("community_other", v)} placeholder="Tell us about your spiritual path" />}
          {form.community && form.community !== "Other" && (
            <Select label="Primary Practice" value={form.primary_practice} onChange={(v: string) => set("primary_practice", v)} options={["", ...(PRIMARY_PRACTICES[form.community] ?? [])]} />
          )}
          <Select label="Practice Frequency" value={form.practice_frequency} onChange={(v: string) => set("practice_frequency", v)} options={["", ...FREQUENCIES]} />
          <Select label="Practice Hours Per Day" value={form.practice_hours} onChange={(v: string) => set("practice_hours", v)} options={["", ...PRACTICE_HOURS]} />
          <Input label="Years Practicing" value={form.years_active} onChange={(v: string) => set("years_active", v)} type="number" placeholder="How many years have you been on this path?" />
          <Select label="Favorite Sacred Space" value={form.favorite_space} onChange={(v: string) => set("favorite_space", v)} options={["", ...SACRED_SPACES]} />
        </SectionFrame>

        <SectionFrame icon={Star} title="Spiritual Depth" subtitle="Reflect on your path" open={openSection === "depth"} onToggle={() => setOpenSection(openSection === "depth" ? "" : "depth")}>
          <p className="text-sm italic" style={{ color: C.textSecondary }}>Take a moment to reflect. These answers will help others understand the real you.</p>
          <TextArea label="Your Guru Connection" value={form.guru_connection} onChange={(v: string) => set("guru_connection", v)} prompt="What does your Guru mean to you?" maxLength={500} />
          <TextArea label="Your Spiritual Commitment" value={form.spiritual_commitment} onChange={(v: string) => set("spiritual_commitment", v)} prompt="How has your practice changed you?" maxLength={500} />
          <TextArea label="Your Life Goals" value={form.life_goals} onChange={(v: string) => set("life_goals", v)} prompt="What's your vision for your life?" maxLength={500} />
        </SectionFrame>

        <SectionFrame icon={Heart} title="What You're Looking For" subtitle="The soul you wish to meet" open={openSection === "looking"} onToggle={() => setOpenSection(openSection === "looking" ? "" : "looking")}>
          <Select label="Looking For" value={form.looking_for} onChange={(v: string) => set("looking_for", v)} options={["", ...LOOKING_FOR]} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Minimum Age" value={form.age_range_min} onChange={(v: string) => set("age_range_min", v)} type="number" placeholder="Min" />
            <Input label="Maximum Age" value={form.age_range_max} onChange={(v: string) => set("age_range_max", v)} type="number" placeholder="Max" />
          </div>
          <Select label="Location Preference" value={form.location_preference} onChange={(v: string) => set("location_preference", v)} options={["", ...LOCATION_PREF]} />
          <Select label="Community Preference" value={form.community_preference} onChange={(v: string) => set("community_preference", v)} options={["", ...COMMUNITY_PREF]} />
          <div>
            <p className="mb-2 text-sm font-medium" style={{ color: C.textPrimary }}>Lifestyle Match — What matters to you in a partner?</p>
            <div className="flex flex-wrap gap-2">
              {LIFESTYLE_OPTIONS.map((opt) => (
                <button key={opt} type="button" onClick={() => toggleLifestyle(opt)}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                  style={{
                    borderColor: (form.lifestyle_match ?? []).includes(opt) ? C.primary : C.border,
                    background: (form.lifestyle_match ?? []).includes(opt) ? "rgba(236,103,27,0.08)" : C.card,
                    color: (form.lifestyle_match ?? []).includes(opt) ? C.primary : C.textSecondary,
                  }}>
                  {(form.lifestyle_match ?? []).includes(opt) ? "✓ " : ""}{opt}
                </button>
              ))}
            </div>
          </div>
        </SectionFrame>

        <SectionFrame icon={Moon} title="Lifestyle" subtitle="Your daily rhythm" open={openSection === "lifestyle"} onToggle={() => setOpenSection(openSection === "lifestyle" ? "" : "lifestyle")}>
          <div>
            <p className="mb-2 text-sm font-medium" style={{ color: C.textPrimary }}>Diet</p>
            <div className="flex flex-wrap gap-2">
              {DIET.map((d) => (
                <button key={d} type="button" onClick={() => set("diet", d)}
                  className="rounded-full border px-4 py-2 text-xs font-medium transition-all"
                  style={{ borderColor: form.diet === d ? C.primary : C.border, background: form.diet === d ? C.primary : C.card, color: form.diet === d ? "#fff" : C.textSecondary }}>{d}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium" style={{ color: C.textPrimary }}>Alcohol</p>
            <div className="flex flex-wrap gap-2">
              {ALCOHOL.map((a) => (
                <button key={a} type="button" onClick={() => set("alcohol", a)}
                  className="rounded-full border px-4 py-2 text-xs font-medium transition-all"
                  style={{ borderColor: form.alcohol === a ? C.primary : C.border, background: form.alcohol === a ? C.primary : C.card, color: form.alcohol === a ? "#fff" : C.textSecondary }}>{a}</button>
              ))}
            </div>
          </div>
          <Toggle label="Smoking" value={form.smoking === "Yes"} onChange={(v: boolean) => set("smoking", v ? "Yes" : "No")} />
          <Toggle label="Morning Person" value={form.morning_person} onChange={(v: boolean) => set("morning_person", v)} />
          <Select label="Exercise" value={form.exercise} onChange={(v: string) => set("exercise", v)} options={["", ...EXERCISE]} />
        </SectionFrame>

        <SectionFrame icon={Star} title="Astrological Details" subtitle="The cosmos within you (optional)" open={openSection === "astrology"} onToggle={() => setOpenSection(openSection === "astrology" ? "" : "astrology")}>
          <p className="text-sm" style={{ color: C.textSecondary }}>These details help us generate accurate compatibility insights based on Vedic astrology. They are completely optional but recommended.</p>
          <Input label="Birth Date" value={form.birth_date} onChange={(v: string) => set("birth_date", v)} type="date" />
          <Input label="Birth Time" value={form.birth_time} onChange={(v: string) => set("birth_time", v)} type="time" />
          <Input label="Birth Coordinates" value={form.birth_location} onChange={(v: string) => set("birth_location", v)} placeholder="latitude,longitude (e.g. 19.0760,72.8777)" />
          <p className="text-[10px] leading-relaxed" style={{ color: C.textSecondary }}>Find your birth coordinates from <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Maps</a> (right-click on your birthplace). Used by our Vedic astrology engine (Navamsha) for accurate chart calculations.</p>
          <Select label="Timezone" value={form.timezone} onChange={(v: string) => set("timezone", v)} options={["", ...TIMEZONES]} />
        </SectionFrame>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t px-4 py-4" style={{ borderColor: C.border, background: C.card }}>
        <div className="mx-auto max-w-2xl">
          <button type="button" onClick={handleSave} disabled={saving || saved}
            className="w-full rounded-full py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#BE185D] disabled:opacity-70"
            style={{ background: C.primary }}>
            {saving ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium" style={{ color: C.textSecondary }}>{label}</span>
      <input type={type ?? "text"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#EC4899]"
        style={{ borderColor: C.border, background: C.inputBg, color: C.textPrimary }} />
    </label>
  );
}

function Select({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const display = value || placeholder || "Select...";

  return (
    <label className="block" ref={ref}>
      <span className="mb-1 block text-xs font-medium" style={{ color: C.textSecondary }}>{label}</span>
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm outline-none transition-all"
          style={{
            borderColor: open ? C.primary : C.border,
            background: C.inputBg,
            color: value ? C.textPrimary : C.textSecondary,
          }}>
          <span className="truncate">{display}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} style={{ color: C.textSecondary }} />
        </button>
        {open && (
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border py-1"
            style={{ background: C.card, borderColor: C.border, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
            {options.map((o) => (
              <button key={o} type="button"
                onClick={() => { onChange(o); setOpen(false); }}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors"
                style={{
                  background: value === o ? "rgba(0,0,0,0.04)" : "transparent",
                  color: C.textPrimary,
                }}>
                <span className={value === o ? "font-medium" : ""}>{o || (placeholder || "Select...")}</span>
                {value === o && <Check className="h-4 w-4 shrink-0" style={{ color: C.primary }} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </label>
  );
}

function TextArea({ label, value, onChange, prompt, maxLength }: { label: string; value: string; onChange: (v: string) => void; prompt: string; maxLength: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium" style={{ color: C.textSecondary }}>{label}</span>
      <p className="mb-2 text-sm italic" style={{ color: C.textSecondary }}>"{prompt}"</p>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} rows={4}
        className="w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[#EC4899]"
        style={{ borderColor: C.border, background: C.inputBg, color: C.textPrimary }} />
      <p className="mt-1 text-right text-[10px]" style={{ color: C.textSecondary }}>{value.length}/{maxLength}</p>
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: C.border, background: C.inputBg }}>
      <span className="text-sm" style={{ color: C.textPrimary }}>{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors`}
        style={{ background: value ? C.primary : C.border }}>
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
