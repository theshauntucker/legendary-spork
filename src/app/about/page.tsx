import type { Metadata } from "next";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";

export const metadata: Metadata = {
  title: "About [SiteName]",
  description:
    "Learn about [SiteName], an academic platform for religious literacy presenting the world's faith traditions with equal care and scholarly rigor.",
};

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-cream-100 via-cream-50 to-primary-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-5 leading-tight">
            About [SiteName]
          </h1>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 space-y-12">
        {/* Mission */}
        <section>
          <div className="space-y-5 text-ink-700 leading-relaxed">
            <p className="text-lg">
              We believe that understanding the world&rsquo;s faith traditions
              &mdash; from the inside and the outside &mdash; makes everyone
              more informed, more empathetic, and more free. [SiteName] is an
              academic platform for religious literacy. We present the history,
              beliefs, practices, and perspectives of every tradition with equal
              care and scholarly rigor.
            </p>

            <p className="text-lg font-medium text-ink-800">
              Our guiding principles:
            </p>

            <ul className="space-y-3 list-none pl-0">
              <li className="flex gap-3">
                <span className="text-primary-500 font-bold shrink-0">&bull;</span>
                <span>
                  <strong className="text-ink-900">
                    Describe, don&rsquo;t prescribe.
                  </strong>{" "}
                  We present what traditions teach. We don&rsquo;t tell you what
                  to believe.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary-500 font-bold shrink-0">&bull;</span>
                <span>
                  <strong className="text-ink-900">
                    Present, don&rsquo;t persuade.
                  </strong>{" "}
                  Every critical resource is paired with its devotional
                  counterpart.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary-500 font-bold shrink-0">&bull;</span>
                <span>
                  <strong className="text-ink-900">Equal care.</strong> A devout
                  member and a former member of any tradition should both feel
                  this site treats them fairly.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary-500 font-bold shrink-0">&bull;</span>
                <span>
                  <strong className="text-ink-900">Scholarly rigor.</strong> We
                  cite sources, attribute perspectives, and distinguish between
                  claims and evidence.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Editorial Standards */}
        <section>
          <h2 className="font-serif text-3xl text-ink-900 mb-6">
            Editorial Standards
          </h2>
          <ul className="space-y-4 text-ink-700 leading-relaxed">
            <li className="flex gap-3">
              <span className="text-primary-500 font-bold shrink-0">&bull;</span>
              <span>
                Every tradition page is reviewed for accuracy by both
                practitioners and scholars.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-500 font-bold shrink-0">&bull;</span>
              <span>
                Resource summaries use neutral language: &ldquo;adherents
                believe,&rdquo; &ldquo;scholars have raised
                questions,&rdquo; &ldquo;this tradition teaches.&rdquo;
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-500 font-bold shrink-0">&bull;</span>
              <span>
                We never use loaded terms like &ldquo;cult,&rdquo;
                &ldquo;brainwashing,&rdquo; &ldquo;debunked,&rdquo; or
                &ldquo;proven true&rdquo; in editorial content.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-500 font-bold shrink-0">&bull;</span>
              <span>
                Critical and devotional resources receive equal visual
                prominence.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-500 font-bold shrink-0">&bull;</span>
              <span>
                Personal stories are published with minimal editing to preserve
                the author&rsquo;s voice.
              </span>
            </li>
          </ul>
        </section>

        {/* Ad */}
        <AdUnit slot="about-mid" format="horizontal" />

        {/* What We Are Not */}
        <section>
          <h2 className="font-serif text-3xl text-ink-900 mb-6">
            What We Are Not
          </h2>
          <ul className="space-y-4 text-ink-700 leading-relaxed">
            <li className="flex gap-3">
              <span className="text-primary-500 font-bold shrink-0">&bull;</span>
              <span>
                We are not affiliated with any religious organization.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-500 font-bold shrink-0">&bull;</span>
              <span>We are not an anti-religion platform.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-500 font-bold shrink-0">&bull;</span>
              <span>We are not a religious advocacy platform.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-500 font-bold shrink-0">&bull;</span>
              <span>
                We are not a counseling service. If you are in crisis, please
                contact a mental health professional.
              </span>
            </li>
          </ul>
        </section>

        {/* Contact */}
        <section>
          <h2 className="font-serif text-3xl text-ink-900 mb-4">Contact</h2>
          <p className="text-ink-700 leading-relaxed">
            Have suggestions, corrections, or want to contribute? Reach out at{" "}
            <a
              href="mailto:hello@example.com"
              className="text-primary-500 hover:text-primary-600 underline"
            >
              hello@example.com
            </a>
            .
          </p>
        </section>

        {/* Email Capture */}
        <EmailCapture />
      </div>
    </>
  );
}
