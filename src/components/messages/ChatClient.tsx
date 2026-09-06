"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Crown } from "lucide-react";
import UpgradeModal, { type UpgradeVariant } from "@/components/modals/UpgradeModal";

const C = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  primary: "#EC4899",
  secondary: "#FF6B6B",
  textPrimary: "#1A1A1A",
  textSecondary: "#8A8A8A",
  border: "#EBEBEB",
  inputBg: "#F5F5F3",
  shadow: "0 8px 30px rgba(236,72,153,0.08)",
};

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface OtherProfile {
  id: string;
  full_name: string | null;
  age: number | null;
  location: string | null;
  profile_pic_url: string | null;
  spiritual_practices: string[];
  zodiac: string | null;
  nakshatra: string | null;
  gotra: string | null;
  bio: string | null;
  tier: string;
}

export default function ChatClient({
  initialMessages,
  otherProfile,
  viewerTier,
  viewerId,
  profileComplete = true,
}: {
  initialMessages: Message[];
  otherProfile: OtherProfile;
  viewerTier: string;
  viewerId: string;
  profileComplete?: boolean;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [upgradeVariant, setUpgradeVariant] = useState<UpgradeVariant | null>(null);
  const [dailyRemaining, setDailyRemaining] = useState<{ messagesRemaining: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isFree = viewerTier === "free";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch(`/api/profiles/feed?userId=${viewerId}`)
      .then((r) => r.json())
      .then((data) => {
        setDailyRemaining({ messagesRemaining: data.messagesRemaining ?? 0 });
      })
      .catch(() => {});
  }, [viewerId]);

  useEffect(() => {
    let active = true;
    const interval = setInterval(async () => {
      if (!document.hidden && active) {
        try {
          const res = await fetch(`/api/messages/${otherProfile.id}?poll=true`);
          const data = await res.json();
          if (data.messages) {
            setMessages((prev) => {
              const existing = new Set(prev.map((m) => m.id));
              const newOnes = data.messages.filter((m: Message) => !existing.has(m.id));
              if (newOnes.length === 0) return prev;
              return [...prev, ...newOnes];
            });
          }
        } catch {}
      }
    }, 10000);
    return () => { active = false; clearInterval(interval); };
  }, [viewerId, otherProfile.id]);

  const remaining =
    dailyRemaining ?? { messagesRemaining: isFree ? 3 : Infinity };

  const sendMessage = useCallback(async () => {
    if (!profileComplete) {
      router.push("/onboarding");
      return;
    }
    const text = input.trim();
    if (!text || sending) return;

    // Message limit check hidden during early offer
    // if (remaining.messagesRemaining <= 0) {
    //   setUpgradeVariant("message-exhausted");
    //   return;
    // }

    setSending(true);
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: otherProfile.id, content: text }),
      });
      const data = await res.json();
      // Blocked check hidden during early offer
      // if (data.blocked) {
      //   setUpgradeVariant("message-exhausted");
      //   return;
      // }
      if (data.ok && data.message) {
        setMessages((prev) => [...prev, data.message as Message]);
        setInput("");
        setDailyRemaining((prev) =>
          prev ? { messagesRemaining: Math.max(0, prev.messagesRemaining - 1) } : prev,
        );
      }
    } finally {
      setSending(false);
    }
  }, [input, sending, viewerId, otherProfile.id, profileComplete, remaining.messagesRemaining, router]);

  return (
    <main className="relative flex min-h-dvh flex-col" style={{ background: C.bg }}>
      {/* Top Bar */}
      <header className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: C.border, background: C.card }}>
        <button type="button" onClick={() => router.push("/messages")} style={{ color: C.textSecondary }}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full" style={{ background: "rgba(236,103,27,0.08)" }}>
          {otherProfile.profile_pic_url ? (
            <img src={otherProfile.profile_pic_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-name text-sm" style={{ color: C.primary }}>
              {otherProfile.full_name?.charAt(0) ?? "?"}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-medium" style={{ color: C.textPrimary }}>
            {otherProfile.full_name ?? "Unknown"}
          </h2>
          {otherProfile.location && (
            <p className="truncate text-xs" style={{ color: C.textSecondary }}>{otherProfile.location}</p>
          )}
        </div>
        {/* Message count badge hidden during early offer */}
      </header>

      {/* Messages */}
      <section className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <span className="text-4xl">💬</span>
              <p className="text-sm" style={{ color: C.textSecondary }}>
                Send a message to start the conversation
              </p>
            </div>
          )}
          {messages.map((m) => {
            const isMine = m.sender_id === viewerId;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMine ? "rounded-br-md" : "rounded-bl-md"}`}
                  style={{
                    background: isMine ? C.card : C.secondary,
                    border: isMine ? `1px solid ${C.border}` : "none",
                  }}
                >
                  <p className="text-sm" style={{ color: isMine ? C.textPrimary : C.textPrimary }}>
                    {m.content}
                  </p>
                  <p className={`mt-0.5 text-right text-[10px]`} style={{ color: isMine ? C.textSecondary : "rgba(45,42,36,0.6)" }}>
                    {new Date(m.created_at).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </section>

      {/* Input bar */}
      <div className="border-t px-4 py-3" style={{ borderColor: C.border, background: C.card }}>
        {!profileComplete ? (
          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className="w-full rounded-full py-3 text-sm font-medium text-white hover:bg-[#BE185D]"
            style={{ background: C.primary }}
          >
            Complete your profile to send messages
          </button>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={2000}
              className="flex-1 rounded-full border px-4 py-2.5 text-sm outline-none transition-colors"
              style={{ borderColor: C.border, background: C.inputBg, color: C.textPrimary }}
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-all disabled:opacity-40 hover:bg-[#BE185D]"
              style={{ background: C.primary }}
            >
              {sending ? <span className="h-4 w-4 animate-pulse rounded-full bg-white/60" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        )}
      </div>

      <UpgradeModal
        variant={upgradeVariant ?? "message-exhausted"}
        open={upgradeVariant !== null}
        onClose={() => setUpgradeVariant(null)}
        onUpgrade={(tier) => {
          window.location.reload();
        }}
      />
    </main>
  );
}
