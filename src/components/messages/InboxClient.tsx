"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MessageCircle, Search, Loader2, AlertTriangle,
} from "lucide-react";
import type { ConversationSummary } from "@/types/internal";
import UpgradeModal from "@/components/modals/UpgradeModal";
import BottomNav from "@/components/BottomNav";

export default function InboxClient({
  conversations,
  myId,
  profileComplete = true,
  userTier = "free",
}: {
  conversations: ConversationSummary[];
  myId: string;
  profileComplete?: boolean;
  userTier?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: string; full_name: string | null; ai_archetype: string | null }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  async function handleUserSearch(q: string) {
    setUserQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/profiles/search?q=${encodeURIComponent(q.trim())}&userId=${myId}`);
      const data = await res.json();
      setSearchResults(data.results ?? []);
    } finally {
      setSearching(false);
    }
  }

  function startConversation(otherId: string) {
    setShowNewMsg(false);
    setUserQuery("");
    setSearchResults([]);
    router.push(`/messages/${otherId}`);
  }

  const filtered = conversations.filter((c) =>
    c.otherName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "#EBEBEB", background: "#FFFFFF" }}>
        <h1 className="font-name text-xl" style={{ color: "#1A1A1A" }}>Messages</h1>
        <div className="flex items-center gap-3">
          {userTier === "free" && conversations.length > 0 && (
            <span className="text-xs font-medium" style={{ color: "#8A8A8A" }}>
              {conversations.reduce((s, c) => s + c.unreadCount, 0)} unread
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowNewMsg(true)}
            className="rounded-full px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#BE185D]"
            style={{ background: "#EC4899" }}
          >
            New Message
          </button>
        </div>
      </header>

      {!profileComplete && (
        <div className="px-4 py-3 text-center text-sm font-medium"
          style={{ background: "rgba(236,103,27,0.08)", color: "#EC4899" }}>
          <AlertTriangle className="mr-1.5 inline h-4 w-4 align-text-bottom" />
          Complete your profile to send messages and connect with others.
        </div>
      )}

      <main className="flex-1 px-6 py-8">
        {/* Early offer: show messages for all users, remove upgrade gate */}
        {false && userTier === "free" && filtered.length > 0 ? (
          /* ─── Free: subtle teaser ─── */
          <div className="flex flex-col items-center pt-6">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {filtered.slice(0, 5).map((c, i) => (
                <div key={c.otherUserId} className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-sm text-sm font-medium" style={{ zIndex: 5 - i, background: "rgba(236,103,27,0.1)", color: "#EC4899" }}>
                  {c.otherName?.charAt(0) ?? "?"}
                </div>
              ))}
              {filtered.length > 5 && (
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#EBEBEB] text-xs font-semibold shadow-sm" style={{ color: "#8A8A8A", zIndex: 0 }}>
                  +{filtered.length - 5}
                </div>
              )}
            </div>
            <p className="mt-4 text-sm font-medium" style={{ color: "#8A8A8A" }}>
              {filtered.reduce((s, c) => s + c.unreadCount, 0)} unread from {filtered.length} {filtered.length === 1 ? "person" : "people"}
            </p>

            {/* Elegant glass card */}
            <div className="relative mx-auto mt-8 w-full max-w-sm overflow-hidden rounded-3xl border" style={{ borderColor: "#EBEBEB", background: "#FFFFFF" }}>
              <div className="absolute inset-0 opacity-[0.04]" style={{ background: "linear-gradient(135deg, #EC4899, #FF6B6B)" }} />
              <div className="relative z-10 flex flex-col items-center px-8 py-12 text-center">
                <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10" style={{ background: "#EC4899" }} />
                <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full opacity-10" style={{ background: "#FF6B6B" }} />

                <div className="relative flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #EC4899, #FF6B6B)" }}>
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>

                <h2 className="font-name mt-5 text-2xl font-semibold" style={{ color: "#1A1A1A" }}>
                  Read Your Messages
                </h2>
                <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ color: "#8A8A8A" }}>
                  Upgrade to <span className="font-semibold" style={{ color: "#EC4899" }}>Seeker</span> to read and reply to all your messages.
                </p>

                <button type="button" onClick={() => setShowUpgrade(true)}
                  className="mt-6 w-full rounded-full py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#BE185D] active:scale-[0.97]"
                  style={{ background: "#EC4899", boxShadow: "0 4px 20px rgba(236,103,27,0.35)" }}>
                  Upgrade to Seeker — ₹149/mo
                </button>

                <button type="button" onClick={() => router.push("/dashboard")}
                  className="mt-3 text-xs font-medium underline underline-offset-2 transition-colors hover:opacity-70"
                  style={{ color: "#8A8A8A" }}>
                  Not now
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="relative mb-5 max-w-md mx-auto">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#8A8A8A" }} />
              <input type="text" placeholder="Search conversations..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border py-2.5 pl-10 pr-4 text-sm outline-none transition-colors"
                style={{ borderColor: "#EBEBEB", background: "#FFFFFF", color: "#1A1A1A" }} />
            </div>

            <div className="mx-auto max-w-md">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                  <MessageCircle className="h-10 w-10" style={{ color: "rgba(236,103,27,0.4)" }} />
                  <p className="font-name text-lg" style={{ color: "#1A1A1A" }}>No conversations yet</p>
                  <p className="max-w-xs text-sm" style={{ color: "#8A8A8A" }}>Find a seeker and send your first message to start a connection.</p>
                  <button type="button" onClick={() => setShowNewMsg(true)}
                    className="mt-2 rounded-full px-5 py-2 text-sm font-semibold text-white hover:bg-[#BE185D]"
                    style={{ background: "#EC4899" }}>Find someone to message</button>
                </div>
              ) : (
                <div className="space-y-1">
                  {filtered.map((c) => (
                    <button key={c.otherUserId} type="button" onClick={() => router.push(`/messages/${c.otherUserId}`)}
                      className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:shadow-md"
                      style={{ borderColor: "#EBEBEB", background: "#FFFFFF" }}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "rgba(236,103,27,0.08)", color: "#EC4899" }}>
                        <span className="font-name text-sm">{c.otherName?.charAt(0) ?? "?"}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium" style={{ color: "#1A1A1A" }}>{c.otherName ?? "Unknown"}</span>
                          <span className="shrink-0 text-[10px]" style={{ color: "#8A8A8A" }}>{formatTime(c.lastMessageAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="truncate text-xs" style={{ color: "#8A8A8A" }}>
                            {c.lastMessageSenderId === myId ? "You: " : ""}{c.lastMessage}
                          </span>
                          {c.unreadCount > 0 && (
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "#EC4899" }}>
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <BottomNav />

      {/* New Message modal */}
      {showNewMsg && (
        <motion.div
          className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "rgba(45,42,36,0.5)" }}
            onClick={() => { setShowNewMsg(false); setUserQuery(""); setSearchResults([]); }}
          />
          <motion.div
            className="relative z-10 mx-4 w-full max-w-sm rounded-2xl border shadow-lg"
            style={{ borderColor: "#EBEBEB", background: "#FFFFFF" }}
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <div className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderColor: "#EBEBEB" }}>
              <h2 className="font-name text-base" style={{ color: "#1A1A1A" }}>
                New Message
              </h2>
              <button
                type="button"
                onClick={() => { setShowNewMsg(false); setUserQuery(""); setSearchResults([]); }}
                className="text-xs underline"
                style={{ color: "#8A8A8A" }}
              >
                Cancel
              </button>
            </div>
            <div className="p-5">
              <input
                type="text"
                placeholder="Search by name..."
                value={userQuery}
                onChange={(e) => handleUserSearch(e.target.value)}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors"
                style={{
                  borderColor: "#EBEBEB",
                  background: "#FAFAF8",
                  color: "#1A1A1A",
                }}
                autoFocus
              />
              <div className="mt-3 flex max-h-48 flex-col gap-1 overflow-y-auto">
                {searching && (
                  <div className="flex justify-center py-3">
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#EC4899" }} />
                  </div>
                )}
                {!searching && userQuery.length >= 2 && searchResults.length === 0 && (
                  <p className="py-3 text-center text-xs" style={{ color: "#8A8A8A" }}>No seekers found</p>
                )}
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => startConversation(p.id)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
                    style={{ color: "#1A1A1A" }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ background: "rgba(236,103,27,0.08)", color: "#EC4899" }}>
                      <span className="font-name text-xs">
                        {p.full_name?.charAt(0) ?? "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm">{p.full_name ?? "Unknown"}</p>
                      {p.ai_archetype && (
                        <p className="text-[10px]" style={{ color: "#8A8A8A" }}>{p.ai_archetype}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <UpgradeModal variant="message-exhausted" open={showUpgrade} onClose={() => setShowUpgrade(false)} onUpgrade={() => window.location.reload()} />
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
