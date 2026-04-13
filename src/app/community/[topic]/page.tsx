import Link from "next/link";

interface Thread {
  id: string;
  topic: string;
  title: string;
  author: string;
  date: string;
  replyCount: number;
  body?: string;
}

const topicMeta: Record<string, { name: string; description: string }> = {
  mormonism: {
    name: "Mormonism",
    description:
      "Discuss LDS teachings, history, the CES Letter, faith transitions, and more.",
  },
  christianity: {
    name: "Christianity",
    description:
      "Explore evangelical traditions, biblical scholarship, deconstruction, and theology.",
  },
  islam: {
    name: "Islam",
    description:
      "Conversations about the Quran, Islamic history, modern practice, and interfaith dialogue.",
  },
  catholicism: {
    name: "Catholicism",
    description:
      "Discuss Catholic doctrine, Vatican history, sacraments, and the modern church.",
  },
  "jehovahs-witnesses": {
    name: "Jehovah's Witnesses",
    description:
      "Share experiences, discuss Watchtower teachings, and support those in transition.",
  },
  general: {
    name: "General Discussion",
    description:
      "Compare religions, discuss philosophy of religion, spirituality, and anything that doesn't fit elsewhere.",
  },
};

const seedThreads: Thread[] = [
  // Mormonism
  {
    id: "lds-experience-leaving",
    topic: "mormonism",
    title: "My experience leaving the LDS church",
    author: "SeekerOfTruth",
    date: "2026-03-28",
    replyCount: 24,
  },
  {
    id: "ces-letter-discussion",
    topic: "mormonism",
    title: "CES Letter discussion thread",
    author: "HistoryBuff42",
    date: "2026-04-02",
    replyCount: 57,
  },
  {
    id: "fair-mormon-responses",
    topic: "mormonism",
    title: "FAIR Mormon responses - are they convincing?",
    author: "OpenMinded99",
    date: "2026-04-05",
    replyCount: 31,
  },

  // Christianity
  {
    id: "left-evangelical",
    topic: "christianity",
    title: "Why I left evangelical Christianity",
    author: "GraceWalker",
    date: "2026-03-15",
    replyCount: 42,
  },
  {
    id: "best-arguments-christianity",
    topic: "christianity",
    title: "Best arguments for Christianity",
    author: "Philosopher_Paul",
    date: "2026-03-22",
    replyCount: 38,
  },
  {
    id: "deconstruction-books",
    topic: "christianity",
    title: "Recommended books for deconstruction",
    author: "BookwormBeth",
    date: "2026-04-01",
    replyCount: 19,
  },

  // Islam
  {
    id: "understanding-quran",
    topic: "islam",
    title: "Understanding the Quran as a non-Muslim",
    author: "CuriousReader",
    date: "2026-03-20",
    replyCount: 15,
  },
  {
    id: "islam-women-rights",
    topic: "islam",
    title: "Women's rights in Islam - scholarly perspectives",
    author: "ScholarSara",
    date: "2026-04-03",
    replyCount: 28,
  },

  // Catholicism
  {
    id: "catholic-to-agnostic",
    topic: "catholicism",
    title: "From Catholic school to agnosticism",
    author: "FormerAltar",
    date: "2026-03-18",
    replyCount: 21,
  },
  {
    id: "vatican-ii-changes",
    topic: "catholicism",
    title: "How Vatican II changed everything",
    author: "ChurchHistory101",
    date: "2026-04-06",
    replyCount: 16,
  },

  // Jehovah's Witnesses
  {
    id: "leaving-jw",
    topic: "jehovahs-witnesses",
    title: "Life after leaving Jehovah's Witnesses",
    author: "FreeAtLast",
    date: "2026-03-25",
    replyCount: 33,
  },
  {
    id: "jw-blood-transfusion",
    topic: "jehovahs-witnesses",
    title: "The blood transfusion policy - ethical discussion",
    author: "MedStudent_JW",
    date: "2026-04-04",
    replyCount: 22,
  },

  // General
  {
    id: "comparing-religions",
    topic: "general",
    title: "What surprised you most when comparing religions?",
    author: "WorldExplorer",
    date: "2026-04-07",
    replyCount: 45,
  },
  {
    id: "spirituality-without-religion",
    topic: "general",
    title: "Can you be spiritual without religion?",
    author: "SoulSearcher",
    date: "2026-04-08",
    replyCount: 29,
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const meta = topicMeta[topic];
  const name = meta?.name ?? topic;
  return {
    title: `${name} - Community Discussions`,
    description: meta?.description ?? `Discuss ${name} with the FaithLens community.`,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  const meta = topicMeta[topic];
  const topicName = meta?.name ?? topic;
  const topicDescription =
    meta?.description ?? `Explore discussions about ${topic}.`;

  const threads = seedThreads.filter((t) => t.topic === topic);

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-accent-50 via-white to-amber-50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/community"
            className="inline-flex items-center text-sm text-accent-600 hover:text-accent-700 mb-4 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Community
          </Link>
          <h1 className="text-3xl sm:text-4xl font-heading text-slate-900 mb-3">
            {topicName}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
            {topicDescription}
          </p>
        </div>
      </section>

      {/* Threads */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-slate-900">
            {threads.length} Discussion{threads.length !== 1 ? "s" : ""}
          </h2>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-accent-600 text-white text-sm font-semibold rounded-xl hover:bg-accent-700 transition-colors"
          >
            Start a Discussion
          </Link>
        </div>

        {threads.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
            <p className="text-slate-500 mb-2">
              No discussions yet for this topic.
            </p>
            <p className="text-sm text-slate-400">
              Be the first to start a conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/community/${topic}/${thread.id}`}
                className="block"
              >
                <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-accent-300 hover:shadow-sm transition-all duration-200">
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    {thread.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {thread.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {thread.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {thread.replyCount} replies
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
