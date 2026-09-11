"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import RoutineXLogo from "@/components/RoutineXLogo";

const inputCls =
  "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors";

function ForgotForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">Forgot your password?</h1>
          <p className="mt-2 text-surface-200">We&apos;ll email you a link to set a new one.</p>
        </div>

        {sent ? (
          <div className="glass rounded-3xl p-6 sm:p-8 text-center">
            <MailCheck className="mx-auto h-10 w-10 text-green-400" />
            <p className="mt-4 font-semibold text-white">Check your email</p>
            <p className="mt-2 text-sm text-surface-200 leading-relaxed">
              If there&apos;s a RoutineX account for <span className="text-white">{email}</span>, a reset link is on its
              way. It can take a minute — check spam if you don&apos;t see it.
            </p>
            <a href="/login" className="mt-6 inline-block text-sm text-primary-400 hover:underline font-medium">
              Back to log in
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass rounded-3xl p-6 sm:p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
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
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-surface-200">
          Remembered it?{" "}
          <a href="/login" className="text-primary-400 hover:underline font-medium">
            Log in
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotForm />
    </Suspense>
  );
}
