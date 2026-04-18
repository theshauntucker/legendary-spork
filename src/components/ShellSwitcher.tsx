"use client";

/**
 * ShellSwitcher — the Meta-style product switcher.
 * Three products share one account; this bar lets the user hop between them
 * without logging out and without drowning in "every button in the app".
 *
 * Rendered in the global nav. If the user isn't a studio owner we hide the
 * Studio pill — there's nothing for them there.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Trophy, Building2 } from "lucide-react";

type ShellKey = "analyzer" | "coda" | "studio";

type ShellDef = {
  key: ShellKey;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  activeMatch: (pathname: string) => boolean;
};

const SHELLS: ShellDef[] = [
  {
    key: "analyzer",
    label: "Analyzer",
    href: "/dashboard",
    icon: Sparkles,
    activeMatch: (p) =>
      p === "/dashboard" ||
      p.startsWith("/upload") ||
      p.startsWith("/analysis") ||
      p.startsWith("/processing") ||
      p.startsWith("/routines"),
  },
  {
    key: "coda",
    label: "Coda",
    href: "/home",
    icon: Trophy,
    activeMatch: (p) =>
      p === "/home" ||
      p.startsWith("/u/") ||
      p.startsWith("/find") ||
      p.startsWith("/inbox") ||
      p.startsWith("/events") ||
      p.startsWith("/threads"),
  },
  {
    key: "studio",
    label: "Studio",
    href: "/studio/dashboard",
    icon: Building2,
    activeMatch: (p) => p.startsWith("/studio"),
  },
];

export function ShellSwitcher({
  profileType,
}: {
  profileType?: "dancer" | "parent" | "studio" | "choreographer" | null;
}) {
  const pathname = usePathname() ?? "/";

  const visible = SHELLS.filter((s) => {
    if (s.key !== "studio") return true;
    // Only show the Studio pill to people who actually have a studio role.
    return profileType === "studio" || profileType === "choreographer";
  });

  return (
    <nav
      aria-label="Products"
      style={{
        display: "inline-flex",
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {visible.map((s) => {
        const active = s.activeMatch(pathname);
        const Icon = s.icon;
        return (
          <Link
            key={s.key}
            href={s.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              color: active ? "#FFFFFF" : "rgba(255,255,255,0.7)",
              background: active
                ? "linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)"
                : "transparent",
              transition: "background 180ms ease, color 180ms ease",
            }}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{s.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default ShellSwitcher;
