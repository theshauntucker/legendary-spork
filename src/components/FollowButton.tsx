"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { haptics } from "@/lib/haptics";

type Props = {
  targetProfileId: string;
  initialFollowing?: boolean;
};

export function FollowButton({ targetProfileId, initialFollowing = false }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    const nextState = !following;
    setFollowing(nextState);
    haptics.tap();
    try {
      const res = await fetch("/api/follow", {
        method: nextState ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_profile_id: targetProfileId }),
      });
      if (!res.ok) {
        setFollowing(!nextState);
      } else if (nextState) {
        haptics.success();
      }
    } catch {
      setFollowing(!nextState);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant={following ? "secondary" : "primary"} onClick={toggle} disabled={pending}>
      {following ? "Following" : "Follow"}
    </Button>
  );
}

export default FollowButton;
