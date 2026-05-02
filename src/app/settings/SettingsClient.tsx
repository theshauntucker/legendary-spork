"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Trash2, LogOut, Shield, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { isIosShell, restoreNativePurchases } from "@/lib/native-iap";

interface SettingsClientProps {
  email: string;
  createdAt: string;
}

export default function SettingsClient({ email, createdAt }: SettingsClientProps) {
  const router = useRouter();
  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm" | "deleting" | "done">("idle");
  const [error, setError] = useState("");

  // Restore Purchases — Apple App Store Review Guideline 3.1.1 requires
  // a user-initiated restore button anywhere we sell restorable IAPs.
  // We surface it inside the iOS shell only; on the web Stripe handles
  // entitlements server-side, so a "restore" button has nothing to do.
  const [showRestore, setShowRestore] = useState(false);
  const [restoreState, setRestoreState] = useState<"idle" | "restoring">("idle");
  const [restoreMessage, setRestoreMessage] = useState("");

  useEffect(() => {
    // isIosShell() reads window.Capacitor — only safe in useEffect.
    setShowRestore(isIosShell());
  }, []);

  const handleSignOut = async () => {
    await fetch("/auth/callback?logout=true", { method: "POST" });
    router.push("/login");
  };

  const handleRestore = async () => {
    setRestoreState("restoring");
    setRestoreMessage("");
    const result = await restoreNativePurchases();
    setRestoreState("idle");
    if (result.ok) {
      setRestoreMessage(result.message);
    } else {
      setRestoreMessage(result.error);
    }
    // Auto-clear the message after a few seconds so the row resets.
    setTimeout(() => setRestoreMessage(""), 6000);
  };

  const handleDeleteAccount = async () => {
    setDeleteStep("deleting");
    setError("");

    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to delete account");
      }
      setDeleteStep("done");
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleteStep("confirm");
    }
  };

  const memberSince = new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-400" />
            <span className="text-lg font-bold">
              Routine<span className="gradient-text">X</span>
            </span>
          </Link>
          <span className="text-surface-200/50 mx-2">/</span>
          <span className="text-surface-200">Settings</span>
        </div>

        {/* Profile */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
              {email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">{email}</p>
              <p className="text-sm text-surface-200">Member since {memberSince}</p>
            </div>
          </div>
        </div>

        {/* Restore Purchases — iOS only.
            Required by App Store Review Guideline 3.1.1 (Business — Payments — IAP). */}
        {showRestore && (
          <div className="glass rounded-2xl overflow-hidden mb-6">
            <button
              onClick={handleRestore}
              disabled={restoreState === "restoring"}
              aria-label="Restore Purchases"
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <RefreshCw
                  className={`h-4 w-4 text-primary-400 ${restoreState === "restoring" ? "animate-spin" : ""}`}
                />
                <span className="text-[15px] text-white">
                  {restoreState === "restoring" ? "Restoring..." : "Restore Purchases"}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-surface-200/50" />
            </button>
            {restoreMessage && (
              <div className="px-4 pb-3 -mt-1">
                <p className="text-xs text-surface-200">{restoreMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Links */}
        <div className="glass rounded-2xl overflow-hidden mb-6">
          <Link href="/privacy" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-surface-200" />
              <span className="text-[15px] text-white">Privacy Policy</span>
            </div>
            <ChevronRight className="h-4 w-4 text-surface-200/50" />
          </Link>
          <div className="h-px bg-white/5 mx-4" />
          <Link href="/terms" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-surface-200" />
              <span className="text-[15px] text-white">Terms of Service</span>
            </div>
            <ChevronRight className="h-4 w-4 text-surface-200/50" />
          </Link>
          <div className="h-px bg-white/5 mx-4" />
          <Link href="/support" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-surface-200" />
              <span className="text-[15px] text-white">Support</span>
            </div>
            <ChevronRight className="h-4 w-4 text-surface-200/50" />
          </Link>
        </div>

        {/* Sign Out */}
        <div className="glass rounded-2xl overflow-hidden mb-6">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-4 w-4 text-surface-200" />
            <span className="text-[15px] text-white">Sign Out</span>
          </button>
        </div>

        {/* Delete Account */}
        <div className="glass rounded-2xl overflow-hidden border border-red-500/10">
          {deleteStep === "done" ? (
            <div className="p-6 text-center">
              <p className="text-green-400 font-medium">Account deleted.</p>
              <p className="text-sm text-surface-200 mt-1">Redirecting...</p>
            </div>
          ) : deleteStep === "confirm" ? (
            <div className="p-6">
              <p className="text-red-400 font-medium mb-2">
                This will permanently delete:
              </p>
              <ul className="text-sm text-surface-200 space-y-1 mb-4 ml-4 list-disc">
                <li>Your account and login</li>
                <li>All uploaded videos and analyses</li>
                <li>Payment history and remaining credits</li>
                <li>Dancer profiles and achievements</li>
              </ul>
              <p className="text-sm text-surface-200 mb-4">This cannot be undone.</p>
              {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteStep("idle")}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Delete Everything
                </button>
              </div>
            </div>
          ) : deleteStep === "deleting" ? (
            <div className="p-6 text-center">
              <p className="text-surface-200">Deleting account...</p>
            </div>
          ) : (
            <button
              onClick={() => setDeleteStep("confirm")}
              className="w-full flex items-center gap-3 p-4 hover:bg-red-500/5 transition-colors"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
              <span className="text-[15px] text-red-400">Delete Account</span>
            </button>
          )}
        </div>

        <p className="text-xs text-surface-200/40 text-center mt-8">
          RoutineX v1.0.0
        </p>
      </div>
    </div>
  );
}
