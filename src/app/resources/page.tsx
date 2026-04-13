import type { Metadata } from "next";
import AdUnit from "@/components/AdUnit";

export const metadata: Metadata = {
  title: "Resources — Official Church Links & Missionary Scheduling",
  description:
    "Find official websites, missionary scheduling links, and study tools for every major religion. Direct links to LDS, Catholic, JW, Islamic, and Christian resources.",
};

interface ResourceLink {
  name: string;
  url: string;
  description: string;
}

interface ResourceSection {
  title: string;
  icon: string;
  links: ResourceLink[];
}

const resources: ResourceSection[] = [
  {
    title: "The Church of Jesus Christ of Latter-day Saints (LDS / Mormon)",
    icon: "\u{1F3DB}",
    links: [
      {
        name: "Official Church Website",
        url: "https://www.churchofjesuschrist.org",
        description:
          "The official website of The Church of Jesus Christ of Latter-day Saints",
      },
      {
        name: "Meet with Missionaries",
        url: "https://www.churchofjesuschrist.org/comeuntochrist",
        description:
          "Request a visit from LDS missionaries in your area",
      },
      {
        name: "Book of Mormon Online",
        url: "https://www.churchofjesuschrist.org/study/scriptures/bofm",
        description: "Read the Book of Mormon online for free",
      },
      {
        name: "FamilySearch (Genealogy)",
        url: "https://www.familysearch.org",
        description:
          "Free genealogy research tool operated by the LDS Church",
      },
      {
        name: "CES Letter",
        url: "https://cesletter.org",
        description:
          "Critical examination of LDS Church truth claims by Jeremy Runnells",
      },
      {
        name: "FAIR Latter-day Saints",
        url: "https://www.fairlatterdaysaints.org",
        description:
          "Apologetics and responses to criticisms of the LDS Church",
      },
    ],
  },
  {
    title: "Christianity (Protestant)",
    icon: "\u271E",
    links: [
      {
        name: "Bible Gateway",
        url: "https://www.biblegateway.com",
        description:
          "Read the Bible online in over 200 versions and 70 languages",
      },
      {
        name: "Christianity Today",
        url: "https://www.christianitytoday.com",
        description:
          "News, analysis, and commentary from an evangelical Christian perspective",
      },
      {
        name: "Got Questions",
        url: "https://www.gotquestions.org",
        description:
          "Bible-based answers to common questions about Christianity",
      },
    ],
  },
  {
    title: "Roman Catholic Church",
    icon: "\u{1F54D}",
    links: [
      {
        name: "The Vatican",
        url: "https://www.vatican.va",
        description: "Official website of the Holy See and Vatican City",
      },
      {
        name: "USCCB",
        url: "https://www.usccb.org",
        description: "United States Conference of Catholic Bishops",
      },
      {
        name: "Catholic Answers",
        url: "https://www.catholic.com",
        description:
          "Catholic apologetics and information about Catholic teachings",
      },
      {
        name: "Daily Mass Readings",
        url: "https://bible.usccb.org/daily-bible-reading",
        description: "Today's scripture readings for Catholic Mass",
      },
    ],
  },
  {
    title: "Islam",
    icon: "\u262A",
    links: [
      {
        name: "IslamicFinder",
        url: "https://www.islamicfinder.org",
        description:
          "Prayer times, Quran, and Islamic resources worldwide",
      },
      {
        name: "Quran.com",
        url: "https://quran.com",
        description:
          "Read the Holy Quran online with translations and audio",
      },
      {
        name: "IslamiCity",
        url: "https://www.islamicity.org",
        description:
          "Comprehensive Islamic information, education, and encyclopedic resources",
      },
      {
        name: "WhyIslam",
        url: "https://www.whyislam.org",
        description:
          "Learn about Islam and request a free Quran or mosque visit",
      },
    ],
  },
  {
    title: "Jehovah's Witnesses",
    icon: "\u{1F4D6}",
    links: [
      {
        name: "JW.org",
        url: "https://www.jw.org",
        description: "Official website of Jehovah's Witnesses",
      },
      {
        name: "Request a Bible Study",
        url: "https://www.jw.org/en/jehovahs-witnesses/free-bible-study/",
        description:
          "Request a free personal Bible study with Jehovah's Witnesses",
      },
      {
        name: "JW Online Library",
        url: "https://wol.jw.org",
        description:
          "Watchtower Online Library with publications and study materials",
      },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl sm:text-4xl font-heading text-slate-900 mb-3">
        Resources & Official Links
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Direct links to official church websites, missionary scheduling,
        scripture study tools, and more. We link to both official and
        independent sources for every faith.
      </p>

      <AdUnit slot="resources-top" format="horizontal" />

      <div className="space-y-10 mt-8">
        {resources.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-heading text-slate-900 mb-4 flex items-center gap-2">
              <span>{section.icon}</span> {section.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {section.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-accent-300 transition-all"
                >
                  <h3 className="font-semibold text-accent-700 text-sm mb-1">
                    {link.name} &rarr;
                  </h3>
                  <p className="text-xs text-slate-500">
                    {link.description}
                  </p>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      <AdUnit
        slot="resources-bottom"
        format="horizontal"
        className="mt-10"
      />
    </div>
  );
}
