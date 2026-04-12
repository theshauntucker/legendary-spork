import Link from "next/link";
import DonateButton from "./DonateButton";

export default function Footer() {
  return (
    <footer className="bg-surface-900 text-surface-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-white text-lg font-bold mb-3">FaithLens</h3>
            <p className="text-sm leading-relaxed">
              An unbiased, all-encompassing resource for exploring the
              world&#39;s religions. Every faith gets equal space. No bias, just
              information.
            </p>
            <div className="mt-4">
              <DonateButton />
            </div>
          </div>

          {/* Topics */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Topics
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/topics/mormonism"
                  className="hover:text-white transition-colors"
                >
                  Mormonism (LDS)
                </Link>
              </li>
              <li>
                <Link
                  href="/topics/christianity"
                  className="hover:text-white transition-colors"
                >
                  Christianity
                </Link>
              </li>
              <li>
                <Link
                  href="/topics/islam"
                  className="hover:text-white transition-colors"
                >
                  Islam
                </Link>
              </li>
              <li>
                <Link
                  href="/topics/catholicism"
                  className="hover:text-white transition-colors"
                >
                  Catholicism
                </Link>
              </li>
              <li>
                <Link
                  href="/topics/jehovahs-witnesses"
                  className="hover:text-white transition-colors"
                >
                  Jehovah&#39;s Witnesses
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/resources"
                  className="hover:text-white transition-colors"
                >
                  Official Church Links
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="hover:text-white transition-colors"
                >
                  Meet with Missionaries
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="hover:text-white transition-colors"
                >
                  Scripture Study Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Site */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Site
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About FaithLens
                </Link>
              </li>
              <li>
                <Link
                  href="/donate"
                  className="hover:text-white transition-colors"
                >
                  Support Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-700 mt-10 pt-6 text-center text-sm text-surface-500">
          <p>
            FaithLens presents information from multiple perspectives for
            educational purposes. We are not affiliated with any religious
            organization. All trademarks belong to their respective owners.
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} FaithLens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
