/* ── Resource data module ──
 * This file provides types and data accessors for resources.
 * Stub implementations — will be replaced with real data.
 */

export interface Resource {
  slug: string;
  title: string;
  author?: string;
  traditionSlug: string;
  perspectiveType: "devotional" | "questioning" | "academic" | "personal";
  type: string;
  summary: string;
  editorialSummary?: string;
  sourceUrl?: string;
  hostedLocally?: boolean;
  tags: string[];
  pairedWith?: string;
}

const resources: Resource[] = [
  {
    slug: "christianity-devotional-intro",
    title: "An Introduction to Christian Devotion",
    author: "Dr. Sarah Mitchell",
    traditionSlug: "christianity",
    perspectiveType: "devotional",
    type: "article",
    summary:
      "An exploration of Christian devotional practices through history.",
    editorialSummary:
      "This resource provides a comprehensive overview of Christian devotional traditions from the early church to modern practice.",
    sourceUrl: "https://example.com/christian-devotion",
    tags: ["devotion", "prayer", "christianity"],
  },
  {
    slug: "christianity-questioning-analysis",
    title: "Questions of Faith: A Critical Examination",
    author: "Prof. James Chen",
    traditionSlug: "christianity",
    perspectiveType: "questioning",
    type: "article",
    summary:
      "A balanced critical examination of core Christian theological claims.",
    editorialSummary:
      "An academic exploration of the questions and challenges that have shaped Christian thought.",
    sourceUrl: "https://example.com/faith-questions",
    tags: ["criticism", "theology", "christianity"],
    pairedWith: "christianity-devotional-intro",
  },
  {
    slug: "christianity-academic-history",
    title: "The Historical Development of Christianity",
    author: "Dr. Maria Santos",
    traditionSlug: "christianity",
    perspectiveType: "academic",
    type: "paper",
    summary:
      "A scholarly overview of Christianity's historical development across two millennia.",
    tags: ["history", "scholarship", "christianity"],
  },
  {
    slug: "islam-devotional-prayer",
    title: "The Beauty of Salah: Understanding Islamic Prayer",
    author: "Dr. Ahmed Hassan",
    traditionSlug: "islam",
    perspectiveType: "devotional",
    type: "article",
    summary: "An exploration of the spiritual dimensions of Islamic prayer.",
    tags: ["prayer", "devotion", "islam"],
  },
  {
    slug: "judaism-academic-history",
    title: "Judaism Through the Ages",
    author: "Prof. Rachel Goldstein",
    traditionSlug: "judaism",
    perspectiveType: "academic",
    type: "paper",
    summary: "A scholarly examination of Jewish history and practice.",
    tags: ["history", "scholarship", "judaism"],
  },
  {
    slug: "buddhism-personal-journey",
    title: "My Path to Buddhism",
    author: "David Park",
    traditionSlug: "buddhism",
    perspectiveType: "personal",
    type: "story",
    summary:
      "A personal account of discovering and embracing Buddhist practice.",
    tags: ["personal", "journey", "buddhism"],
  },
];

export function getAllResources(): Resource[] {
  return resources;
}

export function getResourceBySlug(slug: string): Resource | undefined {
  return resources.find((r) => r.slug === slug);
}

export function getResourcesByTradition(traditionSlug: string): Resource[] {
  return resources.filter((r) => r.traditionSlug === traditionSlug);
}

export function getResourcesByPerspective(
  type: Resource["perspectiveType"]
): Resource[] {
  return resources.filter((r) => r.perspectiveType === type);
}

export function getPairedResource(slug: string): Resource | undefined {
  const resource = getResourceBySlug(slug);
  if (!resource?.pairedWith) return undefined;
  return getResourceBySlug(resource.pairedWith);
}
