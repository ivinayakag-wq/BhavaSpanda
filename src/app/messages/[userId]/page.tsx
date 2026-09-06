import { createAdminClient } from "@/lib/supabase-admin";
import ChatClient from "@/components/messages/ChatClient";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <p className="text-sm text-muted">Sign in to message.</p>
      </main>
    );
  }

  const viewerId = authUser.id;
  const admin = createAdminClient();

  const { data: match } = await admin
    .from("Match")
    .select("*")
    .or(`user1_id.eq.${viewerId},user2_id.eq.${viewerId}`)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .single();

  let messages: any[] = [];
  if (match) {
    const { data } = await admin
      .from("Message")
      .select("*")
      .eq("match_id", match.id)
      .order("created_at", { ascending: true });
    messages = data ?? [];
  }

  const [otherProfileResult, myProfileResult] = await Promise.all([
    admin.from("Profile").select("*").eq("id", userId).single(),
    admin.from("Profile").select("*").eq("id", viewerId).single(),
  ]);

  const otherProfile = otherProfileResult.data;
  const myProfile = myProfileResult.data;

  if (!otherProfile) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <p className="text-sm text-muted">Profile not found.</p>
      </main>
    );
  }

  return (
    <ChatClient
      initialMessages={messages as any[]}
      otherProfile={otherProfile as any}
      viewerTier={myProfile?.tier ?? "free"}
      viewerId={viewerId}
      profileComplete={(myProfile?.profile_completeness ?? 0) >= 100}
    />
  );
}
