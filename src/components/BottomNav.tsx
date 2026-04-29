"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Inbox, User } from "lucide-react";
import { haptics } from "@/lib/haptics";

const TABS = [
  { href: "/home", label: "Feed", icon: Home },
  { href: "/find", label: "Find", icon: Search },
  { href: "/upload", label: "Post", icon: Plus, primary: true },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/dashboard", label: "Me", icon: User },
];

// Only show the bottom tab bar on Coda surfaces (the social side of
// the app — feed, find, inbox, profiles, threads). On RoutineX surfaces
// (/dashboard, /upload, /analysis, /settings, /studio, /admin, etc.) the
// top Navbar is the only nav — no bottom bar — per product direction.
const APP_PATH_PREFIXES = [
  "/home",
  "/feed",
  "/find",
  "/explore",
  "/inbox",
  "/u/",
  "/threads",
];

export function BottomNav() {
  const pathname = usePathname();
  const isAppSurface =
    !!pathname &&
    APP_PATH_PREFIXES.some(
      (prefix) =>
        pathname === prefix ||
        pathname === prefix.replace(/\/$/, "") ||
        pathname.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`),
    );
  if (!isAppSurface) return null;

  return (
    <nav
      aria-label="Primary"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "10px 12px calc(10px + env(safe-area-inset-bottom))",
        background: "rgba(9,9,11,0.85)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        zIndex: 40,
      }}
      className="md:hidden"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = pathname === tab.href || (tab.href !== "/home" && pathname?.startsWith(tab.href));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={() => haptics.tap()}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: tab.primary ? "6px 10px" : "4px 8px",
              borderRadius: tab.primary ? 999 : 8,
              color: active ? "#fff" : "rgba(255,255,255,0.65)",
              background: tab.primary
                ? "linear-gradient(135deg, #EC4899, #F97316, #FBBF24)"
                : "transparent",
              textDecoration: "none",
              minWidth: 56,
            }}
          >
            <Icon size={tab.primary ? 22 : 20} />
            <span style={{ fontSize: 10, fontWeight: 600 }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomNav;
