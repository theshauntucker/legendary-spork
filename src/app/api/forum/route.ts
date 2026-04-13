import { NextRequest, NextResponse } from "next/server";

export interface ForumThread {
  id: string;
  topic: string;
  title: string;
  author: string;
  date: string;
  replyCount: number;
  body?: string;
}

const seedThreads: ForumThread[] = [
  // Mormonism
  {
    id: "lds-experience-leaving",
    topic: "mormonism",
    title: "My experience leaving the LDS church",
    author: "SeekerOfTruth",
    date: "2026-03-28",
    replyCount: 24,
    body: "After 30 years as a faithful member, I finally made the decision to step away. It wasn't a single event but a gradual process of asking questions and not finding satisfying answers. I want to share my journey in case it helps anyone else who is going through something similar.",
  },
  {
    id: "ces-letter-discussion",
    topic: "mormonism",
    title: "CES Letter discussion thread",
    author: "HistoryBuff42",
    date: "2026-04-02",
    replyCount: 57,
    body: "I recently read the CES Letter for the first time. I'd like to discuss some of the key claims point by point. What did you find most compelling? What arguments do you think are weakest? Let's have a respectful, evidence-based discussion.",
  },
  {
    id: "fair-mormon-responses",
    topic: "mormonism",
    title: "FAIR Mormon responses - are they convincing?",
    author: "OpenMinded99",
    date: "2026-04-05",
    replyCount: 31,
    body: "I've been reading through FAIR's responses to common criticisms. Some seem well-researched while others feel like they sidestep the actual issues. What's everyone's take on their apologetics?",
  },

  // Christianity
  {
    id: "left-evangelical",
    topic: "christianity",
    title: "Why I left evangelical Christianity",
    author: "GraceWalker",
    date: "2026-03-15",
    replyCount: 42,
    body: "Growing up in the Bible Belt, my entire identity was wrapped up in my church community. When I started having doubts in college, I felt like I was losing everything. Here's my story of deconstruction and what I found on the other side.",
  },
  {
    id: "best-arguments-christianity",
    topic: "christianity",
    title: "Best arguments for Christianity",
    author: "Philosopher_Paul",
    date: "2026-03-22",
    replyCount: 38,
    body: "In the spirit of fair inquiry, let's compile the strongest intellectual arguments for the Christian faith. I'll start with the cosmological argument and the historical case for the resurrection.",
  },
  {
    id: "deconstruction-books",
    topic: "christianity",
    title: "Recommended books for deconstruction",
    author: "BookwormBeth",
    date: "2026-04-01",
    replyCount: 19,
    body: "I'm looking for thoughtful books that helped others through their faith deconstruction. Not looking for angry atheist rants - more like honest, compassionate explorations of doubt. What would you recommend?",
  },

  // Islam
  {
    id: "understanding-quran",
    topic: "islam",
    title: "Understanding the Quran as a non-Muslim",
    author: "CuriousReader",
    date: "2026-03-20",
    replyCount: 15,
    body: "I'm trying to read the Quran to better understand Islam. Any recommended translations or study guides for someone coming from a Western, non-Muslim background?",
  },
  {
    id: "islam-women-rights",
    topic: "islam",
    title: "Women's rights in Islam - scholarly perspectives",
    author: "ScholarSara",
    date: "2026-04-03",
    replyCount: 28,
    body: "I'd like to have a nuanced discussion about women's rights in Islamic tradition, looking at both progressive and traditional scholarly interpretations.",
  },

  // Catholicism
  {
    id: "catholic-to-agnostic",
    topic: "catholicism",
    title: "From Catholic school to agnosticism",
    author: "FormerAltar",
    date: "2026-03-18",
    replyCount: 21,
    body: "Twelve years of Catholic education and I ended up agnostic. But I don't regret the journey. Here's what I kept and what I left behind.",
  },
  {
    id: "vatican-ii-changes",
    topic: "catholicism",
    title: "How Vatican II changed everything",
    author: "ChurchHistory101",
    date: "2026-04-06",
    replyCount: 16,
    body: "Let's discuss the sweeping reforms of Vatican II and their lasting impact on Catholic practice and theology.",
  },

  // Jehovah's Witnesses
  {
    id: "leaving-jw",
    topic: "jehovahs-witnesses",
    title: "Life after leaving Jehovah's Witnesses",
    author: "FreeAtLast",
    date: "2026-03-25",
    replyCount: 33,
    body: "The hardest part wasn't the theological questions - it was losing my entire social network overnight. For anyone considering leaving, here's what to expect and how to rebuild.",
  },
  {
    id: "jw-blood-transfusion",
    topic: "jehovahs-witnesses",
    title: "The blood transfusion policy - ethical discussion",
    author: "MedStudent_JW",
    date: "2026-04-04",
    replyCount: 22,
    body: "As a medical student who grew up JW, I've been wrestling with the blood transfusion doctrine. Let's discuss the scriptural basis and the medical/ethical implications.",
  },

  // General
  {
    id: "comparing-religions",
    topic: "general",
    title: "What surprised you most when comparing religions?",
    author: "WorldExplorer",
    date: "2026-04-07",
    replyCount: 45,
    body: "After studying multiple faiths, what was the most surprising similarity or difference you discovered? For me, it was how many creation narratives share common themes across completely unrelated cultures.",
  },
  {
    id: "spirituality-without-religion",
    topic: "general",
    title: "Can you be spiritual without religion?",
    author: "SoulSearcher",
    date: "2026-04-08",
    replyCount: 29,
    body: "For those who left organized religion but still consider themselves spiritual - what does your practice look like now? How do you find meaning and community outside of a church?",
  },
];

export async function GET() {
  return NextResponse.json({ threads: seedThreads }, { status: 200 });
}

export async function POST(request: NextRequest) {
  // Require authentication for creating threads (not yet implemented)
  void request;
  return NextResponse.json(
    { error: "Authentication required. Please log in to create a thread." },
    { status: 401 }
  );
}
