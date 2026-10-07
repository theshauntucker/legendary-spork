/**
 * The privacy promise, stated the way a parent would ask it.
 */
const POINTS = [
  ["The video never leaves your phone", "Frames are pulled from the video on your device. The file itself is never uploaded, to us or anyone."],
  ["Other dancers are blurred before upload", "In a group video you tap your dancer. Everyone else is blurred on your phone, before a single frame is sent."],
  ["Nobody watches", "No human reviews your frames. Routine-scoring frames are deleted within 24 hours. Spotlight keeps only the frames in your report, and you can delete the whole report with one tap."],
  ["Built by a dance parent", "RoutineX was built by a competitive-dance family for competitive-dance families. The founder answers the support email himself."],
];

export default function PrivacyStage() {
  return (
    <section id="privacy" className="relative border-y border-white/[0.06] bg-[#0C0B10] py-20 sm:py-28">
      <div className="st-wrap grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        <div>
          <p className="st-runner">Privacy</p>
          <h2 className="st-h2 mt-3">Your child&apos;s privacy isn&apos;t an afterthought.</h2>
        </div>
        <dl className="grid gap-8 sm:grid-cols-2">
          {POINTS.map(([t, b]) => (
            <div key={t} className="border-t border-white/10 pt-5">
              <dt className="text-lg font-semibold">{t}</dt>
              <dd className="mt-2 text-[15.5px] leading-relaxed text-zinc-400">{b}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
