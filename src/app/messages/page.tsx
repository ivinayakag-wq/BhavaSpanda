"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, MessageCircle, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ProfileCompletionGate from "@/components/ProfileCompletionGate";
import { useAuth } from "@/context/AuthContext";

const C = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  primary: "#EC4899",
  textPrimary: "#1A1A1A",
  textSecondary: "#8A8A8A",
  border: "#EBEBEB",
};

interface Conversation {
  otherUserId: string;
  otherName: string;
  otherProfile?: { profile_pic_url?: string | null };
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    if (!authUser) return;
    (async () => {
      try {
        const [convRes, feedRes] = await Promise.all([
          fetch("/api/messages/conversations"),
          fetch("/api/profiles/feed"),
        ]);
        const convData = await convRes.json();
        const feedData = await feedRes.json();
        setConversations(convData.conversations ?? []);
        setMe(feedData.user ?? null);
      } catch {}
      setLoading(false);
    })();
  }, [authUser]);

  const filtered = conversations.filter((c) =>
    (c.otherName ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const matches = conversations.filter((c) => c.lastMessage).slice(0, 8);

  function formatTime(dateStr: string | null) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins} mins`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hrs`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays} days`;
    return d.toLocaleDateString();
  }

  const profileComplete = (me?.profile_completeness ?? 0) >= 100;

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center" style={{ background: C.bg }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: C.primary }} />
      </div>
    );
  }

  if (!profileComplete) {
    return <ProfileCompletionGate completeness={me?.profile_completeness ?? 0} />;
  }

  return (
    <div className="min-h-dvh pb-24" style={{ background: C.bg }}>
      <header className="sticky top-0 z-20 px-5 pt-5 pb-3" style={{ background: C.bg }}>
        <h1 className="font-name text-xl font-bold" style={{ color: C.textPrimary }}>Chatting</h1>
      </header>

      {matches.length > 0 && (
        <section className="px-5 pb-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: C.textSecondary }}>Matches</h2>
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            <button type="button" className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed"
                style={{ borderColor: C.border, color: C.textSecondary }}>
                <span className="text-2xl">+</span>
              </div>
              <span className="text-[10px] font-medium" style={{ color: C.textSecondary }}>Add Story</span>
            </button>
            {matches.map((c) => (
              <button key={c.otherUserId} type="button"
                onClick={() => router.push(`/messages/${c.otherUserId}`)}
                className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2"
                  style={{ borderColor: C.primary }}>
                  {c.otherProfile?.profile_pic_url ? (
                    <img src={c.otherProfile.profile_pic_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ background: "rgba(236,72,153,0.08)" }}>
                      <span className="font-name text-lg font-bold" style={{ color: C.primary }}>
                        {(c.otherName ?? "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {c.unreadCount > 0 && (
                    <div className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white"
                      style={{ background: C.primary }} />
                  )}
                </div>
                <span className="max-w-[64px] truncate text-[10px] font-medium" style={{ color: C.textPrimary }}>
                  {(c.otherName ?? "Unknown").split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="px-5 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: C.textSecondary }} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
            style={{ borderColor: C.border, background: C.card, color: C.textPrimary }}
          />
        </div>
      </div>

      <section className="px-5">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: C.textSecondary }}>Chat</h2>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <MessageCircle className="h-10 w-10" style={{ color: C.textSecondary }} />
            <h2 className="font-name text-lg font-semibold" style={{ color: C.textPrimary }}>No messages yet</h2>
            <p className="max-w-xs text-sm" style={{ color: C.textSecondary }}>
              Match with someone to start a conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((conv) => (
              <motion.button
                key={conv.otherUserId}
                type="button"
                onClick={() => router.push(`/messages/${conv.otherUserId}`)}
                className="flex w-full items-center gap-3.5 rounded-xl p-3 text-left transition-colors hover:bg-black/[0.02]"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  {conv.otherProfile?.profile_pic_url ? (
                    <img src={conv.otherProfile.profile_pic_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ background: "rgba(236,72,153,0.08)" }}>
                      <span className="font-name text-sm font-bold" style={{ color: C.primary }}>
                        {(conv.otherName ?? "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-sm font-semibold" style={{ color: C.textPrimary }}>
                      {conv.otherName ?? "Unknown"}
                    </h3>
                    <span className="shrink-0 text-[10px]" style={{ color: C.textSecondary }}>
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs" style={{ color: C.textSecondary }}>
                    {conv.lastMessage ?? "No messages yet"}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: C.primary }}>
                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
}
