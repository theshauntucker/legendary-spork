import { Sparkles, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — RoutineX",
  description: "How RoutineX protects your data and privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-surface-200 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </a>
          <a href="/" className="inline-flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-400" />
            <span className="font-bold">
              Routine<span className="gradient-text">X</span>
            </span>
          </a>
          <div className="w-20" />
        </div>

        <div className="glass rounded-3xl p-6 sm:p-10">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-surface-200 mb-8">
            Last updated: March 23, 2026
          </p>

          <div className="space-y-8 text-sm text-surface-200 leading-relaxed">
            {/* 1 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                1. Introduction
              </h2>
              <p>
                RoutineX (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website routinex.org and the
                RoutineX mobile application. This Privacy Policy explains how we collect, use,
                and protect your information when you use our AI-powered dance and cheer video
                analysis platform.
              </p>
              <p className="mt-2">
                We are committed to protecting the privacy of all our users, including children.
                We designed RoutineX with privacy as a core principle — your video never leaves
                your device, names are anonymized before AI analysis, and thumbnail images are
                automatically deleted.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                2. How Video Analysis Works
              </h2>
              <p>
                When you use RoutineX to analyze a routine, here&apos;s exactly what happens:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1.5">
                <li>
                  <strong className="text-white">Video stays on your device.</strong> Your full
                  video file is never uploaded to our servers. Only still-frame thumbnails
                  (screenshots) extracted from the video are uploaded.
                </li>
                <li>
                  <strong className="text-white">Frames are uploaded temporarily.</strong> The
                  extracted thumbnail images are stored briefly on our secure servers for the
                  duration of AI processing.
                </li>
                <li>
                  <strong className="text-white">AI analyzes the frames.</strong> Our AI provider
                  (Anthropic) reviews the thumbnail images and generates a detailed analysis
                  with scoring and feedback.
                </li>
                <li>
                  <strong className="text-white">Frames are deleted.</strong> Thumbnail images
                  are automatically deleted from our servers within 24 hours. You can also
                  delete them immediately after receiving your analysis.
                </li>
              </ol>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                3. Anonymous AI Analysis
              </h2>
              <p>
                We take extra steps to protect your identity during AI analysis:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1.5">
                <li>
                  Dancer names, studio names, and other personally identifiable information are
                  <strong className="text-white"> stripped from the AI prompt</strong> before
                  sending to our AI provider.
                </li>
                <li>
                  The AI sees &quot;The performer&quot; and &quot;The studio&quot; instead of real names.
                </li>
                <li>
                  After analysis, we replace these placeholders with your actual names in the
                  final report — but the AI never sees them.
                </li>
                <li>
                  No personally identifiable information (PII) is included in the data sent to
                  the AI for analysis.
                </li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                4. No Human Review
              </h2>
              <p>
                Your routine thumbnails and analysis are processed entirely by AI. No RoutineX
                employee, contractor, or third party views your images or analysis results. The
                process is fully automated from upload to report delivery.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                5. Thumbnail Auto-Deletion
              </h2>
              <p>
                We believe in data minimization. Thumbnail images uploaded for analysis are:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1.5">
                <li>
                  <strong className="text-white">Automatically deleted within 24 hours</strong>{" "}
                  of your analysis being completed, via an automated cleanup process.
                </li>
                <li>
                  <strong className="text-white">Deletable immediately</strong> by you at any
                  time using the &quot;Delete Thumbnails Now&quot; button on your analysis report page.
                </li>
                <li>
                  Stored in isolated, encrypted cloud storage during the brief processing
                  window.
                </li>
              </ul>
              <p className="mt-2">
                Your analysis report (text scores, feedback, and improvement tips) is retained
                so you can access it anytime. Only the thumbnail images are deleted.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                6. Information We Collect
              </h2>
              <p>We collect the following information:</p>
              <ul className="list-disc list-inside mt-2 space-y-1.5">
                <li>
                  <strong className="text-white">Account information:</strong> Email address and
                  password (encrypted) when you create an account.
                </li>
                <li>
                  <strong className="text-white">Routine metadata:</strong> Dancer name, studio
                  name, routine title, age group, dance style, and entry type that you provide.
                </li>
                <li>
                  <strong className="text-white">Thumbnail images:</strong> Still frames extracted
                  from your routine video (temporarily — see Section 5).
                </li>
                <li>
                  <strong className="text-white">Payment information:</strong> Processed securely
                  by Stripe. We never store your full credit card number.
                </li>
                <li>
                  <strong className="text-white">Usage data:</strong> Basic analytics to improve
                  the service (pages visited, features used).
                </li>
              </ul>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                7. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-1.5">
                <li>To provide AI-powered routine analysis and scoring</li>
                <li>To process payments for analysis services</li>
                <li>To personalize your analysis reports with dancer and studio names</li>
                <li>To send transactional emails (analysis ready, account updates)</li>
                <li>To improve our AI analysis accuracy and service quality</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                8. Anthropic Data Policy
              </h2>
              <p>
                We use Anthropic&apos;s Claude AI for routine analysis. Anthropic&apos;s data handling:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1.5">
                <li>
                  Anthropic may retain API inputs for up to <strong className="text-white">30 days</strong> for
                  safety and abuse monitoring, after which they are deleted.
                </li>
                <li>
                  Anthropic does <strong className="text-white">not use API data to train their models</strong>.
                </li>
                <li>
                  No personally identifiable information is included in our API requests to
                  Anthropic (see Section 3).
                </li>
              </ul>
              <p className="mt-2">
                For more details, see{" "}
                <a
                  href="https://www.anthropic.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:underline"
                >
                  Anthropic&apos;s Privacy Policy
                </a>
                .
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                9. Data Sharing &amp; Selling
              </h2>
              <p>We want to be crystal clear:</p>
              <ul className="list-disc list-inside mt-2 space-y-1.5">
                <li>
                  We <strong className="text-white">do not sell</strong> your personal data to
                  anyone, ever.
                </li>
                <li>
                  We <strong className="text-white">do not use advertising trackers</strong> or
                  serve ads on RoutineX.
                </li>
                <li>
                  We <strong className="text-white">do not share</strong> your data with third
                  parties for marketing purposes.
                </li>
                <li>
                  The only third parties that process your data are our essential service
                  providers (see Section 12), and only as needed to deliver our service.
                </li>
              </ul>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                10. Children&apos;s Privacy &amp; COPPA Compliance
              </h2>
              <p>
                RoutineX is used by parents and coaches to analyze routines performed by minors.
                We take children&apos;s privacy seriously and comply with the Children&apos;s Online
                Privacy Protection Act (COPPA):
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1.5">
                <li>
                  <strong className="text-white">Parental consent required:</strong> During account
                  creation, users must confirm they are the parent or legal guardian of any minor
                  whose routines will be analyzed.
                </li>
                <li>
                  <strong className="text-white">Data minimization:</strong> We collect only the
                  minimum data necessary to provide analysis. Video never leaves the device.
                  Thumbnails are auto-deleted.
                </li>
                <li>
                  <strong className="text-white">No PII to AI:</strong> Children&apos;s names are never
                  sent to our AI provider.
                </li>
                <li>
                  <strong className="text-white">Parental rights:</strong> Parents can request
                  deletion of all data associated with their child&apos;s routines at any time by
                  contacting us.
                </li>
                <li>
                  <strong className="text-white">Consent records:</strong> We maintain records of
                  parental consent including timestamp and consent version.
                </li>
              </ul>
            </section>

            {/* 11 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                11. Data Security
              </h2>
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1.5">
                <li>All data transmitted over HTTPS/TLS encryption</li>
                <li>Passwords are hashed and never stored in plain text</li>
                <li>Thumbnail images stored in encrypted cloud storage with access controls</li>
                <li>Authentication tokens securely managed via Supabase Auth</li>
                <li>Regular security reviews of our codebase and infrastructure</li>
              </ul>
            </section>

            {/* 12 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                12. Third-Party Services
              </h2>
              <p>
                RoutineX uses the following third-party services to deliver our platform:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1.5">
                <li>
                  <strong className="text-white">Supabase</strong> — Database, authentication,
                  and file storage. Data stored in encrypted, SOC 2 compliant infrastructure.
                </li>
                <li>
                  <strong className="text-white">Anthropic (Claude AI)</strong> — AI analysis of
                  routine thumbnails. No PII sent. 30-day input retention for safety monitoring,
                  no model training.
                </li>
                <li>
                  <strong className="text-white">Stripe</strong> — Payment processing. PCI DSS
                  Level 1 certified. We never store your full card number.
                </li>
                <li>
                  <strong className="text-white">Vercel</strong> — Web hosting. SOC 2 compliant.
                </li>
                <li>
                  <strong className="text-white">Resend</strong> — Transactional email delivery
                  only (no marketing emails unless you opt in).
                </li>
              </ul>
            </section>

            {/* 13 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                13. Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1.5">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and all associated data</li>
                <li>Delete thumbnail images immediately (via the analysis report page)</li>
                <li>Export your analysis reports</li>
                <li>Withdraw consent for data processing at any time</li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, contact us at{" "}
                <a
                  href="mailto:22tucker22@comcast.net"
                  className="text-primary-400 hover:underline"
                >
                  22tucker22@comcast.net
                </a>
                .
              </p>
            </section>

            {/* 14 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                14. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any
                material changes by email or by posting a prominent notice on our website. Your
                continued use of RoutineX after changes constitutes acceptance of the updated
                policy.
              </p>
            </section>

            {/* 15 */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">
                15. Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy, your data, or your rights,
                please contact us:
              </p>
              <div className="mt-2 rounded-xl bg-white/5 p-4">
                <p>
                  <strong className="text-white">RoutineX</strong>
                </p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:22tucker22@comcast.net"
                    className="text-primary-400 hover:underline"
                  >
                    22tucker22@comcast.net
                  </a>
                </p>
                <p>
                  Website:{" "}
                  <a
                    href="https://routinex.org"
                    className="text-primary-400 hover:underline"
                  >
                    routinex.org
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
