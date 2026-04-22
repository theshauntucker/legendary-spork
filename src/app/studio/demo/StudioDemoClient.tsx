"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Glass } from "@/components/ui/Glass";
import { GradientText } from "@/components/ui/GradientText";
import { Button } from "@/components/ui/Button";
import { springOut, fadeLift, stagger } from "@/lib/motion";
import { haptics } from "@/lib/haptics";
import { gradients } from "@/lib/gradients";

// ── Seeded demo data (no PII, no real handles) ─────────────────────────────
type DemoDancer = {
  id: string;
  handle: string;
  aura: string;
  discipline: "dance" | "cheer";
  lastScore: number;
  award: string;
  trend: "up" | "flat" | "down";
};

const DEMO_ROSTER: DemoDancer[] = [
  { id: "d1", handle: "aurora_on_stage", aura: "linear-gradient(135deg,#F472B6,#FB923C,#FDE68A)", discipline: "dance", lastScore: 287, award: "Platinum", trend: "up" },
  { id: "d2", handle: "midnight_sparkle", aura: "linear-gradient(135deg,#A78BFA,#60A5FA,#34D399)", discipline: "cheer", lastScore: 291, award: "Diamond", trend: "up" },
  { id: "d3", handle: "golden_hour", aura: "linear-gradient(135deg,#FBBF24,#F97316,#EF4444)", discipline: "dance", lastScore: 274, award: "High Gold", trend: "flat" },
  { id: "d4", handle: "nova_beats", aura: "linear-gradient(135deg,#C4B5FD,#67E8F9,#F0ABFC)", discipline: "dance", lastScore: 282, award: "Platinum", trend: "up" },
  { id: "d5", handle: "stormlight", aura: "linear-gradient(135deg,#2DD4BF,#38BDF8,#818CF8)", discipline: "cheer", lastScore: 268, award: "Gold", trend: "up" },
  { id: "d6", handle: "ember_vox", aura: "linear-gradient(135deg,#EC4899,#F43F5E,#FB923C)", discipline: "cheer", lastScore: 279, award: "High Gold", trend: "flat" },
];

const DEMO_TEAMBOARD = [
  { author: "aurora_on_stage", when: "2h", text: "Saturday drill run felt clean — focus pass on switch leaps.", aura: DEMO_ROSTER[0].aura },
  { author: "coach_whitney", when: "6h", text: "Squad — bring black warmups to Nationals. Call time 0600 sharp.", aura: "linear-gradient(135deg,#F0ABFC,#C4B5FD,#67E8F9)" },
  { author: "nova_beats", when: "1d", text: "Mix v2 of the finale is uploaded. Feedback welcome.", aura: DEMO_ROSTER[3].aura },
];

const DEMO_PLAYBOOK = [
  { title: "Competition prep — 14 days out", minutes: 12, category: "Readiness" },
  { title: "How to run a Bayda video review", minutes: 8, category: "Coaching" },
  { title: "Building a clean drill circuit", minutes: 15, category: "Technique" },
  { title: "Parent comms — score week", minutes: 6, category: "Comms" },
];

const DEMO_MRR = {
  activeMembers: 34,
  trialMembers: 7,
  mrrCents: 34 * 1299,
  poolUsed: 58,
  poolCap: 120,
  lastWeekJudged: 41,
  thisWeekJudged: 52,
};

const DEMO_POOL = {
  totalCredits: 120,
  usedCredits: 58,
  remainingCredits: 62,
  resetsIn: 17,
};

// ── Tour steps ──────────────────────────────────────────────────────────────
type TourStep = {
  title: string;
  subtitle: string;
  panel: "roster" | "team" | "playbook" | "mrr" | "pool";
  body: string;
};

const STEPS: TourStep[] = [
  {
    title: "Your roster",
    subtitle: "Step 1 of 5",
    panel: "roster",
    body:
      "Every dancer and cheerleader on your team, side-by-side. Auras instead of photos — identity without the safety problem. Tap any athlete for trend and score history.",
  },
  {
    title: "The Team Board",
    subtitle: "Step 2 of 5",
    panel: "team",
    body:
      "A private feed just for your studio. Coaches post notes, athletes post check-ins. No outside eyes, no doomscroll. Faster than a group chat and searchable.",
  },
  {
    title: "Coach's Playbook",
    subtitle: "Step 3 of 5",
    panel: "playbook",
    body:
      "The techniques and drills your team runs — saved once, shared forever. New coaches get onboarded in a day, not a season.",
  },
  {
    title: "MRR Dashboard",
    subtitle: "Step 4 of 5",
    panel: "mrr",
    body:
      "See revenue, active members, trial conversions, and how much the team is actually using the platform. One number per box. No spreadsheet gymnastics.",
  },
  {
    title: "Shared Credit Pool",
    subtitle: "Step 5 of 5",
    panel: "pool",
    body:
      "One pool for the whole studio. Distribute credits as you want, top up when you need to. No chasing parents for individual BOGO codes.",
  },
];

// ── Component ───────────────────────────────────────────────────────────────
export default function StudioDemoClient() {
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(false);

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  function next() {
    haptics.tap();
    if (step < STEPS.length - 1) setStep(step + 1);
  }
  function prev() {
    haptics.tap();
    if (step > 0) setStep(step - 1);
  }

  return (
    <main
      style={{
        background: "#0a0118",
        color: "#f3f4f6",
        minHeight: "100vh",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Header / hero */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "48px 20px 24px 20px",
        }}
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <motion.div variants={fadeLift}>
            <Link
              href="/studio"
              style={{ color: "#9ca3af", fontSize: 14, textDecoration: "none" }}
            >
              ← Back to Studio plans
            </Link>
          </motion.div>
          <motion.h1
            variants={fadeLift}
            style={{
              fontSize: "clamp(32px, 7vw, 52px)",
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              fontWeight: 900,
              margin: 0,
            }}
          >
            RoutineX for{" "}
            <GradientText gradient="sunsetText">Studios</GradientText> —
            live demo
          </motion.h1>
          <motion.p
            variants={fadeLift}
            style={{
              fontSize: 17,
              lineHeight: 1.55,
              opacity: 0.82,
              margin: 0,
              maxWidth: 640,
            }}
          >
            Real product, seeded data. Take a five-minute tour of the roster,
            team board, Coach's Playbook, MRR dashboard, and shared credit pool.
            No signup.
          </motion.p>
        </motion.div>
      </div>

      {!started ? (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 80px 20px" }}>
          <Glass style={{ padding: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#9ca3af",
                }}
              >
                What you'll see
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 15,
                  lineHeight: 1.5,
                }}
              >
                <li>Roster of six dancers and cheerleaders with trend + award.</li>
                <li>Team Board — private studio feed, no outside eyes.</li>
                <li>Coach's Playbook — saved drills and protocols.</li>
                <li>MRR + usage dashboard for the studio owner.</li>
                <li>Shared Credit Pool — one bucket for the whole team.</li>
              </ul>
              <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                <Button
                  variant="primary"
                  onClick={() => {
                    haptics.success();
                    setStarted(true);
                  }}
                >
                  Start the tour
                </Button>
                <Link href="/studio/signup" style={{ textDecoration: "none" }}>
                  <Button variant="secondary">Skip to trial signup</Button>
                </Link>
              </div>
            </div>
          </Glass>
        </div>
      ) : (
        <TourRunner
          step={step}
          current={current}
          progress={progress}
          onNext={next}
          onPrev={prev}
          onFinish={() => {
            haptics.success();
          }}
        />
      )}
    </main>
  );
}

// ── Tour runner (split + panels) ────────────────────────────────────────────
function TourRunner({
  step,
  current,
  progress,
  onNext,
  onPrev,
  onFinish,
}: {
  step: number;
  current: TourStep;
  progress: number;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
}) {
  const isLast = step === STEPS.length - 1;
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 80px 20px" }}>
      {/* Progress bar */}
      <div
        style={{
          height: 4,
          borderRadius: 999,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={springOut}
          style={{
            height: "100%",
            borderRadius: 999,
            backgroundImage: gradients.sunset,
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 20,
        }}
      >
        {/* Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.panel}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={springOut}
          >
            {current.panel === "roster" && <RosterPanel />}
            {current.panel === "team" && <TeamBoardPanel />}
            {current.panel === "playbook" && <PlaybookPanel />}
            {current.panel === "mrr" && <MrrPanel />}
            {current.panel === "pool" && <PoolPanel />}
          </motion.div>
        </AnimatePresence>

        {/* Step caption + controls */}
        <Glass style={{ padding: 20 }}>
          <div
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontSize: 11,
              color: "#9ca3af",
              marginBottom: 6,
            }}
          >
            {current.subtitle}
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.01em",
            }}
          >
            <GradientText gradient="sunsetText">{current.title}</GradientText>
          </h2>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.55,
              opacity: 0.86,
              margin: "10px 0 18px 0",
            }}
          >
            {current.body}
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="secondary" onClick={onPrev} disabled={step === 0}>
              Back
            </Button>
            {!isLast && (
              <Button variant="primary" onClick={onNext} style={{ flex: 1 }}>
                Next →
              </Button>
            )}
            {isLast && (
              <Link
                href="/studio/signup"
                style={{ flex: 1, textDecoration: "none" }}
                onClick={onFinish}
              >
                <Button variant="primary" style={{ width: "100%" }}>
                  Start your studio trial →
                </Button>
              </Link>
            )}
          </div>
        </Glass>
      </div>
    </div>
  );
}

// ── Panels (seeded data) ───────────────────────────────────────────────────
function RosterPanel() {
  return (
    <Glass style={{ padding: 20 }}>
      <PanelHeader label="Studio roster" count={`${DEMO_ROSTER.length} athletes`} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
          marginTop: 14,
        }}
      >
        {DEMO_ROSTER.map((d) => (
          <div
            key={d.id}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              aria-hidden
              style={{
                width: 54,
                height: 54,
                borderRadius: "50%",
                background: d.aura,
                boxShadow: "0 0 32px rgba(244,114,182,0.25)",
              }}
            />
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
              @{d.handle}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>
              {d.discipline === "dance" ? "Dance" : "Cheer"} · {d.award}
            </div>
            <div
              style={{
                fontSize: 12,
                color: d.trend === "up" ? "#34D399" : d.trend === "down" ? "#F87171" : "#FBBF24",
              }}
            >
              {d.trend === "up" ? "▲" : d.trend === "down" ? "▼" : "—"} {d.lastScore}
            </div>
          </div>
        ))}
      </div>
    </Glass>
  );
}

function TeamBoardPanel() {
  return (
    <Glass style={{ padding: 20 }}>
      <PanelHeader label="Team Board" count="Private to your studio" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 14,
        }}
      >
        {DEMO_TEAMBOARD.map((p, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: 14,
              display: "flex",
              gap: 12,
            }}
          >
            <div
              aria-hidden
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: p.aura,
                flexShrink: 0,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "#e5e7eb" }}>
                <strong style={{ color: "#fff" }}>@{p.author}</strong>{" "}
                <span style={{ color: "#6b7280", fontSize: 12 }}>· {p.when}</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.45, color: "#d1d5db" }}>
                {p.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Glass>
  );
}

function PlaybookPanel() {
  return (
    <Glass style={{ padding: 20 }}>
      <PanelHeader label="Coach's Playbook" count={`${DEMO_PLAYBOOK.length} saved plays`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {DEMO_PLAYBOOK.map((p, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                {p.title}
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                {p.category} · {p.minutes} min
              </div>
            </div>
            <div style={{ color: "#9ca3af", fontSize: 18 }}>›</div>
          </div>
        ))}
      </div>
    </Glass>
  );
}

function MrrPanel() {
  const mrr = (DEMO_MRR.mrrCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  return (
    <Glass style={{ padding: 20 }}>
      <PanelHeader label="Studio MRR" count="This month" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginTop: 14,
        }}
      >
        <Metric label="MRR" value={mrr} accent />
        <Metric label="Active members" value={String(DEMO_MRR.activeMembers)} />
        <Metric label="Trials" value={String(DEMO_MRR.trialMembers)} />
        <Metric
          label="Routines judged this wk"
          value={String(DEMO_MRR.thisWeekJudged)}
          delta={`+${DEMO_MRR.thisWeekJudged - DEMO_MRR.lastWeekJudged} vs last`}
        />
      </div>
    </Glass>
  );
}

function PoolPanel() {
  const pct = Math.min(
    100,
    Math.round((DEMO_POOL.usedCredits / DEMO_POOL.totalCredits) * 100)
  );
  return (
    <Glass style={{ padding: 20 }}>
      <PanelHeader label="Shared Credit Pool" count={`${DEMO_POOL.remainingCredits} remaining`} />
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={springOut}
            style={{
              height: "100%",
              borderRadius: 999,
              backgroundImage: gradients.sunset,
            }}
          />
        </div>
        <div style={{ fontSize: 13, color: "#d1d5db" }}>
          Used <strong style={{ color: "#fff" }}>{DEMO_POOL.usedCredits}</strong> of{" "}
          <strong style={{ color: "#fff" }}>{DEMO_POOL.totalCredits}</strong> this cycle.
          Resets in <strong style={{ color: "#fff" }}>{DEMO_POOL.resetsIn} days</strong>.
        </div>
        <div style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.55 }}>
          No individual BOGO chasing — parents don't get the cart experience.
          Studio owners assign credits to dancers with one tap.
        </div>
      </div>
    </Glass>
  );
}

function PanelHeader({ label, count }: { label: string; count: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div
        style={{
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          fontSize: 11,
          color: "#9ca3af",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{count}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  delta,
  accent,
}: {
  label: string;
  value: string;
  delta?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#9ca3af",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: accent ? undefined : "#fff",
          backgroundImage: accent ? gradients.sunsetText : undefined,
          WebkitBackgroundClip: accent ? "text" : undefined,
          backgroundClip: accent ? "text" : undefined,
          WebkitTextFillColor: accent ? "transparent" : undefined,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 11, color: "#34D399", marginTop: 6 }}>{delta}</div>
      )}
    </div>
  );
}
