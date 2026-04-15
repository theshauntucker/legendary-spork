"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  Users,
  Music,
  Trophy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { US_STATES } from "@/lib/studio/us-states";

export default function StudioSignupPage() {
  const router = useRouter();

  const [ownerName, setOwnerName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [region, setRegion] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!ownerName.trim()) {
      setError("Your name is required.");
      setLoading(false);
      return;
    }
    if (!studioName.trim() || studioName.trim().length < 2) {
      setError("Studio name must be at least 2 characters.");
      setLoading(false);
      return;
    }
    if (!region) {
      setError("Please choose your state.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://routinex.org";

    // 1. Create auth user (mirrors existing /signup so account creation
    //    behavior is identical — auto-confirm produces an immediate session)
    const { data: signUpData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: ownerName, account_type: "studio_owner" },
        emailRedirectTo: `${baseUrl}/auth/callback`,
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Auto-confirm may not issue a session in some configs — sign in if so
    if (signUpData.user && !signUpData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Account created but sign-in failed. Please log in.");
        setLoading(false);
        return;
      }
    }

    // 2. Create the studios row + owner member via our API route
    const signupRes = await fetch("/api/studio/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studioName: studioName.trim(), region }),
    });
    if (!signupRes.ok) {
      const { error: apiErr } = await signupRes.json().catch(() => ({ error: "Unknown error" }));
      setError(apiErr || "Could not create studio.");
      setLoading(false);
      return;
    }

    // 3. Redirect to Stripe for the trial subscription. 30-day free trial,
    //    no charge today; webhook creates the credit pool on success.
    const subRes = await fetch("/api/studio/subscribe", { method: "POST" });
    if (!subRes.ok) {
      // Studio was created successfully; land on dashboard so the owner
      // sees the subscription-setup banner and can retry from there.
      setSuccess(true);
      setTimeout(() => {
        router.push("/studio/dashboard?subscribe=pending");
        router.refresh();
      }, 1200);
      return;
    }
    const { url } = await subRes.json();
    if (url) {
      window.location.href = url;
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/studio/dashboard");
      router.refresh();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary-400" />
            <span className="text-lg font-bold">
              Routine<span className="gradient-text">X</span> for Studios
            </span>
          </a>
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">
            Your Studio&apos;s Private Edge
          </h1>
          <p className="mt-3 text-surface-200 text-sm">
            30-day free trial. Shared credit pool. Music Hub with collision
            detection. Team board. Cancel anytime.
          </p>
        </div>

        {/* Feature teaser */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass rounded-xl p-3 text-center">
            <Users className="mx-auto h-5 w-5 text-primary-400 mb-1" />
            <p className="text-xs text-surface-200">Team Board</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <Music className="mx-auto h-5 w-5 text-accent-400 mb-1" />
            <p className="text-xs text-surface-200">Music Hub</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <Trophy className="mx-auto h-5 w-5 text-gold-400 mb-1" />
            <p className="text-xs text-surface-200">Season Schedule</p>
          </div>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-8 text-center"
          >
            <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
            <h2 className="text-xl font-bold">Studio Created</h2>
            <p className="mt-2 text-surface-200 text-sm">
              Taking you to your studio dashboard...
            </p>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="glass rounded-3xl p-6 sm:p-8 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Name <span className="text-accent-400">*</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Sarah Tucker"
                  required
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Studio Name <span className="text-accent-400">*</span>
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  placeholder="Elite Dance Studio"
                  required
                  minLength={2}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                State <span className="text-accent-400">*</span>
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="" className="bg-surface-900">
                  Select your state…
                </option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code} className="bg-surface-900">
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-surface-200">
                Used to warn you when other studios in your state lock in the
                same competition song. Never used to reveal your identity.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email <span className="text-accent-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
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
                  Start 30-Day Free Trial
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="text-xs text-surface-200 text-center">
              No charge today. Card required. Cancel anytime in Settings.
            </p>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-surface-200">
          Have an invite code?{" "}
          <a href="/studio/join" className="text-primary-400 hover:underline font-medium">
            Join an existing studio
          </a>
        </p>
        <p className="mt-2 text-center text-xs text-surface-200/70">
          Looking for the dancer account?{" "}
          <a href="/signup" className="hover:underline">
            Sign up here
          </a>
        </p>
      </motion.div>
    </div>
  );
}
