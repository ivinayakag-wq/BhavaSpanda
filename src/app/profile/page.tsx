import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile · BhavaSpanda",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return <p className="p-6 text-sm text-muted">Sign in to view your profile.</p>;
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("Profile")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile) return <p className="p-6 text-sm text-muted">No profile found.</p>;

  return <ProfilePageClient profile={profile as any} />;
}
