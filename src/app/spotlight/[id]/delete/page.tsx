"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteSpotlightPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090B] px-5 pt-16 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <p className="sl-eyebrow">Delete report</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">Remove this Spotlight report?</h1>
        <p className="mt-3 text-sm text-zinc-400">The report, every frame it uses and the PDF are deleted from our storage. This cannot be undone. Your purchase is not refunded by deleting.</p>
        {err && <p className="mt-3 text-sm text-pink-300">{err}</p>}
        <div className="mt-6 flex gap-3">
          <button disabled={busy} onClick={async () => { setBusy(true); const r = await fetch("/api/spotlight/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); if (r.ok) router.push("/dashboard"); else { setErr("Couldn't delete — try again."); setBusy(false); } }} className="rounded-full bg-pink-600 px-5 py-2.5 text-sm font-bold disabled:opacity-50">Delete permanently</button>
          <button onClick={() => router.back()} className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold">Keep it</button>
        </div>
      </div>
    </main>
  );
}
