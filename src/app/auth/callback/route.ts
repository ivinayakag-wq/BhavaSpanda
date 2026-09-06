import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createProfile } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const existing = await prisma.profile.findUnique({ where: { id: user.id } }).catch(() => null);
        if (!existing) {
          await createProfile(user.id, {
            name: user.email?.split("@")[0] ?? "User",
            email: user.email ?? null,
            tier: "free",
          } as any).catch(() => {});
        }
      }
      const redirectOrigin = origin.replace("0.0.0.0", "localhost");
      return NextResponse.redirect(`${redirectOrigin}${next}`);
    }
  }

  const errorOrigin = origin.replace("0.0.0.0", "localhost");
  return NextResponse.redirect(`${errorOrigin}/auth?error=auth_failed`);
}
