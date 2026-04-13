"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
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

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://faithlens.org";
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

    if (signUpData.user && !signUpData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError("Account created but sign-in failed. Please log in.");
        setLoading(false);
        return;
      }
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-accent-50 via-white to-amber-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">FL</span>
            </div>
            <span className="text-xl font-heading text-slate-900">
              FaithLens
            </span>
          </a>
          <h1 className="text-3xl font-heading text-slate-900">
            Create Your Account
          </h1>
          <p className="mt-2 text-slate-500">
            Join the community and start exploring
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
              <svg
                className="h-6 w-6 text-brand-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="text-xl font-heading text-slate-900">
              Account Created!
            </h2>
            <p className="mt-2 text-slate-500 text-sm">
              Redirecting you to your dashboard...
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email <span className="text-accent-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password <span className="text-accent-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent-600 px-6 py-3.5 font-semibold text-white hover:bg-accent-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-accent-600 hover:underline font-medium"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <svg className="h-8 w-8 animate-spin text-accent-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
