"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import RoutineXLogo from "@/components/RoutineXLogo";

const inputCls =
  "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-10 text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<"verifying" | "ready" | "invalid" | "done">("verifying");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Exchange the one-time token from the email for a recovery session.
  useEffect(() => {
    const tokenHash = searchParams.get("token_hash");
    const supabase = createClient();
    (async () => {
      if (tokenHash) {
        const { error: vErr } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
        if (!vErr) {
          setPhase("ready");
          return;
        }
      }
      // Already in a recovery session (e.g. page refresh after verifying)?
      const { data } = await supabase.auth.getSession();
      setPhase(data.session ? "ready" : "invalid");
    })();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Use at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: uErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (uErr) {
      setError(uErr.message);
      return;
    }
    setPhase("done");
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <a href="/" className="inline-flex mb-4">
            <RoutineXLogo size="md" />
          </a>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">Choose a new password</h1>
        </div>

        {phase === "verifying" && (
          <div className="glass rounded-3xl p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-400" />
            <p className="mt-3 text-sm text-surface-200">Checking your reset link…</p>
          </div>
        )}

        {phase === "invalid" && (
          <div className="glass rounded-3xl p-6 sm:p-8 text-center">
            <p className="font-semibold text-white">This link has expired or was already used.</p>
            <p className="mt-2 text-sm text-surface-200">Reset links work once and expire after about an hour.</p>
            <a
              href="/forgot-password"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-6 py-3 text-sm font-bold text-white"
            >
              Send a new link <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        )}

        {phase === "done" && (
          <div className="glass rounded-3xl p-8 text-center">
            <p className="font-semibold text-white">Password updated.</p>
            <p className="mt-2 text-sm text-surface-200">Taking you to your dashboard…</p>
          </div>
        )}

        {phase === "ready" && (
          <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">New password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  autoComplete="new-password"
                  className={inputCls}
                  style={{ fontSize: 16 }}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-200 hover:text-white"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm new password</label>
              <input
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className={inputCls}
                style={{ fontSize: 16 }}
              />
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-6 py-3.5 font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Save Password <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
