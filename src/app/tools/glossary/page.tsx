"use client";

import { useState, useMemo } from "react";
import AdUnit from "@/components/AdUnit";
import EmailCapture from "@/components/EmailCapture";

interface GlossaryTerm {
  word: string;
  definition: string;
  traditions: string[];
}

const glossaryTerms: GlossaryTerm[] = [
  {
    word: "Atonement",
    definition:
      "A theological concept referring to the reconciliation of humanity with God, often through sacrifice or repentance. Central to Christian soteriology and present in various forms across Abrahamic traditions.",
    traditions: ["Christianity", "Judaism"],
  },
  {
    word: "Baptism",
    definition:
      "A rite of initiation involving water, practiced in Christianity as a sacrament signifying purification, regeneration, and admission to the faith community.",
    traditions: ["Christianity"],
  },
  {
    word: "Dharma",
    definition:
      "A multifaceted concept referring to cosmic order, moral law, duty, and the teachings of the Buddha or the natural order of the universe, depending on the tradition.",
    traditions: ["Hinduism", "Buddhism", "Jainism", "Sikhism"],
  },
  {
    word: "Eucharist",
    definition:
      "A Christian sacrament commemorating the Last Supper, in which bread and wine are consecrated and consumed. Also known as Holy Communion or the Lord's Supper.",
    traditions: ["Christianity"],
  },
  {
    word: "Fatwa",
    definition:
      "A formal ruling or interpretation on a point of Islamic law given by a qualified legal scholar. Fatwas are advisory and not universally binding.",
    traditions: ["Islam"],
  },
  {
    word: "Guru",
    definition:
      "A spiritual teacher or guide, especially in Hinduism and Sikhism. In Sikhism, the term specifically refers to the ten founding Gurus and the Guru Granth Sahib.",
    traditions: ["Hinduism", "Sikhism", "Buddhism"],
  },
  {
    word: "Hajj",
    definition:
      "The annual Islamic pilgrimage to Mecca, required of every able-bodied Muslim who can afford it at least once in their lifetime. It is one of the Five Pillars of Islam.",
    traditions: ["Islam"],
  },
  {
    word: "Imam",
    definition:
      "In Sunni Islam, a person who leads congregational prayer. In Shia Islam, the term also refers to divinely appointed leaders descended from the Prophet Muhammad.",
    traditions: ["Islam"],
  },
  {
    word: "Jihad",
    definition:
      "An Arabic term meaning 'striving' or 'struggle.' In Islamic theology, it most commonly refers to the inner spiritual struggle against sin (the 'greater jihad'), though it can also refer to outward efforts to defend or promote the faith.",
    traditions: ["Islam"],
  },
  {
    word: "Karma",
    definition:
      "The principle that a person's actions in this and previous lives determine their fate in future existences. Interpreted differently across Hindu, Buddhist, Jain, and Sikh traditions.",
    traditions: ["Hinduism", "Buddhism", "Jainism", "Sikhism"],
  },
  {
    word: "Lent",
    definition:
      "A period of approximately forty days of fasting, prayer, and penitence observed by many Christians in preparation for Easter, commemorating Jesus's time of fasting in the wilderness.",
    traditions: ["Christianity"],
  },
  {
    word: "Mantra",
    definition:
      "A word, phrase, or sound repeated in meditation or prayer, believed to have spiritual power. Used extensively in Hindu, Buddhist, Jain, and Sikh practices.",
    traditions: ["Hinduism", "Buddhism", "Sikhism"],
  },
  {
    word: "Nirvana",
    definition:
      "In Buddhism, the ultimate spiritual goal: the extinguishing of suffering, desire, and the cycle of rebirth. In Hinduism, it refers to liberation (moksha) and union with the divine.",
    traditions: ["Buddhism", "Hinduism"],
  },
  {
    word: "Original Sin",
    definition:
      "A Christian doctrine holding that all humans inherit a sinful nature from Adam and Eve's disobedience in the Garden of Eden. Interpretations vary widely among denominations.",
    traditions: ["Christianity"],
  },
  {
    word: "Prophet",
    definition:
      "A person regarded as an inspired teacher or proclaimer of the will of God. Prophets are central figures in Judaism, Christianity, and Islam, though each tradition recognizes different prophetic lineages.",
    traditions: ["Judaism", "Christianity", "Islam"],
  },
  {
    word: "Quran",
    definition:
      "The central religious text of Islam, believed by Muslims to be the word of God as revealed to the Prophet Muhammad through the angel Gabriel over approximately 23 years.",
    traditions: ["Islam"],
  },
  {
    word: "Ramadan",
    definition:
      "The ninth month of the Islamic lunar calendar, observed by Muslims worldwide as a month of fasting, prayer, reflection, and community. Fasting from dawn to sunset is one of the Five Pillars of Islam.",
    traditions: ["Islam"],
  },
  {
    word: "Sangha",
    definition:
      "The Buddhist community of monks, nuns, and laypeople. One of the Three Jewels of Buddhism, alongside the Buddha and the Dharma.",
    traditions: ["Buddhism"],
  },
  {
    word: "Torah",
    definition:
      "The foundational text of Judaism, comprising the first five books of the Hebrew Bible (Genesis, Exodus, Leviticus, Numbers, Deuteronomy). Also referred to as the Pentateuch in Christian tradition.",
    traditions: ["Judaism", "Christianity"],
  },
  {
    word: "Ummah",
    definition:
      "The global community of Muslims, bound together by shared faith regardless of nationality, ethnicity, or language.",
    traditions: ["Islam"],
  },
  {
    word: "Vedas",
    definition:
      "The oldest and most authoritative scriptures of Hinduism, composed in Vedic Sanskrit. The four Vedas — Rigveda, Samaveda, Yajurveda, and Atharvaveda — contain hymns, rituals, and philosophical teachings.",
    traditions: ["Hinduism"],
  },
  {
    word: "Zazen",
    definition:
      "A form of seated meditation central to Zen Buddhism, emphasizing posture, breathing, and the direct experience of the present moment without attachment to thoughts.",
    traditions: ["Buddhism"],
  },
];

const allTraditions = Array.from(
  new Set(glossaryTerms.flatMap((t) => t.traditions))
).sort();

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTradition, setSelectedTradition] = useState<string>("all");
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return glossaryTerms.filter((term) => {
      if (
        searchQuery.trim() &&
        !term.word.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !term.definition.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (
        selectedTradition !== "all" &&
        !term.traditions.includes(selectedTradition)
      )
        return false;
      return true;
    });
  }, [searchQuery, selectedTradition]);

  const pillBase =
    "px-3 py-1.5 text-sm rounded-xl border transition-colors font-medium cursor-pointer";
  const pillActive = "bg-primary-500 text-white border-primary-500";
  const pillInactive =
    "bg-cream-50 text-ink-600 border-cream-200 hover:border-primary-500/40";

  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-br from-cream-100 via-cream-50 to-primary-50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl text-ink-900 mb-5 leading-tight">
            Glossary of Terms
          </h1>
          <p className="text-lg sm:text-xl text-ink-500 max-w-2xl mx-auto leading-relaxed">
            Key terms, concepts, and names from the world&rsquo;s faith
            traditions.
          </p>
        </div>
      </section>

      {/* Ad: top */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <AdUnit slot="glossary-top" format="horizontal" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search terms or definitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Tradition filter */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-ink-600 mb-2">
            Filter by Tradition
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              className={`${pillBase} ${selectedTradition === "all" ? pillActive : pillInactive}`}
              onClick={() => setSelectedTradition("all")}
            >
              All
            </button>
            {allTraditions.map((t) => (
              <button
                key={t}
                className={`${pillBase} ${selectedTradition === t ? pillActive : pillInactive}`}
                onClick={() => setSelectedTradition(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-ink-400 mb-4">
          {filtered.length} term{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Terms list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink-400 text-lg">
              No terms match your search.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTradition("all");
              }}
              className="mt-4 text-primary-500 hover:text-primary-600 font-medium text-sm"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((term) => {
              const isExpanded = expandedTerm === term.word;
              return (
                <div
                  key={term.word}
                  className="bg-cream-50 border border-cream-200 rounded-2xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() =>
                      setExpandedTerm(isExpanded ? null : term.word)
                    }
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <h3 className="font-serif font-semibold text-ink-900 text-lg">
                        {term.word}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {term.traditions.map((trad) => (
                          <span
                            key={trad}
                            className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium"
                          >
                            {trad}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-ink-400 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
                  {isExpanded && (
                    <div className="px-5 pb-4">
                      <p className="text-sm text-ink-700 leading-relaxed">
                        {term.definition}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ad: bottom */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
        <AdUnit slot="glossary-bottom" format="horizontal" />
      </div>

      {/* Email Capture */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <EmailCapture />
      </div>
    </>
  );
}
