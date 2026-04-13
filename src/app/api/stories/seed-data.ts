export interface SeedStory {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  religion: string;
  religionLabel: string;
  anonymous: boolean;
  displayName: string | null;
  date: string;
}

export const seedStories: SeedStory[] = [
  {
    id: "leaving-lds-after-30-years",
    title: "Leaving the LDS Church After 30 Years",
    excerpt:
      "I was born into a multi-generational Mormon family in Provo, Utah. The church was everything — my social life, my identity, my worldview.",
    body: `I was born into a multi-generational Mormon family in Provo, Utah. The church was everything — my social life, my identity, my worldview. I served a two-year mission, married in the temple, and raised four children in the faith. For decades, I never questioned a single teaching.

It started with the Gospel Topics essays. The church's own website confirmed things I'd been told were "anti-Mormon lies" — polygamy with teenage girls, multiple First Vision accounts, the Book of Abraham translation problems. I felt physically sick reading them. I spent two years trying to make it work, reading FAIR apologetics, praying, fasting. But the shelf kept getting heavier.

The hardest part wasn't losing my beliefs — it was losing my community. My parents told me I was destroying our eternal family. My wife and I nearly divorced before she started her own research. Three of our four kids have also left. The youngest still attends, and we support that completely.

I'm three years out now. I still grieve the community I lost, but I've never felt more intellectually honest. I've found a wonderful group of post-Mormon friends who understand the unique pain of leaving a high-demand religion. If you're in the middle of this process, know that it gets better. You are not broken for questioning.`,
    religion: "mormonism",
    religionLabel: "Mormonism",
    anonymous: true,
    displayName: null,
    date: "2025-11-15",
  },
  {
    id: "journey-out-of-evangelical-christianity",
    title: "My Journey Out of Evangelical Christianity",
    excerpt:
      "I was a worship leader for twelve years. I knew all the right songs, all the right answers, all the right prayers. But inside, I was falling apart.",
    body: `I was a worship leader for twelve years. I knew all the right songs, all the right answers, all the right prayers. But inside, I was falling apart.

My deconstruction began when my best friend came out as gay. The church's response was devastating — not outright cruelty, but a suffocating "love the sinner" rhetoric that reduced a beautiful human being to a theological problem. I watched my friend lose his entire support system overnight. I couldn't reconcile the God of love I sang about every Sunday with a theology that caused this much harm.

I started reading broadly — Bart Ehrman, Rob Bell, Pete Enns. I discovered that many of my "foundational" beliefs were relatively modern inventions. Biblical inerrancy, the rapture, young-earth creationism — none of these were held by the early church. The more I learned about church history, the less I could pretend everything was fine.

Leaving was gradual. I stopped leading worship first, then stopped attending. The silence from people I'd served alongside for a decade was deafening. But I've found that faith — or whatever I call it now — is richer when it's honest. I still believe in something bigger than myself. I just don't think it fits in the box I was given.`,
    religion: "christianity",
    religionLabel: "Christianity",
    anonymous: false,
    displayName: "Grace W.",
    date: "2025-12-03",
  },
  {
    id: "life-after-the-watchtower",
    title: "Life After the Watchtower",
    excerpt:
      "Being disfellowshipped from the Jehovah's Witnesses meant losing every single person I'd ever known. My own mother hasn't spoken to me in four years.",
    body: `Being disfellowshipped from the Jehovah's Witnesses meant losing every single person I'd ever known. My own mother hasn't spoken to me in four years.

I was a third-generation Witness. I was baptized at 14, pioneered at 18, and married a Witness man at 21. My entire world existed within Kingdom Hall walls. I never went to college — why would I, when Armageddon was coming any day? I never made worldly friends. I never developed any identity outside the organization.

My doubts started with the Australian Royal Commission investigation into child abuse within the organization. I watched Geoffrey Jackson's testimony and felt my world crack. I started reading JWFacts.com in secret, terrified that Jehovah could read my thoughts. I learned about the organization's history of failed predictions, their UN NGO membership, and the constant changes in "truth" they called "new light."

When I expressed doubts to an elder, the judicial process moved quickly. I was disfellowshipped within weeks. Overnight, I became invisible. My parents, my siblings, my lifelong friends — all gone. I had to learn how to exist in a world I'd been taught was controlled by Satan.

It's been four years. I've built a new life, made genuine friends, and started therapy. The trauma doesn't disappear, but I'm finally free to think for myself.`,
    religion: "jehovahs-witnesses",
    religionLabel: "Jehovah's Witnesses",
    anonymous: true,
    displayName: null,
    date: "2026-01-20",
  },
  {
    id: "finding-peace-after-ultra-orthodox",
    title: "Finding Peace After Leaving Ultra-Orthodox Judaism",
    excerpt:
      "In my community, questioning wasn't just discouraged — it was dangerous. Leaving meant losing custody of my children.",
    body: `In my community, questioning wasn't just discouraged — it was dangerous. Leaving meant losing custody of my children.

I grew up in a Hasidic community in Brooklyn. My life was completely prescribed — what to wear, what to eat, who to marry, what to think. I was married at 19 to a man I'd met twice. By 25, I had four children and a growing sense that something was deeply wrong.

I started sneaking books from the public library — science, philosophy, history. Each book was a small act of rebellion. I learned about evolution, about biblical scholarship, about the world beyond our insular community. I felt like I was waking up from a dream I'd been born into.

The hardest part was the children. In our community, courts often favor the religious parent. I was told that if I left, I would lose custody. I spent two years planning in secret, connecting with Footsteps — an organization that helps people leaving ultra-Orthodox communities. They helped me find a lawyer, a therapist, and an apartment.

I left on a Tuesday morning. The custody battle took eighteen months and cost me everything I had. But I kept my children. We're learning together now — about the world, about who we are without the community that defined us. My oldest daughter recently told me she's proud of me. That's worth everything I lost.`,
    religion: "judaism",
    religionLabel: "Judaism",
    anonymous: true,
    displayName: null,
    date: "2026-02-14",
  },
];
