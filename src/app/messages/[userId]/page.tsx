import { prisma } from "@/lib/prisma";
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

  const match = await prisma.match.findFirst({
    where: {
      OR: [
        { user1_id: viewerId, user2_id: userId },
        { user1_id: userId, user2_id: viewerId },
      ],
    },
  });

  const messages = match
    ? await prisma.message.findMany({
        where: { match_id: match.id },
        orderBy: { created_at: "asc" },
      })
    : [];

  const [otherProfile, myProfile] = await Promise.all([
    prisma.profile.findUnique({ where: { id: userId } }),
    prisma.profile.findUnique({ where: { id: viewerId } }),
  ]);

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
