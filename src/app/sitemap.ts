import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://routinex.org";

const danceStyles = [
  "jazz",
  "contemporary",
  "lyrical",
  "ballet",
  "hip-hop",
  "tap",
  "acro",
  "musical-theater",
  "pom",
  "cheer",
  "modern",
  "pointe",
  "open-freestyle",
];

const competitions = [
  "starquest",
  "showstopper",
  "jump",
  "nuvo",
  "the-dance-awards",
  "world-of-dance",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/upload`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/scoring`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/competitions`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const scoringPages: MetadataRoute.Sitemap = danceStyles.map((style) => ({
    url: `${BASE_URL}/scoring/${style}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const competitionPages: MetadataRoute.Sitemap = competitions.map((comp) => ({
    url: `${BASE_URL}/competitions/${comp}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...scoringPages, ...competitionPages];
}
