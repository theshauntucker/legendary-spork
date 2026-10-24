import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReportView from "@/components/spotlight/ReportView";
import { renderSpotlightPdf } from "./pdf";
import { practiceScale } from "./judges-card";
import type { JudgesCardLine, SpotlightReport, SpotlightRow } from "./types";

function line(partial: Partial<JudgesCardLine> & Pick<JudgesCardLine, "category" | "weight">): JudgesCardLine {
  return {
    name: partial.name ?? partial.category,
    score: partial.score ?? 8,
    note: partial.note ?? "A judge's sentence.",
    ...partial,
  };
}

const classic: JudgesCardLine[] = [
  line({ category: "technique", name: "Technique", weight: 40 }),
  line({ category: "performance", name: "Performance quality", weight: 30 }),
  line({ category: "choreography", name: "Choreography & musicality", weight: 15 }),
  line({ category: "presentation", name: "Presentation", weight: 10 }),
  line({ category: "overall", name: "Overall impression", weight: 5 }),
];

const withExecution: JudgesCardLine[] = [
  line({ category: "technique", name: "Technique", weight: 25 }),
  line({ category: "execution", name: "Execution & precision", weight: 15 }),
  line({ category: "performance", name: "Performance", weight: 30 }),
  line({ category: "choreography", name: "Choreography", weight: 15 }),
  line({ category: "presentation", name: "Presentation", weight: 10 }),
  line({ category: "overall", name: "Overall", weight: 5 }),
];

describe("practiceScale", () => {
  it("reads the weights stored on a classic five-line card", () => {
    const scale = practiceScale(classic);
    expect(scale?.split).toBe("technique 40 · performance quality 30 · choreography & musicality 15 · presentation 10 · overall impression 5");
    expect(scale?.total).toBe(100);
    expect(scale?.outOf).toBe("100");
    expect(scale?.note).toContain("technique 40");
    expect(scale?.note).toContain("used for this estimate");
    expect(scale?.note).not.toMatch(/technique 40 · performance 30 · choreography 15 · presentation 10 · overall 5/);
  });

  it("keeps 40/30/15/10/5 when that is the split stored on the report", () => {
    const scale = practiceScale([
      line({ category: "technique", name: "Technique", weight: 40 }),
      line({ category: "performance", name: "Performance", weight: 30 }),
      line({ category: "choreography", name: "Choreography", weight: 15 }),
      line({ category: "presentation", name: "Presentation", weight: 10 }),
      line({ category: "overall", name: "Overall", weight: 5 }),
    ]);
    expect(scale?.split).toBe("technique 40 · performance 30 · choreography 15 · presentation 10 · overall 5");
    expect(scale?.outOf).toBe("100");
  });

  it("prints a 25 + 15 technique split instead of the fixed 40-point line", () => {
    const scale = practiceScale(withExecution);
    expect(scale?.split).toBe("technique 25 · execution & precision 15 · performance 30 · choreography 15 · presentation 10 · overall 5");
    expect(scale?.total).toBe(100);
    expect(scale?.note).not.toContain("technique 40");
  });

  it("uses weights that do not sum to 100", () => {
    const scale = practiceScale([
      line({ category: "technique", weight: 60 }),
      line({ category: "performance", weight: 1 }),
      line({ category: "choreography", weight: 1 }),
      line({ category: "presentation", weight: 1 }),
      line({ category: "overall", weight: 1 }),
    ]);
    expect(scale?.outOf).toBe("64");
    expect(scale?.split.startsWith("technique 60")).toBe(true);
  });

  it("accepts a numeric weight stored as a string", () => {
    const scale = practiceScale([line({ category: "technique", name: "Technique", weight: "25" as unknown as number })]);
    expect(scale?.split).toBe("technique 25");
    expect(scale?.outOf).toBe("25");
  });

  it("drops the note when any line is missing a usable weight or label", () => {
    expect(practiceScale(undefined)).toBeNull();
    expect(practiceScale([])).toBeNull();
    expect(practiceScale([line({ category: "technique", weight: 0 })])).toBeNull();
    expect(practiceScale([line({ category: "technique", weight: Number.NaN })])).toBeNull();
    expect(practiceScale([{ ...line({ category: "technique", weight: 40 }), name: "  ", category: "" as JudgesCardLine["category"] }])).toBeNull();
    const partial = practiceScale([
      line({ category: "technique", weight: 25 }),
      line({ category: "execution", weight: undefined as unknown as number }),
    ]);
    expect(partial).toBeNull();
  });
});

function reportWith(card: JudgesCardLine[] | undefined): SpotlightReport {
  return {
    version: 1,
    dancer: { name: "Avery Cole", style: "Jazz" },
    headline: "A clean jazz read with one fix that scores.",
    opening: "Opening paragraph that is long enough to stand as the read for this fixture report.",
    verdict: { current: "Strong lines.", potential: "Cleaner finishes.", timeline: "Four weeks." },
    categories: [],
    strengths: [],
    priorities: [],
    moments: [],
    drills: [],
    plan: [],
    closing: "Keep the work specific.",
    glossary: [],
    judgesCard: card,
  };
}

describe("ReportView judge card", () => {
  it("shows the stored split and the real point total", () => {
    const html = renderToStaticMarkup(createElement(ReportView, {
      report: reportWith(withExecution),
      frames: [],
      urls: {},
      meta: { date: "May 1, 2026", frameCount: 12, trackedFrames: 10 },
    }));
    expect(html).toContain("technique 25 · execution &amp; precision 15 · performance 30 · choreography 15 · presentation 10 · overall 5");
    expect(html).not.toContain("technique 40");
    expect(html).toContain(">/100<");
  });

  it("drops the static note when weights are not stored, and keeps the 100-point fallback", () => {
    const html = renderToStaticMarkup(createElement(ReportView, {
      report: reportWith([
        line({ category: "technique", weight: 40 }),
        line({ category: "performance", weight: undefined as unknown as number }),
      ]),
      frames: [],
      urls: {},
      meta: { date: "May 1, 2026", frameCount: 12, trackedFrames: 10 },
    }));
    expect(html).not.toContain("The split used for this estimate");
    expect(html).not.toContain("technique 40 · performance 30");
    expect(html).toContain("out of 100");
    expect(html).toContain(">/100<");
  });

  it("labels the total with the sum of the weights that were used", () => {
    const html = renderToStaticMarkup(createElement(ReportView, {
      report: reportWith([
        line({ category: "technique", name: "Technique", weight: 60, score: 10 }),
        line({ category: "performance", name: "Performance", weight: 20, score: 5 }),
      ]),
      frames: [],
      urls: {},
      meta: { date: "May 1, 2026", frameCount: 12, trackedFrames: 10 },
    }));
    expect(html).toContain("technique 60 · performance 20");
    expect(html).toContain("out of 80");
    expect(html).toContain(">/80<");
    expect(html).toContain(">70<");
  });
});

function pdfText(buf: Buffer): string {
  const dir = mkdtempSync(path.join(tmpdir(), "spotlight-pdf-"));
  try {
    const file = path.join(dir, "report.pdf");
    writeFileSync(file, buf);
    return execFileSync("pdftotext", ["-layout", file, "-"], { encoding: "utf8" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const canReadPdf = (() => {
  try {
    execFileSync("which", ["pdftotext"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

describe.skipIf(!canReadPdf)("Spotlight PDF judge card", () => {
  it("prints the stored split and omits the fixed 40/30/15/10/5 note", async () => {
    const row: SpotlightRow = {
      id: "r1",
      user_id: "u1",
      status: "ready",
      dancer_name: "Avery Cole",
      routine_name: null,
      style: "Jazz",
      age_division: null,
      level: null,
      focus_note: null,
      frame_count: 0,
      tracked_frames: 0,
      video_duration: null,
      frames: [],
      key_frames: null,
      report: reportWith(withExecution),
      model: "test",
      error: null,
      pdf_path: null,
      created_at: "2026-05-01T15:00:00.000Z",
      ready_at: "2026-05-01T15:00:00.000Z",
    };
    const buf = await renderSpotlightPdf(row, {} as never);
    const text = pdfText(buf);
    expect(text).toContain("technique 25");
    expect(text).toContain("execution & precision 15");
    expect(text).not.toContain("technique 40 · performance 30 · choreography 15 · presentation 10 · overall 5");
    expect(text).toContain("out of 100");
  }, 30000);

  it("omits the split note in the PDF when a weight is missing", async () => {
    const row: SpotlightRow = {
      id: "r2",
      user_id: "u1",
      status: "ready",
      dancer_name: "Avery Cole",
      routine_name: null,
      style: "Cheer",
      age_division: null,
      level: null,
      focus_note: null,
      frame_count: 0,
      tracked_frames: 0,
      video_duration: null,
      frames: [],
      key_frames: null,
      report: reportWith([
        line({ category: "technique", name: "Technique", weight: 40 }),
        line({ category: "performance", name: "Performance", weight: undefined as unknown as number }),
      ]),
      model: "test",
      error: null,
      pdf_path: null,
      created_at: "2026-05-01T15:00:00.000Z",
      ready_at: "2026-05-01T15:00:00.000Z",
    };
    const buf = await renderSpotlightPdf(row, {} as never);
    const text = pdfText(buf);
    expect(text).not.toContain("The split used for this estimate");
    expect(text).not.toContain("technique 40 · performance 30 · choreography 15 · presentation 10 · overall 5");
    expect(text).toContain("out of 100");
  }, 30000);
});
