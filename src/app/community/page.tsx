import Link from "next/link";
import EmailCapture from "@/components/EmailCapture";

interface CommunityTopic {
  slug: string;
  name: string;
  description: string;
  threadCount: number;
  icon: string;
  color: string;
}

const communityTopics: CommunityTopic[] = [
  {
    slug: "mormonism",
    name: "Mormonism",
    description:
      "Discuss LDS teachings, history, the CES Letter, faith transitions, and more.",
    threadCount: 47,
    icon: "\u{1F3D4}\uFE0F",
    color: "bg-amber-50 border-amber-200 hover:border-amber-400",
  },
  {
    slug: "christianity",
    name: "Christianity",
    description:
      "Explore evangelical traditions, biblical scholarship, deconstruction, and theology.",
    threadCount: 63,
    icon: "\u271A",
    color: "bg-sky-50 border-sky-200 hover:border-sky-400",
  },
  {
    slug: "islam",
    name: "Islam",
    description:
      "Conversations about the Quran, Islamic history, modern practice, and interfaith dialogue.",
    threadCount: 29,
    icon: "\u2602\uFE0F",
    color: "bg-green-50 border-green-200 hover:border-green-400",
  },
  {
    slug: "catholicism",
    name: "Catholicism",
    description:
      "Discuss Catholic doctrine, Vatican history, sacraments, and the modern church.",
    threadCount: 34,
    icon: "\u26EA",
    color: "bg-amber-50 border-amber-200 hover:border-amber-400",
  },
  {
    slug: "jehovahs-witnesses",
    name: "Jehovah's Witnesses",
    description:
      "Share experiences, discuss Watchtower teachings, and support those in transition.",
    threadCount: 22,
    icon: "\u{1F4D6}",
    color: "bg-rose-50 border-rose-200 hover:border-rose-400",
  },
  {
    slug: "general",
    name: "General Discussion",
    description:
      "Compare religions, discuss philosophy of religion, spirituality, and anything that doesn't fit elsewhere.",
    threadCount: 51,
    icon: "\u{1F30D}",
    color: "bg-teal-50 border-teal-200 hover:border-teal-400",
  },
];

export const metadata = {
  title: "Community Discussions",
  description:
    "Join the FaithLens community. Share your journey, ask questions, and explore different perspectives on religion.",
};

export default function CommunityPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-accent-50 via-white to-amber-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-heading text-slate-900 mb-3">
            Community Discussions
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Join the conversation. Share your journey, ask questions, and explore
            different perspectives.
          </p>
        </div>
      </section>

      {/* Topic Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {communityTopics.map((topic) => (
            <Link key={topic.slug} href={`/community/${topic.slug}`}>
              <div
                className={`rounded-2xl border-2 p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${topic.color}`}
              >
                <div className="text-3xl mb-3">{topic.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  {topic.name}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                  {topic.description}
                </p>
                <span className="text-xs text-slate-400">
                  {topic.threadCount} discussions
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Email Capture */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-12">
        <EmailCapture />
      </section>
    </>
  );
}
