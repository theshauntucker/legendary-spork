"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { NotificationBell } from "@/components/NotificationBell";
import { ShellSwitcher } from "@/components/ShellSwitcher";
import RoutineXLogo from "@/components/RoutineXLogo";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Sample report", href: "/#sample-analysis" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
  { label: "For Studios", href: "/studio/signup" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileType, setProfileType] = useState<
    "dancer" | "parent" | "studio" | "choreographer" | null
  >(null);

  const pathname = usePathname();
  // Bright editorial chrome on the marketing homepage; dark glass on
  // every app surface (dashboard, upload, analysis, studio, …).
  const bright = pathname === "/";

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      setLoading(false);
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("profile_type")
          .eq("user_id", data.user.id)
          .maybeSingle();
        setProfileType(profile?.profile_type ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setProfileType(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  };

  const linkCls = bright
    ? "text-sm text-[#5D5565] hover:text-[#221A29] transition-colors"
    : "text-sm text-surface-200 hover:text-white transition-colors";

  return (
    <nav
      className={
        bright
          ? "fixed top-0 left-0 right-0 z-50 bg-[#FBF8F3]/85 backdrop-blur-xl border-b border-[#221A29]/[0.07]"
          : "fixed top-0 left-0 right-0 z-50 glass"
      }
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo — official sunset X + wordmark */}
          <a href="/" className="flex items-center">
            <RoutineXLogo
              size="md"
              wordmarkClassName={bright ? "text-[#221A29]" : "text-white"}
            />
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className={linkCls}>
                {link.label}
              </a>
            ))}

            {loading ? (
              <div
                className={`w-24 h-9 rounded-full animate-pulse ${
                  bright ? "bg-[#221A29]/[0.05]" : "bg-white/5"
                }`}
              />
            ) : user ? (
              <div className="flex items-center gap-3">
                <ShellSwitcher profileType={profileType} />
                <NotificationBell />
                <a
                  href="/settings"
                  className={linkCls}
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </a>
                <button
                  onClick={handleLogout}
                  className={linkCls}
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a href="/login" className={linkCls}>
                  Log in
                </a>
                <a
                  href="/signup"
                  className={
                    bright
                      ? "btn-ink rounded-full px-5 py-2 text-sm font-semibold"
                      : "rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  }
                >
                  Get started
                </a>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden ${bright ? "text-[#221A29]" : "text-white"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={
              bright
                ? "md:hidden bg-[#FBF8F3]/95 backdrop-blur-xl border-t border-[#221A29]/[0.07]"
                : "md:hidden glass border-t border-white/10"
            }
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`block ${linkCls}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              {user ? (
                <>
                  <div className="py-2">
                    <ShellSwitcher profileType={profileType} />
                  </div>
                  <a
                    href="/settings"
                    className={`flex items-center gap-2 ${linkCls}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </a>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className={`block w-full text-left ${linkCls}`}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className={`block ${linkCls}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    Log in
                  </a>
                  <a
                    href="/signup"
                    className={
                      bright
                        ? "btn-ink block w-full text-center rounded-full px-5 py-2.5 text-sm font-semibold"
                        : "block w-full text-center rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white"
                    }
                    onClick={() => setMobileOpen(false)}
                  >
                    Get started
                  </a>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
