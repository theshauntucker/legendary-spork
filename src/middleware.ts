import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Referral capture: if URL has ?ref=CODE on any route, drop a 30-day cookie.
  // The signup form reads ?ref= directly, but the cookie covers users who
  // land on /coda or /pricing first and then sign up later.
  const ref = request.nextUrl.searchParams.get("ref");
  if (ref && /^[A-Za-z0-9]{4,12}$/.test(ref)) {
    response.cookies.set("rx_ref", ref.toUpperCase(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      secure: true,
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon, images, and other static files
     * - API routes that should be public (waitlist, opengraph)
     */
    "/((?!_next/static|_next/image|favicon\\.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$|api/waitlist|api/checkout|opengraph-image|sitemap\\.xml|robots\\.txt).*)",
  ],
};
