"use client";

import { useEffect, useState } from "react";
import { Activity, DollarSign, Users, AlertTriangle, Clock, TrendingUp } from "lucide-react";

interface LiveOps {
  ts: string;
  todayRevenueCents: number;
  todayPaymentCount: number;
  mrrCents: number;
  activeSubCount: number;
  cancelAtPeriodEndCount: number;
  failedPaymentsToday: number;
  signupsToday: number;
  processingQueueDepth: number;
  last24hAnalysisCount: number;
  avgScore24h: number;
  cancelingPeriodEnds: string[];
}

const dollars = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/**
 * LiveOpsBar — renders at the top of AdminClient. Polls /api/admin/live-ops
 * every 30s. Highlights amber/red when something needs attention (failed
 * payments, stuck queue, cancels pending).
 */
export default function LiveOpsBar() {
  const [data, setData] = useState<LiveOps | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const res = await fetch("/api/admin/live-ops", { cache: "no-store" });
        if (!res.ok) throw new Error(`${res.status}`);
        const json = (await res.json()) as LiveOps;
        if (!cancelled) {
          setData(json);
          setErr(null);
          setRefreshedAt(new Date());
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "err");
      }
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!data && !err) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-900/60 p-4 text-surface-300">
        Loading live ops…
      </div>
    );
  }

  if (err && !data) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-red-200">
        Live ops error: {err}
      </div>
    );
  }

  if (!data) return null;

  const alerts: Array<{ label: string; severity: "warn" | "bad" }> = [];
  if (data.failedPaymentsToday > 0)
    alerts.push({ label: `${data.failedPaymentsToday} failed payments today`, severity: "bad" });
  if (data.processingQueueDepth >= 5)
    alerts.push({ label: `${data.processingQueueDepth} videos stuck processing`, severity: "bad" });
  else if (data.processingQueueDepth > 0)
    alerts.push({ label: `${data.processingQueueDepth} videos processing`, severity: "warn" });
  if (data.cancelAtPeriodEndCount > 0)
    alerts.push({ label: `${data.cancelAtPeriodEndCount} subs canceling — win-back?`, severity: "warn" });

  const Cell = ({
    icon: Icon,
    label,
    value,
    sub,
    tone = "neutral",
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    sub?: string;
    tone?: "neutral" | "good" | "warn" | "bad";
  }) => {
    const toneRing =
      tone === "good"
        ? "border-emerald-500/30 bg-emerald-950/20"
        : tone === "warn"
        ? "border-amber-500/30 bg-amber-950/20"
        : tone === "bad"
        ? "border-red-500/30 bg-red-950/20"
        : "border-white/10 bg-surface-900/50";
    return (
      <div className={`rounded-xl border ${toneRing} p-3`}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-surface-300">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <div className="mt-1 text-xl font-bold text-white">{value}</div>
        {sub ? <div className="text-xs text-surface-300 mt-0.5">{sub}</div> : null}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-surface-200">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold text-white">Live ops</span>
          <span className="text-surface-400">
            refreshed{" "}
            {refreshedAt
              ? refreshedAt.toLocaleTimeString("en-US", { timeZone: "America/New_York" }) + " ET"
              : "—"}
          </span>
        </div>
        {alerts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {alerts.map((a, i) => (
              <span
                key={i}
                className={`rounded-full border px-2.5 py-0.5 text-xs ${
                  a.severity === "bad"
                    ? "border-red-500/40 bg-red-950/40 text-red-200"
                    : "border-amber-500/40 bg-amber-950/40 text-amber-200"
                }`}
              >
                <AlertTriangle className="inline h-3 w-3 mr-1" />
                {a.label}
              </span>
            ))}
          </div>
        ) : (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-0.5 text-xs text-emerald-200">
            All systems green
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Cell
          icon={DollarSign}
          label="Revenue today"
          value={dollars(data.todayRevenueCents)}
          sub={`${data.todayPaymentCount} payments`}
          tone={data.todayRevenueCents > 0 ? "good" : "neutral"}
        />
        <Cell
          icon={TrendingUp}
          label="MRR (est.)"
          value={dollars(data.mrrCents)}
          sub={`${data.activeSubCount} active subs`}
          tone="good"
        />
        <Cell
          icon={Users}
          label="Signups today"
          value={data.signupsToday}
          sub="America/New_York day"
        />
        <Cell
          icon={Clock}
          label="Processing queue"
          value={data.processingQueueDepth}
          tone={
            data.processingQueueDepth >= 5
              ? "bad"
              : data.processingQueueDepth > 0
              ? "warn"
              : "neutral"
          }
        />
        <Cell
          icon={AlertTriangle}
          label="Failed pmts today"
          value={data.failedPaymentsToday}
          tone={data.failedPaymentsToday > 0 ? "bad" : "neutral"}
        />
        <Cell
          icon={Activity}
          label="Analyses 24h"
          value={data.last24hAnalysisCount}
          sub={data.avgScore24h ? `avg ${data.avgScore24h}/300` : undefined}
          tone="good"
        />
      </div>

      {data.cancelingPeriodEnds.length > 0 ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-3 text-sm text-amber-100">
          <div className="font-semibold mb-1">Subs pending cancellation</div>
          <div className="flex flex-wrap gap-2 text-xs text-amber-200/90">
            {data.cancelingPeriodEnds.slice(0, 10).map((d, i) => (
              <span key={i} className="rounded-md bg-amber-900/30 px-2 py-0.5">
                access ends {new Date(d).toLocaleDateString("en-US", { timeZone: "America/New_York" })}
              </span>
            ))}
            {data.cancelingPeriodEnds.length > 10 ? (
              <span className="text-amber-300/70">+{data.cancelingPeriodEnds.length - 10} more</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
