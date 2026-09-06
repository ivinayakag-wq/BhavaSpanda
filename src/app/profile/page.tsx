import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile · Isha Connect",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return <p className="p-6 text-sm text-muted">Sign in to view your profile.</p>;
  }

  const profile = await prisma.profile.findUnique({ where: { id: authUser.id } });
  if (!profile) return <p className="p-6 text-sm text-muted">No profile found.</p>;

  return <ProfilePageClient profile={profile as any} />;
}
