"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { haptics } from "@/lib/haptics";

type Props = {
  targetProfileId: string;
  /**
   * If the viewer isn't Tier 2 we still render a disabled-looking pill that
   * links to /inbox so they see where DMs live. Easier than hiding.
   */
  disabled?: boolean;
  disabledReason?: string;
};

export function MessageButton({
  targetProfileId,
  disabled,
  disabledReason,
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    if (disabled || pending) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/messages/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: targetProfileId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.conversation_id) {
        setError(data.error ?? "Could not open conversation");
        setPending(false);
        return;
      }
      haptics.success();
      router.push(`/inbox/${data.conversation_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setPending(false);
    }
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <Button
        variant="secondary"
        onClick={open}
        disabled={disabled || pending}
        aria-label="Message this profile"
      >
        <span
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <MessageCircle size={16} />
          {pending ? "Opening…" : "Message"}
        </span>
      </Button>
      {disabled && disabledReason ? (
        <span style={{ fontSize: 11, opacity: 0.55 }}>{disabledReason}</span>
      ) : null}
      {error ? (
        <span style={{ fontSize: 11, color: "#EF4444" }}>{error}</span>
      ) : null}
    </div>
  );
}

export default MessageButton;
