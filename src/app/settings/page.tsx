"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, User, Shield, Bell, HelpCircle, LogOut, Crown, ChevronRight } from "lucide-react";
import UpgradeModal, { type UpgradeVariant } from "@/components/modals/UpgradeModal";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";

const SHOW_PRICING = false; // Flip to true to re-enable premium/pricing UI

const C = {
  bg: "#FAFAF8", card: "#FFFFFF", primary: "#EC4899", secondary: "#FF6B6B",
  textPrimary: "#1A1A1A", textSecondary: "#8A8A8A", border: "#EBEBEB", inputBg: "#F5F5F3",
};

interface Settings {
  messagePermission: "mutual" | "anyone";
  contactVisibility: "nobody" | "mutual" | "ultimate";
  showPhone: boolean;
  showEmail: boolean;
  pushNotifications: boolean;
  swipeGesture: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, signOut } = useAuth();
  const [me, setMe] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [upgradeVariant, setUpgradeVariant] = useState<UpgradeVariant | null>(null);

  const [settings, setSettings] = useState<Settings>({
    messagePermission: "mutual",
    contactVisibility: "nobody",
    showPhone: false,
    showEmail: false,
    pushNotifications: false,
    swipeGesture: true,
  });

  useEffect(() => {
    if (!authUser) return;
    fetch("/api/profiles/feed")
      .then((r) => r.json())
      .then((data) => {
        const u = data.user;
        if (!u) return;
        setMe(u);
        setSettings({
          messagePermission: u.message_permission ?? "mutual",
          contactVisibility: u.contact_visibility ?? "nobody",
          showPhone: u.phone_visible ?? false,
          showEmail: u.email_visible ?? false,
          pushNotifications: u.notifications_enabled ?? false,
          swipeGesture: u.swipe_gesture_enabled ?? true,
        });
      });
  }, [authUser]);

  function set<K extends keyof Settings>(field: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message_permission: settings.messagePermission,
          contact_visibility: settings.contactVisibility,
          phone_visible: settings.showPhone,
          email_visible: settings.showEmail,
          notifications_enabled: settings.pushNotifications,
          swipe_gesture_enabled: settings.swipeGesture,
        }),
      });
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setIsSaving(false);
    }
  }

  function handleUpgrade() {
    setUpgradeVariant(null);
    window.location.reload();
  }

  if (!me) {
    return (
      <div className="flex min-h-dvh items-center justify-center" style={{ background: C.bg }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: C.primary, borderTopColor: "transparent" }} />
      </div>
    );
  }

  const isFree = me.tier === "free";
  const tierLabel = isFree ? "Free" : me.tier === "ultimate" ? "Ultimate" : "Seeker";

  return (
    <div className="min-h-dvh pb-20" style={{ background: C.bg }}>
      <header className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: C.border, background: C.card }}>
        <button type="button" onClick={() => router.push("/dashboard")} className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#EBEBEB]" style={{ color: C.textSecondary }}>
          <X className="h-4 w-4" />
        </button>
        <div className="text-center">
          <h1 className="font-name text-lg font-semibold" style={{ color: C.textPrimary }}>Settings</h1>
          <p className="text-xs" style={{ color: C.textSecondary }}>Manage your privacy and preferences</p>
        </div>
        <div className="w-8" />
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6 pb-32">
        <Section title="Account" icon={User}>
          <Row onClick={() => router.push("/profile/edit")}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(236,103,27,0.08)" }}>
                <User className="h-4 w-4" style={{ color: C.primary }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: C.textPrimary }}>Edit Profile</p>
                <p className="text-xs" style={{ color: C.textSecondary }}>Update your photos, bio, and spiritual details</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4" style={{ color: C.textSecondary }} />
          </Row>
          {/* Plans & Pricing — hidden during early offer */}
          {SHOW_PRICING && (
            <Row onClick={() => setUpgradeVariant("fomo")}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(236,103,27,0.08)" }}>
                  <Crown className="h-4 w-4" style={{ color: C.primary }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: C.textPrimary }}>Plans &amp; Pricing</p>
                  <p className="text-xs" style={{ color: C.textSecondary }}>Current plan: <span style={{ color: C.primary }}>{tierLabel}</span></p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4" style={{ color: C.textSecondary }} />
            </Row>
          )}
        </Section>

        <Section title="Privacy" icon={Shield}>
          <SelectSetting
            label="Message Permission"
            description={settings.messagePermission === "anyone" ? "Anyone can message you" : "Only people you've mutually liked can message you"}
            value={settings.messagePermission}
            onChange={(v) => set("messagePermission", v as "mutual" | "anyone")}
            options={[
              { value: "mutual", label: "Only mutual likes" },
              { value: "anyone", label: "Anyone can message me" },
            ]}
          />
          <SelectSetting
            label="Contact Visibility"
            description="Who can see your phone number and email"
            value={settings.contactVisibility}
            onChange={(v) => set("contactVisibility", v as "nobody" | "mutual" | "ultimate")}
            options={[
              { value: "nobody", label: "Nobody (Recommended)" },
              { value: "mutual", label: "Only mutual matches" },
              { value: "ultimate", label: "Anyone on Ultimate plan" },
            ]}
          />
          <ToggleSetting
            label="Phone Number Visibility"
            description="Show your phone number to users who can see your contact info"
            value={settings.showPhone}
            onChange={(v) => set("showPhone", v)}
          />
          <ToggleSetting
            label="Email Visibility"
            description="Show your email to users who can see your contact info"
            value={settings.showEmail}
            onChange={(v) => set("showEmail", v)}
          />
        </Section>

        <Section title="Notifications" icon={Bell}>
          {/* Notifications paywall hidden during early offer */}
          {SHOW_PRICING && isFree ? (
            <div className="rounded-xl border p-4 text-center" style={{ borderColor: C.border, background: C.inputBg }}>
              <p className="text-sm font-medium" style={{ color: C.textPrimary }}>🔔 Notifications are available on Seeker &amp; Ultimate plans</p>
              <button type="button" onClick={() => setUpgradeVariant("fomo")} className="mt-2 text-xs font-medium underline" style={{ color: C.primary }}>Upgrade to enable</button>
            </div>
          ) : (
            <ToggleSetting
              label="Push Notifications"
              description="Receive push notifications for likes, messages, and matches"
              value={settings.pushNotifications}
              onChange={(v) => set("pushNotifications", v)}
            />
          )}
        </Section>

        <Section title="Experience" icon={Bell}>
          <ToggleSetting
            label="Swipe Gestures"
            description="Drag cards to like or pass. Disable for button-only mode (smoother on older phones)"
            value={settings.swipeGesture}
            onChange={(v) => set("swipeGesture", v)}
          />
        </Section>

        <Section title="Support" icon={HelpCircle}>
          <Row onClick={() => window.open("https://bhavaspanda.com/help", "_blank")}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(236,103,27,0.08)" }}>
                <HelpCircle className="h-4 w-4" style={{ color: C.primary }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: C.textPrimary }}>Help &amp; Support</p>
                <p className="text-xs" style={{ color: C.textSecondary }}>Get help with your account or report a problem</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4" style={{ color: C.textSecondary }} />
          </Row>
        </Section>

        <Section title="" icon={LogOut}>
          <button type="button" onClick={async () => { await signOut(); router.push("/auth"); }}
            className="flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-all hover:bg-red-50"
            style={{ borderColor: "#FECACA", color: "#DC2626", background: "#FEF2F2" }}>
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </Section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t px-4 py-4" style={{ borderColor: C.border, background: C.card }}>
        <div className="mx-auto max-w-2xl">
          <button type="button" onClick={handleSave} disabled={isSaving || saved}
            className="w-full rounded-full py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#BE185D] disabled:opacity-70"
            style={{ background: C.primary }}>
            {isSaving ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : saved ? "✓ Saved!" : "Save Settings"}
          </button>
        </div>
      </div>

      <UpgradeModal variant={upgradeVariant ?? "fomo"} open={upgradeVariant !== null} onClose={() => setUpgradeVariant(null)} onUpgrade={handleUpgrade} />
      <BottomNav />
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <motion.div
      className="mb-5 overflow-hidden rounded-2xl border"
      style={{ borderColor: C.border, background: C.card }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {title && (
        <div className="flex items-center gap-2 border-b px-5 py-3.5" style={{ borderColor: C.border }}>
          <Icon className="h-4 w-4" style={{ color: C.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: C.textPrimary }}>{title}</h2>
        </div>
      )}
      <div className="divide-y px-5" style={{ borderColor: C.border }}>{children}</div>
    </motion.div>
  );
}

function Row({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between py-3.5 text-left transition-colors hover:opacity-80">
      {children}
    </button>
  );
}

function ToggleSetting({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium" style={{ color: C.textPrimary }}>{label}</p>
        <p className="text-xs" style={{ color: C.textSecondary }}>{description}</p>
      </div>
      <button type="button" onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors`}
        style={{ background: value ? C.primary : C.border }}>
        <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function SelectSetting({ label, description, value, onChange, options }: { label: string; description: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="py-3.5">
      <p className="text-sm font-medium" style={{ color: C.textPrimary }}>{label}</p>
      <p className="mb-2 text-xs" style={{ color: C.textSecondary }}>{description}</p>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors appearance-none"
        style={{ borderColor: C.border, background: C.inputBg, color: C.textPrimary }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
