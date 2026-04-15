"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings as SettingsIcon,
  Loader2,
  CreditCard,
  CheckCircle,
  Building2,
  MapPin,
  Sparkles,
} from "lucide-react";
import { US_STATES } from "@/lib/studio/us-states";

interface Studio {
  id: string;
  name: string;
  region: string | null;
  invite_code: string;
}

interface PoolSnapshot {
  totalCredits: number;
  usedCredits: number;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  hasStripeSubscription: boolean;
}

export default function SettingsClient({
  studio,
  pool,
}: {
  studio: Studio;
  pool: PoolSnapshot | null;
}) {
  const router = useRouter();

  const [name, setName] = useState(studio.name);
  const [region, setRegion] = useState(studio.region || "");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const updates: Record<string, string> = {};
    if (name.trim() !== studio.name) updates.name = name.trim();
    if (region && region !== studio.region) updates.region = region;
    if (Object.keys(updates).length === 0) {
      setSaving(false);
      return;
    }
    const res = await fetch("/api/studio/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSaving(false);
    if (!res.ok) {
      const { error: apiErr } = await res.json().catch(() => ({ error: "Save failed" }));
      setError(apiErr || "Save failed");
      return;
    }
    setSavedAt(Date.now());
    router.refresh();
  };

  const subscribe = async () => {
    setSubscribing(true);
    const res = await fetch("/api/studio/subscribe", { method: "POST" });
    if (!res.ok) {
      setSubscribing(false);
      setError("Could not start subscription. Try again.");
      return;
    }
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  const remaining = pool ? Math.max(0, pool.totalCredits - pool.usedCredits) : 0;

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-primary-400 mb-1">
            Studio Settings
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)] flex items-center gap-3">
            <SettingsIcon className="h-7 w-7 text-primary-400" />
            {studio.name}
          </h1>
        </div>

        {/* Subscription status */}
        <div className="glass rounded-2xl p-5 sm:p-6 mb-6">
          <h2 className="flex items-center gap-2 font-semibold mb-4">
            <CreditCard className="h-4 w-4 text-gold-400" />
            Subscription
          </h2>
          {pool ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-surface-200">Status</span>
                <span className="font-medium capitalize">
                  {pool.subscriptionStatus || "pending"}
                </span>
              </div>
              {pool.subscriptionStatus === "trial" && pool.trialEndsAt && (
                <div className="flex items-center justify-between">
                  <span className="text-surface-200">Trial ends</span>
                  <span className="font-medium">
                    {new Date(pool.trialEndsAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-surface-200">Analyses this cycle</span>
                <span className="font-medium">
                  {pool.usedCredits} used · {remaining} remaining ·{" "}
                  {pool.totalCredits} total
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-surface-200">
                No active subscription yet. Start a free 30-day trial to
                unlock the shared credit pool, Music Hub, and team features.
              </p>
              <button
                onClick={subscribe}
                disabled={subscribing}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {subscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Start 30-day free trial
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Studio details */}
        <form onSubmit={save} className="glass rounded-2xl p-5 sm:p-6 mb-6 space-y-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <Building2 className="h-4 w-4 text-primary-400" />
            Studio details
          </h2>
          <div>
            <label className="block text-sm font-medium mb-2">Studio name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-surface-200" />
              State
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="" className="bg-surface-900">
                Select your state…
              </option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code} className="bg-surface-900">
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-surface-200">
              Used by collision detection to flag songs being locked in by
              other studios in your state.
            </p>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 hover:bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </button>
            {savedAt && Date.now() - savedAt < 3000 && (
              <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                <CheckCircle className="h-4 w-4" /> Saved
              </span>
            )}
          </div>
        </form>

        <div className="glass rounded-2xl p-5 sm:p-6">
          <h2 className="font-semibold mb-2">Studio invite code</h2>
          <p className="text-sm text-surface-200 mb-3">
            Share this code directly with choreographers you trust. For per-email
            invites with revoke/expire, use the Team page.
          </p>
          <p className="font-mono text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 inline-block">
            {studio.invite_code}
          </p>
        </div>

        <div className="mt-6 text-center text-sm">
          <a href="/studio/team" className="text-primary-400 hover:underline">
            ← Back to team
          </a>
        </div>
      </div>
    </div>
  );
}
