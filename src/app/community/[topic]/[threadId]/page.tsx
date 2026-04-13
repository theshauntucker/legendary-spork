import Link from "next/link";
import TherapyCTA from "@/components/TherapyCTA";

interface Thread {
  id: string;
  topic: string;
  title: string;
  author: string;
  date: string;
  replyCount: number;
  body: string;
}

interface Reply {
  id: string;
  author: string;
  date: string;
  body: string;
}

const topicNames: Record<string, string> = {
  mormonism: "Mormonism",
  christianity: "Christianity",
  islam: "Islam",
  catholicism: "Catholicism",
  "jehovahs-witnesses": "Jehovah's Witnesses",
  general: "General Discussion",
};

const seedThreads: Record<string, Thread> = {
  "lds-experience-leaving": {
    id: "lds-experience-leaving",
    topic: "mormonism",
    title: "My experience leaving the LDS church",
    author: "SeekerOfTruth",
    date: "2026-03-28",
    replyCount: 24,
    body: "After 30 years as a faithful member, I finally made the decision to step away. It wasn't a single event but a gradual process of asking questions and not finding satisfying answers. I want to share my journey in case it helps anyone else who is going through something similar.\n\nIt started when I was teaching Sunday School and a student asked a question about the Book of Abraham. I realized I didn't actually know the full history, so I started researching. What I found shocked me — not because the information was new, but because I had never been exposed to it in decades of active membership.\n\nThe hardest part has been the social fallout. My family still doesn't fully understand, and some friendships have become strained. But I've also found an incredible community of people who have been through the same thing.",
  },
  "ces-letter-discussion": {
    id: "ces-letter-discussion",
    topic: "mormonism",
    title: "CES Letter discussion thread",
    author: "HistoryBuff42",
    date: "2026-04-02",
    replyCount: 57,
    body: "I recently read the CES Letter for the first time. I'd like to discuss some of the key claims point by point. What did you find most compelling? What arguments do you think are weakest? Let's have a respectful, evidence-based discussion.",
  },
  "fair-mormon-responses": {
    id: "fair-mormon-responses",
    topic: "mormonism",
    title: "FAIR Mormon responses - are they convincing?",
    author: "OpenMinded99",
    date: "2026-04-05",
    replyCount: 31,
    body: "I've been reading through FAIR's responses to common criticisms. Some seem well-researched while others feel like they sidestep the actual issues. What's everyone's take on their apologetics?",
  },
  "left-evangelical": {
    id: "left-evangelical",
    topic: "christianity",
    title: "Why I left evangelical Christianity",
    author: "GraceWalker",
    date: "2026-03-15",
    replyCount: 42,
    body: "Growing up in the Bible Belt, my entire identity was wrapped up in my church community. When I started having doubts in college, I felt like I was losing everything. Here's my story of deconstruction and what I found on the other side.",
  },
  "best-arguments-christianity": {
    id: "best-arguments-christianity",
    topic: "christianity",
    title: "Best arguments for Christianity",
    author: "Philosopher_Paul",
    date: "2026-03-22",
    replyCount: 38,
    body: "In the spirit of fair inquiry, let's compile the strongest intellectual arguments for the Christian faith. I'll start with the cosmological argument and the historical case for the resurrection.",
  },
  "deconstruction-books": {
    id: "deconstruction-books",
    topic: "christianity",
    title: "Recommended books for deconstruction",
    author: "BookwormBeth",
    date: "2026-04-01",
    replyCount: 19,
    body: "I'm looking for thoughtful books that helped others through their faith deconstruction. Not looking for angry atheist rants — more like honest, compassionate explorations of doubt. What would you recommend?",
  },
  "understanding-quran": {
    id: "understanding-quran",
    topic: "islam",
    title: "Understanding the Quran as a non-Muslim",
    author: "CuriousReader",
    date: "2026-03-20",
    replyCount: 15,
    body: "I'm trying to read the Quran to better understand Islam. Any recommended translations or study guides for someone coming from a Western, non-Muslim background?",
  },
  "islam-women-rights": {
    id: "islam-women-rights",
    topic: "islam",
    title: "Women's rights in Islam - scholarly perspectives",
    author: "ScholarSara",
    date: "2026-04-03",
    replyCount: 28,
    body: "I'd like to have a nuanced discussion about women's rights in Islamic tradition, looking at both progressive and traditional scholarly interpretations.",
  },
  "catholic-to-agnostic": {
    id: "catholic-to-agnostic",
    topic: "catholicism",
    title: "From Catholic school to agnosticism",
    author: "FormerAltar",
    date: "2026-03-18",
    replyCount: 21,
    body: "Twelve years of Catholic education and I ended up agnostic. But I don't regret the journey. Here's what I kept and what I left behind.",
  },
  "vatican-ii-changes": {
    id: "vatican-ii-changes",
    topic: "catholicism",
    title: "How Vatican II changed everything",
    author: "ChurchHistory101",
    date: "2026-04-06",
    replyCount: 16,
    body: "Let's discuss the sweeping reforms of Vatican II and their lasting impact on Catholic practice and theology.",
  },
  "leaving-jw": {
    id: "leaving-jw",
    topic: "jehovahs-witnesses",
    title: "Life after leaving Jehovah's Witnesses",
    author: "FreeAtLast",
    date: "2026-03-25",
    replyCount: 33,
    body: "The hardest part wasn't the theological questions — it was losing my entire social network overnight. For anyone considering leaving, here's what to expect and how to rebuild.",
  },
  "jw-blood-transfusion": {
    id: "jw-blood-transfusion",
    topic: "jehovahs-witnesses",
    title: "The blood transfusion policy - ethical discussion",
    author: "MedStudent_JW",
    date: "2026-04-04",
    replyCount: 22,
    body: "As a medical student who grew up JW, I've been wrestling with the blood transfusion doctrine. Let's discuss the scriptural basis and the medical/ethical implications.",
  },
  "comparing-religions": {
    id: "comparing-religions",
    topic: "general",
    title: "What surprised you most when comparing religions?",
    author: "WorldExplorer",
    date: "2026-04-07",
    replyCount: 45,
    body: "After studying multiple faiths, what was the most surprising similarity or difference you discovered? For me, it was how many creation narratives share common themes across completely unrelated cultures.",
  },
  "spirituality-without-religion": {
    id: "spirituality-without-religion",
    topic: "general",
    title: "Can you be spiritual without religion?",
    author: "SoulSearcher",
    date: "2026-04-08",
    replyCount: 29,
    body: "For those who left organized religion but still consider themselves spiritual — what does your practice look like now? How do you find meaning and community outside of a church?",
  },
};

const seedReplies: Record<string, Reply[]> = {
  "lds-experience-leaving": [
    {
      id: "reply-1",
      author: "StillBelieving",
      date: "2026-03-29",
      body: "Thank you for sharing your story. I'm still active in the church but I respect your honesty. Can I ask — did you try talking to your bishop or a church historian before deciding to leave? Sometimes having those conversations can help address concerns.",
    },
    {
      id: "reply-2",
      author: "ExMoMom",
      date: "2026-03-30",
      body: "Your story sounds so much like mine. The Book of Abraham was my starting point too. The social cost is real — I lost most of my friend group. But three years out, I can honestly say I've never been more at peace. Hang in there.",
    },
    {
      id: "reply-3",
      author: "NuancedMember",
      date: "2026-03-31",
      body: "I'm what some call a 'nuanced member' — I stay for the community and the good parts while acknowledging the historical issues. It's not for everyone, but it works for me. Wishing you the best on your journey wherever it leads.",
    },
  ],
  "ces-letter-discussion": [
    {
      id: "reply-1",
      author: "ApologistAdam",
      date: "2026-04-03",
      body: "I think the CES Letter makes some valid points about the Book of Abraham and the multiple First Vision accounts, but it also presents some arguments in a misleading way. For example, the anachronism arguments don't account for recent archaeological findings. We should be careful about taking any single source as the final word.",
    },
    {
      id: "reply-2",
      author: "SeekerOfTruth",
      date: "2026-04-03",
      body: "Fair point about not relying on a single source. What I found most valuable about the CES Letter wasn't the conclusions it draws, but the questions it raises. Those questions led me to primary sources I never would have looked at otherwise.",
    },
  ],
  "left-evangelical": [
    {
      id: "reply-1",
      author: "DeconstructingDave",
      date: "2026-03-16",
      body: "Thank you for this. The 'losing everything' feeling is so real. My parents still think I'm going through a phase, five years later. Have you found any communities or groups that helped with the transition?",
    },
    {
      id: "reply-2",
      author: "StillChristian",
      date: "2026-03-17",
      body: "I left evangelicalism too but ended up in a progressive mainline denomination. Deconstruction doesn't have to mean abandoning faith entirely — sometimes it means rebuilding it in a healthier way. Just sharing my experience, not prescribing it for anyone.",
    },
    {
      id: "reply-3",
      author: "SecularSam",
      date: "2026-03-18",
      body: "I went all the way to atheism and honestly I'm happier for it. But I agree that the process of leaving is painful regardless of where you land. The important thing is to be honest with yourself.",
    },
  ],
};

function getDefaultReplies(threadId: string): Reply[] {
  return [
    {
      id: "default-reply-1",
      author: "CommunityMember",
      date: "2026-04-10",
      body: "Great topic for discussion. I think this is something a lot of people are thinking about but don't always feel comfortable bringing up. Thanks for creating a space for this conversation.",
    },
    {
      id: "default-reply-2",
      author: "ThoughtfulReader",
      date: "2026-04-11",
      body: `I've been following this thread with interest. These are the kinds of discussions we need more of — respectful, nuanced, and open to different perspectives. Looking forward to hearing more viewpoints on "${threadId}".`,
    },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string; threadId: string }>;
}) {
  const { threadId } = await params;
  const thread = seedThreads[threadId];
  return {
    title: thread?.title ?? "Thread Not Found",
    description: thread?.body?.slice(0, 160) ?? "Community discussion on FaithLens.",
  };
}

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ topic: string; threadId: string }>;
}) {
  const { topic, threadId } = await params;
  const thread = seedThreads[threadId];
  const topicName = topicNames[topic] ?? topic;

  if (!thread) {
    return (
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-heading text-slate-900 mb-4">
          Thread Not Found
        </h1>
        <p className="text-slate-600 mb-6">
          This discussion thread could not be found.
        </p>
        <Link
          href={`/community/${topic}`}
          className="text-accent-600 hover:text-accent-700 font-medium transition-colors"
        >
          Back to {topicName}
        </Link>
      </section>
    );
  }

  const replies = seedReplies[threadId] ?? getDefaultReplies(threadId);

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-accent-50 via-white to-amber-50 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href={`/community/${topic}`}
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
            Back to {topicName}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-heading text-slate-900">
            {thread.title}
          </h1>
        </div>
      </section>

      {/* Thread body + replies */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Original post */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
              <span className="text-accent-700 font-semibold text-sm">
                {thread.author.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">
                {thread.author}
              </p>
              <p className="text-xs text-slate-500">{thread.date}</p>
            </div>
          </div>
          <div className="text-slate-700 leading-relaxed whitespace-pre-line">
            {thread.body}
          </div>
        </div>

        {/* Replies */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
          </h2>
          <div className="space-y-4">
            {replies.map((reply) => (
              <div
                key={reply.id}
                className="bg-white border border-slate-200 rounded-2xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="text-slate-600 font-medium text-xs">
                      {reply.author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {reply.author}
                    </p>
                    <p className="text-xs text-slate-500">{reply.date}</p>
                  </div>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {reply.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reply form (disabled) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-10">
          <h3 className="text-base font-semibold text-slate-900 mb-3">
            Reply to this thread
          </h3>
          <textarea
            disabled
            rows={4}
            placeholder="Log in to reply..."
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 placeholder:text-slate-400 resize-none text-sm cursor-not-allowed"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-slate-500">
              <Link
                href="/login"
                className="text-accent-600 hover:text-accent-700 font-medium transition-colors"
              >
                Log in
              </Link>{" "}
              to join the conversation.
            </p>
            <button
              disabled
              className="px-5 py-2 bg-accent-600 text-white text-sm font-medium rounded-lg opacity-50 cursor-not-allowed"
            >
              Post Reply
            </button>
          </div>
        </div>

        {/* Therapy CTA */}
        <TherapyCTA />
      </section>
    </>
  );
}
