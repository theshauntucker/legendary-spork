"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import RoutineXLogo from "@/components/RoutineXLogo";
import {
  Sparkles,
  Upload,
  Video,
  BarChart3,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  LogOut,
  TrendingUp,
  TrendingDown,
  Trophy,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { startCheckout, type CheckoutType } from "@/lib/checkout";

interface VideoRecord {
  id: string;
  routine_name: string;
  dancer_name: string | null;
  style: string;
  age_group: string;
  entry_type: string;
  status: string;
  created_at: string;
  thumbnail_path: string | null;
  analyses: Array<{ id: string; total_score: number; award_level: string }>;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  uploaded: {
    label: "Uploaded",
    color: "text-blue-400 bg-blue-400/10",
    icon: Clock,
  },
  processing: {
    label: "Processing",
    color: "text-yellow-400 bg-yellow-400/10",
    icon: Loader2,
  },
  ready: {
    label: "Ready",
    color: "text-green-400 bg-green-400/10",
    icon: CheckCircle,
  },
  analyzed: {
    label: "Analyzed",
    color: "text-primary-400 bg-primary-400/10",
    icon: BarChart3,
  },
  error: {
    label: "Error",
    color: "text-red-400 bg-red-400/10",
    icon: AlertCircle,
  },
};

// Big hero-style card for one-time purchases — variant: "gold" | "purple"
function HeroPurchaseCard({
  variant, badge, title, price, subPrice, tagline, features, buttonText, type
}: {
  variant: "gold" | "purple";
  badge: string; title: string; price: string; subPrice: string; tagline: string;
  features: string[]; buttonText: string; type: string;
}) {
  const [loading, setLoading] = React.useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    const result = await startCheckout(type as CheckoutType);
    if (!result.ok) {
      if (!result.cancelled) alert(result.error || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }
    if (!result.redirected) window.location.href = "/dashboard?from=iap";
  };

  const isGold = variant === "gold";

  return (
    <div
      className={`relative rounded-3xl overflow-hidden flex flex-col ${isGold ? "border-2 border-yellow-500/50" : "border-2 border-violet-500/50"}`}
      style={{ boxShadow: isGold ? "0 0 30px rgba(234,179,8,0.2), 0 0 60px rgba(234,179,8,0.1)" : "0 0 30px rgba(139,92,246,0.2), 0 0 60px rgba(139,92,246,0.1)" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-surface-900/95 via-surface-900/80 to-surface-800/90" />

      {/* Badge stripe */}
      <div className="absolute top-0 left-0 right-0 flex justify-center">
        {isGold
          ? <div className="bg-gradient-to-r from-yellow-500 to-amber-400 text-white text-xs font-extrabold uppercase tracking-widest px-6 py-1 rounded-b-xl">{badge}</div>
          : <div className="bg-gradient-to-r from-violet-600 to-purple-500 text-white text-xs font-extrabold uppercase tracking-widest px-6 py-1 rounded-b-xl">{badge}</div>
        }
      </div>

      <div className="relative px-6 pt-10 pb-6 flex flex-col flex-1">
        <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-1">{title}</h3>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl sm:text-5xl font-black text-white">{price}</span>
        </div>
        {isGold
          ? <p className="text-sm font-semibold mb-3 text-yellow-300">{subPrice}</p>
          : <p className="text-sm font-semibold mb-3 text-violet-300">{subPrice}</p>
        }
        <ul className="space-y-2 mb-4 flex-1">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-surface-200">
              {isGold
                ? <span className="text-yellow-400 font-bold">✓</span>
                : <span className="text-violet-400 font-bold">✓</span>
              }
              {f}
            </li>
          ))}
        </ul>
        <p className="text-xs text-surface-200/60 italic mb-4">{tagline}</p>
        {isGold
          ? <button onClick={handlePurchase} disabled={loading} className="w-full py-3.5 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-yellow-500 to-amber-400 hover:opacity-90 transition-all shadow-lg disabled:opacity-50">{loading ? "Loading..." : buttonText}</button>
          : <button onClick={handlePurchase} disabled={loading} className="w-full py-3.5 rounded-2xl font-extrabold text-base text-white bg-gradient-to-r from-violet-600 to-purple-500 hover:opacity-90 transition-all shadow-lg disabled:opacity-50">{loading ? "Loading..." : buttonText}</button>
        }
      </div>
    </div>
  );
}

// Small card (used in out-of-credits 3-col grid only)
function PurchaseCard({
  badge, badgeColor, title, price, description, features, buttonText, buttonStyle, type
}: {
  badge: string; badgeColor: string; title: string; price: string;
  description: string; features: string[]; buttonText: string;
  buttonStyle: string; type: string;
}) {
  const [loading, setLoading] = React.useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    const result = await startCheckout(type as CheckoutType);
    if (!result.ok) {
      if (!result.cancelled) alert(result.error || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }
    if (!result.redirected) window.location.href = "/dashboard?from=iap";
  };

  return (
    <div className="glass rounded-2xl p-6 border border-white/10 flex flex-col">
      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit ${badgeColor}`}>{badge}</span>
      <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
      <p className="text-3xl font-extrabold text-white mb-1">{price}</p>
      <p className="text-sm text-surface-200 mb-4">{description}</p>
      <ul className="space-y-2 mb-6 flex-1">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2 text-sm text-surface-200">
            <span className="text-primary-400">✓</span> {f}
          </li>
        ))}
      </ul>
      <button
        onClick={handlePurchase}
        disabled={loading}
        className={`w-full py-3 rounded-full font-bold text-white transition-all ${buttonStyle} disabled:opacity-50`}
      >
        {loading ? "Loading..." : buttonText}
      </button>
    </div>
  );
}

// Big hero card for Season Member — shown to brand-new signups
function SubscriptionHeroCard() {
  const [loading, setLoading] = React.useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    const result = await startCheckout("subscription");
    if (!result.ok) {
      if (!result.cancelled) alert(result.error || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }
    if (!result.redirected) window.location.href = "/dashboard?from=iap";
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-primary-500/60 mb-4"
      style={{ boxShadow: "0 0 40px rgba(139,92,246,0.25), 0 0 80px rgba(139,92,246,0.1)" }}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-accent-900/60 to-surface-900/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-transparent to-gold-500/10" />

      {/* Badge */}
      <div className="absolute top-0 left-0 right-0 flex justify-center">
        <div className="bg-gradient-to-r from-primary-500 via-accent-500 to-gold-500 text-white text-xs font-extrabold uppercase tracking-widest px-8 py-1.5 rounded-b-xl">
          👑 Most Popular — Introductory Rate
        </div>
      </div>

      <div className="relative px-6 pt-10 pb-6 sm:px-10 sm:pt-12 sm:pb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Left: price + details */}
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Season Member</h3>
            <div className="flex items-baseline gap-2 justify-center sm:justify-start mb-3">
              <span className="text-5xl sm:text-6xl font-black text-white">$12.99</span>
              <span className="text-surface-200 text-lg">/month</span>
            </div>
            <p className="text-primary-300 text-sm font-semibold mb-4">
              🔒 Rate locked in forever — price goes up soon
            </p>
            <ul className="space-y-2 text-sm text-surface-200 text-left inline-block">
              {[
                "10 AI-powered analyses every month",
                "Full season progress tracking",
                "All styles: dance, cheer, duo, group",
                "Cancel anytime — no contracts",
              ].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-primary-400 font-bold">✓</span> {f}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-surface-200/70 italic max-w-sm">
              "Upload after every rehearsal. Watch your scores climb. Walk into competition already knowing what the judges will say."
            </p>
          </div>

          {/* Right: CTA */}
          <div className="w-full sm:w-64 flex flex-col items-center gap-3">
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-extrabold text-lg text-white bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? "Loading..." : "Start Membership →"}
            </button>
            <p className="text-xs text-surface-200/60 text-center">
              Cancel anytime. No commitment.
            </p>
            <p className="text-xs text-surface-200/40 text-center">
              Or use your free credit first — upgrade anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({
  user,
  videos,
  credits,
}: {
  user: { email: string; name: string };
  videos: VideoRecord[];
  credits: { remaining: number; total: number; used: number };
}) {
  const router = useRouter();

  // Client-side credit verification fallback:
  // If user just paid but credits are still 0, call verify-payment API
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId && credits.remaining === 0) {
      fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.verified) {
            router.refresh();
          }
        })
        .catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <a href="/" className="inline-flex">
              <RoutineXLogo size="md" />
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-surface-200 hidden sm:block">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm text-surface-200 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </div>

        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">
            {user.name ? `Hey, ${user.name.split(" ")[0]}!` : "Your Dashboard"}
          </h1>
          <p className="mt-2 text-surface-200">
            {videos.length > 0
              ? `You have ${videos.length} routine${videos.length !== 1 ? "s" : ""} uploaded.`
              : "Upload your first routine to get started."}
          </p>
        </motion.div>

        {/* ── Get More Analyses — always visible, right at the top ── */}
        <div className="mb-10">
          {/* Season Member — HERO CARD */}
          <SubscriptionHeroCard />

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-xs text-surface-200/50 uppercase tracking-widest">or pay per routine</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          {/* BOGO + Pack — big hero cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            <HeroPurchaseCard
              variant="gold"
              badge="⚡ Buy One Get One Free"
              title="BOGO — 2 Analyses"
              price="$8.99"
              subPrice="Just $4.50 each — buy one, get one free"
              tagline="Perfect for a single competition day or trying us out."
              features={[
                "2 full AI analyses",
                "Competition-standard scoring (out of 300)",
                "Timestamped judge feedback",
                "Never expire",
              ]}
              buttonText="Get 2 Analyses — $8.99"
              type="single"
            />
            <HeroPurchaseCard
              variant="purple"
              badge="🏆 Best Value — Save $15"
              title="Competition Pack"
              price="$29.99"
              subPrice="Only $6 per analysis — 5 total, never expire"
              tagline="Stock up for the whole season. Use them whenever you need."
              features={[
                "5 full AI analyses",
                "Save $15 vs buying individually",
                "All styles: dance, cheer, duo, group",
                "Never expire — use all season",
              ]}
              buttonText="Get 5 Analyses — $29.99"
              type="pack"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {(() => {
            const analyzedCount = videos.filter((v) => v.status === "analyzed").length;
            const analyzedVideos = videos.filter((v) => v.analyses?.length > 0);
            const avgScore = analyzedVideos.length > 0
              ? Math.round(
                  analyzedVideos.reduce(
                    (sum, v) => sum + (v.analyses[0]?.total_score ?? 0),
                    0
                  ) / analyzedVideos.length
                )
              : "—";

            return [
              { label: "Credits Left", value: credits.remaining, icon: CheckCircle },
              { label: "Videos Uploaded", value: videos.length, icon: Video },
              { label: "Analyses Complete", value: analyzedCount, icon: BarChart3 },
              { label: "Avg. Score", value: avgScore, icon: CheckCircle },
            ];
          })().map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center">
              <stat.icon className="mx-auto h-5 w-5 text-primary-400 mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-surface-200 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Out-of-credits section (existing subscribers/purchasers who ran out) ── */}
        {credits.remaining === 0 && credits.total > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-primary-700/60 via-accent-600/40 to-primary-700/60 border border-primary-500/30 rounded-2xl p-6 mb-4 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Ready for Your Next Routine?</h2>
              <p className="text-surface-200 text-sm max-w-lg mx-auto">
                {credits.used > 0
                  ? "Pick up more credits to keep improving your routines all season long."
                  : "Grab our Launch Offer below — 2 full AI-powered analyses for just $8.99. Buy one, get one free."}
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <PurchaseCard
                badge="👑 Most Popular"
                badgeColor="text-primary-300 bg-primary-500/20"
                title="Season Member"
                price="$12.99/mo"
                description="10 analyses/month. Intro rate — locked in forever."
                features={["10 analyses per month", "Full season tracking", "Cancel anytime", "🔒 Rate locked at intro price"]}
                buttonText="Subscribe — $12.99/mo"
                buttonStyle="bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 hover:opacity-90"
                type="subscription"
              />
              <PurchaseCard
                badge="⚡ Buy One Get One"
                badgeColor="text-gold-300 bg-gold-500/20"
                title="BOGO — 2 Analyses"
                price="$8.99"
                description="Buy one analysis, get one free."
                features={["2 full AI analyses", "Competition-standard scoring", "Timestamped judge notes"]}
                buttonText="Get 2 Analyses — $8.99"
                buttonStyle="border border-gold-500/60 hover:bg-gold-500/10"
                type="single"
              />
              <PurchaseCard
                badge="🏆 Best Value"
                badgeColor="text-gold-300 bg-gold-500/20"
                title="Competition Pack"
                price="$29.99"
                description="5 analyses — only $6 each, never expire."
                features={["5 full AI analyses", "Only $6 each — save $15", "Never expire"]}
                buttonText="Get 5 Analyses — $29.99"
                buttonStyle="border border-primary-500/60 hover:bg-primary-500/10"
                type="pack"
              />
            </div>
          </motion.div>
        )}

        {/* Upload CTA */}
        <motion.a
          href="/upload"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 flex items-center justify-between glass rounded-2xl p-6 hover:border-primary-500/30 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold">Upload a New Routine</p>
              <p className="text-sm text-surface-200">
                Get AI-powered competition scoring in under 5 minutes
              </p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-surface-200 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </motion.a>

        {/* Season Tracker CTA */}
        <motion.a
          href="/dancers"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10 flex items-center justify-between rounded-2xl p-6 hover:border-gold-500/40 transition-all cursor-pointer group border border-gold-500/20 bg-gradient-to-r from-gold-500/8 via-accent-500/5 to-primary-600/8"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500/30 to-accent-500/30">
              <Trophy className="h-6 w-6 text-gold-400" />
            </div>
            <div>
              <p className="font-bold flex items-center gap-2">
                Season Tracker
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-gold-500/20 text-gold-300 px-2 py-0.5 rounded-full">New</span>
              </p>
              <p className="text-sm text-surface-200">
                Every score, every award, every competition — all in one place 🏆
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {videos.filter(v => v.analyses?.length > 0 && v.dancer_name).length > 0 && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-gold-300 font-medium">
                <Star className="h-3 w-3" />
                {new Set(videos.filter(v => v.analyses?.length > 0 && v.dancer_name).map(v => v.dancer_name)).size} dancer{new Set(videos.filter(v => v.analyses?.length > 0 && v.dancer_name).map(v => v.dancer_name)).size !== 1 ? "s" : ""} tracked
              </span>
            )}
            <ArrowRight className="h-5 w-5 text-gold-400 group-hover:text-gold-300 group-hover:translate-x-1 transition-all" />
          </div>
        </motion.a>

        {/* Your Routines — Grouped by routine_name */}
        {videos.length > 0 ? (
          <div>
            <h2 className="text-lg font-bold mb-4">Your Routines</h2>
            {(() => {
              // Group by routine_name
              const groups: Record<string, VideoRecord[]> = {};
              for (const v of videos) {
                if (!groups[v.routine_name]) groups[v.routine_name] = [];
                groups[v.routine_name].push(v);
              }
              // Sort each group oldest→newest
              for (const key of Object.keys(groups)) {
                groups[key].sort(
                  (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
                );
              }
              // Sort groups by most-recent submission
              const sortedNames = Object.keys(groups).sort((a, b) => {
                const latestA =
                  groups[a][groups[a].length - 1].created_at;
                const latestB =
                  groups[b][groups[b].length - 1].created_at;
                return (
                  new Date(latestB).getTime() - new Date(latestA).getTime()
                );
              });

              const analyzedGroups = sortedNames.filter((name) =>
                groups[name].some(
                  (v) => v.status === "analyzed" && v.analyses?.length > 0
                )
              );
              const pendingGroups = sortedNames.filter(
                (name) =>
                  !groups[name].some(
                    (v) => v.status === "analyzed" && v.analyses?.length > 0
                  )
              );

              const awardColors: Record<string, string> = {
                Gold: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
                "High Gold":
                  "text-amber-400 bg-amber-400/10 border-amber-400/30",
                Platinum: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
                Diamond:
                  "text-violet-400 bg-violet-400/10 border-violet-400/30",
              };

              return (
                <>
                  {/* Analyzed routines — progress cards */}
                  {analyzedGroups.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {analyzedGroups.map((name, i) => {
                        const group = groups[name];
                        const analyzed = group.filter(
                          (v) =>
                            v.status === "analyzed" && v.analyses?.length > 0
                        );
                        const latest = analyzed[analyzed.length - 1];
                        const first = analyzed[0];
                        const latestScore =
                          latest.analyses[0]?.total_score ?? 0;
                        const firstScore =
                          first.analyses[0]?.total_score ?? 0;
                        const delta = latestScore - firstScore;
                        const awardLevel =
                          latest.analyses[0]?.award_level ?? "";
                        const awardStyle =
                          awardColors[awardLevel] ||
                          "text-primary-400 bg-primary-400/10 border-primary-400/30";

                        return (
                          <motion.a
                            key={name}
                            href={`/routines/${latest.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 glass rounded-2xl p-5 hover:border-primary-500/30 transition-all group cursor-pointer"
                          >
                            {/* Left: info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                {awardLevel && (
                                  <span
                                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${awardStyle}`}
                                  >
                                    🏆 {awardLevel}
                                  </span>
                                )}
                                <span className="text-xs text-surface-200">
                                  {analyzed.length} submission
                                  {analyzed.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <p className="font-bold text-white text-lg leading-tight truncate">
                                {name}
                              </p>
                              <p className="text-xs text-surface-200 mt-0.5">
                                {latest.style} {latest.entry_type} &bull;{" "}
                                {latest.age_group}
                              </p>
                            </div>

                            {/* Center: score + delta */}
                            <div className="flex items-center gap-6 sm:gap-8">
                              <div className="text-center">
                                <p className="text-2xl font-extrabold gradient-text">
                                  {latestScore}
                                </p>
                                <p className="text-[10px] text-surface-200">
                                  / 300 latest
                                </p>
                              </div>
                              {analyzed.length > 1 && (
                                <div
                                  className={`flex items-center gap-1 text-sm font-semibold ${
                                    delta >= 0
                                      ? "text-green-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {delta >= 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4" />
                                  )}
                                  {delta >= 0 ? "+" : ""}
                                  {delta} pts
                                </div>
                              )}
                            </div>

                            {/* Right: CTA */}
                            <div className="flex items-center gap-2 text-sm text-primary-400 font-semibold group-hover:text-primary-300 transition-colors shrink-0">
                              View Progress
                              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </motion.a>
                        );
                      })}
                    </div>
                  )}

                  {/* Pending / processing routines */}
                  {pendingGroups.length > 0 && (
                    <div>
                      {analyzedGroups.length > 0 && (
                        <h3 className="text-sm font-semibold text-surface-200 mb-3 mt-6">
                          In Progress
                        </h3>
                      )}
                      <div className="space-y-3">
                        {pendingGroups.map((name, i) => {
                          const group = groups[name];
                          const latest = group[group.length - 1];
                          const status =
                            statusConfig[latest.status] ||
                            statusConfig.uploaded;
                          const StatusIcon = status.icon;

                          return (
                            <motion.a
                              key={name}
                              href={
                                latest.status === "processing"
                                  ? `/processing/${latest.id}`
                                  : "#"
                              }
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                delay:
                                  (analyzedGroups.length + i) * 0.05,
                              }}
                              className="flex items-center gap-4 glass rounded-2xl p-4 hover:border-primary-500/20 transition-colors"
                            >
                              <div className="shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                <Video className="h-5 w-5 text-surface-200" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{name}</p>
                                <p className="text-xs text-surface-200 mt-0.5">
                                  {latest.style} {latest.entry_type} &bull;{" "}
                                  {latest.age_group}
                                </p>
                              </div>
                              <div
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                              >
                                <StatusIcon
                                  className={`h-3 w-3 ${
                                    latest.status === "processing"
                                      ? "animate-spin"
                                      : ""
                                  }`}
                                />
                                {status.label}
                              </div>
                            </motion.a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        ) : (
          <div className="glass rounded-3xl p-12 text-center">
            <Video className="mx-auto h-12 w-12 text-surface-200 mb-4" />
            <h2 className="text-xl font-bold">No routines yet</h2>
            <p className="mt-2 text-surface-200 text-sm max-w-md mx-auto">
              Upload your first dance or cheer routine to get a full AI-powered
              competition analysis.
            </p>
            <a
              href="/upload"
              className="inline-flex items-center gap-2 mt-6 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Upload Your First Routine
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
