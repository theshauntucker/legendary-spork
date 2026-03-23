"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  Shield,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [parentConsent, setParentConsent] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!parentConsent || !dataConsent) {
      setError("You must agree to both consent statements to create an account.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseBrowser();

      // Create the account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError("Account created but could not retrieve user ID.");
        setLoading(false);
        return;
      }

      // Store COPPA consent records
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
      const consentRecords = [
        {
          user_id: userId,
          consent_type: "coppa_parent",
          consent_version: "v1.0",
          user_agent: userAgent,
        },
        {
          user_id: userId,
          consent_type: "coppa_data_processing",
          consent_version: "v1.0",
          user_agent: userAgent,
        },
      ];

      const { error: consentError } = await supabase
        .from("consent_records")
        .insert(consentRecords);

      if (consentError) {
        console.error("Failed to store consent records:", consentError);
        // Don't block signup if consent storage fails — the account is already created
        // Log this for manual review
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-primary-400" />
            <span className="text-lg font-bold">
              Routine<span className="gradient-text">X</span>
            </span>
          </a>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
            Create Your Account
          </h1>
          <p className="mt-2 text-sm text-surface-200">
            Get AI-powered analysis for every routine.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-8 text-center"
            >
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Account Created!</h2>
              <p className="text-sm text-surface-200 mb-6">
                Check your email for a confirmation link, then you&apos;re ready to
                start analyzing routines.
              </p>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Go to Login
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSignup}
              className="glass rounded-3xl p-6 sm:p-8 space-y-5"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address <span className="text-accent-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  required
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Password <span className="text-accent-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
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

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password <span className="text-accent-400">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">
                    Parental Consent (Required)
                  </span>
                </div>
              </div>

              {/* COPPA Consent Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={parentConsent}
                    onChange={(e) => setParentConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500 accent-primary-500"
                  />
                  <span className="text-sm text-surface-200 group-hover:text-white transition-colors">
                    I am the parent or legal guardian of any minor whose dance/cheer
                    routines will be submitted for analysis through RoutineX.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={dataConsent}
                    onChange={(e) => setDataConsent(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500 accent-primary-500"
                  />
                  <span className="text-sm text-surface-200 group-hover:text-white transition-colors">
                    I consent to the temporary processing of still-frame images
                    extracted from my child&apos;s routine video by our AI analysis
                    provider (Anthropic). These images are analyzed anonymously and
                    automatically deleted from our servers within 24 hours.
                  </span>
                </label>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-400 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-accent-500 to-gold-500 px-6 py-3.5 text-base font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-surface-200 text-center">
                Already have an account?{" "}
                <a href="/login" className="text-primary-400 hover:underline">
                  Sign in
                </a>
              </p>

              <p className="text-xs text-surface-200/50 text-center">
                By creating an account you agree to our{" "}
                <a href="/privacy" className="text-primary-400/70 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
