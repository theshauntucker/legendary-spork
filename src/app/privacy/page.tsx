import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <a href="/" className="inline-flex items-center gap-2 mb-10">
          <Sparkles className="h-6 w-6 text-primary-400" />
          <span className="text-lg font-bold">
            Routine<span className="gradient-text">X</span>
          </span>
        </a>

        <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-surface-200">
          <p><strong>Effective Date:</strong> March 23, 2026</p>

          <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
          <p>
            We collect information you provide directly: your name, email address, and payment information (processed securely by Stripe — we never store your card details). When you submit a routine for analysis, still-frame thumbnails are extracted from your video and sent to our servers for AI processing.
          </p>

          <h2 className="text-lg font-semibold text-white">2. How We Use Your Information</h2>
          <p>
            We use your information to provide and improve the Service, process payments, send transactional emails (account confirmation, analysis results), and communicate important updates about RoutineX.
          </p>

          <h2 className="text-lg font-semibold text-white">3. How Video Analysis Works</h2>
          <p>
            Your video never leaves your device. RoutineX extracts still-frame thumbnails from the video directly in your browser. Only these thumbnail images — not the full video — are uploaded to our secure servers for analysis. The full video stays on your phone or computer at all times.
          </p>

          <h2 className="text-lg font-semibold text-white">4. Anonymous AI Analysis</h2>
          <p>
            When thumbnails are sent to our AI analysis provider (Anthropic Claude), no personal information is included. Your dancer&apos;s name, studio name, email, and account details are never sent to the AI. The analysis is performed anonymously using only the images, routine name, dance style, and scoring instructions. After the AI returns scores and feedback, we personalize the report on our end before delivering it to you.
          </p>

          <h2 className="text-lg font-semibold text-white">5. No Human Review</h2>
          <p>
            The entire analysis pipeline is fully automated. No one on our team ever sees your images or video content. No human eyes, at any point.
          </p>

          <h2 className="text-lg font-semibold text-white">6. Thumbnail Auto-Deletion</h2>
          <p>
            All thumbnail images stored on our servers are automatically deleted within 24 hours of your report being delivered. You also have the option to delete them instantly from your report page. Once thumbnails are removed, only your text-based scores, written feedback, and improvement roadmap remain — available in your dashboard whenever you need them.
          </p>

          <h2 className="text-lg font-semibold text-white">7. Anthropic (AI Provider) Data Policy</h2>
          <p>
            We use Anthropic&apos;s Claude API for analysis. Under Anthropic&apos;s commercial API policy, all inputs (the thumbnail images we send) are automatically deleted from their servers within 30 days. API data is never used to train their AI models — this is a flat policy, not an opt-in. For details, see{" "}
            <a href="https://privacy.claude.com/en/collections/10663361-commercial-customers" className="text-primary-400 hover:text-primary-300" target="_blank" rel="noopener noreferrer">
              Anthropic&apos;s Commercial Privacy Center
            </a>.
          </p>

          <h2 className="text-lg font-semibold text-white">8. Data Sharing &amp; Selling</h2>
          <p>
            We do not sell, share, or provide your data to any third party. No ads, no data partnerships, no monetization of your information. Our only revenue is the analysis fee. Your data exists to serve your dancer — that&apos;s it.
          </p>

          <h2 className="text-lg font-semibold text-white">9. Third-Party Services</h2>
          <p>We use the following third-party services, each with their own privacy policies:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Supabase</strong> — authentication, database, and secure file storage (private buckets, signed URLs)</li>
            <li><strong>Stripe</strong> — payment processing (we never store card details)</li>
            <li><strong>Anthropic (Claude API)</strong> — AI image analysis (anonymous, no personal data sent)</li>
            <li><strong>Vercel</strong> — hosting, infrastructure, and privacy-friendly analytics (no cookies, no third-party trackers)</li>
          </ul>
          <p>
            We only share the minimum data necessary for each service to function. We do not use Google Analytics, Meta Pixel, or any third-party tracking scripts.
          </p>

          <h2 className="text-lg font-semibold text-white">10. Data Retention</h2>
          <p>
            Thumbnail images: automatically deleted within 24 hours (or instantly at your request). Scores, feedback, and improvement roadmaps: retained as long as your account is active. You may request deletion of your account and all associated data at any time by contacting us.
          </p>

          <h2 className="text-lg font-semibold text-white">11. Children&apos;s Privacy &amp; COPPA Compliance</h2>
          <p>
            RoutineX analyzes dance and cheer routines performed by minors. We take this responsibility seriously and comply with the Children&apos;s Online Privacy Protection Act (COPPA).
          </p>
          <p>
            <strong>Parental consent:</strong> Only parents or legal guardians may create RoutineX accounts. During registration, parents confirm they are the parent or guardian of any minor whose routines will be submitted, and consent to the temporary processing of still-frame images as described in this policy.
          </p>
          <p>
            <strong>What we collect:</strong> The only personal information related to minors is the still-frame thumbnail images temporarily extracted for analysis. No names, ages, or other identifying details are sent to our AI provider.
          </p>
          <p>
            <strong>Parental rights:</strong> Parents can review all data associated with their child through their dashboard, delete thumbnail images instantly from any report page, and request complete deletion of all their child&apos;s data by emailing us. Parents may also revoke consent at any time by deleting their account.
          </p>
          <p>
            <strong>Data minimization:</strong> We collect only what is necessary to deliver the analysis. Thumbnail images auto-delete within 24 hours. We do not use children&apos;s data for marketing, advertising, or any purpose beyond delivering the requested analysis.
          </p>

          <h2 className="text-lg font-semibold text-white">12. Security</h2>
          <p>
            We implement industry-standard security measures including encrypted data transmission (HTTPS/TLS), secure authentication, row-level security in our database, and private storage buckets with signed URL access. However, no method of transmission over the internet is 100% secure.
          </p>

          <h2 className="text-lg font-semibold text-white">13. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. You may also request a copy of your data or withdraw consent for processing. To exercise these rights, contact us at the email below.
          </p>

          <h2 className="text-lg font-semibold text-white">14. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of material changes via email or through the Service.
          </p>

          <h2 className="text-lg font-semibold text-white">15. Contact</h2>
          <p>
            For privacy questions or data requests, email us at{" "}
            <a href="mailto:hello@routinex.org" className="text-primary-400 hover:text-primary-300">
              hello@routinex.org
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
