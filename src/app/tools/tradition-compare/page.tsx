"use client";

import { useState } from "react";
import Link from "next/link";
import { getAllTraditions, type Tradition } from "@/lib/traditions";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";

const traditions = getAllTraditions();

export default function TraditionComparePage() {
  const [slugA, setSlugA] = useState<string>("");
  const [slugB, setSlugB] = useState<string>("");

  const traditionA = traditions.find((t) => t.slug === slugA);
  const traditionB = traditions.find((t) => t.slug === slugB);

  const bothSelected = traditionA && traditionB;

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-cream-100 via-cream-50 to-primary-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-5 leading-tight">
            Tradition Compare
          </h1>
          <p className="text-lg sm:text-xl text-ink-500 max-w-2xl mx-auto leading-relaxed">
            Select two or more traditions to see where they converge and
            diverge.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        {/* Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div>
            <label
              htmlFor="tradition-a"
              className="block text-sm font-semibold text-ink-600 mb-2"
            >
              First Tradition
            </label>
            <select
              id="tradition-a"
              value={slugA}
              onChange={(e) => setSlugA(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-ink-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              <option value="">Select a tradition...</option>
              {traditions.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="tradition-b"
              className="block text-sm font-semibold text-ink-600 mb-2"
            >
              Second Tradition
            </label>
            <select
              id="tradition-b"
              value={slugB}
              onChange={(e) => setSlugB(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-ink-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              <option value="">Select a tradition...</option>
              {traditions.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison table */}
        {bothSelected ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-sm font-semibold text-ink-500 py-3 px-4 border-b border-cream-200 w-1/4">
                    &nbsp;
                  </th>
                  <th className="text-left text-sm font-semibold text-ink-900 py-3 px-4 border-b border-cream-200">
                    {traditionA.iconEmoji ? `${traditionA.iconEmoji} ` : ""}
                    {traditionA.name}
                  </th>
                  <th className="text-left text-sm font-semibold text-ink-900 py-3 px-4 border-b border-cream-200">
                    {traditionB.iconEmoji ? `${traditionB.iconEmoji} ` : ""}
                    {traditionB.name}
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-ink-700">
                <CompareRow
                  label="Founded"
                  a={traditionA.foundedDate ?? "Unknown"}
                  b={traditionB.foundedDate ?? "Unknown"}
                />
                <CompareRow
                  label="Adherents"
                  a={traditionA.adherentCount ?? "Unknown"}
                  b={traditionB.adherentCount ?? "Unknown"}
                />
                <CompareRow
                  label="Also Known As"
                  a={
                    traditionA.alternateNames?.join(", ") ?? "\u2014"
                  }
                  b={
                    traditionB.alternateNames?.join(", ") ?? "\u2014"
                  }
                />
                <CompareRow
                  label="Summary"
                  a={traditionA.summary}
                  b={traditionB.summary}
                />
                <tr className="border-b border-cream-200">
                  <td className="py-3 px-4 font-medium text-ink-500 align-top">
                    Learn More
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/traditions/${traditionA.slug}`}
                      className="text-primary-500 hover:text-primary-600 underline"
                    >
                      Introduction &rarr;
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/traditions/${traditionB.slug}`}
                      className="text-primary-500 hover:text-primary-600 underline"
                    >
                      Introduction &rarr;
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-cream-100 rounded-2xl border border-cream-200">
            <p className="text-ink-400 text-lg">
              Select two traditions above to compare them side by side.
            </p>
          </div>
        )}
      </div>

      {/* Ad */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <AdUnit slot="tradition-compare" format="horizontal" />
      </div>

      {/* Email Capture */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <EmailCapture />
      </div>
    </>
  );
}

function CompareRow({
  label,
  a,
  b,
}: {
  label: string;
  a: string;
  b: string;
}) {
  return (
    <tr className="border-b border-cream-200">
      <td className="py-3 px-4 font-medium text-ink-500 align-top">{label}</td>
      <td className="py-3 px-4">{a}</td>
      <td className="py-3 px-4">{b}</td>
    </tr>
  );
}
