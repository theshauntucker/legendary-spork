"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">FL</span>
            </div>
            <span className="text-xl font-heading text-slate-900">
              FaithLens
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-5 text-sm font-medium">
            <Link
              href="/topics/mormonism"
              className="text-slate-600 hover:text-accent-600 transition-colors"
            >
              Mormonism
            </Link>
            <Link
              href="/topics/christianity"
              className="text-slate-600 hover:text-accent-600 transition-colors"
            >
              Christianity
            </Link>
            <Link
              href="/topics/islam"
              className="text-slate-600 hover:text-accent-600 transition-colors"
            >
              Islam
            </Link>
            <Link
              href="/topics/catholicism"
              className="text-slate-600 hover:text-accent-600 transition-colors"
            >
              Catholicism
            </Link>
            <Link
              href="/topics/jehovahs-witnesses"
              className="text-slate-600 hover:text-accent-600 transition-colors"
            >
              JW
            </Link>
            <Link
              href="/community"
              className="text-slate-600 hover:text-accent-600 transition-colors"
            >
              Community
            </Link>
            <Link
              href="/resources"
              className="text-slate-600 hover:text-accent-600 transition-colors"
            >
              Resources
            </Link>
            <span className="w-px h-5 bg-slate-200" />
            <Link
              href="/login"
              className="text-slate-600 hover:text-accent-600 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors text-sm"
            >
              Sign Up
            </Link>
            <Link
              href="/donate"
              className="bg-amber-400 text-slate-900 px-4 py-2 rounded-lg hover:bg-amber-500 transition-colors text-sm font-semibold"
            >
              Buy Me a Coffee
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-slate-600"
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
          <div className="lg:hidden pb-4 border-t border-slate-200">
            <div className="flex flex-col gap-1 pt-3">
              <Link
                href="/topics/mormonism"
                className="px-3 py-2.5 text-slate-700 hover:bg-accent-50 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Mormonism
              </Link>
              <Link
                href="/topics/christianity"
                className="px-3 py-2.5 text-slate-700 hover:bg-accent-50 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Christianity
              </Link>
              <Link
                href="/topics/islam"
                className="px-3 py-2.5 text-slate-700 hover:bg-accent-50 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Islam
              </Link>
              <Link
                href="/topics/catholicism"
                className="px-3 py-2.5 text-slate-700 hover:bg-accent-50 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Catholicism
              </Link>
              <Link
                href="/topics/jehovahs-witnesses"
                className="px-3 py-2.5 text-slate-700 hover:bg-accent-50 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Jehovah&#39;s Witnesses
              </Link>
              <Link
                href="/community"
                className="px-3 py-2.5 text-slate-700 hover:bg-accent-50 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Community
              </Link>
              <Link
                href="/resources"
                className="px-3 py-2.5 text-slate-700 hover:bg-accent-50 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Resources
              </Link>
              <div className="border-t border-slate-200 mt-2 pt-2">
                <Link
                  href="/login"
                  className="px-3 py-2.5 text-slate-700 hover:bg-accent-50 rounded-lg block"
                  onClick={() => setMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="mx-3 mt-1 bg-accent-600 text-white px-4 py-2.5 rounded-lg hover:bg-accent-700 text-center block"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  href="/donate"
                  className="mx-3 mt-2 bg-amber-400 text-slate-900 px-4 py-2.5 rounded-lg hover:bg-amber-500 text-center block font-semibold"
                  onClick={() => setMenuOpen(false)}
                >
                  Buy Me a Coffee
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
