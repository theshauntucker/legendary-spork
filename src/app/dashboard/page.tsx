import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

const topics = [
  { name: "Mormonism", slug: "mormonism", color: "bg-amber-50 border-amber-200 hover:border-amber-400" },
  { name: "Christianity", slug: "christianity", color: "bg-sky-50 border-sky-200 hover:border-sky-400" },
  { name: "Islam", slug: "islam", color: "bg-emerald-50 border-emerald-200 hover:border-emerald-400" },
  { name: "Catholicism", slug: "catholicism", color: "bg-violet-50 border-violet-200 hover:border-violet-400" },
  { name: "Jehovah's Witnesses", slug: "jehovahs-witnesses", color: "bg-rose-50 border-rose-200 hover:border-rose-400" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const displayName =
    user.user_metadata?.full_name || user.email || "there";

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50/30 via-white to-amber-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-heading text-slate-900">
              Welcome, {displayName}
            </h1>
            <p className="mt-1 text-slate-500">
              Your personal FaithLens dashboard
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Your Activity */}
        <section className="mb-10">
          <h2 className="text-xl font-heading text-slate-800 mb-4">
            Your Activity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <h3 className="font-medium text-slate-800 mb-2">
                Saved Articles
              </h3>
              <p className="text-sm text-slate-500">
                You haven&apos;t saved any articles yet. Browse topics below to
                get started.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <h3 className="font-medium text-slate-800 mb-2">
                Forum Posts
              </h3>
              <p className="text-sm text-slate-500">
                Join the community to share your thoughts and learn from others.
              </p>
            </div>
          </div>
        </section>

        {/* Browse Topics */}
        <section className="mb-10">
          <h2 className="text-xl font-heading text-slate-800 mb-4">
            Browse Topics
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/topics/${topic.slug}`}
                className={`border-2 rounded-2xl px-4 py-3 text-center font-medium text-slate-800 hover:shadow-md transition-all ${topic.color}`}
              >
                {topic.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Community Link */}
        <section>
          <Link
            href="/community"
            className="block bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:border-accent-400 hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-heading text-slate-800 mb-1">
              Community Forum
            </h2>
            <p className="text-sm text-slate-500">
              Discuss world religions with fellow learners. Ask questions, share
              insights, and explore diverse perspectives in a respectful space.
            </p>
            <span className="inline-block mt-3 bg-accent-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-accent-700 transition-colors">
              Visit Community
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}
