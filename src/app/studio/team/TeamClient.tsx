"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Mail,
  Shield,
  Copy,
  Loader2,
  X,
  Check,
  UserPlus,
  Settings,
} from "lucide-react";

export interface TeamMember {
  id: string;
  userId: string;
  role: "owner" | "choreographer" | "viewer";
  joinedAt: string;
  email: string | null;
  isCurrentUser: boolean;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: string;
  code: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  joinUrl: string;
}

interface Studio {
  id: string;
  name: string;
  invite_code: string;
  region: string | null;
}

export default function TeamClient({
  studio,
  currentRole,
  members,
  invites,
}: {
  studio: Studio;
  currentRole: "owner" | "choreographer" | "viewer";
  currentUserId: string;
  members: TeamMember[];
  invites: TeamInvite[];
}) {
  const router = useRouter();
  const isOwner = currentRole === "owner";

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"choreographer" | "viewer">("choreographer");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const pendingInvites = invites.filter((i) => i.status === "pending");

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    const res = await fetch("/api/studio/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail.trim().toLowerCase(), role: inviteRole }),
    });
    setSending(false);
    if (!res.ok) {
      const { error: apiErr } = await res.json().catch(() => ({ error: "Failed" }));
      setError(apiErr || "Failed to send invite");
      return;
    }
    setInviteEmail("");
    router.refresh();
  };

  const revokeInvite = async (code: string) => {
    if (!confirm("Revoke this invite?")) return;
    const res = await fetch(`/api/studio/invite?code=${encodeURIComponent(code)}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  };

  const removeMember = async (userId: string, email: string | null) => {
    if (!confirm(`Remove ${email || "this member"} from the studio?`)) return;
    const res = await fetch(`/api/studio/settings?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  };

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCode(key);
      setTimeout(() => setCopiedCode(null), 1500);
    } catch {
      // noop — some browsers require a secure context
    }
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-400 mb-1">
              Studio Team
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">
              {studio.name}
            </h1>
            {studio.region && (
              <p className="mt-1 text-sm text-surface-200">Region: {studio.region}</p>
            )}
          </div>
          {isOwner && (
            <a
              href="/studio/settings"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-sm transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </a>
          )}
        </div>

        {/* Permanent studio invite code */}
        <div className="glass rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-surface-200 mb-1">Studio code</p>
            <p className="font-mono text-sm truncate">{studio.invite_code}</p>
          </div>
          <button
            onClick={() => copy(studio.invite_code, "studio-code")}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary-600/20 hover:bg-primary-600/30 text-primary-200 px-3 py-1.5 text-xs transition-colors"
          >
            {copiedCode === "studio-code" ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </button>
        </div>

        {/* Invite form — owner only */}
        {isOwner && (
          <div className="glass rounded-2xl p-5 sm:p-6 mb-6">
            <h2 className="flex items-center gap-2 font-semibold mb-4">
              <UserPlus className="h-4 w-4 text-primary-400" />
              Invite a choreographer
            </h2>
            <form onSubmit={sendInvite} className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="choreographer@example.com"
                required
                className="rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "choreographer" | "viewer")}
                className="rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="choreographer" className="bg-surface-900">
                  Choreographer
                </option>
                <option value="viewer" className="bg-surface-900">
                  Viewer
                </option>
              </select>
              <button
                type="submit"
                disabled={sending}
                className="rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate invite"}
              </button>
            </form>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <p className="mt-3 text-xs text-surface-200">
              An invite link is generated for each address. Copy and send it
              through your preferred channel — email delivery ships in a
              later update.
            </p>
          </div>
        )}

        {/* Pending invites */}
        {isOwner && pendingInvites.length > 0 && (
          <div className="glass rounded-2xl p-5 sm:p-6 mb-6">
            <h2 className="flex items-center gap-2 font-semibold mb-4">
              <Mail className="h-4 w-4 text-accent-400" />
              Pending invites ({pendingInvites.length})
            </h2>
            <ul className="divide-y divide-white/10">
              {pendingInvites.map((inv) => (
                <li key={inv.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{inv.email}</p>
                    <p className="text-xs text-surface-200">
                      {inv.role} ·{" "}
                      {inv.expiresAt
                        ? `expires ${new Date(inv.expiresAt).toLocaleDateString()}`
                        : "no expiry"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copy(inv.joinUrl, inv.code)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-600/20 hover:bg-primary-600/30 text-primary-200 px-3 py-1.5 text-xs transition-colors"
                    >
                      {copiedCode === inv.code ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy link
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => revokeInvite(inv.code)}
                      className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-surface-200 px-3 py-1.5 text-xs transition-colors"
                      aria-label="Revoke invite"
                    >
                      <X className="h-3.5 w-3.5" /> Revoke
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Members */}
        <div className="glass rounded-2xl p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-semibold mb-4">
            <Users className="h-4 w-4 text-primary-400" />
            Members ({members.length})
          </h2>
          <ul className="divide-y divide-white/10">
            {members.map((m) => (
              <li key={m.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {m.email || "Unknown user"}{" "}
                    {m.isCurrentUser && (
                      <span className="ml-2 text-xs text-surface-200">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-surface-200 flex items-center gap-1.5">
                    <Shield className="h-3 w-3" />
                    {m.role}
                    <span className="text-surface-200/50">·</span>
                    joined {new Date(m.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                {isOwner && m.role !== "owner" && (
                  <button
                    onClick={() => removeMember(m.userId, m.email)}
                    className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-surface-200 px-3 py-1.5 text-xs transition-colors"
                  >
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
