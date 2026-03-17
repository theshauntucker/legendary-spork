import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
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
