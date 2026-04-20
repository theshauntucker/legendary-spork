"use client";

/**
 * Dancer autocomplete — used on /upload by studio members.
 *
 * - Fetches /api/studio/dancers on mount. If the user isn't a studio member
 *   (API returns 403), the component silently falls back to plain free-text
 *   input so non-studio users see the same UX they always had.
 * - As the user types, we filter the roster and surface matches. Selecting
 *   a dancer stamps both the display name and the hidden `studio_dancer_id`
 *   on the parent form.
 * - If the user types a name that doesn't match any dancer, they can either
 *   submit the routine as a free-text dancer (works for one-off guest
 *   performers) OR click "+ Add <typed name> to roster" to create the dancer
 *   inline, which then auto-selects them.
 *
 * Intentional UX: never block submission on "no dancer picked" — a studio
 * owner shouldn't have to build their whole roster before they upload their
 * first routine. The autocomplete is a speed boost, not a gate.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, Plus, Sparkles, Users } from "lucide-react";

interface RosterDancer {
  id: string;
  name: string;
  nickname: string | null;
  age_group: string | null;
  level: string | null;
  primary_style: string | null;
  routineCount: number;
}

export interface DancerAutocompleteValue {
  displayName: string;
  studioDancerId: string | null;
}

export default function DancerAutocomplete({
  value,
  onChange,
  disabled,
  className,
}: {
  value: DancerAutocompleteValue;
  onChange: (v: DancerAutocompleteValue) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [roster, setRoster] = useState<RosterDancer[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStudioMember, setIsStudioMember] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/studio/dancers", { credentials: "include" });
        if (cancelled) return;
        if (res.status === 403 || res.status === 401 || res.status === 404) {
          // Not a studio member — graceful fallback to free text
          setIsStudioMember(false);
          setRoster([]);
        } else if (res.ok) {
          const data = await res.json();
          setIsStudioMember(true);
          setRoster(Array.isArray(data.dancers) ? data.dancers : []);
        } else {
          setIsStudioMember(false);
          setRoster([]);
        }
      } catch {
        if (!cancelled) {
          setIsStudioMember(false);
          setRoster([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const query = value.displayName.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!roster) return [];
    if (!query) return roster.slice(0, 8);
    return roster
      .filter((d) => {
        const hay = `${d.name} ${d.nickname ?? ""}`.toLowerCase();
        return hay.includes(query);
      })
      .slice(0, 8);
  }, [roster, query]);

  const exactMatch = useMemo(() => {
    if (!roster || !query) return null;
    return roster.find((d) => d.name.toLowerCase() === query) ?? null;
  }, [roster, query]);

  const showAddOption =
    isStudioMember === true &&
    !disabled &&
    query.length >= 2 &&
    !exactMatch &&
    !creating;

  async function handleCreate(name: string) {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/studio/dancers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Could not add dancer");
        setCreating(false);
        return;
      }
      const d = data.dancer;
      // Append to local roster and select
      setRoster((prev) => [
        ...(prev ?? []),
        {
          id: d.id,
          name: d.name,
          nickname: d.nickname,
          age_group: d.age_group,
          level: d.level,
          primary_style: d.primary_style,
          routineCount: 0,
        },
      ]);
      onChange({ displayName: d.name, studioDancerId: d.id });
      setOpen(false);
      setCreating(false);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Network error");
      setCreating(false);
    }
  }

  // Always render a plain <input> so non-studio users get the exact same UX
  // as before. The roster dropdown only shows if the user is a studio member.
  const baseInputClass =
    "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50";

  return (
    <div className={`relative ${className ?? ""}`} ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        value={value.displayName}
        onChange={(e) => {
          const next = e.target.value;
          // Typing invalidates any previously selected dancer ID — the user
          // must re-select or create.
          onChange({ displayName: next, studioDancerId: null });
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="e.g., Emma R."
        disabled={disabled}
        className={baseInputClass}
        autoComplete="off"
      />

      {/* Selected-from-roster indicator */}
      {value.studioDancerId && !loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-primary-300 bg-primary-500/15 border border-primary-500/30 rounded-full px-2 py-0.5 pointer-events-none">
          <Check className="h-2.5 w-2.5" /> Roster
        </div>
      )}

      {/* Dropdown — only if studio member and open */}
      {isStudioMember && open && !disabled && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-white/10 bg-surface-900 shadow-xl overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 text-xs text-surface-200 inline-flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading roster…
            </div>
          ) : roster && roster.length === 0 && !query ? (
            <div className="px-4 py-3 text-xs text-surface-200">
              Your roster is empty. Type a name above to add a dancer, or build your roster at{" "}
              <a href="/studio/roster" className="text-primary-400 underline" target="_blank" rel="noreferrer">
                /studio/roster
              </a>
              .
            </div>
          ) : (
            <>
              {filtered.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-surface-300 flex items-center gap-1 border-b border-white/5">
                    <Users className="h-2.5 w-2.5" /> Your roster
                  </div>
                  {filtered.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onChange({ displayName: d.name, studioDancerId: d.id });
                        setOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-white/8 transition-colors flex items-center gap-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500/40 via-accent-500/30 to-gold-500/20 text-xs font-bold text-white border border-white/10">
                        {d.name
                          .trim()
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((p) => p[0]?.toUpperCase() ?? "")
                          .join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {d.name}
                          {d.nickname && (
                            <span className="text-surface-200 font-normal ml-1">"{d.nickname}"</span>
                          )}
                        </p>
                        <div className="flex gap-2 text-[10px] text-surface-300">
                          {d.age_group && <span>{d.age_group}</span>}
                          {d.level && <span>· {d.level}</span>}
                          {d.primary_style && <span>· {d.primary_style}</span>}
                          {d.routineCount > 0 && (
                            <span className="text-primary-300">
                              · {d.routineCount} routine{d.routineCount === 1 ? "" : "s"}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {filtered.length === 0 && query && (
                <div className="px-4 py-3 text-xs text-surface-200">
                  No match in roster for "{value.displayName}".
                </div>
              )}

              {showAddOption && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCreate(value.displayName.trim());
                  }}
                  disabled={creating}
                  className="w-full text-left px-3 py-2.5 border-t border-white/5 bg-primary-500/5 hover:bg-primary-500/10 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus className="h-3.5 w-3.5 text-primary-400" />
                  <span>
                    Add <span className="font-semibold">{value.displayName.trim()}</span> to roster
                  </span>
                  {creating && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
                </button>
              )}

              {createError && (
                <div className="px-4 py-2 text-xs text-red-300 bg-red-500/10 border-t border-white/5">
                  {createError}
                </div>
              )}

              <div className="px-3 py-2 border-t border-white/5 bg-white/3 text-[10px] text-surface-300 flex items-center gap-1.5">
                <Sparkles className="h-2.5 w-2.5 text-accent-400" />
                Enter a dancer once — they'll auto-fill on every future routine.
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
