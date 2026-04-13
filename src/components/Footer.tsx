import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-cream-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand + mission */}
          <div className="md:col-span-1">
            <h3 className="text-white text-lg font-serif font-semibold mb-3">
              [SiteName]
            </h3>
            <p className="text-sm leading-relaxed">
              A neutral, academic platform for religious literacy. We present
              the history, beliefs, and practices of every tradition with equal
              care and scholarly rigor.
            </p>
          </div>

          {/* Traditions */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Traditions
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/traditions/christianity"
                  className="hover:text-primary-50 transition-colors"
                >
                  Christianity
                </Link>
              </li>
              <li>
                <Link
                  href="/traditions/islam"
                  className="hover:text-primary-50 transition-colors"
                >
                  Islam
                </Link>
              </li>
              <li>
                <Link
                  href="/traditions/judaism"
                  className="hover:text-primary-50 transition-colors"
                >
                  Judaism
                </Link>
              </li>
              <li>
                <Link
                  href="/traditions/hinduism"
                  className="hover:text-primary-50 transition-colors"
                >
                  Hinduism
                </Link>
              </li>
              <li>
                <Link
                  href="/traditions/buddhism"
                  className="hover:text-primary-50 transition-colors"
                >
                  Buddhism
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Tools
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/tools/comparison"
                  className="hover:text-primary-50 transition-colors"
                >
                  Tradition Comparison
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/timeline"
                  className="hover:text-primary-50 transition-colors"
                >
                  Historical Timeline
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/glossary"
                  className="hover:text-primary-50 transition-colors"
                >
                  Glossary of Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/library"
                  className="hover:text-primary-50 transition-colors"
                >
                  Reading Lists
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Community
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/community"
                  className="hover:text-primary-50 transition-colors"
                >
                  Discussion Forum
                </Link>
              </li>
              <li>
                <Link
                  href="/stories"
                  className="hover:text-primary-50 transition-colors"
                >
                  Personal Stories
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary-50 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary-50 transition-colors"
                >
                  Newsletter Signup
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom: disclaimer + copyright */}
        <div className="border-t border-ink-700 mt-10 pt-6 text-center text-sm text-ink-400">
          <p>
            [SiteName] is an educational platform. We present perspectives from
            within, outside, and across every tradition with equal care. We are
            not affiliated with any religious organization.
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} [SiteName]. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
