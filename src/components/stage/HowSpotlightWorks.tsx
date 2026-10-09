/**
 * Three steps — a real sequence, so the numbering earns its place.
 */
const STEPS = [
  {
    n: "1",
    title: "Upload from your phone",
    body: "Any routine video — a studio run-through, last weekend's comp, a living-room take. Group video? Tap your dancer on the first frame and we follow her through the routine. Everyone else is blurred before anything leaves the phone.",
  },
  {
    n: "2",
    title: "Every frame gets measured",
    body: "Sixty to eighty frames are tracked on your device: knees, hips, shoulders, lines, lean, balance. From those we pick the moments worth freezing — the apex of the jump, the top of the extension, the landing, the turn.",
  },
  {
    n: "3",
    title: "The AI writes it up",
    body: "An AI breakdown: what is working and why it scores, what to change and the cause behind it, marks drawn on her frames, drills with cues, and a four-week plan. Two to three minutes later it is on your screen and in your inbox as a PDF.",
  },
];

export default function HowSpotlightWorks() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="st-wrap">
        <p className="st-runner">How a Spotlight report is made</p>
        <h2 className="st-h2 mt-3 max-w-2xl">Two to three minutes. The most thorough look she can get.</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s) => (
            <li key={s.n} className="border-t border-white/10 pt-6">
              <span className="font-[family-name:var(--font-display)] text-4xl text-amber-300/90">{s.n}</span>
              <h3 className="mt-3 text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-[15.5px] leading-relaxed text-zinc-400">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
