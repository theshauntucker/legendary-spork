"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  Gift,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import UploadTrustBadge from "@/components/UploadTrustBadge";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Capture ?ref= from URL on mount
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${baseUrl}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Auto-confirm is on — sign them in immediately so checkout works
    if (signUpData.user && !signUpData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Account created but sign-in failed. Please log in.");
        setLoading(false);
        return;
      }
    }

    // Grant the free credit immediately after sign-in.
    // auth/callback only runs for confirmation email links — not direct signups
    // with auto-confirm ON — so we grant it here to ensure no one is missed.
    fetch("/api/free-credit", { method: "POST" }).catch((err) =>
      console.error("Free credit grant failed:", err)
    );

    setSuccess(true);
    setLoading(false);

    // Record referral code if present (fire and forget)
    if (referralCode.trim()) {
      fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: referralCode.trim() }),
      }).catch(() => {});
    }

    // Notify admin of new signup immediately (fire and forget)
    fetch("/api/notify-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "signup", email, name, referralCode: referralCode.trim() || undefined }),
    }).catch(() => {});

    // Send to dashboard — they'll see the welcome banner + pricing options there
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
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary-400" />
            <span className="text-lg font-bold">
              Routine<span className="gradient-text">X</span>
            </span>
          </a>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
            Create Your Account
          </h1>
          <p className="mt-2 text-surface-200">
            
          </p>
          <div className="mt-4">
            <UploadTrustBadge />
          </div>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 text-center"
          >
            <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
            <h2 className="text-xl font-bold">Account Created!</h2>
            <p className="mt-2 text-surface-200 text-sm">
              Your first analysis is on us. Taking you to your dashboard...
            </p>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="glass rounded-3xl p-6 sm:p-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sarah Tucker"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
              />
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 pr-10 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-200 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <span className="flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5 text-gold-400" />
                  Referral Code
                  <span className="text-surface-200 text-xs font-normal">(optional)</span>
                </span>
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g., DANCERJEN"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-gold-500 transition-colors uppercase tracking-wider"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-6 py-3.5 font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-xs text-surface-200 text-center">
              By signing up, you agree to our Terms of Service. Your video never leaves your device — only still-frame thumbnails are analyzed. Nothing is uploaded, stored, or shared. Built by dance parents.
            </p>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-surface-200">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-primary-400 hover:underline font-medium"
          >
            Log in
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
