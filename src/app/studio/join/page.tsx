"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Loader2, CheckCircle, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/**
 * Join flow:
 * - ?code=xxx pre-fills the invite code.
 * - If the user is not signed in, they enter email/password and we either
 *   sign them in or create an account on the fly (same auto-confirm pattern
 *   as /signup).
 * - Then POST /api/studio/join consumes the invite.
 * - On success, land on /studio/team.
 */
function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) setCode(urlCode);

    supabase.auth.getUser().then(({ data }) => {
      setSessionReady(!!data.user);
    });
  }, [searchParams, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!code.trim()) {
      setError("Invite code is required.");
      setLoading(false);
      return;
    }

    // Ensure the user has an authenticated session
    if (!sessionReady) {
      if (mode === "signup") {
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";
        const { data: signUpData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${baseUrl}/auth/callback` },
        });
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
        if (signUpData.user && !signUpData.session) {
          const { error: siErr } = await supabase.auth.signInWithPassword({ email, password });
          if (siErr) {
            setError("Account created but sign-in failed. Please log in.");
            setLoading(false);
            return;
          }
        }
      } else {
        const { error: siErr } = await supabase.auth.signInWithPassword({ email, password });
        if (siErr) {
          setError(siErr.message);
          setLoading(false);
          return;
        }
      }
    }

    // Consume invite
    const res = await fetch("/api/studio/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });
    if (!res.ok) {
      const { error: apiErr } = await res.json().catch(() => ({ error: "Could not join studio" }));
      setError(apiErr || "Could not join studio");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/studio/dashboard");
      router.refresh();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary-400" />
            <span className="text-lg font-bold">
              Routine<span className="gradient-text">X</span>
            </span>
          </a>
          <Users className="mx-auto h-8 w-8 text-primary-400 mb-3" />
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
            Join Your Studio
          </h1>
          <p className="mt-2 text-surface-200 text-sm">
            Enter the invite code from your studio owner.
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 text-center"
          >
            <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
            <h2 className="text-xl font-bold">You&apos;re in!</h2>
            <p className="mt-2 text-surface-200 text-sm">Heading to your studio dashboard…</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                Invite Code <span className="text-accent-400">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 4f2k-h8pz-r3xm"
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors font-mono tracking-wide"
              />
            </div>

            {sessionReady === false && (
              <>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className={`flex-1 rounded-full py-2 transition-colors ${
                      mode === "signin"
                        ? "bg-primary-600 text-white"
                        : "bg-white/5 text-surface-200 hover:bg-white/10"
                    }`}
                  >
                    I have an account
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className={`flex-1 rounded-full py-2 transition-colors ${
                      mode === "signup"
                        ? "bg-primary-600 text-white"
                        : "bg-white/5 text-surface-200 hover:bg-white/10"
                    }`}
                  >
                    Create one
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-accent-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password <span className="text-accent-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                    required
                    minLength={6}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </>
            )}

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || sessionReady === null}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-6 py-3.5 font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Join Studio
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-surface-200">
          Need to create your own studio?{" "}
          <a href="/studio/signup" className="text-primary-400 hover:underline font-medium">
            Start a studio
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default function StudioJoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
        </div>
      }
    >
      <JoinForm />
    </Suspense>
  );
}
