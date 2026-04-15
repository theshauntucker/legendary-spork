import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserCredits, useCredit } from "@/lib/credits";

/**
 * Phase A regression test — proves the B2C credit path is byte-identical
 * after studio-pool branching was added to getUserCredits() and useCredit().
 *
 * A "B2C user" here = a user with NO row in studio_members. Because
 * getStudioForUser() returns null for that case, the studio branch in
 * each function is skipped and the original code path executes unchanged.
 *
 * Studio-path assertions are also included to confirm the additive branch
 * actually activates when a studio membership exists.
 */

// ─────────────────────────────────────────────────────────────────────
// Fake Supabase client — just enough to satisfy the query builder calls
// that credits.ts + membership.ts make. Each .from() returns a chainable
// stub whose terminal method (single/maybeSingle/update.select/rpc) is
// configured per-test via rows/errors maps.
// ─────────────────────────────────────────────────────────────────────
type RowOrNull<T = Record<string, unknown>> = { data: T | null; error: null | { message: string; code?: string } };

function makeClient(responses: {
  studioMember?: RowOrNull;
  studioCredits?: RowOrNull;
  userCredits?: RowOrNull;
  studioCreditsUpdate?: { data: unknown[] | null; error: null | { message: string } };
}) {
  const rpc = vi.fn().mockResolvedValue({ data: null, error: null });

  const from = vi.fn((table: string) => {
    // Terminal object that all chains end at.
    const terminal = {
      maybeSingle: vi.fn(() => {
        if (table === "studio_members") return Promise.resolve(responses.studioMember ?? { data: null, error: null });
        if (table === "studio_credits") return Promise.resolve(responses.studioCredits ?? { data: null, error: null });
        if (table === "user_credits") return Promise.resolve(responses.userCredits ?? { data: null, error: null });
        return Promise.resolve({ data: null, error: null });
      }),
      single: vi.fn(() => {
        if (table === "user_credits") return Promise.resolve(responses.userCredits ?? { data: null, error: null });
        return Promise.resolve({ data: null, error: null });
      }),
    };

    // Any chain like .select(...).eq(...).eq(...).maybeSingle()
    // or .update(...).eq(...).eq(...).lt(...).select(...) must resolve.
    const chain: Record<string, unknown> = {};
    const returnChain = () => chain;
    chain.select = vi.fn(returnChain);
    chain.eq = vi.fn(returnChain);
    chain.lt = vi.fn(returnChain);
    chain.maybeSingle = terminal.maybeSingle;
    chain.single = terminal.single;
    // .update(...).eq(...).eq(...).lt(...).select(...) resolves directly
    chain.update = vi.fn(() => {
      const updateChain: Record<string, unknown> = {};
      updateChain.eq = vi.fn(() => updateChain);
      updateChain.lt = vi.fn(() => updateChain);
      updateChain.select = vi.fn(() =>
        Promise.resolve(
          responses.studioCreditsUpdate ?? { data: [{ studio_id: "s1" }], error: null }
        )
      );
      return updateChain;
    });

    return chain;
  });

  return { from, rpc } as unknown as Parameters<typeof getUserCredits>[0];
}

// ─────────────────────────────────────────────────────────────────────
// B2C regression — shape and behavior must match pre-studio exactly.
// ─────────────────────────────────────────────────────────────────────
describe("getUserCredits — B2C regression (no studio membership)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the exact pre-studio shape for a paying B2C user", async () => {
    const client = makeClient({
      studioMember: { data: null, error: null }, // no studio row
      userCredits: {
        data: { total_credits: 5, used_credits: 2, is_beta_member: false },
        error: null,
      },
    });

    const result = await getUserCredits(client, "user-123", "dancer@example.com");

    // Keys must be exactly the pre-studio set — no leaked studio fields.
    expect(Object.keys(result).sort()).toEqual(
      ["hasCredits", "isAdmin", "isBetaMember", "remaining", "totalCredits", "usedCredits"].sort()
    );
    expect(result).toEqual({
      hasCredits: true,
      remaining: 3,
      isBetaMember: false,
      isAdmin: false,
      totalCredits: 5,
      usedCredits: 2,
    });
  });

  it("returns the exact pre-studio shape for a zero-credit B2C user", async () => {
    const client = makeClient({
      studioMember: { data: null, error: null },
      userCredits: { data: null, error: null },
    });

    const result = await getUserCredits(client, "user-new", "newbie@example.com");

    expect(Object.keys(result).sort()).toEqual(
      ["hasCredits", "isAdmin", "isBetaMember", "remaining", "totalCredits", "usedCredits"].sort()
    );
    expect(result).toEqual({
      hasCredits: false,
      remaining: 0,
      isBetaMember: false,
      isAdmin: false,
      totalCredits: 0,
      usedCredits: 0,
    });
  });

  it("returns the exact pre-studio admin shape without touching studio tables", async () => {
    process.env.ADMIN_EMAIL = "admin@example.com";
    // Re-import so the module-level ADMIN_EMAILS picks up the env var.
    vi.resetModules();
    const { getUserCredits: freshGetter } = await import("@/lib/credits");

    const client = makeClient({});
    const result = await freshGetter(client, "user-admin", "admin@example.com");

    expect(Object.keys(result).sort()).toEqual(
      ["hasCredits", "isAdmin", "isBetaMember", "remaining", "totalCredits", "usedCredits"].sort()
    );
    expect(result).toEqual({
      hasCredits: true,
      remaining: 999,
      isBetaMember: true,
      isAdmin: true,
      totalCredits: 999,
      usedCredits: 0,
    });

    // Admin bypass must short-circuit BEFORE any DB lookup — studio_members
    // and user_credits tables should not have been queried.
    expect((client as unknown as { from: ReturnType<typeof vi.fn> }).from).not.toHaveBeenCalled();
  });
});

describe("useCredit — B2C regression (no studio membership)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls increment_used_credits exactly once for a B2C user and nothing else", async () => {
    const client = makeClient({
      studioMember: { data: null, error: null },
    });

    await useCredit(client, "user-123", "dancer@example.com");

    const c = client as unknown as { rpc: ReturnType<typeof vi.fn>; from: ReturnType<typeof vi.fn> };
    expect(c.rpc).toHaveBeenCalledTimes(1);
    expect(c.rpc).toHaveBeenCalledWith("increment_used_credits", { p_user_id: "user-123" });

    // The only .from() call should be the studio_members lookup — no
    // studio_credits writes, no user_credits writes.
    const tablesHit = c.from.mock.calls.map((args: unknown[]) => args[0]);
    expect(tablesHit).toEqual(["studio_members"]);
  });

  it("short-circuits without any DB call for admins (behavior preserved)", async () => {
    process.env.ADMIN_EMAIL = "admin@example.com";
    vi.resetModules();
    const { useCredit: freshUse } = await import("@/lib/credits");

    const client = makeClient({});
    await freshUse(client, "user-admin", "admin@example.com");

    const c = client as unknown as { rpc: ReturnType<typeof vi.fn>; from: ReturnType<typeof vi.fn> };
    expect(c.rpc).not.toHaveBeenCalled();
    expect(c.from).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Studio path — additive branch actually activates for studio members.
// ─────────────────────────────────────────────────────────────────────
describe("getUserCredits — studio member", () => {
  beforeEach(() => {
    // Ensure admin bypass doesn't interfere.
    delete process.env.ADMIN_EMAIL;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("reports the studio pool balance and adds source/studioId fields", async () => {
    const { getUserCredits: freshGetter } = await import("@/lib/credits");
    const client = makeClient({
      studioMember: { data: { studio_id: "studio-A", role: "choreographer" }, error: null },
      studioCredits: {
        data: {
          total_credits: 25,
          used_credits: 7,
          subscription_status: "trial",
          trial_ends_at: "2026-05-14T00:00:00Z",
        },
        error: null,
      },
    });

    const result = await freshGetter(client, "user-choreo", "choreo@studio.com");

    expect(result.source).toBe("studio");
    expect(result.studioId).toBe("studio-A");
    expect(result.studioSubscriptionStatus).toBe("trial");
    expect(result.hasCredits).toBe(true);
    expect(result.remaining).toBe(18);
    expect(result.totalCredits).toBe(25);
    expect(result.usedCredits).toBe(7);
  });
});

describe("useCredit — studio member", () => {
  beforeEach(() => {
    delete process.env.ADMIN_EMAIL;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("drains the studio pool and skips the personal RPC", async () => {
    const { useCredit: freshUse } = await import("@/lib/credits");
    const client = makeClient({
      studioMember: { data: { studio_id: "studio-A", role: "choreographer" }, error: null },
      studioCredits: {
        data: {
          total_credits: 25,
          used_credits: 7,
          subscription_status: "active",
          trial_ends_at: null,
        },
        error: null,
      },
      studioCreditsUpdate: { data: [{ studio_id: "studio-A" }], error: null },
    });

    await freshUse(client, "user-choreo", "choreo@studio.com");

    const c = client as unknown as { rpc: ReturnType<typeof vi.fn>; from: ReturnType<typeof vi.fn> };
    // increment_used_credits must NOT be called for a studio user
    expect(c.rpc).not.toHaveBeenCalled();
    // studio_members + studio_credits (read) + studio_credits (update) tables hit
    const tablesHit = c.from.mock.calls.map((args: unknown[]) => args[0]);
    expect(tablesHit).toContain("studio_credits");
  });

  it("throws when the studio pool is exhausted", async () => {
    const { useCredit: freshUse } = await import("@/lib/credits");
    const client = makeClient({
      studioMember: { data: { studio_id: "studio-A", role: "choreographer" }, error: null },
      studioCredits: {
        data: {
          total_credits: 25,
          used_credits: 25,
          subscription_status: "active",
          trial_ends_at: null,
        },
        error: null,
      },
      studioCreditsUpdate: { data: [], error: null }, // 0 rows affected
    });

    await expect(freshUse(client, "user-choreo", "choreo@studio.com")).rejects.toThrow(
      /Studio credit pool exhausted/
    );
  });
});
