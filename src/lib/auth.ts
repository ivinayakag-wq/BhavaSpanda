import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

export type AuthUser = { id: string; email?: string };

export async function requireUser(): Promise<AuthUser> {
  const supabaseClient = await createClient();
  const { data: { user }, error } = await supabaseClient.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }

  return { id: user.id, email: user.email };
}

export async function requireProfile(): Promise<any> {
  const authUser = await requireUser();
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("Profile")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (!profile) {
    throw new Error("PROFILE_NOT_FOUND");
  }

  return profile;
}
