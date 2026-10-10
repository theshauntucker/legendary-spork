import { STATUS_COLOR, arcPath, momentPrimitives, type Primitive } from "@/lib/spotlight/annotations";
import type { Annotation } from "@/lib/spotlight/types";
import type { Pose } from "@/lib/spotlight/landmarks";

/**
 * A frame with the coaching lines drawn on it. Pure SVG over an <img>, so it
 * scales to any width and prints crisp. Works in server components.
 */
export default function AnnotatedFrame({
  src, pose, annotations, w, h, className, skeleton = true, alt = "",
}: {
  src: string; pose: Pose | null; annotations: Annotation[]; w: number; h: number; className?: string; skeleton?: boolean; alt?: string;
}) {
  const W = w || 1024, H = h || Math.round((w || 1024) * 9 / 16);
  const aspect = W / H;
  const prims: Primitive[] = pose ? momentPrimitives(pose, annotations, aspect, skeleton) : [];
  const fs = Math.max(13, Math.min(18, W / 56));
  const sw = W / 520;
  return (
    <div className={`relative overflow-hidden bg-black ${className ?? ""}`} style={{ aspectRatio: `${W} / ${H}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
        {prims.map((p, i) => {
          const col = STATUS_COLOR[p.status];
          switch (p.kind) {
            case "line":
              return <line key={i} x1={p.a.x * W} y1={p.a.y * H} x2={p.b.x * W} y2={p.b.y * H} stroke={col} strokeWidth={(p.width ?? 2) * sw} strokeDasharray={p.dashed ? `${5 * sw} ${4 * sw}` : undefined} strokeLinecap="round" opacity={p.status === "note" && !p.dashed ? 0.55 : 0.95} />;
            case "dot":
              return <circle key={i} cx={p.p.x * W} cy={p.p.y * H} r={(p.r ?? 3) * sw} fill={col} opacity={p.status === "note" ? 0.7 : 1} />;
            case "arc":
              return <path key={i} d={arcPath(p.c.x * W, p.c.y * H, p.r * H, p.start, p.end)} stroke={col} strokeWidth={2 * sw} fill="none" />;
            case "ghost": {
              const d = p.pts.map((q, k) => `${k === 0 ? "M" : "L"} ${(q.x * W).toFixed(1)} ${(q.y * H).toFixed(1)}`).join(" ");
              const e = p.pts[p.pts.length - 1];
              return (
                <g key={i}>
                  <path d={d} stroke={col} strokeWidth={9 * sw} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.22} />
                  <path d={d} stroke={col} strokeWidth={2.2 * sw} strokeLinecap="round" strokeDasharray={`${6 * sw} ${5 * sw}`} fill="none" opacity={0.95} />
                  <circle cx={e.x * W} cy={e.y * H} r={6 * sw} fill={col} opacity={0.28} />
                  <circle cx={e.x * W} cy={e.y * H} r={3 * sw} fill={col} />
                </g>
              );
            }
            case "arrow": {
              const ax = p.a.x * W, ay = p.a.y * H, bx = p.b.x * W, by = p.b.y * H;
              const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, hd = 7 * sw;
              return (
                <g key={i}>
                  <line x1={ax} y1={ay} x2={bx - ux * hd} y2={by - uy * hd} stroke={col} strokeWidth={2.2 * sw} strokeLinecap="round" />
                  <path d={`M ${bx} ${by} L ${bx - ux * hd * 1.8 + uy * hd * 0.9} ${by - uy * hd * 1.8 - ux * hd * 0.9} L ${bx - ux * hd * 1.8 - uy * hd * 0.9} ${by - uy * hd * 1.8 + ux * hd * 0.9} Z`} fill={col} />
                </g>
              );
            }
            case "label": {
              const tw = p.text.length * fs * 0.58 + 14;
              let x = p.p.x * W, y = p.p.y * H + (p.dy ?? 0);
              if (p.anchor === "middle") x -= tw / 2; else if (p.anchor === "end") x -= tw;
              x = Math.max(6, Math.min(W - tw - 6, x)); y = Math.max(6, Math.min(H - fs - 14, y - fs / 2 - 6));
              return (
                <g key={i}>
                  <rect x={x} y={y} width={tw} height={fs + 12} rx={6} fill="#09090B" opacity={0.84} />
                  <rect x={x} y={y} width={3} height={fs + 12} rx={1.5} fill={col} />
                  <text x={x + 10} y={y + fs + 2} fill="#fff" fontSize={fs} fontWeight={600} fontFamily="Inter, system-ui, sans-serif">{p.text}</text>
                </g>
              );
            }
          }
        })}
      </svg>
    </div>
  );
}
