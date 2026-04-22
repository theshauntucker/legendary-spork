"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Glass } from "@/components/ui/Glass";
import { GradientText } from "@/components/ui/GradientText";
import { Button } from "@/components/ui/Button";
import { springOut, fadeLift, stagger } from "@/lib/motion";
import { haptics } from "@/lib/haptics";
import { gradients } from "@/lib/gradients";

type ReferralState = {
  code: string;
  shareUrl: string;
  stats: {
    total: number;
    credited: number;
    pending: number;
    capped: number;
    thisMonthCredits: number;
    monthlyCap: number;
    remainingThisMonth: number;
  };
};

export default function ReferralsClient() {
  const [data, setData] = useState<ReferralState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/referrals", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError("Couldn't load your invite page. Refresh and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCopy() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.shareUrl);
      setCopied(true);
      haptics.success();
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy failed — select the link and copy manually.");
    }
  }

  async function handleShare() {
    if (!data) return;
    const nav = typeof navigator !== "undefined" ? navigator : null;
    if (nav && "share" in nav) {
      try {
        await nav.share({
          title: "RoutineX",
          text:
            "I use RoutineX to get judge-style feedback on my routines. You get a free credit when you sign up with my link.",
          url: data.shareUrl,
        });
        haptics.tap();
        return;
      } catch {
        // user canceled — fall through to copy
      }
    }
    handleCopy();
  }

  return (
    <main
      style={{
        background: "#0a0118",
        color: "#f3f4f6",
        minHeight: "100vh",
        padding: "56px 20px 80px 20px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          <motion.div variants={fadeLift}>
            <Link
              href="/home"
              style={{
                color: "#9ca3af",
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              ← Back
            </Link>
          </motion.div>

          <motion.h1
            variants={fadeLift}
            style={{
              fontSize: "clamp(32px, 7vw, 48px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              fontWeight: 900,
              margin: 0,
            }}
          >
            Bring a <GradientText gradient="sunsetText">dance</GradientText> or{" "}
            <GradientText gradient="magentaRush">cheer</GradientText> friend
          </motion.h1>

          <motion.p
            variants={fadeLift}
            style={{
              fontSize: 17,
              lineHeight: 1.55,
              opacity: 0.82,
              margin: 0,
            }}
          >
            Send them your link. When they sign up and grab their first paid
            routine, you both earn{" "}
            <strong style={{ color: "#fff" }}>one free credit</strong>. Up to 10
            per month.
          </motion.p>

          {/* Share card */}
          <motion.div variants={fadeLift}>
            <Glass style={{ padding: 20 }}>
              {loading && (
                <div style={{ opacity: 0.7, fontSize: 14 }}>Loading your link…</div>
              )}

              {!loading && data && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      fontSize: 11,
                      color: "#9ca3af",
                    }}
                  >
                    Your link
                  </div>

                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      fontSize: 14,
                      wordBreak: "break-all",
                      color: "#e5e7eb",
                    }}
                  >
                    {data.shareUrl}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      variant="primary"
                      onClick={handleShare}
                      style={{ flex: 1, minWidth: 160 }}
                    >
                      Share
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleCopy}
                      style={{ flex: 1, minWidth: 160 }}
                    >
                      {copied ? "Copied ✓" : "Copy link"}
                    </Button>
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                      lineHeight: 1.5,
                    }}
                  >
                    Code:{" "}
                    <span style={{ color: "#fff", fontWeight: 700 }}>
                      {data.code}
                    </span>
                    {" · "}
                    {data.stats.remainingThisMonth} of{" "}
                    {data.stats.monthlyCap} credits left this month
                  </div>
                </div>
              )}

              {error && (
                <div style={{ color: "#fca5a5", fontSize: 14 }}>{error}</div>
              )}
            </Glass>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeLift}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              <StatCard label="Invited" value={data?.stats.total ?? 0} />
              <StatCard label="Paid + credited" value={data?.stats.credited ?? 0} />
              <StatCard label="Pending" value={data?.stats.pending ?? 0} />
            </div>
          </motion.div>

          {/* How it works */}
          <motion.div variants={fadeLift}>
            <Glass style={{ padding: 20 }}>
              <div
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontSize: 11,
                  color: "#9ca3af",
                  marginBottom: 12,
                }}
              >
                How it works
              </div>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 14,
                  lineHeight: 1.5,
                  opacity: 0.9,
                }}
              >
                <li>Share your link with a dance or cheer friend.</li>
                <li>They sign up and pay for their first routine.</li>
                <li>
                  You both get <strong style={{ color: "#fff" }}>+1 free credit</strong>{" "}
                  automatically — no code redemption.
                </li>
                <li>Max 10 credits per month. No cap on who you invite.</li>
              </ol>
            </Glass>
          </motion.div>

          <motion.div variants={fadeLift}>
            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                textAlign: "center",
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              No photos of dancers — ever. Your aura stays private until you share it.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Glass style={{ padding: 14 }}>
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
          fontSize: 24,
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </Glass>
  );
}
