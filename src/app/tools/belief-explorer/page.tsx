"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";

/* ────────────────────────────────────────────
   Quiz data
   ──────────────────────────────────────────── */

interface Question {
  id: number;
  text: string;
}

interface Category {
  key: string;
  label: string;
  icon: React.ReactNode;
  questions: Question[];
}

const categories: Category[] = [
  {
    key: "behavior",
    label: "Behavior",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    questions: [
      {
        id: 1,
        text: "Members are expected to devote significant time to group activities",
      },
      {
        id: 2,
        text: "There are strict rules about diet, clothing, or personal appearance",
      },
      {
        id: 3,
        text: "Members need permission or approval for major life decisions",
      },
      {
        id: 4,
        text: "Leaving or reducing involvement carries social consequences",
      },
      {
        id: 5,
        text: "Financial contributions are strongly expected or required",
      },
    ],
  },
  {
    key: "information",
    label: "Information",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    questions: [
      {
        id: 6,
        text: "Members are discouraged from reading critical or outside perspectives",
      },
      {
        id: 7,
        text: "The group has its own terminology or redefined common words",
      },
      {
        id: 8,
        text: "Information about the group\u2019s history or leadership is tightly controlled",
      },
      {
        id: 9,
        text: "Former members\u2019 perspectives are dismissed or discouraged",
      },
      {
        id: 10,
        text: "Members are encouraged to report concerns about other members to leadership",
      },
    ],
  },
  {
    key: "thought",
    label: "Thought",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    questions: [
      {
        id: 11,
        text: "The group\u2019s teachings are presented as the only correct worldview",
      },
      {
        id: 12,
        text: "Doubt or critical questioning is framed as a personal or spiritual failing",
      },
      {
        id: 13,
        text: "An us-vs-them mentality is promoted regarding outsiders",
      },
      {
        id: 14,
        text: "Members are taught that leaving will result in spiritual or existential harm",
      },
      {
        id: 15,
        text: "Complex issues are reduced to simple, black-and-white answers",
      },
    ],
  },
  {
    key: "emotional",
    label: "Emotional",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
    questions: [
      {
        id: 16,
        text: "Guilt or shame is used to influence members\u2019 behavior",
      },
      {
        id: 17,
        text: "Love and acceptance appear conditional on compliance",
      },
      {
        id: 18,
        text: "Fear of supernatural punishment is used as motivation",
      },
      {
        id: 19,
        text: "Members\u2019 personal boundaries are not consistently respected",
      },
      {
        id: 20,
        text: "Emotional highs from group activities are framed as spiritual confirmation",
      },
    ],
  },
];

const SLIDER_LABELS: Record<number, string> = {
  1: "Not at all",
  2: "Rarely",
  3: "Sometimes",
  4: "Often",
  5: "Very much",
};

/* ────────────────────────────────────────────
   Result bands
   ──────────────────────────────────────────── */

interface Band {
  min: number;
  max: number;
  label: string;
  description: string;
}

const bands: Band[] = [
  {
    min: 20,
    max: 35,
    label: "Low structural influence",
    description:
      "This group appears to encourage significant personal autonomy and openness.",
  },
  {
    min: 36,
    max: 50,
    label: "Moderate structural influence",
    description:
      "This group has some structured expectations. This is common across many organizations and faith traditions.",
  },
  {
    min: 51,
    max: 70,
    label: "High structural influence",
    description:
      "This group exhibits notable patterns of structural control. Consider exploring perspectives from both current and former members.",
  },
  {
    min: 71,
    max: 100,
    label: "Very high structural influence",
    description:
      "This group shows significant patterns associated with high-control environments. We encourage exploring multiple perspectives and speaking with trusted individuals outside the group.",
  },
];

function getBand(score: number): Band {
  return bands.find((b) => score >= b.min && score <= b.max) ?? bands[0];
}

/* ────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */

export default function BeliefExplorerPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [expandFramework, setExpandFramework] = useState(false);

  /* derived state */
  const totalQuestions = 20;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const allAnswered = answeredCount === totalQuestions;

  const activeCategory = categories[activeCategoryIndex];

  const categoryAnsweredCount = useCallback(
    (cat: Category) =>
      cat.questions.filter((q) => answers[q.id] !== undefined).length,
    [answers],
  );

  const categoryScore = useCallback(
    (cat: Category) =>
      cat.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0),
    [answers],
  );

  const totalScore = useMemo(
    () => categories.reduce((sum, cat) => sum + categoryScore(cat), 0),
    [categoryScore],
  );

  /* handlers */
  function handleAnswer(questionId: number, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleNext() {
    if (activeCategoryIndex < categories.length - 1) {
      setActiveCategoryIndex((i) => i + 1);
    }
  }

  function handlePrev() {
    if (activeCategoryIndex > 0) {
      setActiveCategoryIndex((i) => i - 1);
    }
  }

  function handleShowResults() {
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setAnswers({});
    setActiveCategoryIndex(0);
    setShowResults(false);
    setExpandFramework(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ── Results view ── */
  if (showResults) {
    const band = getBand(totalScore);

    return (
      <>
        {/* Header */}
        <section className="py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-4 leading-tight">
              Your Results
            </h1>
            <p className="text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed">
              Belief Environment Explorer
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
          {/* Overall score card */}
          <div className="bg-cream-100 border border-cream-200 rounded-2xl p-8 mb-8 text-center">
            <p className="text-6xl font-serif font-bold text-primary-500 mb-2">
              {totalScore}
              <span className="text-2xl text-ink-400 font-normal"> / 100</span>
            </p>
            <p className="text-xl font-serif font-semibold text-ink-900 mb-2">
              {band.label}
            </p>
            <p className="text-ink-500 leading-relaxed max-w-lg mx-auto">
              {band.description}
            </p>
          </div>

          {/* Category breakdown */}
          <div className="bg-cream-100 border border-cream-200 rounded-2xl p-8 mb-8">
            <h2 className="font-serif text-xl font-semibold text-ink-900 mb-6">
              Category Breakdown
            </h2>
            <div className="space-y-5">
              {categories.map((cat) => {
                const score = categoryScore(cat);
                const pct = Math.round((score / 25) * 100);
                return (
                  <div key={cat.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-2 text-sm font-medium text-ink-700">
                        <span className="text-primary-500">{cat.icon}</span>
                        {cat.label}
                      </span>
                      <span className="text-sm text-ink-500">
                        {score} / 25
                      </span>
                    </div>
                    <div className="w-full h-3 bg-cream-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Framework explanation */}
          <div className="bg-cream-100 border border-cream-200 rounded-2xl overflow-hidden mb-8">
            <button
              onClick={() => setExpandFramework((v) => !v)}
              className="w-full flex items-center justify-between px-8 py-5 text-left"
            >
              <span className="font-serif font-semibold text-ink-900">
                What does this mean?
              </span>
              <svg
                className={`w-5 h-5 text-ink-400 transition-transform duration-300 ${
                  expandFramework ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {expandFramework && (
              <div className="px-8 pb-6 text-sm text-ink-600 leading-relaxed space-y-3">
                <p>
                  The Belief Environment Explorer is inspired by Dr. Steven
                  Hassan&rsquo;s BITE Model, a framework used to assess the
                  degree of structural influence a group exerts over its
                  members across four domains: Behavior, Information, Thought,
                  and Emotional control.
                </p>
                <p>
                  Higher scores indicate more structural control in that
                  area. Many healthy organizations will score in the low to
                  moderate range on some questions &mdash; structured
                  expectations are a normal part of community life. The
                  purpose of this tool is to encourage reflection, not to
                  render a diagnosis.
                </p>
                <p>
                  If your results raised concerns, consider exploring
                  perspectives from a variety of sources and speaking with
                  trusted friends, family members, or a licensed counselor.
                </p>
              </div>
            )}
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link
              href="/traditions"
              className="flex-1 text-center bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors font-semibold text-sm"
            >
              Explore related traditions
            </Link>
            <Link
              href="/library"
              className="flex-1 text-center border-2 border-primary-500 text-primary-500 px-6 py-3 rounded-xl hover:bg-primary-500 hover:text-white transition-colors font-semibold text-sm"
            >
              Browse the library
            </Link>
          </div>

          {/* Take again */}
          <div className="text-center mb-12">
            <button
              onClick={handleReset}
              className="text-sm text-primary-500 underline underline-offset-2 hover:text-primary-600 transition-colors"
            >
              Take again
            </button>
          </div>

          {/* Ad */}
          <AdUnit slot="belief-explorer-results" format="horizontal" />

          {/* Email */}
          <div className="mt-10">
            <EmailCapture />
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-ink-400 text-center mt-10 leading-relaxed">
            This tool is for personal reflection and education only. It is not
            a clinical assessment.
          </p>
        </section>
      </>
    );
  }

  /* ── Quiz view ── */
  return (
    <>
      {/* Header */}
      <section className="py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-4 leading-tight">
            Belief Environment Explorer
          </h1>
          <p className="text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed">
            An interactive tool for understanding the level of structural
            influence within a religious or ideological group. Based on Dr.
            Steven Hassan&rsquo;s BITE Model framework.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        {/* Attribution box */}
        <div className="bg-cream-100 border border-cream-200 rounded-2xl p-6 mb-10">
          <p className="text-sm text-ink-600 leading-relaxed">
            This tool is inspired by Dr. Steven Hassan&rsquo;s BITE Model of
            Authoritarian Control. It is adapted here for educational purposes
            to help individuals reflect on the structural characteristics of
            groups they belong to or are considering joining. This is not a
            diagnostic tool.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-600">Progress</span>
            <span className="text-sm text-ink-400">
              {answeredCount} / {totalQuestions} questions
            </span>
          </div>
          <div className="w-full h-2.5 bg-cream-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {categories.map((cat, idx) => {
            const isActive = idx === activeCategoryIndex;
            const count = categoryAnsweredCount(cat);
            const complete = count === cat.questions.length;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategoryIndex(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary-500 text-white"
                    : "bg-cream-100 text-ink-600 hover:bg-cream-200"
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                {complete && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {!complete && count > 0 && (
                  <span
                    className={`text-xs ${
                      isActive ? "text-white/70" : "text-ink-400"
                    }`}
                  >
                    {count}/{cat.questions.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Questions for active category */}
        <div className="space-y-6 mb-10">
          {activeCategory.questions.map((q, qIdx) => {
            const value = answers[q.id] ?? 0;
            return (
              <div
                key={q.id}
                className="bg-cream-100 border border-cream-200 rounded-2xl p-6"
              >
                <p className="text-ink-800 font-medium mb-5 leading-relaxed">
                  <span className="text-ink-400 mr-2 text-sm">
                    {activeCategoryIndex * 5 + qIdx + 1}.
                  </span>
                  {q.text}
                </p>

                {/* Slider */}
                <div className="px-1">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={value || 3}
                    onChange={(e) =>
                      handleAnswer(q.id, parseInt(e.target.value, 10))
                    }
                    className="w-full h-2 bg-cream-200 rounded-full appearance-none cursor-pointer accent-primary-500
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-5
                      [&::-webkit-slider-thumb]:h-5
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-primary-500
                      [&::-webkit-slider-thumb]:shadow-md
                      [&::-webkit-slider-thumb]:transition-transform
                      [&::-webkit-slider-thumb]:hover:scale-110
                      [&::-moz-range-thumb]:w-5
                      [&::-moz-range-thumb]:h-5
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-primary-500
                      [&::-moz-range-thumb]:border-0
                      [&::-moz-range-thumb]:shadow-md"
                  />
                  <div className="flex justify-between mt-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => handleAnswer(q.id, n)}
                        className={`text-xs transition-colors ${
                          value === n
                            ? "text-primary-500 font-semibold"
                            : "text-ink-400"
                        }`}
                      >
                        {SLIDER_LABELS[n]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={activeCategoryIndex === 0}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border-2 border-cream-200 text-ink-600 hover:border-primary-500 hover:text-primary-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {activeCategoryIndex < categories.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              Next category
            </button>
          ) : (
            <button
              onClick={handleShowResults}
              disabled={!allAnswered}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {allAnswered
                ? "See results"
                : `Answer all questions (${answeredCount}/${totalQuestions})`}
            </button>
          )}
        </div>

        {/* Bottom ad */}
        <div className="mt-14">
          <AdUnit slot="belief-explorer-bottom" format="horizontal" />
        </div>

        {/* Email capture */}
        <div className="mt-10">
          <EmailCapture />
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-ink-400 text-center mt-10 leading-relaxed">
          This tool is for personal reflection and education only. It is not a
          clinical assessment.
        </p>
      </section>
    </>
  );
}
