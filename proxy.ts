import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16: this file was formerly `middleware.ts`.
// See node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
export async function proxy(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session — also populates `user` for gating logic below.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");

  // Routes under /admin that do NOT require an authenticated session.
  // reset-password DOES need a session (recovery session from the email link),
  // but that session is established via /api/auth/callback before arrival,
  // so it is also allowed for "unauthenticated" here.
  const publicAdminPaths = new Set([
    "/admin/login",
    "/admin/forgot-password",
    "/admin/reset-password",
  ]);

  // Unauthenticated access to a guarded admin route → send to login
  if (isAdminRoute && !publicAdminPaths.has(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Already signed in → skip the login/forgot pages (but not reset-password,
  // since the user is mid-recovery-flow and must complete it)
  if (
    (pathname === "/admin/login" || pathname === "/admin/forgot-password") &&
    user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
