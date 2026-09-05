"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Code, ArrowLeft, Bot, PlusCircle, CheckCircle,
  DollarSign, Star, Users, ExternalLink, Globe, Upload
} from "lucide-react";

export default function DeveloperPage() {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    ensSubname: "",
    category: "ONCHAIN",
    priceMonthly: "3.00",
    description: "",
  });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100">
      <header className="border-b border-slate-800/80 bg-[#0B0D13]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 font-mono border border-purple-500/20">
              Developer Portal
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Agent Developer Studio</h1>
          <p className="mt-2 text-sm text-slate-400">
            Build, publish, and monetize AI agents. Receive 97.5% of subscription revenue settled via Arc USDC.
          </p>
        </div>

        {/* Developer Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Lifetime USDC Earnings</span>
            <div className="mt-2 text-3xl font-extrabold text-emerald-400">$1,420.50</div>
            <span className="text-[11px] text-slate-500 mt-1 block">97.5% Developer Split via Arc</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Active Subscribers</span>
            <div className="mt-2 text-3xl font-extrabold text-white">38 Users</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Across 2 published agents</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Average Reputation Score</span>
            <div className="mt-2 text-3xl font-extrabold text-cyan-400">94 / 100</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Anti-sybil verifiable reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Publish Agent Form */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" /> Publish New Agent
            </h2>

            {published ? (
              <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Agent Published & Registered on ENS!</h3>
                <p className="text-xs text-slate-300">
                  Bound to <strong>{form.slug || "myagent"}.agentfi.eth</strong>. Available for WhatsApp discovery.
                </p>
                <button
                  onClick={() => setPublished(false)}
                  className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-semibold text-white mt-2"
                >
                  Publish Another Agent
                </button>
              </div>
            ) : (
              <form onSubmit={handlePublish} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Agent Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. YieldHunter Pro"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">ENS Subname</label>
                    <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3">
                      <input
                        type="text"
                        required
                        placeholder="yieldhunter"
                        value={form.slug}
                        onChange={e => setForm({ ...form, slug: e.target.value })}
                        className="w-full py-2.5 bg-transparent text-sm text-white focus:outline-none"
                      />
                      <span className="text-xs text-slate-500 font-mono">.agentfi.eth</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Monthly Price (USDC)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={form.priceMonthly}
                      onChange={e => setForm({ ...form, priceMonthly: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Description & Capabilities</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe how your agent analyzes or executes trades..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={publishing}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm transition"
                >
                  {publishing ? "Registering on ENS & Uploading Manifest..." : "Publish to Marketplace"}
                </button>
              </form>
            )}
          </div>

          {/* Machine-Readable Manifest Preview */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-slate-400 font-sans font-bold flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" /> Machine-Readable Agent Manifest
              </span>
              <span className="text-[10px] text-slate-500">ERC-8004 Standard</span>
            </div>

            <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{JSON.stringify({
  name: form.name || "WhaleWatcher Pro",
  ens_name: `${form.slug || "whalewatcher"}.agentfi.eth`,
  version: "1.2.0",
  pricing: {
    model: "SUBSCRIPTION",
    amount_usdc: parseFloat(form.priceMonthly) || 3.0,
    per_query_x402_hbar: 0.25
  },
  capabilities: [
    "THE_GRAPH_SUBGRAPH_QUERYING",
    "WHALE_NET_FLOW_ANALYSIS",
    "HEDERA_X402_PAYMENT_RECEPTOR"
  ],
  guardrails: {
    max_slippage: "0.5%",
    fail_closed: true,
    risk_guardian_verified: true
  }
}, null, 2)}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
