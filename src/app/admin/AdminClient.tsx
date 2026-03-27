"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, DollarSign, BarChart3, Sparkles,
  ChevronDown, ChevronUp, Plus, Minus, RefreshCw,
  CheckCircle, AlertCircle, Activity, TrendingUp,
  Video, Star, ExternalLink, LogOut, Gift, Link2,
  Trash2, Pause, Play, Edit3, Copy, X
} from "lucide-react";

interface UserRecord {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastSignIn: string | null;
  totalCredits: number;
  usedCredits: number;
  remaining: number;
  isBeta: boolean;
  totalPaid: number;
  videoCount: number;
  analysisCount: number;
  hasConverted: boolean;
  payments: Array<{
    id: string;
    payment_type: string;
    amount_cents: number;
    credits_granted: number;
    created_at: string;
    status: string;
  }>;
}

interface AnalysisRecord {
  id: string;
  videoId: string;
  userId: string;
  totalScore: number;
  awardLevel: string;
  createdAt: string;
}

interface ActivityItem {
  type: "payment" | "signup";
  date: string;
  userId: string;
  detail: string;
  amount: number;
}

interface AffiliateRecord {
  id: string;
  code: string;
  name: string;
  email: string | null;
  revenue_share_pct: number;
  status: string;
  notes: string | null;
  total_signups: number;
  total_revenue_cents: number;
  total_payout_cents: number;
  created_at: string;
  updated_at: string;
  referredUsers: Array<{ email: string; name: string; totalPaid: number }>;
  actualRevenue: number;
  owedAmount: number;
}

interface Stats {
  totalRevenue: number;
  singleRevenue: number;
  packRevenue: number;
  singleCount: number;
  packCount: number;
  totalMembers: number;
  convertedMembers: number;
  conversionRate: number;
  totalAnalyses: number;
  totalVideos: number;
}

interface Props {
  users: UserRecord[];
  payments: Array<Record<string, unknown>>;
  affiliates: AffiliateRecord[];
  analyses: AnalysisRecord[];
  recentActivity: ActivityItem[];
  stats: Stats;
}

type Tab = "overview" | "members" | "payments" | "analyses" | "affiliates";

export default function AdminClient({ users: initialUsers, affiliates: initialAffiliates, analyses, recentActivity, stats }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [affiliates, setAffiliates] = useState(initialAffiliates);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [expandedAffiliate, setExpandedAffiliate] = useState<string | null>(null);
  const [creditInputs, setCreditInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Record<string, { type: "success" | "error"; text: string }>>({});
  const [showAddAffiliate, setShowAddAffiliate] = useState(false);
  const [newAffiliate, setNewAffiliate] = useState({ code: "", name: "", email: "", revenueSharePct: "20", notes: "" });

  const showMessage = (userId: string, type: "success" | "error", text: string) => {
    setMessages((prev) => ({ ...prev, [userId]: { type, text } }));
    setTimeout(() => setMessages((prev) => { const n = { ...prev }; delete n[userId]; return n; }), 3000);
  };

  const adjustCredits = async (userId: string, amount: number) => {
    setLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setUsers((prev) => prev.map((u) =>
        u.id === userId
          ? { ...u, totalCredits: u.totalCredits + amount, remaining: u.remaining + amount }
          : u
      ));
      showMessage(userId, "success", `${amount > 0 ? "+" : ""}${amount} credits applied`);
      setCreditInputs((prev) => ({ ...prev, [userId]: "" }));
    } catch (err) {
      showMessage(userId, "error", err instanceof Error ? err.message : "Error");
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const resetCredits = async (userId: string, amount: number) => {
    setLoading((prev) => ({ ...prev, [`reset_${userId}`]: true }));
    try {
      const res = await fetch("/api/admin/credits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, totalCredits: amount, usedCredits: 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setUsers((prev) => prev.map((u) =>
        u.id === userId ? { ...u, totalCredits: amount, usedCredits: 0, remaining: amount } : u
      ));
      showMessage(userId, "success", `Credits reset to ${amount}`);
    } catch (err) {
      showMessage(userId, "error", err instanceof Error ? err.message : "Error");
    } finally {
      setLoading((prev) => ({ ...prev, [`reset_${userId}`]: false }));
    }
  };

  // === Affiliate management functions ===
  const createAffiliate = async () => {
    if (!newAffiliate.code || !newAffiliate.name) return;
    setLoading(prev => ({ ...prev, createAffiliate: true }));
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newAffiliate.code,
          name: newAffiliate.name,
          email: newAffiliate.email || undefined,
          revenueSharePct: parseFloat(newAffiliate.revenueSharePct) || 20,
          notes: newAffiliate.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setAffiliates(prev => [{ ...data.affiliate, referredUsers: [], actualRevenue: 0, owedAmount: 0 }, ...prev]);
      setNewAffiliate({ code: "", name: "", email: "", revenueSharePct: "20", notes: "" });
      setShowAddAffiliate(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create affiliate");
    } finally {
      setLoading(prev => ({ ...prev, createAffiliate: false }));
    }
  };

  const updateAffiliateStatus = async (id: string, status: string) => {
    setLoading(prev => ({ ...prev, [`aff_${id}`]: true }));
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed");
      setAffiliates(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch {
      alert("Failed to update affiliate status");
    } finally {
      setLoading(prev => ({ ...prev, [`aff_${id}`]: false }));
    }
  };

  const updateAffiliatePayout = async (id: string, amount: number) => {
    setLoading(prev => ({ ...prev, [`payout_${id}`]: true }));
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, totalPayoutCents: amount }),
      });
      if (!res.ok) throw new Error("Failed");
      setAffiliates(prev => prev.map(a => a.id === id ? { ...a, total_payout_cents: amount } : a));
    } catch {
      alert("Failed to update payout");
    } finally {
      setLoading(prev => ({ ...prev, [`payout_${id}`]: false }));
    }
  };

  const deleteAffiliate = async (id: string) => {
    if (!confirm("Delete this affiliate? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/affiliates?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setAffiliates(prev => prev.filter(a => a.id !== id));
    } catch {
      alert("Failed to delete affiliate");
    }
  };

  const copyReferralLink = (code: string) => {
    navigator.clipboard.writeText(`https://routinex.org/signup?ref=${code}`);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "members", label: `Members (${users.length})`, icon: Users },
    { id: "affiliates", label: `Affiliates (${affiliates.length})`, icon: Gift },
    { id: "payments", label: `Revenue`, icon: DollarSign },
    { id: "analyses", label: `Analyses (${analyses.length})`, icon: Star },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-primary-400" />
            <div>
              <h1 className="text-2xl font-bold">RoutineX <span className="gradient-text">Admin</span></h1>
              <p className="text-xs text-surface-200">Internal dashboard — for your eyes only</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://vercel.com/theshauntuckers-projects/routinex/analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors glass rounded-lg px-3 py-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Site Analytics
            </a>
            <button onClick={() => window.location.reload()} className="flex items-center gap-1.5 text-xs text-surface-200 hover:text-white glass rounded-lg px-3 py-2 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <a href="/dashboard" className="flex items-center gap-1.5 text-xs text-surface-200 hover:text-white glass rounded-lg px-3 py-2 transition-colors">
              <LogOut className="h-3.5 w-3.5" />
              My Dashboard
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary-600 text-white"
                  : "text-surface-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: `$${(stats.totalRevenue / 100).toFixed(2)}`, icon: DollarSign, color: "text-green-400", sub: `$${(stats.singleRevenue/100).toFixed(2)} singles + $${(stats.packRevenue/100).toFixed(2)} packs` },
                { label: "Total Members", value: stats.totalMembers, icon: Users, color: "text-primary-400", sub: `${stats.convertedMembers} paid` },
                { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-gold-400", sub: `${stats.convertedMembers} of ${stats.totalMembers}` },
              ].map((s) => (
                <div key={s.label} className="glass rounded-2xl p-5">
                  <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-surface-200 mt-0.5">{s.label}</div>
                  <div className="text-[10px] text-surface-200/60 mt-1">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Revenue breakdown */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><DollarSign className="h-4 w-4 text-green-400" /> Revenue Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-200">$8.99 Single purchases</span>
                    <div className="text-right">
                      <span className="font-bold text-green-400">${(stats.singleRevenue/100).toFixed(2)}</span>
                      <span className="text-xs text-surface-200 ml-2">({stats.singleCount} sales)</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-200">$29.99 Pack purchases</span>
                    <div className="text-right">
                      <span className="font-bold text-green-400">${(stats.packRevenue/100).toFixed(2)}</span>
                      <span className="text-xs text-surface-200 ml-2">({stats.packCount} sales)</span>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl text-green-400">${(stats.totalRevenue/100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-primary-400" /> Recent Activity</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {recentActivity.length === 0 && <p className="text-xs text-surface-200">No activity yet.</p>}
                  {recentActivity.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.type === "payment" ? "bg-green-400" : "bg-primary-400"}`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-surface-200 truncate block">{item.detail}</span>
                      </div>
                      <div className="text-surface-200/60 shrink-0">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      {item.amount > 0 && (
                        <span className="text-green-400 font-semibold shrink-0">${(item.amount/100).toFixed(2)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Site analytics link */}
            <div className="glass rounded-2xl p-5 border border-primary-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary-400" /> Site Visitors & Traffic</h3>
                  <p className="text-sm text-surface-200 mt-1">View real-time visitor data, page views, and traffic sources in Vercel Analytics.</p>
                </div>
                <a
                  href="https://vercel.com/theshauntuckers-projects/routinex/analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors shrink-0"
                >
                  Open Analytics <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === "members" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-semibold">All Members ({users.length})</h2>
                <div className="flex gap-3 text-xs text-surface-200">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Paid ({users.filter(u=>u.hasConverted).length})</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-surface-200 inline-block" /> Free ({users.filter(u=>!u.hasConverted).length})</span>
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {users.length === 0 && <div className="px-6 py-10 text-center text-surface-200">No members yet.</div>}
                {users.map((user) => (
                  <div key={user.id}>
                    <div
                      className="px-5 py-4 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${user.hasConverted ? "bg-green-400" : "bg-surface-200/40"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">{user.email}</span>
                          {user.isBeta && <span className="text-[10px] bg-gold-500/20 text-gold-400 px-1.5 py-0.5 rounded-full">Pack</span>}
                          {!user.hasConverted && <span className="text-[10px] bg-white/10 text-surface-200 px-1.5 py-0.5 rounded-full">Free</span>}
                        </div>
                        <div className="text-xs text-surface-200 mt-0.5">
                          Joined {new Date(user.createdAt).toLocaleDateString()} · {user.analysisCount} analyses · {user.videoCount} videos
                        </div>
                      </div>
                      <div className="text-right hidden sm:block shrink-0">
                        <div className="text-sm font-semibold text-green-400">${(user.totalPaid/100).toFixed(2)}</div>
                        <div className="text-xs text-surface-200">paid</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-sm font-bold ${user.remaining > 0 ? "text-green-400" : "text-red-400"}`}>{user.remaining}</div>
                        <div className="text-xs text-surface-200">credits</div>
                      </div>
                      {expandedUser === user.id ? <ChevronUp className="h-4 w-4 text-surface-200 shrink-0" /> : <ChevronDown className="h-4 w-4 text-surface-200 shrink-0" />}
                    </div>

                    {expandedUser === user.id && (
                      <div className="px-5 pb-5 bg-white/5 border-t border-white/5 space-y-4">
                        {/* Credit summary */}
                        <div className="pt-4 grid grid-cols-3 gap-3 text-sm">
                          {[
                            { label: "Total Granted", value: user.totalCredits },
                            { label: "Used", value: user.usedCredits },
                            { label: "Remaining", value: user.remaining, color: user.remaining > 0 ? "text-green-400" : "text-red-400" },
                          ].map(s => (
                            <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                              <div className={`font-bold text-lg ${s.color ?? ""}`}>{s.value}</div>
                              <div className="text-xs text-surface-200">{s.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Quick credit actions */}
                        <div>
                          <p className="text-xs text-surface-200 font-semibold uppercase tracking-wider mb-2">Adjust Credits</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {[1, 3, 5, 10].map(n => (
                              <button key={n} onClick={() => adjustCredits(user.id, n)} disabled={loading[user.id]}
                                className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 flex items-center gap-1">
                                <Plus className="h-3 w-3" />+{n}
                              </button>
                            ))}
                            {[-1, -3].map(n => (
                              <button key={n} onClick={() => adjustCredits(user.id, n)} disabled={loading[user.id]}
                                className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 flex items-center gap-1">
                                <Minus className="h-3 w-3" />{Math.abs(n)}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Custom (+5 or -2)"
                              value={creditInputs[user.id] ?? ""}
                              onChange={(e) => setCreditInputs(prev => ({ ...prev, [user.id]: e.target.value }))}
                              className="flex-1 text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500"
                            />
                            <button
                              onClick={() => { const val = parseInt(creditInputs[user.id] ?? "0"); if (!isNaN(val) && val !== 0) adjustCredits(user.id, val); }}
                              disabled={loading[user.id]}
                              className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-500 rounded-xl text-white font-medium disabled:opacity-50 transition-colors"
                            >Apply</button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs text-surface-200 self-center">Reset to:</span>
                            {[0, 1, 3, 5].map(n => (
                              <button key={n} onClick={() => resetCredits(user.id, n)} disabled={loading[`reset_${user.id}`]}
                                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50">
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>

                        {messages[user.id] && (
                          <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${messages[user.id].type === "success" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {messages[user.id].type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                            {messages[user.id].text}
                          </div>
                        )}

                        {/* Payment history */}
                        {user.payments.length > 0 && (
                          <div>
                            <p className="text-xs text-surface-200 font-semibold uppercase tracking-wider mb-2">Payment History</p>
                            {user.payments.map(p => (
                              <div key={p.id} className="flex items-center justify-between text-sm bg-white/5 rounded-xl px-4 py-2 mb-1">
                                <div>
                                  <span className="capitalize">{p.payment_type.replace("_", " ")}</span>
                                  <span className="text-surface-200 ml-2 text-xs">{new Date(p.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-surface-200">+{p.credits_granted} credits</span>
                                  <span className="font-semibold text-green-400">${(p.amount_cents/100).toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === "payments" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Total Revenue", value: `$${(stats.totalRevenue/100).toFixed(2)}`, color: "text-green-400" },
                { label: "Single Sales ($8.99)", value: `${stats.singleCount} × $8.99 = $${(stats.singleRevenue/100).toFixed(2)}`, color: "text-accent-400" },
                { label: "Pack Sales ($29.99)", value: `${stats.packCount} × $29.99 = $${(stats.packRevenue/100).toFixed(2)}`, color: "text-gold-400" },
              ].map(s => (
                <div key={s.label} className="glass rounded-2xl p-5">
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-surface-200 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="font-semibold">All Payments</h2>
              </div>
              <div className="divide-y divide-white/5">
                {users.flatMap(u => u.payments.map(p => ({ ...p, userEmail: u.email }))).length === 0 && (
                  <div className="px-6 py-8 text-center text-surface-200">No payments yet.</div>
                )}
                {users.flatMap(u => u.payments.map(p => ({ ...p, userEmail: u.email })))
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map(p => (
                    <div key={p.id} className="px-5 py-3 flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${p.payment_type === "beta_access" ? "bg-gold-400" : "bg-accent-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{p.userEmail}</p>
                        <p className="text-xs text-surface-200">{p.payment_type.replace("_", " ")} · {p.credits_granted} credits · {new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="font-bold text-green-400">${(p.amount_cents/100).toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* AFFILIATES TAB */}
        {activeTab === "affiliates" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Affiliate stats summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Active Affiliates", value: affiliates.filter(a => a.status === "active").length, color: "text-primary-400" },
                { label: "Total Referral Revenue", value: `$${(affiliates.reduce((s, a) => s + a.actualRevenue, 0) / 100).toFixed(2)}`, color: "text-green-400" },
                { label: "Total Owed", value: `$${(affiliates.reduce((s, a) => s + Math.max(0, a.owedAmount - a.total_payout_cents), 0) / 100).toFixed(2)}`, color: "text-gold-400" },
                { label: "Referred Signups", value: affiliates.reduce((s, a) => s + a.total_signups, 0), color: "text-accent-400" },
              ].map(s => (
                <div key={s.label} className="glass rounded-2xl p-5">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-surface-200 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Add affiliate button / form */}
            {!showAddAffiliate ? (
              <button
                onClick={() => setShowAddAffiliate(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Affiliate
              </button>
            ) : (
              <div className="glass rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2"><Gift className="h-4 w-4 text-gold-400" /> New Affiliate</h3>
                  <button onClick={() => setShowAddAffiliate(false)} className="text-surface-200 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-surface-200 block mb-1">Code *</label>
                    <input
                      type="text"
                      value={newAffiliate.code}
                      onChange={(e) => setNewAffiliate(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") }))}
                      placeholder="DANCERJEN"
                      className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500 uppercase tracking-wider"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-surface-200 block mb-1">Name *</label>
                    <input
                      type="text"
                      value={newAffiliate.name}
                      onChange={(e) => setNewAffiliate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Jen Smith"
                      className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-surface-200 block mb-1">Email</label>
                    <input
                      type="email"
                      value={newAffiliate.email}
                      onChange={(e) => setNewAffiliate(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="jen@example.com"
                      className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-surface-200 block mb-1">Revenue Share %</label>
                    <input
                      type="number"
                      value={newAffiliate.revenueSharePct}
                      onChange={(e) => setNewAffiliate(prev => ({ ...prev, revenueSharePct: e.target.value }))}
                      placeholder="20"
                      min="0"
                      max="100"
                      className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-surface-200 block mb-1">Notes</label>
                  <input
                    type="text"
                    value={newAffiliate.notes}
                    onChange={(e) => setNewAffiliate(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Instagram dancer with 50k followers..."
                    className="w-full text-sm bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-surface-200/50 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={createAffiliate}
                    disabled={!newAffiliate.code || !newAffiliate.name || loading.createAffiliate}
                    className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-500 rounded-xl text-white font-medium disabled:opacity-50 transition-colors"
                  >
                    {loading.createAffiliate ? "Creating..." : "Create Affiliate"}
                  </button>
                  {newAffiliate.code && (
                    <span className="text-xs text-surface-200">
                      Link: routinex.org/signup?ref={newAffiliate.code}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Affiliates list */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="font-semibold">All Affiliates ({affiliates.length})</h2>
              </div>
              <div className="divide-y divide-white/5">
                {affiliates.length === 0 && <div className="px-6 py-10 text-center text-surface-200">No affiliates yet. Add one above to get started.</div>}
                {affiliates.map((aff) => {
                  const unpaid = Math.max(0, aff.owedAmount - aff.total_payout_cents);
                  return (
                    <div key={aff.id}>
                      <div
                        className="px-5 py-4 flex items-center gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => setExpandedAffiliate(expandedAffiliate === aff.id ? null : aff.id)}
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${aff.status === "active" ? "bg-green-400" : aff.status === "paused" ? "bg-yellow-400" : "bg-surface-200/40"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{aff.name}</span>
                            <span className="text-[10px] bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full font-mono tracking-wider">{aff.code}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${aff.status === "active" ? "bg-green-500/20 text-green-400" : aff.status === "paused" ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 text-surface-200"}`}>{aff.status}</span>
                          </div>
                          <div className="text-xs text-surface-200 mt-0.5">
                            {aff.total_signups} signups · {aff.revenue_share_pct}% rev share · Since {new Date(aff.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right hidden sm:block shrink-0">
                          <div className="text-sm font-semibold text-green-400">${(aff.actualRevenue / 100).toFixed(2)}</div>
                          <div className="text-xs text-surface-200">revenue</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`text-sm font-bold ${unpaid > 0 ? "text-gold-400" : "text-surface-200"}`}>${(unpaid / 100).toFixed(2)}</div>
                          <div className="text-xs text-surface-200">owed</div>
                        </div>
                        {expandedAffiliate === aff.id ? <ChevronUp className="h-4 w-4 text-surface-200 shrink-0" /> : <ChevronDown className="h-4 w-4 text-surface-200 shrink-0" />}
                      </div>

                      {expandedAffiliate === aff.id && (
                        <div className="px-5 pb-5 bg-white/5 border-t border-white/5 space-y-4">
                          {/* Stats row */}
                          <div className="pt-4 grid grid-cols-4 gap-3 text-sm">
                            {[
                              { label: "Signups", value: aff.total_signups },
                              { label: "Revenue Generated", value: `$${(aff.actualRevenue / 100).toFixed(2)}`, color: "text-green-400" },
                              { label: "Their Share", value: `$${(aff.owedAmount / 100).toFixed(2)}`, color: "text-gold-400" },
                              { label: "Paid Out", value: `$${(aff.total_payout_cents / 100).toFixed(2)}` },
                            ].map(s => (
                              <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                                <div className={`font-bold text-lg ${s.color ?? ""}`}>{s.value}</div>
                                <div className="text-xs text-surface-200">{s.label}</div>
                              </div>
                            ))}
                          </div>

                          {/* Referral link */}
                          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5">
                            <Link2 className="h-4 w-4 text-primary-400 shrink-0" />
                            <span className="text-sm text-surface-200 flex-1 truncate font-mono">routinex.org/signup?ref={aff.code}</span>
                            <button
                              onClick={() => copyReferralLink(aff.code)}
                              className="text-xs bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                            >
                              <Copy className="h-3 w-3" /> Copy Link
                            </button>
                          </div>

                          {/* Details */}
                          {aff.email && <div className="text-sm text-surface-200">Email: {aff.email}</div>}
                          {aff.notes && <div className="text-sm text-surface-200">Notes: {aff.notes}</div>}

                          {/* Referred users */}
                          {aff.referredUsers.length > 0 && (
                            <div>
                              <p className="text-xs text-surface-200 font-semibold uppercase tracking-wider mb-2">Referred Users</p>
                              {aff.referredUsers.map((ru, i) => (
                                <div key={i} className="flex items-center justify-between text-sm bg-white/5 rounded-xl px-4 py-2 mb-1">
                                  <span className="truncate">{ru.email} {ru.name && <span className="text-surface-200">({ru.name})</span>}</span>
                                  <span className="font-semibold text-green-400 shrink-0">${(ru.totalPaid / 100).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {aff.status === "active" ? (
                              <button onClick={() => updateAffiliateStatus(aff.id, "paused")} disabled={loading[`aff_${aff.id}`]}
                                className="text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 flex items-center gap-1">
                                <Pause className="h-3 w-3" /> Pause
                              </button>
                            ) : (
                              <button onClick={() => updateAffiliateStatus(aff.id, "active")} disabled={loading[`aff_${aff.id}`]}
                                className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 flex items-center gap-1">
                                <Play className="h-3 w-3" /> Activate
                              </button>
                            )}
                            {unpaid > 0 && (
                              <button onClick={() => updateAffiliatePayout(aff.id, aff.owedAmount)} disabled={loading[`payout_${aff.id}`]}
                                className="text-xs bg-gold-500/20 text-gold-400 hover:bg-gold-500/30 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" /> Mark Paid (${(unpaid / 100).toFixed(2)})
                              </button>
                            )}
                            <button onClick={() => deleteAffiliate(aff.id)}
                              className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ANALYSES TAB */}
        {activeTab === "analyses" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="font-semibold">All Analyses ({analyses.length})</h2>
                <div className="text-xs text-surface-200">
                  Avg score: {analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.totalScore, 0) / analyses.length) : "—"}/300
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {analyses.length === 0 && <div className="px-6 py-8 text-center text-surface-200">No analyses yet.</div>}
                {analyses.map((a) => {
                  const owner = users.find(u => u.id === a.userId);
                  const awardColors: Record<string, string> = {
                    Diamond: "text-gold-400 bg-gold-500/20",
                    Platinum: "text-primary-400 bg-primary-500/20",
                    "High Gold": "text-yellow-400 bg-yellow-500/20",
                    Gold: "text-yellow-600 bg-yellow-600/20",
                  };
                  const color = awardColors[a.awardLevel] ?? "text-surface-200 bg-white/10";
                  return (
                    <div key={a.id} className="px-5 py-3 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{owner?.email ?? "Unknown user"}</p>
                        <p className="text-xs text-surface-200">{new Date(a.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{a.totalScore}/300</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{a.awardLevel}</span>
                      </div>
                      <a
                        href={`/analysis/${a.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

