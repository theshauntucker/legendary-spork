export const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  { q: "What is RoutineX Spotlight?", a: "A private, in-depth technique breakdown of one dancer. We track 60–80 frames of her routine on your phone, pick the moments a coach would freeze on, measure the lines and angles on her own body, and write it up like a private session: what is working, what to change and why, drills with cues, and a four-week plan. You get it on the web and as a PDF. $14.99, one-time." },
  { q: "How is Spotlight different from routine scoring?", a: "Routine scoring judges the whole routine the way a competition panel does — a score out of 300, an award level, timestamped notes. Spotlight is about one dancer's technique, frame by frame, with the corrections drawn directly on her frames. Most families use scoring all season and Spotlight before a big competition or when something specific needs fixing." },
  { q: "Does it work on group routines?", a: "Yes. Upload the group video, tap your dancer on the first frame, and we follow her through the routine. Everyone else is blurred on your phone before any frame is uploaded." },
  { q: "Are the angles real?", a: "Yes. Every number on a Spotlight report is measured from the frames with on-device pose tracking. The coach decides what to point at; the geometry comes from her body, not from a description. Angles are measured from the camera's point of view, so trends across moments matter more than any single degree." },
  { q: "How long does it take?", a: "Routine scoring: usually one to three minutes. Spotlight: two to three minutes, because it tracks and measures every frame before the write-up. You can close the tab — the PDF lands in your inbox." },
  { q: "What does it cost?", a: "Your first routine analysis is 99¢. After that it is $1.99 each, or $4.99 a month for four as a Season Member. Spotlight is $14.99 per dancer per routine. Studios have their own plan with a 30-day free trial." },
  { q: "What happens to the video?", a: "It never leaves your phone. Still frames are extracted on your device and only those are sent. Scoring frames are deleted within 24 hours. Spotlight keeps the frames used in your report so you can reopen it, and you can delete the report and its frames any time." },
  { q: "What if the report misses the mark?", a: "Email us what was off and we credit your account. The founder answers those emails himself." },
];

export default function StageFAQ() {
  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="st-wrap grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        <div>
          <p className="st-runner">Questions</p>
          <h2 className="st-h2 mt-3">Things families ask before they upload.</h2>
        </div>
        <div className="divide-y divide-white/10">
          {FAQ_ITEMS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-semibold marker:content-none">
                {f.q}
                <span aria-hidden className="mt-1 text-zinc-500 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-zinc-400">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
