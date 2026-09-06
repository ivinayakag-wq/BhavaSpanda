import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "@/components/auth/OnboardingForm";
import { createClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Onboarding · Isha Connect",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/auth");

  const profile = await prisma.profile.findUnique({ where: { id: authUser.id } });
  if (!profile) redirect("/auth");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-2xl">
        <OnboardingForm userId={profile.id} />
      </div>
    </main>
  );
}
