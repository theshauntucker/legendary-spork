import { ShieldCheck } from "lucide-react";

/**
 * The RoutineX guarantee.
 *
 * Every purchase is backed by it: if a report doesn't deliver, the parent
 * emails us and we credit the account — no forms, no arguing, no waiting on a
 * refund window. This is deliberately the LAST thing a parent reads before
 * they pay, because the price is small and the only real objection is
 * "what if it's junk."
 *
 * Support routes to danceroutinex@gmail.com and the /support form, both of
 * which land in the founder's inbox. Do not use this copy anywhere the promise
 * can't actually be honored.
 */
export function Guarantee({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "inline" | "compact" | "light";
  className?: string;
}) {
  // Light variant — for the editorial (bright) marketing surfaces like /pricing
  // and the homepage, which use the #221A29 ink palette, not the dark app theme.
  if (variant === "light") {
    return (
      <div
        className={`rounded-3xl border border-[#E4DFE8] bg-white/70 p-6 sm:p-7 ${className}`}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#B0356B]/10">
            <ShieldCheck className="h-5 w-5 text-[#B0356B]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#221A29] text-base sm:text-lg mb-1.5">
              Our money-back guarantee
            </h3>
            <p className="text-sm text-[#5D5565] leading-relaxed">
              We&apos;re a dance family, not a faceless company. If a report doesn&apos;t
              give you something you can actually use, just reach out with your
              feedback — we&apos;ll credit your account immediately. No forms, no
              runaround, no waiting on a refund window.
            </p>
            <a
              href="/support"
              className="inline-block mt-3 text-sm font-semibold text-[#B0356B] hover:opacity-75 underline underline-offset-2"
            >
              Reach out anytime →
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <p className={`text-xs text-surface-200 ${className}`}>
        <ShieldCheck className="inline h-3.5 w-3.5 text-emerald-400 mr-1 -mt-0.5" />
        Backed by our guarantee — not happy, tell us and we credit your account.
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={`flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 ${className}`}
      >
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-sm text-surface-100 leading-relaxed">
          <span className="font-semibold text-white">Money-back guarantee.</span>{" "}
          If your report misses the mark, email us your feedback and we&apos;ll credit
          your account immediately.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.10] to-transparent p-5 sm:p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-bold text-white text-base sm:text-lg mb-1.5">
            Our money-back guarantee
          </h3>
          <p className="text-sm text-surface-200 leading-relaxed">
            We&apos;re a dance family, not a faceless company. If a report doesn&apos;t give
            you something you can actually use, just reach out with your feedback —
            we&apos;ll credit your account immediately. No forms, no runaround, no
            waiting on a refund window.
          </p>
          <a
            href="/support"
            className="inline-block mt-3 text-sm font-semibold text-emerald-300 hover:text-emerald-200 underline underline-offset-2"
          >
            Reach out anytime →
          </a>
        </div>
      </div>
    </div>
  );
}

export default Guarantee;
