"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { getAllTraditions } from "@/lib/traditions";
import {
  JOURNEY_LABELS,
  type JourneyType,
} from "@/lib/stories";

const traditions = getAllTraditions();

const journeyTypes: JourneyType[] = [
  "entering",
  "deepening",
  "questioning",
  "leaving",
  "returning",
];

export default function StorySubmitPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tradition, setTradition] = useState("");
  const [journeyType, setJourneyType] = useState<JourneyType | "">("");
  const [title, setTitle] = useState("");
  const [storyBody, setStoryBody] = useState("");
  const [consent, setConsent] = useState(false);
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
          name: name.trim(),
          email: email.trim(),
          tradition,
          journeyType,
          title: title.trim(),
          storyBody: storyBody.trim(),
          consent,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(
          data.message ||
            "Thank you for sharing your story. Our editorial team will review it and reach out within 7 days."
        );
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
        <div className="bg-cream-100 border border-primary-500/20 rounded-2xl p-8">
          <svg
            className="w-16 h-16 text-primary-500 mx-auto mb-4"
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
          <h2 className="font-serif text-2xl text-ink-900 mb-3">
            Story Submitted
          </h2>
          <p className="text-ink-500 mb-6">{message}</p>
          <Link
            href="/stories"
            className="inline-block bg-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-600 transition-colors text-sm"
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
      <section className="py-14 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl text-ink-900 mb-4 leading-tight">
            Share Your Story
          </h1>
          <p className="text-ink-500 max-w-lg mx-auto leading-relaxed">
            Every journey matters. Whether you are entering, deepening,
            questioning, leaving, or returning &mdash; your experience can help
            others understand.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-14">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-ink-700 mb-1.5"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name or a pseudonym"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-ink-700 mb-1.5"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-ink-400 mt-1">
              We will only use this to contact you about your submission.
            </p>
          </div>

          {/* Tradition */}
          <div>
            <label
              htmlFor="tradition"
              className="block text-sm font-semibold text-ink-700 mb-1.5"
            >
              Tradition <span className="text-red-500">*</span>
            </label>
            <select
              id="tradition"
              required
              value={tradition}
              onChange={(e) => setTradition(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-ink-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              <option value="">Select a tradition...</option>
              {traditions.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Journey Type */}
          <fieldset>
            <legend className="block text-sm font-semibold text-ink-700 mb-3">
              Journey type <span className="text-red-500">*</span>
            </legend>
            <div className="space-y-2">
              {journeyTypes.map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    journeyType === type
                      ? "border-primary-500 bg-primary-50"
                      : "border-cream-200 bg-cream-50 hover:border-cream-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="journeyType"
                    value={type}
                    required
                    checked={journeyType === type}
                    onChange={() => setJourneyType(type)}
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-cream-300"
                  />
                  <span className="text-sm text-ink-700">
                    {JOURNEY_LABELS[type]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Story Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-ink-700 mb-1.5"
            >
              Story title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your story a title"
              className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-cream-50 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Story Body */}
          <div>
            <label
              htmlFor="storyBody"
              className="block text-sm font-semibold text-ink-700 mb-1.5"
            >
              Your story <span className="text-red-500">*</span>
            </label>
            <textarea
              id="storyBody"
              required
              rows={14}
              value={storyBody}
              onChange={(e) => setStoryBody(e.target.value)}
              placeholder="Share your experience in your own words. What was your journey like? There is no wrong way to tell your story."
              className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm leading-relaxed resize-y"
            />
          </div>

          {/* Consent */}
          <div className="bg-cream-100 rounded-2xl p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-cream-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-ink-700">
                I consent to having my story published on [SiteName]. Stories may
                be lightly edited for clarity. I understand I can request removal
                at any time.
              </span>
            </label>
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
            className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold text-base hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Submitting..." : "Submit Your Story"}
          </button>
        </form>
      </section>
    </>
  );
}
