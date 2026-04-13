import { getAllTopics, getAllArticles } from "@/lib/content";
import TopicCard from "@/components/TopicCard";
import ArticleCard from "@/components/ArticleCard";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";

export default function HomePage() {
  const topics = getAllTopics();
  const articles = getAllArticles().slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-accent-50 via-white to-amber-50 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-slate-900 mb-5 leading-tight">
            Explore the World&#39;s Religions
            <br />
            <span className="text-accent-600">Without Bias</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Every faith gets equal space. From Mormonism to Islam, Christianity
            to Jehovah&#39;s Witnesses &mdash; explore official documents, critical
            analysis, and scholarly perspectives. No agenda, just information.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <a
              href="#topics"
              className="bg-accent-600 text-white px-6 py-3 rounded-lg hover:bg-accent-700 transition-colors font-semibold"
            >
              Start Exploring
            </a>
            <a
              href="/community"
              className="border-2 border-slate-300 text-slate-700 px-6 py-3 rounded-lg hover:border-accent-400 hover:text-accent-700 transition-colors font-semibold"
            >
              Join the Community
            </a>
          </div>
        </div>
      </section>

      {/* Top Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <AdUnit slot="top-banner" format="horizontal" />
      </div>

      {/* Topics Grid */}
      <section id="topics" className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-3xl font-heading text-slate-900 mb-2">
          Explore by Religion
        </h2>
        <p className="text-slate-500 mb-8">
          Dive into any tradition. Every topic includes official resources, critical perspectives, and scholarly analysis.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {topics.map((topic) => (
            <TopicCard key={topic.slug} topic={topic} />
          ))}
        </div>
      </section>

      {/* Mid-page Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <AdUnit slot="mid-page" format="horizontal" />
      </div>

      {/* Latest Articles */}
      {articles.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-3xl font-heading text-slate-900 mb-2">
            Latest Articles
          </h2>
          <p className="text-slate-500 mb-8">
            In-depth explorations, document analyses, and balanced perspectives.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Email Capture */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
        <EmailCapture />
      </div>

      {/* Mission Statement */}
      <section className="bg-slate-50 py-14 mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-heading text-slate-900 mb-4">
            Our Mission
          </h2>
          <p className="text-slate-600 leading-relaxed text-lg">
            FaithLens exists to provide a fair, unbiased platform where every
            religion is represented equally. We link to official church
            websites, provide critical scholarly analysis, and let you explore
            at your own pace. Whether you&#39;re a believer, a seeker, or just
            curious &mdash; you&#39;re welcome here.
          </p>
        </div>
      </section>

      {/* Bottom Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <AdUnit slot="bottom-banner" format="horizontal" />
      </div>
    </>
  );
}
