"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Video, X, Loader2, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { startCheckout } from "@/lib/checkout";
import {
  loadPoseLandmarker, extractAndDetect, trackDancer, blurOthersAndEncode, blobToImage, spotlightFrameCount,
  type DenseFrame,
  loadVideoMetadata,
} from "@/lib/spotlight/pose-client";
import { poseBox } from "@/lib/spotlight/landmarks";

const STYLES = ["Jazz", "Contemporary", "Lyrical", "Hip Hop", "Tap", "Ballet", "Musical Theater", "Pom", "Acro", "Cheer", "Open", "Clogging", "Pointe", "Character", "Improvisation"];
const DIVISIONS = ["Mini (5–6)", "Petite (6–9)", "Junior (9–12)", "Teen (12–15)", "Senior (15–19)", "Adult (20+)"];
const LEVELS = ["Recreational", "Competitive — first season", "Competitive — 2+ seasons", "Elite / pre-professional"];

type Step = "loading" | "buy" | "form" | "extract" | "pick" | "upload" | "done" | "error";

function SpotlightNewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<Step>("loading");
  const [credits, setCredits] = useState<{ remaining: number; isAdmin: boolean }>({ remaining: 0, isAdmin: false });
  const [buying, setBuying] = useState(false);
  const [err, setErr] = useState("");

  // form
  const [file, setFile] = useState<File | null>(null);
  const [dancerName, setDancerName] = useState("");
  const [routineName, setRoutineName] = useState("");
  const [style, setStyle] = useState("");
  const [division, setDivision] = useState("");
  const [level, setLevel] = useState("");
  const [focusNote, setFocusNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [drag, setDrag] = useState(false);

  // pipeline
  const [progress, setProgress] = useState({ label: "", done: 0, total: 1 });
  const framesRef = useRef<DenseFrame[]>([]);
  const durationRef = useRef(0);
  const [pickFrame, setPickFrame] = useState<{ index: number; url: string } | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  // ── Step 0: settle purchase, load credits ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const sid = params.get("session_id");
        if (sid) {
          const r = await fetch("/api/spotlight/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sid }) });
          if (r.status === 401) { router.replace(`/login?next=${encodeURIComponent(`/spotlight/new?session_id=${sid}`)}`); return; }
        }
        const c = await fetch("/api/spotlight/credits", { cache: "no-store" });
        if (c.status === 401) { router.replace(`/login?next=${encodeURIComponent("/spotlight/new")}`); return; }
        const d = await c.json();
        setCredits({ remaining: d.credits?.remaining ?? 0, isAdmin: !!d.isAdmin });
        setStep(d.isAdmin || (d.credits?.remaining ?? 0) > 0 ? "form" : "buy");
      } catch {
        setErr("Couldn't load your account. Refresh to try again.");
        setStep("error");
      }
    })();
  }, [params, router]);

  const buy = async () => {
    setBuying(true);
    const r = await startCheckout("spotlight");
    if (!r.ok) { setErr(r.cancelled ? "" : r.error); setBuying(false); return; }
    if (!r.redirected) { // iOS: fulfilled in place
      const c = await fetch("/api/spotlight/credits", { cache: "no-store" }).then((x) => x.json());
      setCredits({ remaining: c.credits?.remaining ?? 0, isAdmin: !!c.isAdmin });
      setStep("form");
      setBuying(false);
    }
  };

  const canStart = !!file && dancerName.trim().length > 0 && !!style && consent;
  const finishRef = useRef<(refIndex: number, seed: number) => Promise<void>>(async () => {});

  // ── Step 1: extract + track on device ─────────────────────────────────
  const run = useCallback(async () => {
    if (!file) return;
    setErr("");
    setStep("extract");
    try {
      setProgress({ label: "Loading the pose tracker (one-time, ~15 MB)…", done: 0, total: 1 });
      const landmarker = await loadPoseLandmarker();
      const probe = document.createElement("video");
      probe.preload = "metadata"; probe.muted = true; probe.src = URL.createObjectURL(file);
      await loadVideoMetadata(probe, "Couldn't read this video.");
      const count = spotlightFrameCount(probe.duration);
      URL.revokeObjectURL(probe.src);
      const { frames, duration } = await extractAndDetect(file, count, landmarker, (done, total) =>
        setProgress({ label: `Tracking ${dancerName.split(" ")[0]} — frame ${done} of ${total}`, done, total })
      );
      framesRef.current = frames;
      durationRef.current = duration;

      const multi = frames.filter((f) => f.poses.length > 1);
      const withPose = frames.filter((f) => f.poses.length > 0);
      if (withPose.length < 6) throw new Error("We couldn't find a dancer in enough frames. Use a clip where her whole body stays in view and the lighting is reasonable.");
      if (multi.length > frames.length * 0.15) {
        // group video — ask which dancer
        const ref = multi.reduce((a, b) => (b.poses.length > a.poses.length ? b : a), multi[0]);
        setPickFrame({ index: ref.index, url: URL.createObjectURL(ref.blob) });
        setStep("pick");
        return;
      }
      const ref = withPose[Math.floor(withPose.length / 2)];
      await finishRef.current(ref.index, 0);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong reading the video.");
      setStep("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, dancerName]);

  // ── Step 2: track the chosen dancer, blur others, upload ──────────────
  // run() reaches this through finishRef so it always sees the CURRENT form
  // values. Calling finish directly from run() captured the version from
  // when the name was typed, and style / division / level / the focus note
  // filled in afterwards were silently dropped ("Other", blank note).
  const finish = useCallback(async (refIndex: number, seed: number) => {
    setStep("upload");
    const frames = framesRef.current;
    const track = trackDancer(frames.map((f) => ({ index: f.index, timestamp: f.timestamp, poses: f.poses })), refIndex, seed);
    const trackedCount = track.filter((t) => t >= 0).length;
    if (trackedCount < 6) { setErr("We lost track of that dancer in most frames. Try a clip where she stays in view."); setStep("error"); return; }

    setProgress({ label: "Reserving your report…", done: 0, total: frames.length });
    const startRes = await fetch("/api/spotlight/start", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dancerName, routineName, style, ageDivision: division, level, focusNote, frameCount: frames.length, duration: durationRef.current }),
    });
    const startData = await startRes.json();
    if (!startRes.ok) { setErr(startData.error || "Couldn't start the report."); setStep(startData.code === "NO_CREDIT" ? "buy" : "error"); return; }
    const { reportId, uploads } = startData as { reportId: string; uploads: Array<{ i: number; path: string; signedUrl: string; token: string }> };

    // Blur every other dancer, then upload straight to storage (4 at a time).
    const needBlur = frames.some((f) => f.poses.length > 1);
    const records: Array<{ i: number; t: number; path: string; w: number; h: number; pose: DenseFrame["poses"][number] | null }> = [];
    let done = 0;
    const queue = frames.map((f, idx) => async () => {
      const u = uploads[idx];
      let blob = f.blob;
      const keep = track[idx];
      if (needBlur && f.poses.length > 1) {
        const img = await blobToImage(f.blob);
        blob = (await blurOthersAndEncode(img, f.poses, keep)).blob;
      }
      const put = await fetch(u.signedUrl, { method: "PUT", headers: { "Content-Type": "image/jpeg", "x-upsert": "true" }, body: blob });
      if (!put.ok) throw new Error(`Upload failed on frame ${idx + 1}`);
      records.push({ i: f.index, t: f.timestamp, path: u.path, w: f.w, h: f.h, pose: keep >= 0 ? f.poses[keep] : null });
      done++;
      setProgress({ label: `Uploading frames securely — ${done} of ${frames.length}`, done, total: frames.length });
    });
    try {
      const workers = Array.from({ length: 4 }, async () => { while (queue.length) { const job = queue.shift(); if (job) await job(); } });
      await Promise.all(workers);
      setProgress({ label: "Handing off to the coach…", done: frames.length, total: frames.length });
      const comp = await fetch("/api/spotlight/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reportId, frames: records }) });
      const cd = await comp.json();
      if (!comp.ok) { setErr(cd.error || "Couldn't finish the upload."); setStep("error"); return; }
      setStep("done");
      router.push(`/spotlight/${reportId}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
      setStep("error");
    }
  }, [dancerName, routineName, style, division, level, focusNote, router]);
  finishRef.current = finish;

  const pickBoxes = useMemo(() => {
    if (!pickFrame) return [];
    const f = framesRef.current[pickFrame.index];
    return f.poses.map((p, k) => ({ k, ...poseBox(p, 0.15) }));
  }, [pickFrame]);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (!/^video\//.test(f.type) && !/\.(mp4|mov|m4v|webm)$/i.test(f.name)) { setErr("Please choose a video file (MP4 or MOV)."); return; }
    if (f.size > 800 * 1024 * 1024) { setErr("That file is over 800 MB. Trim the clip to the routine."); return; }
    setErr(""); setFile(f);
  };

  // ── UI ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#09090B] px-5 pb-24 pt-24 text-white sm:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="sl-eyebrow">RoutineX Spotlight</p>

        {step === "loading" && <div className="mt-10 flex items-center gap-3 text-zinc-400"><Loader2 className="h-5 w-5 animate-spin" />Opening your account…</div>}

        {step === "buy" && (
          <div className="mt-4">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight sm:text-5xl">One dancer. Every frame. Drawn on.</h1>
            <p className="mt-4 text-lg text-zinc-300">A private technique breakdown built from 60–80 frames of her own routine — lines and angles measured on her body, the moments a coach would freeze on, priorities, drills and a four-week plan. Delivered as a PDF you can hand to her teacher.</p>
            <ul className="mt-6 space-y-2 text-zinc-300">
              {["12–16 annotated frames with coaching marks drawn on", "Seven category scores, honest, with the evidence", "Top priorities with the cause, not just the symptom", "5–8 no-equipment drills with sets, reps and cues", "Four-week plan: foundation → strength → integration → performance", "Group video? Tap your dancer — everyone else is blurred"].map((t) => (
                <li key={t} className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />{t}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button onClick={buy} disabled={buying} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 px-7 py-3.5 text-base font-bold shadow-lg shadow-pink-500/20 disabled:opacity-60">
                {buying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />} Get the Spotlight report — $14.99
              </button>
              <p className="text-sm text-zinc-500">One-time. Email us what was off and we credit your account.</p>
            </div>
            {err && <p className="mt-4 text-sm text-pink-300">{err}</p>}
            <p className="mt-8 text-sm text-zinc-500">Compare: a single private lesson runs $75–150 and the notes live in someone&apos;s head. This lives on her fridge.</p>
          </div>
        )}

        {step === "form" && (
          <div className="mt-4">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight sm:text-5xl">Let&apos;s build her breakdown.</h1>
            <p className="mt-3 text-zinc-400">{credits.isAdmin ? "Admin — no credit needed." : `${credits.remaining} Spotlight report${credits.remaining === 1 ? "" : "s"} on this account.`} The video stays on this device; only still frames are sent.</p>

            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files?.[0] ?? null); }}
              className={`mt-8 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${drag ? "border-pink-400 bg-pink-500/5" : "border-white/15 bg-white/[0.02]"}`}
            >
              {file ? (
                <div className="flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3"><Video className="h-6 w-6 text-amber-300" /><div><p className="font-semibold">{file.name}</p><p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p></div></div>
                  <button onClick={() => setFile(null)} className="rounded-full p-2 hover:bg-white/10"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <Upload className="mx-auto h-8 w-8 text-zinc-500" />
                  <p className="mt-3 font-semibold">Drop the routine video here, or tap to choose</p>
                  <p className="mt-1 text-xs text-zinc-500">MP4 or MOV · full body in frame · solo or group</p>
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
                </label>
              )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Dancer's first name *"><input value={dancerName} onChange={(e) => setDancerName(e.target.value)} className="sl-input" placeholder="Ava" /></Field>
              <Field label="Routine name"><input value={routineName} onChange={(e) => setRoutineName(e.target.value)} className="sl-input" placeholder="Optional" /></Field>
              <Field label="Style *"><select value={style} onChange={(e) => setStyle(e.target.value)} className="sl-input"><option value="">Choose…</option>{STYLES.map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label="Age division"><select value={division} onChange={(e) => setDivision(e.target.value)} className="sl-input"><option value="">Choose…</option>{DIVISIONS.map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label="Training level" full><select value={level} onChange={(e) => setLevel(e.target.value)} className="sl-input"><option value="">Choose…</option>{LEVELS.map((s) => <option key={s}>{s}</option>)}</select></Field>
              <Field label="Anything you want the coach to look at?" full><textarea value={focusNote} onChange={(e) => setFocusNote(e.target.value)} rows={3} className="sl-input" placeholder="Her turns have been inconsistent… / Is her technique clean enough for Teen Elite? / We keep getting marked on arms." /></Field>
            </div>

            <label className="mt-6 flex items-start gap-3 text-sm text-zinc-400">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-pink-500" />
              <span>I am the parent or legal guardian of this dancer (or I am the dancer and 18+). I consent to still frames being processed to build this report. Other performers in the video are blurred before upload. Frames the report doesn&apos;t use are deleted; the ones it does are kept with the report until I delete it. See our <Link href="/privacy" className="underline">privacy policy</Link>.</span>
            </label>

            {err && <p className="mt-4 text-sm text-pink-300">{err}</p>}
            <button disabled={!canStart} onClick={run} className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 px-7 py-3.5 text-base font-bold shadow-lg shadow-pink-500/20 disabled:opacity-40">
              Build the Spotlight report <ArrowRight className="h-5 w-5" />
            </button>
            <p className="mt-4 flex items-center gap-2 text-xs text-zinc-500"><ShieldCheck className="h-4 w-4" /> Tracking runs on your device. Expect 2–3 minutes total — this is the most thorough look she can get.</p>
          </div>
        )}

        {(step === "extract" || step === "upload") && (
          <div className="mt-4">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">{step === "extract" ? "Tracking every frame." : "Securing the frames."}</h1>
            <p className="mt-3 text-zinc-400">Keep this tab open and on screen. {step === "extract" ? "We're reading the routine and finding her in each frame — on this device." : "Only still frames go up, and anyone else in the shot is blurred first."}</p>
            <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-pink-500 via-orange-400 to-amber-300" animate={{ width: `${Math.round((progress.done / Math.max(1, progress.total)) * 100)}%` }} transition={{ ease: "linear", duration: 0.3 }} />
            </div>
            <p className="mt-3 text-sm text-zinc-300">{progress.label}</p>
          </div>
        )}

        {step === "pick" && pickFrame && (
          <div className="mt-4">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold sm:text-4xl">Which dancer is {dancerName.split(" ")[0]}?</h1>
            <p className="mt-3 text-zinc-400">Tap her. We&apos;ll follow her through the routine and blur everyone else before anything leaves your device.</p>
            <div className="relative mt-6 overflow-hidden rounded-2xl ring-1 ring-white/10" style={{ aspectRatio: `${framesRef.current[pickFrame.index].w} / ${framesRef.current[pickFrame.index].h}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pickFrame.url} alt="Choose your dancer" className="absolute inset-0 h-full w-full object-cover" />
              {pickBoxes.map((b) => (
                <button key={b.k} onClick={() => setPicked(b.k)} aria-label={`Dancer ${b.k + 1}`}
                  className={`absolute rounded-lg border-2 transition ${picked === b.k ? "border-amber-300 bg-amber-300/10 shadow-[0_0_0_3px_rgba(251,191,36,0.35)]" : "border-white/60 hover:border-pink-300"}`}
                  style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%` }} />
              ))}
            </div>
            <div className="mt-6 flex items-center gap-4">
              <button disabled={picked == null} onClick={() => finish(pickFrame.index, picked!)} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 px-6 py-3 text-sm font-bold disabled:opacity-40">That&apos;s her <ArrowRight className="h-4 w-4" /></button>
              <button onClick={() => { setStep("form"); setPicked(null); }} className="text-sm text-zinc-400 underline">Use a different clip</button>
            </div>
          </div>
        )}

        {step === "done" && <div className="mt-10 flex items-center gap-3 text-zinc-300"><Loader2 className="h-5 w-5 animate-spin" />Opening the report…</div>}

        {step === "error" && (
          <div className="mt-4">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">That didn&apos;t work.</h1>
            <p className="mt-3 text-zinc-300">{err}</p>
            <button onClick={() => { setStep("form"); setErr(""); }} className="mt-6 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold">Back</button>
          </div>
        )}
      </div>
      <AnimatePresence />
      <style jsx global>{`
        .sl-input { width: 100%; border-radius: 0.75rem; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); padding: 0.7rem 0.9rem; color: #fff; font-size: 15px; outline: none; }
        .sl-input:focus { border-color: #F472B6; box-shadow: 0 0 0 3px rgba(244,114,182,0.2); }
        .sl-input option { color: #000; }
      `}</style>
    </main>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

export default function SpotlightNewPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#09090B]" />}>
      <SpotlightNewInner />
    </Suspense>
  );
}
