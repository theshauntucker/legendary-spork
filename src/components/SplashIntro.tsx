"use client";

import { useEffect, useState } from "react";

/**
 * SplashIntro — the Sunset X draws itself in when the app opens / the site loads.
 *
 * - Plays once per browser session (sessionStorage). Inside the iOS shell every
 *   cold launch is a fresh session, so it plays on each app open.
 * - ~1.7s total, then fades and unmounts. Pointer events are released early so
 *   an impatient thumb is never blocked.
 * - Honours prefers-reduced-motion (skips entirely).
 * - Pure CSS/SVG — nothing to load, nothing to buffer.
 */

const KEY = "rx_splash_v1";

export default function SplashIntro() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    try {
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, "1");
    } catch {
      return;
    }
    setShow(true);
    const t1 = window.setTimeout(() => setLeaving(true), 1450);
    const t2 = window.setTimeout(() => setShow(false), 1950);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className={`rx-splash ${leaving ? "rx-splash--leave" : ""}`}
      onClick={() => setLeaving(true)}
    >
      <style>{`
        .rx-splash{position:fixed;inset:0;z-index:9999;background:#09090B;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:22px;opacity:1;transition:opacity .45s ease;pointer-events:none}
        .rx-splash--leave{opacity:0}
        .rx-splash .x{width:min(38vw,168px);height:auto;overflow:visible}
        .rx-splash .stroke{fill:none;stroke-linecap:round;stroke-dasharray:420;stroke-dashoffset:420;animation:rxDraw .62s cubic-bezier(.65,0,.2,1) forwards}
        .rx-splash .stroke.bold{stroke:url(#rxBold);stroke-width:44;filter:url(#rxGlow)}
        .rx-splash .stroke.thin{stroke:url(#rxThin);stroke-width:18;animation-delay:.28s}
        .rx-splash .shine{fill:none;stroke:#fff;stroke-width:44;stroke-linecap:round;stroke-dasharray:70 420;stroke-dashoffset:490;opacity:0;animation:rxShine .55s ease-out .85s forwards;mix-blend-mode:overlay}
        .rx-splash .halo{transform-origin:50% 50%;opacity:0;animation:rxHalo 1.1s ease-out .55s forwards}
        .rx-splash .word{font-family:"Playfair Display",Georgia,serif;font-weight:800;font-size:clamp(26px,6.5vw,38px);letter-spacing:.2px;color:#fff;display:flex;align-items:baseline;gap:0;opacity:0;transform:translateY(10px);animation:rxWord .5s cubic-bezier(.2,.7,.2,1) .9s forwards}
        .rx-splash .word .spark{color:#C084FC;font-size:.7em;transform:translateY(-.15em);margin-right:10px}
        .rx-splash .word .grad{background:linear-gradient(90deg,#C084FC,#F472B6,#FBBF24);-webkit-background-clip:text;background-clip:text;color:transparent}
        .rx-splash .tag{font-family:Inter,system-ui,sans-serif;font-size:11px;letter-spacing:2.2px;text-transform:uppercase;color:#71717A;opacity:0;animation:rxWord .5s ease 1.05s forwards}
        @keyframes rxDraw{to{stroke-dashoffset:0}}
        @keyframes rxShine{0%{opacity:0;stroke-dashoffset:490}30%{opacity:.9}100%{opacity:0;stroke-dashoffset:-70}}
        @keyframes rxHalo{0%{opacity:0;transform:scale(.6)}40%{opacity:.55}100%{opacity:0;transform:scale(1.6)}}
        @keyframes rxWord{to{opacity:1;transform:translateY(0)}}
      `}</style>

      <svg className="x" viewBox="0 0 240 240">
        <defs>
          <linearGradient id="rxBold" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="55%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          <linearGradient id="rxThin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <radialGradient id="rxHaloG" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <filter id="rxGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle className="halo" cx="120" cy="120" r="118" fill="url(#rxHaloG)" />
        {/* thin stroke: top-left → bottom-right */}
        <path className="stroke thin" d="M52 52 L188 188" />
        {/* bold stroke: bottom-left → top-right */}
        <path className="stroke bold" d="M44 196 L196 44" />
        <path className="shine" d="M44 196 L196 44" />
      </svg>

      <div className="word">
        <span className="spark">✦</span>
        <span>Routine</span>
        <span className="grad">X</span>
      </div>
      <div className="tag">Your dancer&rsquo;s secret weapon</div>
    </div>
  );
}
