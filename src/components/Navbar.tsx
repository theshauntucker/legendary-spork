"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/traditions", label: "Traditions" },
  { href: "/library", label: "Library" },
  { href: "/perspectives", label: "Perspectives" },
  { href: "/tools", label: "Tools" },
  { href: "/stories", label: "Stories" },
  { href: "/community", label: "Forum" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-cream-50/95 backdrop-blur-sm border-b border-cream-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-serif font-semibold text-ink-900 tracking-wide">
              [SiteName]
            </span>
          </Link>

          {/* Desktop nav — center links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink-500 hover:text-ink-800 underline-offset-4 decoration-transparent hover:decoration-primary-500 decoration-1 underline transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop nav — right actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-ink-500 hover:text-primary-600 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-ink-500"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden pb-4 border-t border-cream-200">
            <div className="flex flex-col gap-1 pt-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 text-ink-700 hover:bg-primary-50 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-cream-200 mt-2 pt-2">
                <Link
                  href="/login"
                  className="px-3 py-2.5 text-ink-700 hover:bg-primary-50 rounded-lg block"
                  onClick={() => setMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="mx-3 mt-1 bg-primary-500 text-white px-4 py-2.5 rounded-lg hover:bg-primary-600 text-center block font-semibold"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
