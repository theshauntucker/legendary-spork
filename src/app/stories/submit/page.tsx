"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

const RELIGION_OPTIONS = [
  { value: "", label: "Select a religion or tradition..." },
  { value: "mormonism", label: "Mormonism" },
  { value: "christianity", label: "Christianity" },
  { value: "islam", label: "Islam" },
  { value: "catholicism", label: "Catholicism" },
  { value: "jehovahs-witnesses", label: "Jehovah's Witnesses" },
  { value: "scientology", label: "Scientology" },
  { value: "judaism", label: "Judaism" },
  { value: "buddhism", label: "Buddhism" },
  { value: "hinduism", label: "Hinduism" },
  { value: "other", label: "Other" },
];

export default function StorySubmitPage() {
  const [title, setTitle] = useState("");
  const [religion, setReligion] = useState("");
  const [storyBody, setStoryBody] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          religion,
          storyBody: storyBody.trim(),
          anonymous,
          displayName: anonymous ? null : displayName.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(
          data.message ||
            "Thank you for sharing your story. It will be reviewed and published soon."
        );
        setTitle("");
        setReligion("");
        setStoryBody("");
        setAnonymous(true);
        setDisplayName("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="bg-accent-50 border border-accent-200 rounded-2xl p-8">
          <svg
            className="w-16 h-16 text-accent-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-heading text-slate-900 mb-3">
            Story Submitted
          </h2>
          <p className="text-slate-600 mb-6">{message}</p>
          <Link
            href="/stories"
            className="inline-block bg-accent-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-accent-700 transition-colors text-sm"
          >
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-accent-50 via-white to-amber-50 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-heading text-slate-900 mb-3 leading-tight">
            Share Your Story
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto">
            Your experience can help someone else feel less alone. Share as much
            or as little as you feel comfortable with.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Story Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Leaving My Faith After 20 Years"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent text-sm"
            />
          </div>

          {/* Religion */}
          <div>
            <label
              htmlFor="religion"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Religion / Tradition <span className="text-red-500">*</span>
            </label>
            <select
              id="religion"
              required
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent text-sm"
            >
              {RELIGION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Story Body */}
          <div>
            <label
              htmlFor="storyBody"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Your Story <span className="text-red-500">*</span>
            </label>
            <textarea
              id="storyBody"
              required
              rows={12}
              value={storyBody}
              onChange={(e) => setStoryBody(e.target.value)}
              placeholder="Tell your story in your own words. What did you believe? What changed? How are you doing now?"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent text-sm leading-relaxed resize-y"
            />
            <p className="text-xs text-slate-400 mt-1">
              Minimum 50 characters. Take your time — there is no maximum length.
            </p>
          </div>

          {/* Anonymous */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <input
                id="anonymous"
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-400"
              />
              <label htmlFor="anonymous" className="text-sm text-slate-700">
                <span className="font-semibold">Share anonymously</span>
                <br />
                <span className="text-slate-500">
                  Your story will be published without any identifying
                  information.
                </span>
              </label>
            </div>

            {/* Display Name (conditional) */}
            {!anonymous && (
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-semibold text-slate-700 mb-1.5"
                >
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="displayName"
                  type="text"
                  required={!anonymous}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Grace W."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent text-sm"
                />
              </div>
            )}
          </div>

          {/* Error */}
          {status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">{message}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-accent-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Submitting..." : "Submit Your Story"}
          </button>

          {/* Disclaimer */}
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            Stories may be edited for clarity. By submitting, you grant FaithLens
            permission to publish your story.
          </p>
        </form>
      </section>
    </>
  );
}
