import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public routes that don't require auth
  const publicPaths = ["/", "/auth", "/auth/callback", "/api/auth"];
  const isPublicPath = publicPaths.some(
    (p) => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(p + "/")
  );

  // Allow static files and Next.js internals
  const isStaticFile = request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon") ||
    request.nextUrl.pathname.includes(".");

  if (isStaticFile || isPublicPath) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users to auth page
  if (!user) {
    const authUrl = new URL("/auth", request.url);
    authUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(authUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
