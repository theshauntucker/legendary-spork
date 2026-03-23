"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, DollarSign, BarChart3, Sparkles,
  ChevronDown, ChevronUp, Plus, Minus, RefreshCw,
  CheckCircle, AlertCircle, Activity, TrendingUp,
  Video, Star, ExternalLink, LogOut
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

interface Stats {
  totalRevenue: number;
  trialRevenue: number;
  packRevenue: number;
  trialCount: number;
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
  analyses: AnalysisRecord[];
  recentActivity: ActivityItem[];
  stats: Stats;
}

type Tab = "overview" | "members" | "payments" | "analyses";

export default function AdminClient({ users: initialUsers, analyses, recentActivity, stats }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [creditInputs, setCreditInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Record<string, { type: "success" | "error"; text: string }>>({});

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

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "members", label: `Members (${users.length})`, icon: Users },
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
                { label: "Total Revenue", value: `$${(stats.totalRevenue / 100).toFixed(2)}`, icon: DollarSign, color: "text-green-400", sub: `$${(stats.trialRevenue/100).toFixed(2)} trial + $${(stats.packRevenue/100).toFixed(2)} packs` },
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
                    <span className="text-sm text-surface-200">$4.99 Trial purchases</span>
                    <div className="text-right">
                      <span className="font-bold text-green-400">${(stats.trialRevenue/100).toFixed(2)}</span>
                      <span className="text-xs text-surface-200 ml-2">({stats.trialCount} sales)</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-surface-200">$24.99 Pack purchases</span>
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
                { label: "Trial Sales ($4.99)", value: `${stats.trialCount} × $4.99 = $${(stats.trialRevenue/100).toFixed(2)}`, color: "text-accent-400" },
                { label: "Pack Sales ($24.99)", value: `${stats.packCount} × $24.99 = $${(stats.packRevenue/100).toFixed(2)}`, color: "text-gold-400" },
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

