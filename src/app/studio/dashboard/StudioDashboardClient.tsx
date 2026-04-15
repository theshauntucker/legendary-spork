"use client";

import { useMemo, useState } from "react";
import {
  Sparkles,
  Camera,
  Music,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ArrowRight,
  Gauge,
  X,
} from "lucide-react";

interface Studio {
  id: string;
  name: string;
  invite_code: string;
  region: string | null;
}

interface PoolSnapshot {
  total: number;
  used: number;
  remaining: number;
  status: string | null;
  trialEndsAt: string | null;
}

interface ChecklistFlags {
  inviteTeam: boolean;
  loadSchedule: boolean;
  searchMusic: boolean;
  uploadRoutine: boolean;
}

const DISMISS_KEY = "routinex-studio-checklist-dismissed";

export default function StudioDashboardClient({
  studio,
  role,
  pool,
  needsSubscriptionSetup,
  checklist,
}: {
  studio: Studio;
  role: "owner" | "choreographer" | "viewer";
  pool: PoolSnapshot | null;
  needsSubscriptionSetup: boolean;
  checklist: ChecklistFlags;
}) {
  // Hide the checklist once every item is done OR the user dismissed it.
  // The spec calls it "sticky-until-done" so dismissal only matters after
  // everything is checked — we respect that by storing a timestamp only
  // when the user clicks dismiss AND all items are complete.
  const allDone = useMemo(
    () =>
      checklist.inviteTeam &&
      checklist.loadSchedule &&
      checklist.searchMusic &&
      checklist.uploadRoutine,
    [checklist]
  );
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  });
  const showChecklist = !allDone || !dismissed;

  const handleDismiss = () => {
    if (allDone) {
      window.localStorage.setItem(DISMISS_KEY, "1");
      setDismissed(true);
    }
  };

  const poolPct = pool && pool.total > 0 ? Math.round((pool.used / pool.total) * 100) : 0;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Subscription-setup banner — shown until Stripe confirms the trial */}
        {needsSubscriptionSetup && (
          <div className="mb-6 rounded-2xl border border-gold-500/40 bg-gold-500/10 p-4 sm:p-5 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-gold-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gold-100">
                Finish setting up your subscription
              </p>
              <p className="text-sm text-gold-100/80 mt-0.5">
                Your credit pool stays empty until Stripe confirms your trial.
                Takes about 30 seconds.
              </p>
            </div>
            <a
              href="/studio/settings"
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 hover:bg-gold-300 text-surface-950 px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Complete setup
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* Welcome header */}
        <div className="mb-6 sm:mb-8">
          <p className="text-xs uppercase tracking-widest text-primary-400 mb-2 inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            Welcome to RoutineX for Studios
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold font-[family-name:var(--font-display)]">
            {studio.name}
          </h1>
          <p className="mt-2 text-lg text-surface-200">Your Studio&apos;s Private Edge</p>
        </div>

        {/* Pool snapshot card */}
        <div className="glass rounded-2xl p-5 sm:p-6 mb-8 flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-600/20">
              <Gauge className="h-5 w-5 text-primary-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-surface-200">
                Shared Credit Pool
              </p>
              <p className="text-2xl font-bold">
                {pool ? (
                  <>
                    {pool.remaining}
                    <span className="text-base text-surface-200 font-normal">
                      {" "}
                      / {pool.total} analyses
                    </span>
                  </>
                ) : (
                  <span className="text-surface-200">— / —</span>
                )}
              </p>
            </div>
          </div>
          {pool && (
            <div className="flex-1 min-w-[160px]">
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-gold-500 transition-all"
                  style={{ width: `${poolPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-surface-200">
                {pool.used} used this cycle
                {pool.status === "trial" && pool.trialEndsAt && (
                  <>
                    {" "}
                    · Trial ends{" "}
                    {new Date(pool.trialEndsAt).toLocaleDateString()}
                  </>
                )}
                {pool.status && pool.status !== "trial" && (
                  <> · {pool.status}</>
                )}
              </p>
            </div>
          )}
        </div>

        {/* 4 hero tiles — equal visual weight per spec */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <HeroTile
            icon={<Camera className="h-6 w-6" />}
            eyebrow="Analyze"
            title="Analyze a Routine"
            body="Upload a routine, get AI scoring + timestamped feedback. Credits draw from the shared pool automatically."
            actionLabel="Upload"
            href="/upload"
            accent="primary"
            disabled={!pool || pool.remaining === 0}
            disabledHint={
              !pool
                ? "Activate your trial to unlock analyses"
                : pool.remaining === 0
                ? "Pool empty — next cycle refills it"
                : undefined
            }
          />
          <HeroTile
            icon={<Music className="h-6 w-6" />}
            eyebrow="Music Hub"
            title="Find. Check. Lock."
            body="Search Spotify, check lyrics, protect your song from collisions with other studios this season."
            actionLabel="Search"
            href="/studio/music"
            accent="accent"
            disabled
            disabledHint="Launching in the Music Hub release"
          />
          <HeroTile
            icon={<Calendar className="h-6 w-6" />}
            eyebrow="Season"
            title="Season Schedule"
            body="Add your competition weekends so every entry, time, and stage is in one place."
            actionLabel="Add Competition"
            href="/studio/schedule"
            accent="gold"
            disabled
            disabledHint="Launching with the schedule release"
          />
          <HeroTile
            icon={<Users className="h-6 w-6" />}
            eyebrow="Team"
            title="Team Board"
            body={
              role === "owner"
                ? "Invite choreographers, manage roles, and see who's added what."
                : "See everyone on the team and what they&apos;re working on."
            }
            actionLabel={role === "owner" ? "Invite" : "View team"}
            href="/studio/team"
            accent="primary"
          />
        </div>

        {/* First-run checklist */}
        {showChecklist && (
          <div className="glass rounded-2xl p-5 sm:p-6 mb-10">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold">First-Run Checklist</h2>
                <p className="text-xs text-surface-200 mt-0.5">
                  Four steps to have your studio firing on all cylinders.
                </p>
              </div>
              {allDone && (
                <button
                  onClick={handleDismiss}
                  className="text-surface-200 hover:text-white p-1 rounded-lg transition-colors"
                  aria-label="Dismiss checklist"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <ul className="space-y-2.5">
              <ChecklistRow
                done={checklist.inviteTeam}
                label="Invite your choreographers"
                href="/studio/team"
              />
              <ChecklistRow
                done={checklist.loadSchedule}
                label="Load your competition schedule"
                href="/studio/schedule"
                disabled
                disabledHint="Coming with schedule release"
              />
              <ChecklistRow
                done={checklist.searchMusic}
                label="Search your first song in the Music Hub"
                href="/studio/music"
                disabled
                disabledHint="Coming with Music Hub release"
              />
              <ChecklistRow
                done={checklist.uploadRoutine}
                label="Upload your first routine for analysis"
                href="/upload"
                disabled={!pool || pool.remaining === 0}
                disabledHint={
                  !pool
                    ? "Activate your trial first"
                    : pool.remaining === 0
                    ? "Pool empty — wait for refill"
                    : undefined
                }
              />
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroTile({
  icon,
  eyebrow,
  title,
  body,
  actionLabel,
  href,
  accent,
  disabled,
  disabledHint,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  actionLabel: string;
  href: string;
  accent: "primary" | "accent" | "gold";
  disabled?: boolean;
  disabledHint?: string;
}) {
  const accentClasses = {
    primary: "bg-primary-600/20 text-primary-300",
    accent: "bg-accent-500/20 text-accent-300",
    gold: "bg-gold-500/20 text-gold-300",
  }[accent];

  const buttonClasses = disabled
    ? "bg-white/5 text-surface-200 cursor-not-allowed"
    : {
        primary: "bg-primary-600 hover:bg-primary-500 text-white",
        accent: "bg-accent-500 hover:bg-accent-400 text-white",
        gold: "bg-gold-500 hover:bg-gold-400 text-surface-950",
      }[accent];

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-4">
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${accentClasses}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-widest text-surface-200 mb-1">
          {eyebrow}
        </p>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-surface-200">{body}</p>
      </div>
      <div className="flex items-center justify-between gap-3">
        {disabled ? (
          <>
            <span className="text-xs text-surface-200 italic">{disabledHint}</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${buttonClasses}`}
              aria-disabled="true"
            >
              {actionLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </>
        ) : (
          <a
            href={href}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${buttonClasses} ml-auto`}
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function ChecklistRow({
  done,
  label,
  href,
  disabled,
  disabledHint,
}: {
  done: boolean;
  label: string;
  href: string;
  disabled?: boolean;
  disabledHint?: string;
}) {
  const content = (
    <span className="flex items-center gap-3 flex-1 min-w-0">
      {done ? (
        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-surface-200 flex-shrink-0" />
      )}
      <span
        className={`text-sm truncate ${
          done ? "text-surface-200 line-through" : "text-white"
        }`}
      >
        {label}
      </span>
      {disabled && disabledHint && (
        <span className="text-xs text-surface-200/70 italic ml-auto flex-shrink-0">
          {disabledHint}
        </span>
      )}
    </span>
  );

  if (disabled) {
    return <li className="flex items-center gap-3 py-1">{content}</li>;
  }
  return (
    <li>
      <a
        href={href}
        className="flex items-center gap-3 py-1 hover:bg-white/5 -mx-2 px-2 rounded-lg transition-colors"
      >
        {content}
        <ArrowRight className="h-4 w-4 text-surface-200 flex-shrink-0" />
      </a>
    </li>
  );
}
