import { getAllTopics, getAllArticles } from "@/lib/content";
import TopicCard from "@/components/TopicCard";
import ArticleCard from "@/components/ArticleCard";
import AdUnit from "@/components/AdUnit";

export default function HomePage() {
  const topics = getAllTopics();
  const articles = getAllArticles().slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-surface-900 mb-4 leading-tight">
            Explore the World&#39;s Religions
            <br />
            <span className="text-primary-600">Without Bias</span>
          </h1>
          <p className="text-lg sm:text-xl text-surface-600 max-w-2xl mx-auto leading-relaxed">
            Every faith gets equal space. From Mormonism to Islam, Christianity
            to Jehovah&#39;s Witnesses &mdash; explore official documents, critical
            analysis, and scholarly perspectives. No agenda, just information.
          </p>
        </div>
      </section>

      {/* Top Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <AdUnit slot="top-banner" format="horizontal" />
      </div>

      {/* Topics Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold text-surface-900 mb-6">
          Explore by Religion
        </h2>
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
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-bold text-surface-900 mb-6">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Mission Statement */}
      <section className="bg-surface-100 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-surface-900 mb-4">
            Our Mission
          </h2>
          <p className="text-surface-600 leading-relaxed">
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
