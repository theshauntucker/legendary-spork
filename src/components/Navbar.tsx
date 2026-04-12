"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-surface-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">&#9776;</span>
            <span className="text-xl font-bold text-surface-900">
              FaithLens
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/topics/mormonism"
              className="text-surface-600 hover:text-primary-600 transition-colors"
            >
              Mormonism
            </Link>
            <Link
              href="/topics/christianity"
              className="text-surface-600 hover:text-primary-600 transition-colors"
            >
              Christianity
            </Link>
            <Link
              href="/topics/islam"
              className="text-surface-600 hover:text-primary-600 transition-colors"
            >
              Islam
            </Link>
            <Link
              href="/topics/catholicism"
              className="text-surface-600 hover:text-primary-600 transition-colors"
            >
              Catholicism
            </Link>
            <Link
              href="/topics/jehovahs-witnesses"
              className="text-surface-600 hover:text-primary-600 transition-colors"
            >
              Jehovah&#39;s Witnesses
            </Link>
            <Link
              href="/resources"
              className="text-surface-600 hover:text-primary-600 transition-colors"
            >
              Resources
            </Link>
            <Link
              href="/donate"
              className="bg-warm-500 text-white px-4 py-2 rounded-lg hover:bg-warm-600 transition-colors text-sm"
            >
              Buy Me a Coffee
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-surface-600"
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
          <div className="md:hidden pb-4 border-t border-surface-200">
            <div className="flex flex-col gap-2 pt-3">
              <Link
                href="/topics/mormonism"
                className="px-3 py-2 text-surface-600 hover:bg-surface-100 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Mormonism
              </Link>
              <Link
                href="/topics/christianity"
                className="px-3 py-2 text-surface-600 hover:bg-surface-100 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Christianity
              </Link>
              <Link
                href="/topics/islam"
                className="px-3 py-2 text-surface-600 hover:bg-surface-100 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Islam
              </Link>
              <Link
                href="/topics/catholicism"
                className="px-3 py-2 text-surface-600 hover:bg-surface-100 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Catholicism
              </Link>
              <Link
                href="/topics/jehovahs-witnesses"
                className="px-3 py-2 text-surface-600 hover:bg-surface-100 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Jehovah&#39;s Witnesses
              </Link>
              <Link
                href="/resources"
                className="px-3 py-2 text-surface-600 hover:bg-surface-100 rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                Resources
              </Link>
              <Link
                href="/donate"
                className="mx-3 mt-2 bg-warm-500 text-white px-4 py-2 rounded-lg hover:bg-warm-600 text-center"
                onClick={() => setMenuOpen(false)}
              >
                Buy Me a Coffee
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
