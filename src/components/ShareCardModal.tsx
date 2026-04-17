"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Glass } from "@/components/ui/Glass";
import { haptics } from "@/lib/haptics";

type Props = {
  open: boolean;
  onClose: () => void;
  trophyId: string;
  handle: string;
};

export function ShareCardModal({ open, onClose, trophyId, handle }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/u/${handle}` : "";
  const cardUrl = `/api/og/trophy/${trophyId}`;

  async function copyLink() {
    haptics.success();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }

  function download() {
    haptics.success();
    const link = document.createElement("a");
    link.href = cardUrl;
    link.download = `coda-trophy-${trophyId}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Glass
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 420, width: "100%", padding: 20, color: "#fff" }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Share your trophy</h2>
        <div
          style={{
            aspectRatio: "9 / 16",
            maxHeight: 440,
            borderRadius: 12,
            overflow: "hidden",
            background: "#09090B",
            marginBottom: 16,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardUrl}
            alt="Trophy share card"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="primary" onClick={download}>
            Download PNG
          </Button>
          <Button variant="secondary" onClick={copyLink}>
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </Glass>
    </div>
  );
}

export default ShareCardModal;
