/* ── Stories data module ──
 * Types, seed data, and accessors for personal journey stories.
 * All journey types are treated with equal dignity.
 */

export type JourneyType =
  | "entering"
  | "deepening"
  | "questioning"
  | "leaving"
  | "returning";

export interface Story {
  slug: string;
  title: string;
  excerpt: string;
  journeyType: JourneyType;
  traditionSlug: string;
  authorName: string;
  date: string;
  contentHtml: string;
}

export const JOURNEY_LABELS: Record<JourneyType, string> = {
  entering: "Entering a tradition",
  deepening: "Deepening faith",
  questioning: "Exploring doubts",
  leaving: "Leaving a tradition",
  returning: "Returning to faith",
};

export const JOURNEY_COLORS: Record<JourneyType, string> = {
  entering: "bg-emerald-100 text-emerald-700",
  deepening: "bg-blue-100 text-blue-700",
  questioning: "bg-amber-100 text-amber-700",
  leaving: "bg-rose-100 text-rose-700",
  returning: "bg-violet-100 text-violet-700",
};

/** Human-readable tradition names keyed by slug. */
const TRADITION_NAMES: Record<string, string> = {
  "latter-day-saints": "Latter-day Saints",
  "evangelical-christianity": "Evangelical Christianity",
  "jehovahs-witnesses": "Jehovah's Witnesses",
  catholicism: "Catholicism",
  islam: "Islam",
  buddhism: "Buddhism",
  christianity: "Christianity",
  judaism: "Judaism",
  hinduism: "Hinduism",
  sikhism: "Sikhism",
};

export function getTraditionName(slug: string): string {
  return TRADITION_NAMES[slug] ?? slug;
}

const stories: Story[] = [
  {
    slug: "finding-community-in-the-church",
    title: "Finding Community in the Church",
    excerpt:
      "After years of feeling spiritually adrift, I attended a Latter-day Saint service with a friend and discovered a sense of belonging I had never experienced before.",
    journeyType: "entering",
    traditionSlug: "latter-day-saints",
    authorName: "Marcus T.",
    date: "2026-01-15",
    contentHtml: `<p>I grew up without any particular religious background. My parents were kind, thoughtful people, but faith was simply not part of our household. I never felt the absence of it until my late twenties, when a series of life changes left me searching for something I could not quite name.</p>
<p>A coworker invited me to a Sunday service at her Latter-day Saint congregation. I almost declined, but something — curiosity, maybe loneliness — pushed me to go. The first thing I noticed was how warmly people greeted me. Not in a performative way, but with genuine interest. People remembered my name the following week.</p>
<p>Over the next several months I attended regularly, met with missionaries, and studied the Book of Mormon. I will not pretend every doctrine clicked immediately. Some teachings challenged me deeply, and I had long conversations with members who had wrestled with similar questions. What mattered most was that I was welcomed into those conversations rather than shut out of them.</p>
<p>I was baptized nine months after that first visit. The decision was entirely my own, arrived at gradually and without pressure. What I found in this community was not perfection — no community offers that — but a framework for meaning and a group of people committed to showing up for one another. That was what I had been searching for all along.</p>`,
  },
  {
    slug: "my-journey-through-doubt",
    title: "My Journey Through Doubt",
    excerpt:
      "I spent fifteen years as a devoted evangelical before questions about Scripture and suffering forced me into a season of profound uncertainty.",
    journeyType: "questioning",
    traditionSlug: "evangelical-christianity",
    authorName: "Sarah K.",
    date: "2026-02-03",
    contentHtml: `<p>For fifteen years I was fully immersed in evangelical Christianity. I led a small group, volunteered with the youth ministry, and anchored my identity in my faith. I believed the Bible was inerrant and that every question had a clear answer if you just studied hard enough.</p>
<p>The doubts crept in slowly. A close friend was diagnosed with terminal cancer at thirty-two, and the platitudes I had always offered others — "God has a plan," "everything happens for a reason" — rang hollow when I tried to apply them to her hospital bed. I started reading theologians outside my tradition and discovered that Christians throughout history had wrestled with the same questions I was afraid to voice.</p>
<p>I told my pastor I was struggling. His response was compassionate but firm: doubt was a spiritual attack, and the remedy was more prayer and more Scripture. I tried. But the questions did not go away; they only multiplied. I wondered about the formation of the biblical canon, about the diversity of early Christian belief, about what it meant that sincere people of other faiths experienced God just as powerfully as I did.</p>
<p>I am still in this season of questioning. I have not left my church, but my faith looks different than it once did. I am learning to sit with uncertainty rather than rushing toward answers. Some days that feels liberating; other days it is terrifying. I share this because I want anyone in a similar place to know they are not alone, and that honest questioning is not the enemy of faith.</p>`,
  },
  {
    slug: "why-i-left-and-what-i-found",
    title: "Why I Left and What I Found",
    excerpt:
      "Leaving the Jehovah's Witnesses cost me nearly every relationship I had. It also gave me the freedom to build a life on my own terms.",
    journeyType: "leaving",
    traditionSlug: "jehovahs-witnesses",
    authorName: "Anonymous",
    date: "2026-02-20",
    contentHtml: `<p>I was a fourth-generation Jehovah's Witness. I was baptized at sixteen, auxiliary pioneered through my teens, and married a fellow Witness at twenty-three. The organization was not just my religion — it was my entire social world. Every friend, every family gathering, every evening activity revolved around the Kingdom Hall.</p>
<p>My doubts began when I stumbled across the organization's older publications while helping clean out a long-time elder's library. Predictions that had not come true, teachings that had been quietly reversed, statements about science and medicine that were plainly wrong. I felt confused rather than angry at first. I brought my concerns to an elder I trusted, hoping for a conversation. Instead, I was cautioned about "independent thinking" and told to focus on current publications.</p>
<p>The decision to leave took two years of quiet agonizing. I knew the cost: under the shunning policy, my parents, my siblings, and every friend I had ever known would be expected to cut contact with me. And that is exactly what happened. The silence was devastating. I grieved relationships with people who were still alive, which is a particular kind of pain.</p>
<p>Five years later, I have rebuilt. I found a therapist who specializes in high-control religious environments. I made friends who accept me without conditions. I went back to school. I still carry scars, and certain holidays are hard. But I also carry a hard-won sense of authenticity. I do not regret the person I was inside the organization — she was doing her best. I am simply glad I found the courage to become someone new.</p>`,
  },
  {
    slug: "returning-to-the-faith-of-my-childhood",
    title: "Returning to the Faith of My Childhood",
    excerpt:
      "After a decade away from the Catholic Church, a unexpected moment of grace in a small-town parish drew me back to the tradition I thought I had outgrown.",
    journeyType: "returning",
    traditionSlug: "catholicism",
    authorName: "Daniel R.",
    date: "2026-03-05",
    contentHtml: `<p>I left the Catholic Church at nineteen, the way many young people do — not with a dramatic break, but with a slow drift. College introduced me to new ideas, new social circles, and a general sense that organized religion was something I had outgrown. For ten years I barely thought about faith at all.</p>
<p>The return began, of all places, at a funeral. A great-aunt I had been close to as a child passed away, and the service was held in the same small parish where I had made my First Communion. Sitting in that pew, listening to the familiar cadence of the liturgy, something shifted. It was not a thunderbolt conversion. It was more like hearing a song you had forgotten you loved.</p>
<p>I started attending Mass again — sporadically at first, then weekly. I was surprised by how much the Church had changed in the years I was gone, and by how much it had stayed the same. I appreciated the intellectual rigor of the tradition in a way I could not as a teenager. I read Thomas Merton, Dorothy Day, and Pope Francis's encyclicals, and found a Catholicism that was far richer and more socially engaged than what I remembered from catechism class.</p>
<p>I will not pretend I agree with every teaching. I struggle with some of the Church's positions, and I suspect I always will. But I have come to see that tension as part of a living faith rather than a reason to walk away. The tradition held a place for me even when I was not looking for it, and I am grateful I found my way back.</p>`,
  },
  {
    slug: "discovering-islam-in-college",
    title: "Discovering Islam in College",
    excerpt:
      "A world religions class and a chance friendship with a Muslim classmate led me on a two-year journey that ended with my shahada.",
    journeyType: "entering",
    traditionSlug: "islam",
    authorName: "Amina J.",
    date: "2026-03-18",
    contentHtml: `<p>I enrolled in a world religions course during my sophomore year purely to fill a humanities requirement. I had grown up in a loosely secular household and had no strong feelings about faith in any direction. The unit on Islam caught my attention in a way I did not expect. The emphasis on social justice, the discipline of daily prayer, and the poetic beauty of the Quran in Arabic — even through translation — stirred something in me.</p>
<p>Around the same time, I became friends with Fatima, a classmate who wore hijab. I asked her clumsy questions, and she answered them with patience and humor. She never tried to convert me. She simply lived her faith openly, and I found myself drawn to the peace and intentionality that seemed to ground her daily life.</p>
<p>I spent the next year reading — the Quran, hadith collections, Karen Armstrong, Reza Aslan, and scholars from multiple schools of thought. I attended Friday prayers at the campus mosque, first as an observer and then as a participant. I fasted during Ramadan and found the experience profoundly clarifying. The communal iftar meals became some of my happiest memories of college.</p>
<p>I took my shahada the following spring, surrounded by a small group of friends from the Muslim Students Association. My parents were surprised but supportive. Not everyone in my life understood, and I have fielded my share of uncomfortable questions and outright prejudice. But the decision was mine, made freely and after extensive study. Islam gave me a structure for the spiritual longing I had always felt but never known how to express. I am still learning, still growing, and deeply grateful for the path that found me.</p>`,
  },
  {
    slug: "meditation-changed-everything",
    title: "Meditation Changed Everything",
    excerpt:
      "I had identified as Buddhist for years, but it was a silent retreat that transformed my practice from intellectual interest into lived experience.",
    journeyType: "deepening",
    traditionSlug: "buddhism",
    authorName: "Liam W.",
    date: "2026-04-01",
    contentHtml: `<p>I first encountered Buddhism through books in my early twenties — Alan Watts, Thich Nhat Hanh, Pema Chodron. The philosophy resonated deeply. The Four Noble Truths described my experience of suffering with an accuracy that startled me. I began calling myself a Buddhist, attended a local sangha occasionally, and meditated when I remembered to. But if I am honest, my practice was mostly intellectual. I understood impermanence as a concept without truly feeling it.</p>
<p>Everything changed during a ten-day silent Vipassana retreat. I signed up on impulse after a difficult breakup, expecting relaxation. What I got was the hardest and most transformative experience of my life. Ten days without speaking, without eye contact, without my phone — just sitting with my own mind for ten or more hours a day.</p>
<p>The first three days were agony. My knees ached, my thoughts raced, and I desperately wanted to leave. By day four, something began to shift. I started to observe my thoughts without attaching to them. I felt waves of emotion — grief, joy, anger, tenderness — arise and pass without needing to act on any of them. On day seven, during an evening sitting, I experienced a moment of stillness so complete that it brought tears to my eyes.</p>
<p>I came home a different person. Not dramatically so — I still lose my temper, still get anxious, still crave comfort. But I now have a daily practice that is not about escaping discomfort but about meeting it with awareness. Buddhism moved from my bookshelf into my bones. The intellectual framework I had admired for years became something I lived, one breath at a time.</p>`,
  },
];

export function getAllStories(): Story[] {
  return stories;
}

export function getStoryBySlug(slug: string): Story | undefined {
  return stories.find((s) => s.slug === slug);
}

export function getStoriesByTradition(slug: string): Story[] {
  return stories.filter((s) => s.traditionSlug === slug);
}

export function getStoriesByJourneyType(type: JourneyType): Story[] {
  return stories.filter((s) => s.journeyType === type);
}
