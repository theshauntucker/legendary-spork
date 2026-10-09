/**
 * RoutineX Spotlight — PDF renderer (server only).
 *
 * Built with @react-pdf/renderer so it runs inside a Vercel function with no
 * headless browser. Dark, editorial, one idea per page. Every frame carries
 * the same measured annotations the web report shows; the geometry comes
 * from annotations.ts so the two never drift apart.
 */
import React from "react";
import fs from "node:fs";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Document, Page, View, Text, Image, Svg, Line, Circle, Path, Rect, Text as SvgText, Font, renderToBuffer, StyleSheet,
} from "@react-pdf/renderer";
import { STATUS_COLOR, arcPath, momentPrimitives, type Primitive } from "./annotations";
import { formatTime } from "./landmarks";
import type { SpotlightFrame, SpotlightReport, SpotlightRow } from "./types";

// ── Fonts ────────────────────────────────────────────────────────────────────
let fontsReady = false;
function registerFonts() {
  if (fontsReady) return;
  const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";
  const local = path.join(process.cwd(), "public", "fonts");
  const src = (file: string) => (fs.existsSync(path.join(local, file)) ? path.join(local, file) : `${base}/fonts/${file}`);
  Font.register({
    family: "Inter",
    fonts: [
      { src: src("Inter-Regular.ttf"), fontWeight: 400 },
      { src: src("Inter-Medium.ttf"), fontWeight: 500 },
      { src: src("Inter-SemiBold.ttf"), fontWeight: 600 },
      { src: src("Inter-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Playfair",
    fonts: [
      { src: src("PlayfairDisplay-Regular.ttf"), fontWeight: 400 },
      { src: src("PlayfairDisplay-SemiBold.ttf"), fontWeight: 600 },
      { src: src("PlayfairDisplay-Bold.ttf"), fontWeight: 700 },
      { src: src("PlayfairDisplay-ExtraBold.ttf"), fontWeight: 800 },
    ],
  });
  Font.registerHyphenationCallback((w) => [w]);
  fontsReady = true;
}

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#09090B", panel: "#121214", panel2: "#18181B", line: "#27272A",
  text: "#FAFAFA", muted: "#A1A1AA", faint: "#71717A", label: "#C084FC",
  pink: "#EC4899", orange: "#F97316", gold: "#FBBF24", good: "#FBBF24", fix: "#F472B6",
};

const PAGE_W = 612, PAGE_H = 792, M = 40;

const s = StyleSheet.create({
  page: { backgroundColor: C.bg, color: C.text, fontFamily: "Inter", fontSize: 10.5, paddingTop: 44, paddingBottom: 48, paddingHorizontal: M },
  eyebrow: { fontSize: 8.5, letterSpacing: 2, textTransform: "uppercase", color: C.label, fontWeight: 700 },
  h1: { fontFamily: "Playfair", fontSize: 30, fontWeight: 700, lineHeight: 1.15, marginTop: 8 },
  h2: { fontFamily: "Playfair", fontSize: 20, fontWeight: 700, lineHeight: 1.2, marginTop: 6 },
  h3: { fontSize: 12.5, fontWeight: 700, marginBottom: 4 },
  body: { fontSize: 10.5, lineHeight: 1.55, color: "#D4D4D8" },
  muted: { fontSize: 9.5, lineHeight: 1.5, color: C.muted },
  card: { backgroundColor: C.panel, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: C.line },
  rule: { height: 1, backgroundColor: C.line, marginVertical: 12 },
  gradBar: { height: 3, borderRadius: 2 },
  footer: { position: "absolute", bottom: 22, left: M, right: M, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footText: { fontSize: 8, color: C.faint },
  chip: { fontSize: 8.5, color: C.text, backgroundColor: C.panel2, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: C.line },
});

/** Sunset gradient as three stacked bars — react-pdf has no CSS gradients. */
const GradBar = ({ width = 72 }: { width?: number }) => (
  <Svg width={width} height={3}>
    <Rect x={0} y={0} width={width * 0.4} height={3} fill={C.pink} />
    <Rect x={width * 0.38} y={0} width={width * 0.3} height={3} fill={C.orange} />
    <Rect x={width * 0.66} y={0} width={width * 0.34} height={3} fill={C.gold} />
  </Svg>
);

const Footer = ({ dancer, page }: { dancer: string; page?: string }) => (
  <View style={s.footer} fixed>
    <Text style={s.footText}>RoutineX Spotlight · {dancer}</Text>
    <Text style={s.footText} render={({ pageNumber, totalPages }) => `${page ? page + " · " : ""}${pageNumber} / ${totalPages}`} />
  </View>
);

// ── Annotated frame ──────────────────────────────────────────────────────────
function AnnotatedFrame({ frame, src, prims, width }: { frame: SpotlightFrame; src: string; prims: Primitive[]; width: number }) {
  const aspect = frame.w && frame.h ? frame.w / frame.h : 16 / 9;
  const W = width, H = Math.round(width / aspect);
  const X = (x: number) => x * W, Y = (y: number) => y * H;
  const fs = Math.max(7.5, Math.min(10, W / 52));
  return (
    <View style={{ width: W, height: H, borderRadius: 10, overflow: "hidden", backgroundColor: "#000" }}>
      <Image src={src} style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover" }} />
      <Svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0 }}>
        {prims.map((p, i) => {
          const col = STATUS_COLOR[p.status];
          switch (p.kind) {
            case "line":
              return <Line key={i} x1={X(p.a.x)} y1={Y(p.a.y)} x2={X(p.b.x)} y2={Y(p.b.y)} stroke={col} strokeWidth={(p.width ?? 2) * (W / 520)} strokeDasharray={p.dashed ? "5 4" : undefined} strokeLinecap="round" opacity={p.status === "note" && !p.dashed ? 0.55 : 0.95} />;
            case "dot":
              return <Circle key={i} cx={X(p.p.x)} cy={Y(p.p.y)} r={(p.r ?? 3) * (W / 520)} fill={col} opacity={p.status === "note" ? 0.7 : 1} />;
            case "arc":
              return <Path key={i} d={arcPath(X(p.c.x), Y(p.c.y), p.r * H, p.start, p.end)} stroke={col} strokeWidth={2 * (W / 520)} fill="none" />;
            case "ghost": {
              const d = p.pts.map((q, k) => `${k === 0 ? "M" : "L"} ${X(q.x).toFixed(1)} ${Y(q.y).toFixed(1)}`).join(" ");
              const e = p.pts[p.pts.length - 1];
              return (
                <React.Fragment key={i}>
                  <Path d={d} stroke={col} strokeWidth={9 * (W / 520)} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.22} />
                  <Path d={d} stroke={col} strokeWidth={2.2 * (W / 520)} strokeLinecap="round" strokeDasharray="6 5" fill="none" opacity={0.95} />
                  <Circle cx={X(e.x)} cy={Y(e.y)} r={6 * (W / 520)} fill={col} opacity={0.28} />
                  <Circle cx={X(e.x)} cy={Y(e.y)} r={3 * (W / 520)} fill={col} />
                </React.Fragment>
              );
            }
            case "arrow": {
              const dx = X(p.b.x) - X(p.a.x), dy = Y(p.b.y) - Y(p.a.y), L = Math.hypot(dx, dy) || 1;
              const ux = dx / L, uy = dy / L, hx = X(p.b.x), hy = Y(p.b.y), h = 7 * (W / 520);
              return (
                <React.Fragment key={i}>
                  <Line x1={X(p.a.x)} y1={Y(p.a.y)} x2={hx - ux * h} y2={hy - uy * h} stroke={col} strokeWidth={2.2 * (W / 520)} strokeLinecap="round" />
                  <Path d={`M ${hx} ${hy} L ${hx - ux * h * 1.8 + uy * h * 0.9} ${hy - uy * h * 1.8 - ux * h * 0.9} L ${hx - ux * h * 1.8 - uy * h * 0.9} ${hy - uy * h * 1.8 + ux * h * 0.9} Z`} fill={col} />
                </React.Fragment>
              );
            }
            case "label": {
              const tw = p.text.length * fs * 0.56 + 10;
              let x = X(p.p.x), y = Y(p.p.y) + (p.dy ?? 0);
              if (p.anchor === "middle") x -= tw / 2; else if (p.anchor === "end") x -= tw;
              x = Math.max(4, Math.min(W - tw - 4, x)); y = Math.max(4, Math.min(H - fs - 10, y - fs / 2 - 4));
              return (
                <React.Fragment key={i}>
                  <Rect x={x} y={y} width={tw} height={fs + 8} rx={4} ry={4} fill="#09090B" opacity={0.82} />
                  <Rect x={x} y={y} width={2.5} height={fs + 8} fill={col} />
                  <SvgText x={x + 7} y={y + fs + 1.5} fill="#FFFFFF" style={{ fontFamily: "Inter", fontSize: fs, fontWeight: 600 }}>{p.text}</SvgText>
                </React.Fragment>
              );
            }
          }
        })}
      </Svg>
    </View>
  );
}

const Stars = ({ score }: { score: number }) => {
  const pct = Math.max(0, Math.min(1, score / 10));
  return (
    <View style={{ height: 5, backgroundColor: C.panel2, borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
      <View style={{ width: `${pct * 100}%`, height: 5, backgroundColor: pct >= 0.8 ? C.gold : pct >= 0.6 ? C.orange : C.pink }} />
    </View>
  );
};

// ── Document ─────────────────────────────────────────────────────────────────
function SpotlightDoc({ row, report, imgs }: { row: SpotlightRow; report: SpotlightReport; imgs: Map<number, string> }) {
  const frames = row.frames;
  const first = report.dancer.name.split(" ")[0];
  const date = new Date(row.ready_at || row.created_at || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const heroMoment = report.moments.find((m) => imgs.has(m.frame)) ?? report.moments[0];
  const primsFor = (m: { frame: number; annotations: SpotlightReport["moments"][number]["annotations"] }) => {
    const f = frames[m.frame];
    if (!f?.pose) return [];
    return momentPrimitives(f.pose, m.annotations, f.w && f.h ? f.w / f.h : 16 / 9, true);
  };
  const frameW = PAGE_W - M * 2;
  const logo = path.join(process.cwd(), "public", "sunset-x-on-dark.png");
  const logoSrc = fs.existsSync(logo) ? logo : `${process.env.NEXT_PUBLIC_SITE_URL || "https://routinex.org"}/sunset-x-on-dark.png`;

  return (
    <Document title={`RoutineX Spotlight — ${report.dancer.name}`} author="RoutineX" subject={report.headline}>
      {/* Cover */}
      <Page size="LETTER" style={s.page}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image src={logoSrc} style={{ width: 28, height: 28, marginRight: 8 }} />
            <Text style={{ fontSize: 12, fontWeight: 700 }}>RoutineX <Text style={{ color: C.gold }}>Spotlight</Text></Text>
          </View>
          <Text style={s.muted}>{date}</Text>
        </View>
        <View style={{ marginTop: 44 }}>
          <Text style={s.eyebrow}>AI breakdown · practice tool · {report.dancer.style}{report.dancer.division ? ` · ${report.dancer.division}` : ""}</Text>
          <Text style={[s.h1, { fontSize: 44, marginTop: 10 }]}>{report.dancer.name}</Text>
          {report.dancer.routine ? <Text style={[s.muted, { marginTop: 4, fontSize: 11 }]}>“{report.dancer.routine}”</Text> : null}
          <View style={{ marginTop: 14 }}><GradBar width={96} /></View>
          <Text style={{ fontFamily: "Playfair", fontSize: 17, lineHeight: 1.35, marginTop: 16, color: "#E4E4E7" }}>{report.headline}</Text>
        </View>
        {heroMoment && imgs.has(heroMoment.frame) ? (
          <View style={{ marginTop: 26 }}>
            <AnnotatedFrame frame={frames[heroMoment.frame]} src={imgs.get(heroMoment.frame)!} prims={primsFor(heroMoment)} width={frameW} />
            <Text style={[s.muted, { marginTop: 8 }]}>{heroMoment.title} · {formatTime(frames[heroMoment.frame].t)} — lines and angles measured on {first}&apos;s own frame.</Text>
          </View>
        ) : null}
        <View style={{ position: "absolute", bottom: 60, left: M, right: M, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={s.footText}>AI breakdown · not an official score · {row.frame_count} frames</Text>
          <Text style={s.footText}>routinex.org/spotlight</Text>
        </View>
      </Page>

      {/* Overview */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.eyebrow}>What the frames show</Text>
        <Text style={s.h2}>AI breakdown</Text>
        <View style={{ marginTop: 12 }}>
          {report.opening.split(/\n+/).filter(Boolean).map((p, i) => <Text key={i} style={[s.body, { marginBottom: 8 }]}>{p}</Text>)}
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          {[["Where she is today", report.verdict.current], ["Where this takes her", report.verdict.potential], ["Timeline", report.verdict.timeline]].map(([t, b], i) => (
            <View key={i} style={[s.card, { flex: 1 }]}>
              <Text style={[s.eyebrow, { fontSize: 7.5 }]}>{t}</Text>
              <Text style={[s.body, { marginTop: 6, fontSize: 10 }]}>{b}</Text>
            </View>
          ))}
        </View>
        <View style={s.rule} />
        <Text style={s.eyebrow}>Seven things the judges score</Text>
        <View style={{ marginTop: 10, gap: 8 }}>
          {report.categories.map((c) => (
            <View key={c.key} style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View style={{ width: 150 }}>
                <Text style={{ fontSize: 11, fontWeight: 600 }}>{c.name}</Text>
                <Stars score={c.score} />
              </View>
              <Text style={{ width: 44, fontFamily: "Playfair", fontSize: 18, fontWeight: 700, textAlign: "right", marginRight: 14, color: c.score >= 8 ? C.gold : C.text }}>{c.score.toFixed(1)}</Text>
              <Text style={[s.muted, { flex: 1 }]}>{c.summary}</Text>
            </View>
          ))}
        </View>
        <Footer dancer={report.dancer.name} page="Overview" />
      </Page>

      {/* Strengths + Priorities */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.eyebrow}>Keep doing this</Text>
        <Text style={s.h2}>What is already scoring</Text>
        <View style={{ marginTop: 12, gap: 8 }}>
          {report.strengths.map((st, i) => (
            <View key={i} style={[s.card, { flexDirection: "row", gap: 12 }]}>
              {st.frame != null && imgs.has(st.frame) ? <Image src={imgs.get(st.frame)!} style={{ width: 84, height: 84, borderRadius: 6, objectFit: "cover" }} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={[s.h3, { color: C.gold }]}>{st.title}</Text>
                <Text style={s.body}>{st.detail}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={s.rule} />
        <Text style={s.eyebrow}>Fix these first</Text>
        <Text style={s.h2}>Priorities, in order</Text>
        <View style={{ marginTop: 12, gap: 8 }}>
          {report.priorities.map((p) => (
            <View key={p.rank} style={[s.card, { flexDirection: "row", gap: 12 }]}>
              <Text style={{ fontFamily: "Playfair", fontSize: 26, fontWeight: 800, color: C.fix, width: 26 }}>{p.rank}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.h3}>{p.title}</Text>
                <Text style={s.body}>{p.why}</Text>
                <Text style={[s.muted, { marginTop: 5 }]}>Cue: <Text style={{ color: C.text, fontWeight: 600 }}>“{p.cue}”</Text></Text>
              </View>
            </View>
          ))}
        </View>
        <Footer dancer={report.dancer.name} page="Priorities" />
      </Page>

      {/* Moments — one per page */}
      {report.moments.map((m, idx) => {
        const f = frames[m.frame];
        if (!f || !imgs.has(m.frame)) return null;
        const portrait = f.h > f.w;
        const w = portrait ? Math.round((PAGE_H - 260) * (f.w / f.h)) : frameW;
        return (
          <Page key={idx} size="LETTER" style={s.page}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
              <View>
                <Text style={s.eyebrow}>Moment {idx + 1} of {report.moments.length} · {formatTime(f.t)}</Text>
                <Text style={s.h2}>{m.title}</Text>
              </View>
              <Text style={[s.muted, { maxWidth: 200, textAlign: "right" }]}>{m.skill}</Text>
            </View>
            <View style={{ marginTop: 12, flexDirection: portrait ? "row" : "column", gap: 14 }}>
              <AnnotatedFrame frame={f} src={imgs.get(m.frame)!} prims={primsFor(m)} width={w} />
              <View style={portrait ? { flex: 1 } : { width: frameW }}>
                <Text style={[s.body, { marginTop: portrait ? 0 : 4 }]}>{m.analysis}</Text>
                <View style={{ flexDirection: portrait ? "column" : "row", gap: 10, marginTop: 12 }}>
                  {m.working.length ? (
                    <View style={[s.card, portrait ? {} : { width: m.fix.length ? (frameW - 10) / 2 : frameW }, { borderColor: "#3f3a1f" }]}>
                      <Text style={[s.eyebrow, { color: C.gold, fontSize: 7.5 }]}>Working</Text>
                      {m.working.map((t, i) => <Text key={i} style={[s.body, { fontSize: 9.8, marginTop: 4 }]}>• {t}</Text>)}
                    </View>
                  ) : null}
                  {m.fix.length ? (
                    <View style={[s.card, portrait ? {} : { width: m.working.length ? (frameW - 10) / 2 : frameW }, { borderColor: "#4a2238" }]}>
                      <Text style={[s.eyebrow, { color: C.fix, fontSize: 7.5 }]}>Change</Text>
                      {m.fix.map((t, i) => <Text key={i} style={[s.body, { fontSize: 9.8, marginTop: 4 }]}>• {t}</Text>)}
                    </View>
                  ) : null}
                </View>
                {f.metrics ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                    {measurementChips(f).map((c, i) => <Text key={i} style={s.chip}>{c}</Text>)}
                  </View>
                ) : null}
              </View>
            </View>
            <Footer dancer={report.dancer.name} page="Key moments" />
          </Page>
        );
      })}

      {/* Drills */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.eyebrow}>Homework</Text>
        <Text style={s.h2}>Drills that fix the priorities</Text>
        <Text style={[s.muted, { marginTop: 6 }]}>No equipment. Living room, hallway, or the studio before class. Each one is tied to a priority above.</Text>
        <View style={{ marginTop: 12, gap: 8 }}>
          {report.drills.map((d, i) => (
            <View key={i} style={s.card} wrap={false}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Text style={s.h3}>{i + 1}. {d.name}</Text>
                <Text style={[s.chip, { color: C.gold }]}>{d.dose}</Text>
              </View>
              <Text style={[s.muted, { marginBottom: 4 }]}>Targets: {d.targets}</Text>
              <Text style={s.body}>{d.how}</Text>
              <Text style={[s.muted, { marginTop: 5 }]}>Cue: <Text style={{ color: C.text, fontWeight: 600 }}>“{d.cue}”</Text></Text>
            </View>
          ))}
        </View>
        <Footer dancer={report.dancer.name} page="Drills" />
      </Page>

      {/* Judge's card + next time on stage */}
      {(report.judgesCard?.length || report.onStage?.length) ? (
        <Page size="LETTER" style={s.page}>
          {report.judgesCard && report.judgesCard.length > 0 && (
            <View>
              <Text style={s.eyebrow}>Practice read</Text>
              <Text style={s.h2}>How this might read</Text>
              <Text style={[s.muted, { marginTop: 6 }]}>An illustrative split — technique, performance, choreography, presentation, overall — with a practical note for each line. An AI estimate, not an official sheet and not weighted to a specific competition.</Text>
              <View style={[s.card, { marginTop: 12, padding: 0 }]}>
                {report.judgesCard.map((j, i) => {
                  const pts = Math.round((j.score / 10) * j.weight * 10) / 10;
                  return (
                    <View key={i} style={{ flexDirection: "row", gap: 10, paddingHorizontal: 14, paddingVertical: 9, borderTopWidth: i ? 1 : 0, borderTopColor: C.line, alignItems: "flex-start" }} wrap={false}>
                      <View style={{ width: 120 }}>
                        <Text style={{ fontSize: 10, fontWeight: 700 }}>{j.name}</Text>
                        <Text style={[s.muted, { fontSize: 8 }]}>{j.weight} pts in this split</Text>
                      </View>
                      <Text style={[s.body, { flex: 1, fontSize: 9.8 }]}>“{j.note}”</Text>
                      <View style={{ width: 54, alignItems: "flex-end" }}>
                        <Text style={{ fontFamily: "Playfair", fontSize: 15, color: C.gold }}>{pts}<Text style={{ fontSize: 8, color: C.faint }}>/{j.weight}</Text></Text>
                        <View style={{ marginTop: 3, width: 54, height: 3, borderRadius: 2, backgroundColor: C.panel2 }}>
                          <View style={{ width: Math.round((j.score / 10) * 54), height: 3, borderRadius: 2, backgroundColor: C.pink }} />
                        </View>
                      </View>
                    </View>
                  );
                })}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 14, paddingVertical: 9, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.panel2 }}>
                  <Text style={s.muted}>Illustrative total on a 100-point practice split</Text>
                  <Text style={{ fontFamily: "Playfair", fontSize: 20 }}>{Math.round(report.judgesCard.reduce((a, j) => a + (j.score / 10) * j.weight, 0))}<Text style={{ fontSize: 9, color: C.faint }}>/100</Text></Text>
                </View>
              </View>
              <Text style={[s.footText, { marginTop: 6 }]}>These weights are an illustration for this AI breakdown (technique 40 · performance 30 · choreography 15 · presentation 10 · overall 5), not a claim about how any competition prints its sheet. The notes are the part to practice.</Text>
            </View>
          )}
          {report.onStage && report.onStage.length > 0 && (
            <View style={{ marginTop: 18 }}>
              <Text style={s.eyebrow}>For {first}</Text>
              <Text style={s.h2}>Next time on stage</Text>
              <Text style={[s.muted, { marginTop: 4 }]}>Competition day, in order. Read it the night before, then once more in the hallway.</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {report.onStage.map((o, i) => (
                  <View key={i} style={[s.card, { width: (frameW - 16) / 3, padding: 11 }]} wrap={false}>
                    <Text style={[s.eyebrow, { fontSize: 7 }]}>{i + 1} · {o.moment.replace(/-/g, " ")}</Text>
                    <Text style={[s.h3, { fontSize: 11, marginTop: 3 }]}>{o.title}</Text>
                    <Text style={[s.body, { fontSize: 9.4 }]}>{o.cue}</Text>
                  </View>
                ))}
              </View>
              {report.forParent && report.forParent.length > 0 && (
                <View style={[s.card, { marginTop: 10, backgroundColor: "transparent" }]}>
                  <Text style={s.eyebrow}>For the parent</Text>
                  {report.forParent.map((t, i) => <Text key={i} style={[s.body, { fontSize: 9.8, marginTop: 4 }]}>— {t}</Text>)}
                </View>
              )}
            </View>
          )}
          <Footer dancer={report.dancer.name} page="Judge&apos;s card" />
        </Page>
      ) : null}

      {/* Plan + closing */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.eyebrow}>The next four weeks</Text>
        <Text style={s.h2}>Training plan</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          {report.plan.map((w) => (
            <View key={w.week} style={[s.card, { width: (frameW - 10) / 2 }]}>
              <Text style={[s.eyebrow, { fontSize: 7.5 }]}>Week {w.week}</Text>
              <Text style={[s.h3, { marginTop: 4 }]}>{w.focus}</Text>
              {w.plan.map((t, i) => <Text key={i} style={[s.body, { fontSize: 9.8, marginTop: 3 }]}>• {t}</Text>)}
            </View>
          ))}
        </View>
        <View style={[s.card, { marginTop: 16, backgroundColor: "#141018", borderColor: "#3b2a4a" }]}>
          <Text style={s.eyebrow}>A note for {first}</Text>
          <Text style={[s.body, { marginTop: 8, fontFamily: "Playfair", fontSize: 12, lineHeight: 1.5, color: C.text }]}>{report.closing}</Text>
        </View>
        <View style={s.rule} />
        <Text style={s.eyebrow}>Glossary</Text>
        <View style={{ marginTop: 8, gap: 3 }}>
          {report.glossary.map((g, i) => <Text key={i} style={[s.muted, { fontSize: 9.5 }]}><Text style={{ color: C.text, fontWeight: 600 }}>{g.term}</Text> — {g.meaning}</Text>)}
        </View>
        <Text style={[s.footText, { marginTop: 16, lineHeight: 1.5 }]}>How to read the numbers: this is an AI breakdown from RoutineX, not a note from a human coach and not an official score. Every angle and line in this report is measured from the frames of this video using on-device pose tracking, projected from the camera&apos;s point of view. A different camera angle will read slightly differently; trends across moments matter more than any single degree. Frames the report doesn&apos;t use are deleted after it is built. Questions: reply to the email this came with.</Text>
        <Footer dancer={report.dancer.name} page="Plan" />
      </Page>
    </Document>
  );
}

function measurementChips(f: SpotlightFrame): string[] {
  const m = f.metrics!;
  const chips: string[] = [];
  const lift = Math.max(m.legElevation.left, m.legElevation.right);
  if (lift > 30) chips.push(`leg lift ${Math.round(lift)}°`);
  if (m.splitAngle > 90) chips.push(`split ${Math.round(m.splitAngle)}°`);
  chips.push(`knees ${Math.round(m.jointAngles.left_knee)}° / ${Math.round(m.jointAngles.right_knee)}°`);
  chips.push(`torso lean ${Math.abs(Math.round(m.torsoLean))}°`);
  chips.push(`shoulders ${Math.abs(Math.round(m.shoulderTilt))}° · hips ${Math.abs(Math.round(m.hipTilt))}°`);
  if (m.support !== "both") chips.push(`on the ${m.support} leg`);
  return chips;
}

/** Download the frames the report uses and render the PDF to a Buffer. */
export async function renderSpotlightPdf(row: SpotlightRow, svc: SupabaseClient): Promise<Buffer> {
  registerFonts();
  const report = row.report!;
  const needed = new Set<number>();
  report.moments.forEach((m) => needed.add(m.frame));
  report.strengths.forEach((st) => st.frame != null && needed.add(st.frame));
  const imgs = new Map<number, string>();
  for (const i of needed) {
    const f = row.frames[i];
    if (!f) continue;
    const src = await loadFrame(f.path, svc);
    if (src) imgs.set(i, src);
  }
  const buf = await renderToBuffer(<SpotlightDoc row={row} report={report} imgs={imgs} />);
  return Buffer.from(buf);
}

async function loadFrame(p: string, svc: SupabaseClient): Promise<string | null> {
  if (/^https?:\/\//.test(p)) return p;
  if (p.startsWith("/")) { // public sample asset
    const local = path.join(process.cwd(), "public", p);
    if (fs.existsSync(local)) return local;
    return `${process.env.NEXT_PUBLIC_SITE_URL || "https://routinex.org"}${p}`;
  }
  const { data, error } = await svc.storage.from("videos").download(p);
  if (error || !data) return null;
  return `data:image/jpeg;base64,${Buffer.from(await data.arrayBuffer()).toString("base64")}`;
}
