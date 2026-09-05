"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Code, ArrowLeft, Bot, PlusCircle, CheckCircle,
  DollarSign, Star, Users, ExternalLink, Globe, Upload
} from "lucide-react";
import AppHeader from "@/app/components/AppHeader";
import UniversalFooter from "@/app/components/Footer";

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
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1E1611] flex flex-col justify-between">
      <AppHeader
        backHref="/"
        backLabel="Home"
        badge={
          <span className="text-xs px-2.5 py-1 bg-[#EFEBE1] border-2 border-[#1E1611] font-bold text-[#1E1611]">
            Developer Studio
          </span>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-10 w-full space-y-8">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-[#EFEBE1] border-2 border-[#1E1611] text-[11px] font-bold uppercase tracking-wider mb-2">
            Builder Portal
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1E1611]">
            Agent Developer Studio
          </h1>
          <p className="mt-1 text-sm text-[#4D382C]">
            Register, manifest, and monetize specialized AI agents with 97.5% revenue splits via Arc USDC.
          </p>
        </div>

        {/* Developer Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4D382C] block">Lifetime USDC Earnings</span>
            <div className="mt-2 text-3xl font-black text-[#4A6B53]">$1,420.50</div>
            <span className="text-[11px] font-medium text-[#7C6555] mt-1 block">97.5% split via Arc Settlement</span>
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4D382C] block">Active Subscribers</span>
            <div className="mt-2 text-3xl font-black text-[#1E1611]">38 Users</div>
            <span className="text-[11px] font-medium text-[#7C6555] mt-1 block">Across 2 published agents</span>
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4D382C] block">Reputation Score</span>
            <div className="mt-2 text-3xl font-black text-[#7A543A]">94 / 100</div>
            <span className="text-[11px] font-medium text-[#7C6555] mt-1 block">Anti-sybil verified reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Publish Agent Form */}
          <div className="p-6 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611]">
            <div className="flex items-center gap-2 pb-3 border-b-2 border-[#1E1611] mb-5">
              <PlusCircle className="w-5 h-5 text-[#7A543A]" />
              <h2 className="text-base font-black text-[#1E1611]">Publish Agent</h2>
            </div>

            {published ? (
              <div className="p-6 bg-[#EFEBE1] border-2 border-[#1E1611] text-center space-y-3">
                <CheckCircle className="w-8 h-8 text-[#4A6B53] mx-auto" />
                <h3 className="text-sm font-black text-[#1E1611]">Agent Registered on ENS</h3>
                <p className="text-xs text-[#4D382C]">
                  Bound to <strong>{form.slug || "myagent"}.agentfi.eth</strong>. Available for WhatsApp discovery.
                </p>
                <button
                  onClick={() => setPublished(false)}
                  className="px-4 py-2 bg-[#7A543A] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611]"
                >
                  Publish Another
                </button>
              </div>
            ) : (
              <form onSubmit={handlePublish} className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-[#1E1611] block mb-1">Agent Name</label>
                  <input
                    type="text"
                    required
                    placeholder="YieldHunter Pro"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F4EE] border-2 border-[#1E1611] text-xs font-bold text-[#1E1611] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase text-[#1E1611] block mb-1">ENS Subname</label>
                    <div className="flex items-center bg-[#F7F4EE] border-2 border-[#1E1611] px-2.5">
                      <input
                        type="text"
                        required
                        placeholder="yieldhunter"
                        value={form.slug}
                        onChange={e => setForm({ ...form, slug: e.target.value })}
                        className="w-full py-2 bg-transparent text-xs font-bold text-[#1E1611] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#7C6555] font-mono font-bold">.agentfi.eth</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase text-[#1E1611] block mb-1">Price (USDC/mo)</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      value={form.priceMonthly}
                      onChange={e => setForm({ ...form, priceMonthly: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F7F4EE] border-2 border-[#1E1611] text-xs font-bold text-[#1E1611] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-[#1E1611] block mb-1">Capabilities Description</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe how your agent analyzes or executes..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F7F4EE] border-2 border-[#1E1611] text-xs text-[#1E1611] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={publishing}
                  className="w-full py-2.5 px-4 bg-[#7A543A] hover:bg-[#63412B] text-[#FFFFFF] font-black text-xs uppercase tracking-wider border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  {publishing ? "Registering on ENS..." : "Publish to Marketplace"}
                </button>
              </form>
            )}
          </div>

          {/* Machine-Readable Manifest Preview */}
          <div className="p-6 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611] font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E1611] mb-4">
              <span className="font-sans font-black text-sm text-[#1E1611] flex items-center gap-2">
                <Code className="w-4 h-4 text-[#7A543A]" /> Agent Manifest
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-[#EFEBE1] border border-[#1E1611] text-[#1E1611]">
                ERC-8004
              </span>
            </div>

            <pre className="bg-[#F7F4EE] p-3 border-2 border-[#1E1611] text-[#1E1611] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[360px]">
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

      <UniversalFooter />
    </div>
  );
}
