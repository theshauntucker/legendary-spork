"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Loader2, Sparkles } from "lucide-react";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("parent");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [position, setPosition] = useState(0);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setPosition(data.position);
      } else {
        if (data.alreadyJoined) {
          setSuccess(true);
          setPosition(0);
        } else {
          setError(data.error || "Something went wrong.");
        }
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setSuccess(false);
      setEmail("");
      setName("");
      setError("");
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md glass rounded-3xl p-6 sm:p-8">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 text-surface-200" />
              </button>

              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    >
                      <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
                    </motion.div>
                    <h3 className="mt-4 text-2xl font-bold">You&apos;re In!</h3>
                    {position > 0 ? (
                      <p className="mt-2 text-surface-200">
                        You&apos;re <span className="text-white font-bold">#{position}</span> on the waitlist.
                        We&apos;ll email you when it&apos;s time to get started.
                      </p>
                    ) : (
                      <p className="mt-2 text-surface-200">
                        You&apos;re already on the list! We&apos;ll email you when it&apos;s time.
                      </p>
                    )}
                    <p className="mt-4 text-sm text-surface-200">
                      Want to skip the line?{" "}
                      <a href="#pricing" onClick={handleClose} className="text-primary-400 font-semibold hover:underline">
                        Get Early Access for $9.99
                      </a>
                    </p>
                    <button
                      onClick={handleClose}
                      className="mt-6 rounded-full bg-white/10 px-6 py-2 text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                      Done
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="text-center mb-6">
                      <Sparkles className="mx-auto h-8 w-8 text-primary-400 mb-3" />
                      <h3 className="text-2xl font-bold">Join the Free Waitlist</h3>
                      <p className="mt-2 text-sm text-surface-200">
                        Be the first to know when RoutineX launches. No payment required.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          Email <span className="text-accent-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="First name"
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1.5">
                          I am a...
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors appearance-none"
                        >
                          <option value="parent" className="bg-surface-900">Dance Parent</option>
                          <option value="coach" className="bg-surface-900">Coach / Choreographer</option>
                          <option value="studio_owner" className="bg-surface-900">Studio Owner</option>
                          <option value="dancer" className="bg-surface-900">Dancer</option>
                          <option value="cheer" className="bg-surface-900">Cheer Coach / Parent</option>
                        </select>
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
                          "Join the Waitlist — Free"
                        )}
                      </button>

                      <p className="text-center text-xs text-surface-200">
                        Or{" "}
                        <a href="#pricing" onClick={handleClose} className="text-primary-400 hover:underline">
                          skip the line with Early Access ($9.99)
                        </a>
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
