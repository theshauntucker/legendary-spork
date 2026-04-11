"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

// ── 250 realistic entries ────────────────────────────────────────────────────
// Weighted toward afternoons + Mondays to match real comp-family upload patterns.
// Nothing overnight. Times feel like a parent uploading after school or post-weekend comp.

const STYLES = [
  "Jazz", "Contemporary", "Lyrical", "Hip Hop", "Tap",
  "Ballet", "Musical Theater", "Pom", "Acro", "Cheer",
];

const ENTRY_TYPES = [
  "Solo", "Duo/Trio", "Small Group", "Large Group", "Line", "Production",
];

const AGE_GROUPS = ["Mini", "Petite", "Junior", "Teen", "Senior"];

const STATES = [
  "Texas", "California", "Florida", "Ohio", "Georgia",
  "North Carolina", "Virginia", "Illinois", "Pennsylvania", "Tennessee",
  "Michigan", "Arizona", "Colorado", "Washington", "New Jersey",
  "Maryland", "Missouri", "Minnesota", "Indiana", "Alabama",
  "Oklahoma", "Nevada", "Oregon", "Wisconsin", "Louisiana",
];

// Realistic "time ago" labels — weighted toward recent but varied
// No overnight times. Afternoons + evenings + Monday mornings.
const TIME_LABELS = [
  "just now", "just now",
  "1 min ago", "2 min ago", "3 min ago", "4 min ago", "5 min ago",
  "7 min ago", "9 min ago", "11 min ago", "14 min ago",
  "18 min ago", "22 min ago", "27 min ago", "34 min ago",
  "41 min ago", "52 min ago",
  "1 hr ago", "1 hr ago", "2 hrs ago", "2 hrs ago",
  "3 hrs ago", "4 hrs ago",
];

// Seed a deterministic shuffle so the list is different every page load
// but doesn't reshuffle mid-session
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildEntries(): string[] {
  const entries: string[] = [];

  // Generate all combinations, then trim to 250 with variety
  for (const state of STATES) {
    for (const style of STYLES) {
      for (const age of AGE_GROUPS) {
        // Pick a random entry type per combo to keep it varied
        const entry = ENTRY_TYPES[
          (STATES.indexOf(state) + STYLES.indexOf(style) + AGE_GROUPS.indexOf(age)) %
            ENTRY_TYPES.length
        ];
        entries.push(
          `A ${age} ${style} ${entry} from ${state} was just analyzed`
        );
        if (entries.length >= 250) break;
      }
      if (entries.length >= 250) break;
    }
    if (entries.length >= 250) break;
  }

  // Deterministic shuffle based on today's date so order changes daily
  const seed = new Date().getDate() * 7 + new Date().getMonth() * 31;
  return seededShuffle(entries, seed);
}

const ENTRIES = buildEntries();

// ── Timing config ─────────────────────────────────────────────────────────────
// Show each notification for 5s, then wait 20–40s before the next one.
// On weekends / afternoons it feels busier; at other times more spread out.
// The client doesn't know real server load — we just simulate a realistic pattern.

function getNextDelay(): number {
  const hour = new Date().getHours();
  // Afternoons (12–20) and Mondays feel busier → shorter gap
  const isAfternoon = hour >= 12 && hour <= 20;
  const isMonday = new Date().getDay() === 1;
  if (isAfternoon || isMonday) {
    return 18_000 + Math.random() * 15_000; // 18–33s
  }
  // Morning / evening — slightly longer
  return 25_000 + Math.random() * 20_000; // 25–45s
}

export default function SocialProofTicker() {
  const [visible, setVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showNext() {
    const entry = ENTRIES[indexRef.current % ENTRIES.length];
    const time = TIME_LABELS[Math.floor(Math.random() * TIME_LABELS.length)];
    indexRef.current += 1;
    setCurrentEntry(entry);
    setCurrentTime(time);
    setVisible(true);

    // Hide after 5s
    timerRef.current = setTimeout(() => {
      setVisible(false);
      // Wait the realistic gap then show next
      timerRef.current = setTimeout(showNext, getNextDelay());
    }, 5_000);
  }

  useEffect(() => {
    // Don't show immediately on load — wait a natural 8–14s first
    const initialDelay = 8_000 + Math.random() * 6_000;
    timerRef.current = setTimeout(showNext, initialDelay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={currentEntry + currentTime}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-20 left-4 z-40 max-w-[280px] sm:max-w-[320px]"
        >
          <div className="glass border border-white/10 rounded-2xl px-4 py-3 shadow-2xl flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-white leading-snug">{currentEntry}</p>
              <p className="text-[10px] text-surface-200 mt-0.5">{currentTime}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
