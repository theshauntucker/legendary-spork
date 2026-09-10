"use client";

/**
 * HeroMark — the Sunset X as a hero object, not an icon.
 *
 * Big, lit from above, floating a few pixels off a warm ground shadow with a
 * slow breathing tilt and a highlight that sweeps across the strokes every few
 * seconds. Uses the HD re-edged mark (public/splash-x-hd.webp) so it stays
 * crisp at 200px+ on Retina. Pure CSS; respects prefers-reduced-motion.
 */
const MARK = "/splash-x-hd.webp";

export default function HeroMark() {
  return (
    <div className="rxhm" aria-hidden="true">
      <style>{`
        .rxhm{position:relative;width:clamp(170px,24vw,250px);aspect-ratio:1;margin:0 auto;perspective:900px;transform-style:preserve-3d}
        /* warm pool of light behind the mark */
        .rxhm .pool{position:absolute;inset:-40%;border-radius:50%;
          background:radial-gradient(50% 50% at 50% 50%,rgba(236,72,153,.28),rgba(249,115,22,.16) 42%,rgba(251,191,36,0) 70%);filter:blur(18px);
          animation:rxhmPool 6s ease-in-out infinite}
        /* ground shadow — the thing that makes it read as an object */
        .rxhm .ground{position:absolute;left:8%;right:8%;bottom:-14%;height:16%;border-radius:50%;
          background:radial-gradient(50% 50% at 50% 50%,rgba(60,20,50,.42),rgba(60,20,50,.14) 55%,rgba(60,20,50,0) 75%);filter:blur(6px);
          animation:rxhmGround 6s ease-in-out infinite}
        .rxhm .stage{position:absolute;inset:0;transform-style:preserve-3d;animation:rxhmFloat 6s ease-in-out infinite}
        /* soft dark duplicate beneath = thickness */
        .rxhm .depth{position:absolute;inset:0;background:url(${MARK}) center/contain no-repeat;
          filter:brightness(.35) saturate(1.2) blur(1.5px);transform:translate(5px,12px);opacity:.6}
        .rxhm .mark{position:absolute;inset:0;background:url(${MARK}) center/contain no-repeat;
          filter:drop-shadow(0 18px 22px rgba(236,72,153,.30)) drop-shadow(0 6px 8px rgba(120,40,80,.22)) drop-shadow(0 1px 0 rgba(255,255,255,.8))}
        /* highlight sweep masked to the strokes */
        .rxhm .sweep{position:absolute;inset:0;-webkit-mask:url(${MARK}) center/contain no-repeat;mask:url(${MARK}) center/contain no-repeat;
          background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,0) 44%,rgba(255,255,255,.75) 50%,rgba(255,255,255,0) 56%,transparent 65%);
          background-size:260% 100%;background-position:120% 0;mix-blend-mode:screen;opacity:0;animation:rxhmSweep 6s ease-in-out infinite}
        /* top-lit rim: a lighter copy nudged up, masked, very faint */
        .rxhm .rim{position:absolute;inset:0;-webkit-mask:url(${MARK}) center/contain no-repeat;mask:url(${MARK}) center/contain no-repeat;
          background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0) 45%);transform:translateY(-2px);mix-blend-mode:soft-light}
        @keyframes rxhmFloat{0%,100%{transform:translateY(0) rotateX(10deg) rotateY(-8deg)}50%{transform:translateY(-8px) rotateX(14deg) rotateY(8deg)}}
        @keyframes rxhmGround{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.92);opacity:.75}}
        @keyframes rxhmPool{0%,100%{opacity:.9}50%{opacity:1}}
        @keyframes rxhmSweep{0%,55%{opacity:0;background-position:120% 0}62%{opacity:1}80%,100%{opacity:0;background-position:-120% 0}}
        @media (prefers-reduced-motion:reduce){.rxhm .stage,.rxhm .ground,.rxhm .pool,.rxhm .sweep{animation:none}.rxhm .stage{transform:rotateX(10deg) rotateY(-6deg)}}
      `}</style>
      <div className="pool" />
      <div className="ground" />
      <div className="stage">
        <div className="depth" />
        <div className="mark" />
        <div className="rim" />
        <div className="sweep" />
      </div>
    </div>
  );
}
