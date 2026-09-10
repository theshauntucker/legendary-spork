"use client";

import { useEffect, useState } from "react";

/**
 * SplashIntro — the real Sunset X (public/splash-x.png, cropped from sunset-x.png) takes the stage
 * when the app opens / the site loads.
 *
 * Staging: black house, a warm spotlight cone drops from above, the mark lands
 * with a 3D entrance and a coloured glow, a highlight sweeps across the brush
 * strokes, and it reflects in a glossy stage floor with light haze drifting.
 * Then the ✦ RoutineX wordmark rises and the whole thing fades. ~2.1s.
 *
 * - Once per browser session (sessionStorage). Every cold launch in the iOS
 *   shell is a fresh session, so it plays on each app open.
 * - Skipped for prefers-reduced-motion. Pointer events never blocked.
 * - Pure CSS + the existing PNG — nothing extra to download.
 */

const KEY = "rx_splash_v2";
const LOGO = "/splash-x.png"; // sunset-x.png cropped to the strokes (no transparent padding)

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
    const t1 = window.setTimeout(() => setLeaving(true), 1900);
    const t2 = window.setTimeout(() => setShow(false), 2450);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (!show) return null;

  return (
    <div aria-hidden="true" className={`rxs ${leaving ? "rxs--leave" : ""}`} onClick={() => setLeaving(true)}>
      <style>{`
        .rxs{position:fixed;inset:0;z-index:9999;background:#050507;overflow:hidden;opacity:1;transition:opacity .5s ease;pointer-events:none;perspective:1200px}
        .rxs--leave{opacity:0}
        /* house vignette */
        .rxs::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 40%,#111014 0%,#08080a 45%,#000 100%)}
        /* spotlight cone from above */
        .rxs .beam{position:absolute;left:50%;top:-4%;width:min(140vw,1100px);height:100%;transform:translateX(-50%);
          clip-path:polygon(47% 0%,53% 0%,92% 100%,8% 100%);
          background:linear-gradient(180deg,rgba(255,240,220,.55) 0%,rgba(255,222,190,.28) 35%,rgba(255,200,160,.10) 70%,rgba(255,190,150,0) 100%);
          filter:blur(22px);opacity:0;animation:rxsBeam 1s ease-out .05s forwards;mix-blend-mode:screen}
        /* stage floor */
        .rxs .floor{position:absolute;left:-30%;right:-30%;bottom:-8%;height:52%;transform-origin:50% 100%;transform:perspective(900px) rotateX(58deg);
          background:radial-gradient(55% 60% at 50% 12%,rgba(255,215,170,.34) 0%,rgba(255,150,120,.12) 38%,rgba(0,0,0,0) 72%),linear-gradient(180deg,#1a171c 0%,#0c0b0e 55%,#050507 100%);box-shadow:0 -1px 0 rgba(255,255,255,.06);
          opacity:0;animation:rxsFade .8s ease-out .2s forwards}
        .rxs .floor::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.018) 0 2px,transparent 2px 46px);mix-blend-mode:overlay}
        /* the mark */
        .rxs .stage{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);width:min(78vw,460px);aspect-ratio:1;transform-style:preserve-3d}
        .rxs .mark{position:absolute;inset:0;background:url(${LOGO}) center/contain no-repeat;
          filter:drop-shadow(0 0 22px rgba(236,72,153,.55)) drop-shadow(0 0 60px rgba(249,115,22,.35)) drop-shadow(0 30px 40px rgba(0,0,0,.6));
          opacity:0;transform:translateY(-60px) rotateX(38deg) rotateY(-24deg) scale(.6);
          animation:rxsLand 1.05s cubic-bezier(.16,.9,.24,1) .15s forwards}
        /* highlight sweep, masked to the strokes */
        .rxs .sweep{position:absolute;inset:0;-webkit-mask:url(${LOGO}) center/contain no-repeat;mask:url(${LOGO}) center/contain no-repeat;
          background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.0) 42%,rgba(255,255,255,.85) 50%,rgba(255,255,255,0) 58%,transparent 70%);
          background-size:260% 100%;background-position:120% 0;opacity:0;animation:rxsSweep .9s ease-in-out 1s forwards;mix-blend-mode:screen}
        /* floor reflection */
        .rxs .refl{position:absolute;left:0;right:0;top:100%;height:100%;margin-top:-16%;background:url(${LOGO}) center/contain no-repeat;
          transform:scaleY(-1) scaleX(1) translateY(0);filter:blur(2.5px) brightness(.85) saturate(1.05);opacity:0;
          -webkit-mask:linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,.5) 62%,rgba(0,0,0,.75) 100%);mask:linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,.5) 62%,rgba(0,0,0,.75) 100%);
          animation:rxsRefl .8s ease-out .7s forwards}
        /* pool of light under the mark */
        .rxs .pool{position:absolute;left:50%;top:66%;width:min(90vw,620px);height:14vh;transform:translate(-50%,-50%);
          background:radial-gradient(50% 50% at 50% 50%,rgba(255,190,140,.35),rgba(236,72,153,.12) 45%,transparent 70%);filter:blur(14px);opacity:0;animation:rxsFade .9s ease-out .5s forwards}
        /* haze */
        .rxs .haze{position:absolute;border-radius:50%;filter:blur(26px);opacity:0;animation:rxsHaze 2.6s ease-in-out forwards}
        .rxs .haze.a{width:38vw;height:18vh;left:18%;top:58%;background:rgba(255,200,160,.16);animation-delay:.3s}
        .rxs .haze.b{width:30vw;height:16vh;left:52%;top:64%;background:rgba(244,114,182,.12);animation-delay:.6s}
        /* wordmark */
        .rxs .word{position:absolute;left:0;right:0;top:82%;text-align:center;font-family:"Playfair Display",Georgia,serif;font-weight:800;font-size:clamp(28px,7vw,44px);color:#fff;letter-spacing:.2px;
          opacity:0;transform:translateY(14px);animation:rxsWord .55s cubic-bezier(.2,.7,.2,1) 1.15s forwards;text-shadow:0 2px 30px rgba(0,0,0,.6)}
        .rxs .word .spark{color:#C084FC;font-size:.68em;vertical-align:.18em;margin-right:10px}
        .rxs .word .grad{background:linear-gradient(90deg,#F472B6,#F97316,#FBBF24);-webkit-background-clip:text;background-clip:text;color:transparent}
        .rxs .tag{position:absolute;left:0;right:0;top:calc(82% + clamp(40px,9vw,60px));text-align:center;font-family:Inter,system-ui,sans-serif;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:#8a8794;opacity:0;animation:rxsWord .5s ease 1.35s forwards}
        @keyframes rxsBeam{to{opacity:1}}
        @keyframes rxsFade{to{opacity:1}}
        @keyframes rxsLand{0%{opacity:0;transform:translateY(-60px) rotateX(38deg) rotateY(-24deg) scale(.6)}60%{opacity:1}100%{opacity:1;transform:translateY(0) rotateX(0) rotateY(0) scale(1)}}
        @keyframes rxsSweep{0%{opacity:0;background-position:120% 0}15%{opacity:1}100%{opacity:0;background-position:-120% 0}}
        @keyframes rxsRefl{to{opacity:.55}}
        @keyframes rxsHaze{0%{opacity:0;transform:translateX(-4%)}40%{opacity:1}100%{opacity:.6;transform:translateX(6%)}}
        @keyframes rxsWord{to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="beam" />
      <div className="floor" />
      <div className="pool" />
      <div className="haze a" />
      <div className="haze b" />
      <div className="stage">
        <div className="mark" />
        <div className="sweep" />
        <div className="refl" />
      </div>
      <div className="word">
        <span className="spark">✦</span>Routine<span className="grad">X</span>
      </div>
      <div className="tag">Your dancer&rsquo;s secret weapon</div>
    </div>
  );
}
