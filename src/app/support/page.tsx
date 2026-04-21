import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles, Mail, MessageCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support — RoutineX",
  description:
    "Get help with RoutineX. Contact our support team, browse FAQs, or learn how AI dance and cheer analysis works.",
  alternates: {
    canonical: "/support",
  },
};

const quickAnswers = [
  {
    q: "How long does an analysis take?",
    a: "Most analyses complete in under 60 seconds. If your video is longer than 3 minutes, it may take up to 2 minutes.",
  },
  {
    q: "What styles do you support?",
    a: "Dance (jazz, lyrical, contemporary, hip-hop, tap, ballet) and cheer (allstar, sideline, pom, dance). Any competitive routine works.",
  },
  {
    q: "How do I get my credits after purchasing?",
    a: "Credits are added to your account instantly after payment. If you purchased on the app and don’t see credits, try signing out and back in. If that doesn’t work, email us with your receipt.",
  },
  {
    q: "Can I get a refund?",
    a: "For App Store purchases, request a refund through Apple at reportaproblem.apple.com. For web purchases, email us within 7 days and we’ll process it.",
  },
  {
    q: "How do I delete my account?",
    a: "Go to your Dashboard → Settings → Delete Account. This permanently removes all your data including videos, analyses, and payment history.",
  },
];

export default function SupportPage() {
  return (
    <main>
      <Navbar />
      <div className="min-h-screen px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary-400" />
              <span className="text-sm font-medium text-primary-400 uppercase tracking-wider">
                Support
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] mb-4">
              How can we help?
            </h1>
            <p className="text-surface-200">
              We reply to every message within 24 hours.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="rounded-xl bg-primary-500/10 p-3">
                <Mail className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white mb-1">Email Us</h2>
                <a
                  href="mailto:support@routinex.org"
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                >
                  support@routinex.org
                </a>
                <p className="text-sm text-surface-200 mt-1">
                  For account issues, billing questions, or bug reports.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="rounded-xl bg-accent-500/10 p-3">
                <MessageCircle className="h-5 w-5 text-accent-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white mb-1">Contact Form</h2>
                <Link
                  href="/contact"
                  className="text-accent-400 hover:text-accent-300 transition-colors"
                >
                  Send us a message
                </Link>
                <p className="text-sm text-surface-200 mt-1">
                  Prefer a form? We&apos;ll get back to you the same way.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-green-500/10 p-3">
                <Clock className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white mb-1">Response Time</h2>
                <p className="text-sm text-surface-200">
                  We respond within 24 hours, Monday through Saturday. Most emails get a reply within a few hours.
                </p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold font-[family-name:var(--font-display)] mb-6">
              Quick Answers
            </h2>
            <div className="space-y-5">
              {quickAnswers.map((item, i) => (
                <div key={i} className="border-b border-white/5 pb-5 last:border-0 last:pb-0">
                  <h3 className="font-medium text-white mb-1.5">{item.q}</h3>
                  <p className="text-sm text-surface-200 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              View all FAQs
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
