/* ── Tradition data module ──
 * This file provides types and data accessors for faith traditions.
 * Stub implementations — will be replaced with real data.
 */

export interface IntroductionLink {
  label: string;
  url: string;
  description?: string;
}

export interface Tradition {
  slug: string;
  name: string;
  alternateNames?: string[];
  summary: string;
  adherentCount?: string;
  foundedDate?: string;
  overviewHtml: string;
  introductionLinks: IntroductionLink[];
  iconEmoji?: string;
}

const traditions: Tradition[] = [
  {
    slug: "christianity",
    name: "Christianity",
    alternateNames: ["The Christian Faith"],
    summary:
      "One of the world's largest faith traditions, centered on the life and teachings of Jesus of Nazareth.",
    adherentCount: "~2.4 billion",
    foundedDate: "1st century CE",
    overviewHtml:
      "<p>Christianity is a monotheistic religion based on the life and teachings of Jesus Christ. It is the world's largest religion by number of adherents.</p>",
    introductionLinks: [
      {
        label: "Christianity.com",
        url: "https://www.christianity.com",
        description: "A broad overview from a Christian perspective.",
      },
    ],
    iconEmoji: "\u271D\uFE0F",
  },
  {
    slug: "islam",
    name: "Islam",
    alternateNames: ["The Muslim Faith"],
    summary:
      "A major world religion founded in the 7th century, centered on the Quran and the teachings of Prophet Muhammad.",
    adherentCount: "~1.9 billion",
    foundedDate: "7th century CE",
    overviewHtml:
      "<p>Islam is a monotheistic Abrahamic religion teaching that Muhammad is the last messenger of God. Its central text is the Quran.</p>",
    introductionLinks: [
      {
        label: "IslamicFinder",
        url: "https://www.islamicfinder.org",
        description: "Resources for learning about Islamic practices.",
      },
    ],
    iconEmoji: "\u262A\uFE0F",
  },
  {
    slug: "judaism",
    name: "Judaism",
    summary:
      "One of the oldest monotheistic traditions, with roots stretching back over three millennia.",
    adherentCount: "~15 million",
    foundedDate: "~2000 BCE",
    overviewHtml:
      "<p>Judaism is one of the oldest monotheistic religions, founded in the Middle East over 3,500 years ago.</p>",
    introductionLinks: [],
    iconEmoji: "\u2721\uFE0F",
  },
  {
    slug: "hinduism",
    name: "Hinduism",
    alternateNames: ["Sanatan Dharma"],
    summary:
      "An ancient and diverse tradition originating in South Asia, encompassing a wide range of beliefs and practices.",
    adherentCount: "~1.2 billion",
    foundedDate: "~1500 BCE",
    overviewHtml:
      "<p>Hinduism is a diverse body of religion, philosophy, and cultural practice native to and predominant in the Indian subcontinent.</p>",
    introductionLinks: [],
    iconEmoji: "\uD83D\uDD49\uFE0F",
  },
  {
    slug: "buddhism",
    name: "Buddhism",
    summary:
      "A tradition founded by Siddhartha Gautama, emphasizing mindfulness, ethical conduct, and the pursuit of enlightenment.",
    adherentCount: "~500 million",
    foundedDate: "~5th century BCE",
    overviewHtml:
      "<p>Buddhism encompasses a variety of traditions, beliefs, and spiritual practices based on the teachings of Siddhartha Gautama (the Buddha).</p>",
    introductionLinks: [],
    iconEmoji: "\u2638\uFE0F",
  },
  {
    slug: "sikhism",
    name: "Sikhism",
    summary:
      "A monotheistic religion founded in the Punjab region, emphasizing equality, service, and devotion to one God.",
    adherentCount: "~30 million",
    foundedDate: "15th century CE",
    overviewHtml:
      "<p>Sikhism is a monotheistic religion that originated in the Punjab region in the 15th century CE.</p>",
    introductionLinks: [],
    iconEmoji: "\uD83E\uDE96",
  },
];

export function getAllTraditions(): Tradition[] {
  return traditions;
}

export function getTraditionBySlug(slug: string): Tradition | undefined {
  return traditions.find((t) => t.slug === slug);
}

export function getAllTraditionSlugs(): string[] {
  return traditions.map((t) => t.slug);
}
