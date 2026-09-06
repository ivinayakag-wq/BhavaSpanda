import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import OnboardingForm from "@/components/auth/OnboardingForm";
import { createClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Onboarding · BhavaSpanda",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/auth");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("Profile")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile) redirect("/auth");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-2xl">
        <OnboardingForm userId={profile.id} />
      </div>
    </main>
  );
}
