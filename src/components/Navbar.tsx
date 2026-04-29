"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, Calendar, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { NotificationBell } from "@/components/NotificationBell";
import { ShellSwitcher } from "@/components/ShellSwitcher";
import RoutineXLogo from "@/components/RoutineXLogo";

const navLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Events", href: "/events", icon: "calendar", badge: "New" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Studio", href: "/studio/signup", badge: "New" },
  { label: "FAQ", href: "/#faq" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileType, setProfileType] = useState<
    "dancer" | "parent" | "studio" | "choreographer" | null
  >(null);

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

  return (
    <nav className="fixed top-8 left-0 right-0 z-50 glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo — official sunset X + wordmark */}
          <a href="/" className="flex items-center">
            <RoutineXLogo size="md" />
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-sm text-surface-200 hover:text-white transition-colors flex items-center gap-1.5"
              >
                {link.icon === "calendar" && <Calendar className="h-3.5 w-3.5 text-primary-400" />}
                {link.label}
                {link.badge && (
                  <span className="absolute -top-2 -right-5 text-[9px] font-bold bg-primary-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}

            {loading ? (
              <div className="w-24 h-9 rounded-full bg-white/5 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <ShellSwitcher profileType={profileType} />
                <NotificationBell />
                <a
                  href="/settings"
                  className="inline-flex items-center gap-1.5 text-sm text-surface-200 hover:text-white transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </a>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-sm text-surface-200 hover:text-white transition-colors"
                  aria-label="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a
                  href="/login"
                  className="text-sm text-surface-200 hover:text-white transition-colors"
                >
                  Log In
                </a>
                <a
                  href="/signup"
                  className="rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  Get Started
                </a>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white"
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
            className="md:hidden glass border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 text-sm text-surface-200 hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.icon === "calendar" && <Calendar className="h-3.5 w-3.5 text-primary-400" />}
                  {link.label}
                  {link.badge && (
                    <span className="text-[9px] font-bold bg-primary-500 text-white px-1.5 py-0.5 rounded-full">{link.badge}</span>
                  )}
                </a>
              ))}

              {user ? (
                <>
                  <div className="py-2">
                    <ShellSwitcher profileType={profileType} />
                  </div>
                  <a
                    href="/settings"
                    className="flex items-center gap-2 text-sm text-surface-200 hover:text-white transition-colors"
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
                    className="block w-full text-left text-sm text-surface-200 hover:text-white transition-colors"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="block text-sm text-surface-200 hover:text-white transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    Log In
                  </a>
                  <a
                    href="/signup"
                    className="block w-full text-center rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get Started
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
