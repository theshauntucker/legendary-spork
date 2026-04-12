import type { Metadata } from "next";
import AdUnit from "@/components/AdUnit";
import DonateButton from "@/components/DonateButton";

export const metadata: Metadata = {
  title: "About FaithLens — Our Mission & Values",
  description:
    "FaithLens is an unbiased religious education platform. Learn about our mission to give every faith equal representation.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-6">
        About FaithLens
      </h1>

      <div className="space-y-6 text-surface-700 leading-relaxed">
        <p className="text-lg">
          FaithLens is an independent, non-denominational platform dedicated to
          presenting the world&#39;s religions fairly, accurately, and without
          bias. Every faith — from Christianity to Islam, Mormonism to
          Jehovah&#39;s Witnesses — gets equal space and respectful treatment.
        </p>

        <h2 className="text-2xl font-bold text-surface-900 pt-4">
          Our Mission
        </h2>
        <p>
          We believe that understanding different religions is essential for a
          more informed, tolerant world. Our mission is to provide a single
          destination where anyone can explore religious beliefs, read critical
          and supportive perspectives, access official church resources, and
          form their own conclusions.
        </p>

        <h2 className="text-2xl font-bold text-surface-900 pt-4">
          What Makes Us Different
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>No bias:</strong> We present supportive, critical, and
            academic perspectives for every religion. We don&#39;t tell you what to
            think.
          </li>
          <li>
            <strong>Equal representation:</strong> Every faith gets the same
            depth of coverage. No religion is favored or marginalized.
          </li>
          <li>
            <strong>Direct links:</strong> We link directly to official church
            websites, missionary scheduling, and scripture study tools — letting
            you go straight to the source.
          </li>
          <li>
            <strong>Scholarly approach:</strong> Our content draws from
            academic research, official publications, and well-known critical
            works to provide a complete picture.
          </li>
        </ul>

        <AdUnit slot="about-mid" format="horizontal" className="my-6" />

        <h2 className="text-2xl font-bold text-surface-900 pt-4">
          How We&#39;re Funded
        </h2>
        <p>
          FaithLens is independently funded through display advertising and
          voluntary donations. We are not sponsored by or affiliated with any
          religious organization. Our editorial content is never influenced by
          advertisers.
        </p>

        <h2 className="text-2xl font-bold text-surface-900 pt-4">
          Support Us
        </h2>
        <p>
          If you find FaithLens valuable, consider buying us a coffee. Every
          small donation helps us keep the lights on and continue producing
          quality, unbiased religious content.
        </p>
        <DonateButton size="md" />

        <h2 className="text-2xl font-bold text-surface-900 pt-4">
          Disclaimer
        </h2>
        <p className="text-sm text-surface-500">
          FaithLens is an educational resource and is not affiliated with any
          church, denomination, or religious organization. All trademarks,
          church names, and logos belong to their respective owners. Content on
          this site represents various viewpoints and does not constitute
          endorsement of any particular religious belief.
        </p>
      </div>
    </div>
  );
}
