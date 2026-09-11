import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protected routes — require login
  const protectedPaths = ["/upload", "/analysis", "/dashboard", "/processing"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ["/login", "/signup"];
  if (user && authPaths.some((p) => pathname.startsWith(p))) {
    // Honor ?redirect= / ?next= (same-site paths only) so an already-signed-in
    // user sent to /login?next=/referrals lands on /referrals, not the dashboard.
    const wanted =
      request.nextUrl.searchParams.get("redirect") || request.nextUrl.searchParams.get("next") || "";
    const safe = wanted.startsWith("/") && !wanted.startsWith("//") && !wanted.startsWith("/\\");
    const url = request.nextUrl.clone();
    url.search = "";
    url.pathname = safe ? wanted.split("?")[0] : "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
