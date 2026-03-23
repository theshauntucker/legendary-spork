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
          <p><strong>Effective Date:</strong> March 17, 2026</p>

          <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
          <p>
            We collect information you provide directly: your name, email address, and payment information (processed securely by Stripe). When you upload videos, we process and store the video content and extracted frames for analysis.
          </p>

          <h2 className="text-lg font-semibold text-white">2. How We Use Your Information</h2>
          <p>
            We use your information to provide and improve the Service, process payments, send transactional emails (account confirmation, analysis results), and communicate important updates about RoutineX.
          </p>

          <h2 className="text-lg font-semibold text-white">3. Video Content</h2>
          <p>
            Videos you upload are stored securely in our cloud infrastructure. Video frames are sent to our AI analysis provider (Anthropic) for processing. We do not sell, share, or publicly display your videos. Videos are associated with your account and accessible only by you.
          </p>

          <h2 className="text-lg font-semibold text-white">4. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Supabase</strong> — authentication, database, and file storage</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>Anthropic (Claude)</strong> — AI video analysis</li>
            <li><strong>Vercel</strong> — hosting and infrastructure</li>
          </ul>
          <p>
            Each service has its own privacy policy. We only share the minimum data necessary for each service to function.
          </p>

          <h2 className="text-lg font-semibold text-white">5. Data Retention</h2>
          <p>
            We retain your account data and analysis results for as long as your account is active. You may request deletion of your account and all associated data at any time by contacting us.
          </p>

          <h2 className="text-lg font-semibold text-white">6. Children&apos;s Privacy &amp; COPPA Compliance</h2>
          <p>
            RoutineX processes videos of competitive dancers, many of whom are minors. We take children&apos;s privacy seriously and comply with the Children&apos;s Online Privacy Protection Act (COPPA).
          </p>
          <p>
            <strong>How we protect minors:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>We require verifiable parental/guardian consent before any video of a minor is submitted for analysis.</li>
            <li>Video frames sent to our AI provider are used solely for dance analysis and are not used for training AI models.</li>
            <li>Extracted frames are automatically deleted within 24 hours of analysis completion.</li>
            <li>Users can request immediate deletion of frames at any time from their analysis results page.</li>
            <li>We do not knowingly collect personal information from children under 13 without parental consent.</li>
            <li>Dancer and studio names are anonymized before being sent to the AI provider for analysis.</li>
          </ul>
          <p>
            <strong>Parental rights:</strong> Parents or guardians may review, request deletion of, or refuse further collection of their child&apos;s information at any time by contacting us at{" "}
            <a href="mailto:hello@routinex.org" className="text-primary-400 hover:text-primary-300">hello@routinex.org</a>.
          </p>
          <p>
            If we learn we have collected personal information from a child under 13 without verifiable parental consent, we will delete that information promptly.
          </p>

          <h2 className="text-lg font-semibold text-white">7. Security</h2>
          <p>
            We implement industry-standard security measures including encrypted data transmission (HTTPS/TLS), secure authentication, and row-level security in our database. However, no method of transmission over the internet is 100% secure.
          </p>

          <h2 className="text-lg font-semibold text-white">8. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. You may also request a copy of your data or withdraw consent for processing. To exercise these rights, contact us at the email below.
          </p>

          <h2 className="text-lg font-semibold text-white">9. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of material changes via email or through the Service.
          </p>

          <h2 className="text-lg font-semibold text-white">10. Contact</h2>
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
