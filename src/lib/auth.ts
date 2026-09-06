import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import type { Profile } from "@prisma/client";

export type AuthUser = { id: string; email?: string };

export async function requireUser(): Promise<AuthUser> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }

  return { id: user.id, email: user.email };
}

export async function requireProfile(): Promise<Profile> {
  const authUser = await requireUser();

  const profile = await prisma.profile.findUnique({
    where: { id: authUser.id },
  });

  if (!profile) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  return profile;
}
