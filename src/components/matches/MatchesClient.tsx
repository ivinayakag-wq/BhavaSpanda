"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/context/AuthContext";

const MatchInsights = dynamic(() => import("@/components/modals/MatchInsights"), { ssr: false });

const C = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  primary: "#EC4899",
  secondary: "#FF6B6B",
  textPrimary: "#1A1A1A",
  textSecondary: "#8A8A8A",
  border: "#EBEBEB",
  shadow: "0 8px 30px rgba(236,72,153,0.08)",
};

export default function MatchesPageClient() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFree, setIsFree] = useState(true);
  const [insightsTarget, setInsightsTarget] = useState<{ id: string; name: string; pic: string | null; age: number } | null>(null);

  useEffect(() => {
    if (!authUser) return;
    (async () => {
      try {
        const [feedRes, convRes] = await Promise.all([
          fetch("/api/profiles/feed"),
          fetch("/api/messages/conversations"),
        ]);
        const feed = await feedRes.json();
        const convs = await convRes.json();
      const free = (feed.user?.tier ?? "free") === "free";
      console.log("[Matches] tier:", feed.user?.tier, "isFree:", free);
      setIsFree(free);
      setConversations(convs.conversations ?? []);
      } catch {}
      setLoading(false);
    })();
  }, [authUser]);

  function getOtherProfile(otherUserId: string) {
    return conversations.find((c: any) => c.otherUserId === otherUserId)?.otherProfile ?? null;
  }

  return (
    <div className="min-h-dvh pb-20" style={{ background: C.bg }}>
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="font-name text-xl font-semibold" style={{ color: C.textPrimary }}>Your Matches</h1>
        <span className="text-sm font-medium" style={{ color: C.textSecondary }}>
          {isFree ? "🔒" : `${conversations.length} match${conversations.length !== 1 ? "es" : ""}`}
        </span>
      </header>

      <main className="px-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm" style={{ color: C.textSecondary }}>Loading...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <span className="text-4xl">💕</span>
            <h2 className="font-name text-xl font-semibold" style={{ color: C.textPrimary }}>No matches yet</h2>
            <p className="max-w-xs text-sm" style={{ color: C.textSecondary }}>
              Keep swiping! Your perfect match is just a swipe away.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-md space-y-3">
            {conversations.map((conv: any) => {
              const other = conv.otherProfile ?? getOtherProfile(conv.otherUserId);
              if (!other) return null;
              return (
                <div
                  key={conv.otherUserId}
                  className="flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all hover:shadow-md"
                  style={{ borderColor: C.border, background: C.card, boxShadow: C.shadow }}
                >
                  {/* Avatar */}
                  <div
                    onClick={() => { if (!isFree) router.push(`/messages/${conv.otherUserId}`); }}
                    className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2"
                    style={{ borderColor: C.secondary }}
                  >
                    {other.profile_pic_url ? (
                      <img src={other.profile_pic_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-name text-lg" style={{ color: C.primary }}>
                        {(other.full_name ?? "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div
                    onClick={() => { if (!isFree) router.push(`/messages/${conv.otherUserId}`); }}
                    className="min-w-0 flex-1"
                  >
                    <h3 className="truncate font-semibold" style={{ color: C.textPrimary }}>
                      {other.full_name}, {other.age} · {other.location}
                    </h3>
                    {conv.lastMessage && (
                      <p className="truncate text-sm" style={{ color: C.textSecondary }}>{conv.lastMessage}</p>
                    )}
                    <p className="mt-0.5 text-xs" style={{ color: C.textSecondary }}>
                      {new Date(conv.lastMessageAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Insights sparkles button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInsightsTarget({
                        id: conv.otherUserId,
                        name: other.full_name ?? "Match",
                        pic: other.profile_pic_url ?? null,
                        age: other.age ?? 0,
                      });
                    }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95"
                    style={{ background: C.primary, color: "#FFFFFF", boxShadow: "0 2px 8px rgba(236,72,153,0.3)" }}
                    title="View match insights"
                  >
                    <Sparkles className="h-5 w-5" />
                  </button>

                  {/* Unread dot */}
                  {conv.unreadCount > 0 && (
                    <div className="flex h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: C.primary }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Free overlay */}
        {isFree && conversations.length > 0 && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
            <div className="mx-4 max-w-xs rounded-2xl p-8 text-center" style={{ background: C.card, boxShadow: C.shadow }}>
              <span className="text-4xl">🔒</span>
              <h3 className="mt-3 font-name text-lg font-semibold" style={{ color: C.textPrimary }}>
                {conversations.length} people matched with you!
              </h3>
              <p className="mt-2 text-sm" style={{ color: C.textSecondary }}>
                Upgrade to see who liked you back and start chatting.
              </p>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="mt-6 w-full rounded-full py-3 text-sm font-semibold text-white"
                style={{ background: C.primary }}
              >
                View Plans
              </button>
            </div>
          </div>
        )}
      </main>

      {insightsTarget && (
        <MatchInsights
          open={!!insightsTarget}
          onClose={() => setInsightsTarget(null)}
          viewerId={authUser?.id ?? ""}
          profileId={insightsTarget.id}
          profileName={insightsTarget.name}
          profilePic={insightsTarget.pic}
          profileAge={insightsTarget.age}
        />
      )}

      <BottomNav />
    </div>
  );
}
