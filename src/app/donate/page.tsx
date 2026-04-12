import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support FaithLens — Buy Us a Coffee",
  description:
    "Help keep FaithLens running with a small donation. Every dollar helps us provide free, unbiased religious content.",
};

export default function DonatePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">&#9749;</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-3">
          Buy Us a Coffee
        </h1>
        <p className="text-lg text-surface-600">
          FaithLens is free for everyone. If you find our unbiased religious
          content valuable, a small donation helps keep us going.
        </p>
      </div>

      {/* Donation Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <a
          href="#"
          className="bg-white border-2 border-surface-200 rounded-xl p-6 text-center hover:border-warm-400 hover:shadow-md transition-all"
        >
          <div className="text-3xl mb-2">&#9749;</div>
          <div className="text-2xl font-bold text-surface-900 mb-1">$1</div>
          <div className="text-sm text-surface-500">A quick coffee</div>
        </a>
        <a
          href="#"
          className="bg-white border-2 border-warm-400 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all"
        >
          <div className="text-3xl mb-2">&#9749;&#9749;</div>
          <div className="text-2xl font-bold text-surface-900 mb-1">$3</div>
          <div className="text-sm text-surface-500">A nice latte</div>
        </a>
        <a
          href="#"
          className="bg-white border-2 border-surface-200 rounded-xl p-6 text-center hover:border-warm-400 hover:shadow-md transition-all"
        >
          <div className="text-3xl mb-2">&#9749;&#9749;&#9749;</div>
          <div className="text-2xl font-bold text-surface-900 mb-1">$5</div>
          <div className="text-sm text-surface-500">Coffee for the team</div>
        </a>
      </div>

      <div className="bg-surface-100 rounded-xl p-6 text-center">
        <p className="text-surface-600 text-sm mb-3">
          To set up donations, connect a payment provider like{" "}
          <strong>Buy Me a Coffee</strong>, <strong>Ko-fi</strong>, or{" "}
          <strong>PayPal</strong>. Replace the links above with your payment
          URL.
        </p>
        <p className="text-surface-400 text-xs">
          Set the <code className="bg-white px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_DONATE_URL</code> environment
          variable to your Buy Me a Coffee or PayPal.me link.
        </p>
      </div>

      <div className="mt-10 text-center">
        <h2 className="text-xl font-bold text-surface-900 mb-3">
          Where does the money go?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-surface-600">
          <div className="bg-white rounded-lg p-4 border border-surface-200">
            <div className="font-semibold text-surface-900 mb-1">
              Hosting & Infrastructure
            </div>
            <p>Keeping the site fast and reliable for everyone</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-surface-200">
            <div className="font-semibold text-surface-900 mb-1">
              Content Research
            </div>
            <p>Writing accurate, well-researched articles</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-surface-200">
            <div className="font-semibold text-surface-900 mb-1">
              New Features
            </div>
            <p>Building tools for the community</p>
          </div>
        </div>
      </div>
    </div>
  );
}
