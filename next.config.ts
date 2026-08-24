import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  // Coda (the social layer) was removed August 2026 — product direction is
  // pure scoring. These were live URLs; permanent-redirect them to the
  // dashboard so old bookmarks, emails, push notifications, and any indexed
  // links land somewhere useful instead of 404ing.
  async redirects() {
    const gone = [
      "/coda",
      "/feed",
      "/home",
      "/explore",
      "/find",
      "/aura",
      "/welcome",
      "/inbox",
      "/inbox/:path*",
      "/onboarding/:path*",
      "/u/:path*",
      "/threads/:path*",
      "/choreographers/:path*",
    ];
    return gone.map((source) => ({
      source,
      destination: "/dashboard",
      permanent: true,
    }));
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
