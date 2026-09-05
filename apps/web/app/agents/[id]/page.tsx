"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot, Star, Users, Shield, ArrowLeft, CheckCircle,
  ExternalLink, Zap, Lock, Activity, TrendingUp, AlertTriangle, MessageSquare
} from "lucide-react";

const AGENT_DATA: Record<string, any> = {
  "whalewatcher-pro": {
    id: "whalewatcher-pro",
    name: "WhaleWatcher Pro",
    ensName: "whalewatcher.agentfi.eth",
    category: "ONCHAIN",
    description: "Detects large whale transactions, exchange reserve shifts, and liquidity movements across decentralized protocols.",
    longDescription: "WhaleWatcher Pro connects directly to The Graph decentralized subgraphs and real-time mempool monitors. When large wallets transfer funds or liquidity pools experience sudden depth shifts, WhaleWatcher scores the activity into ACCUMULATION or DISTRIBUTION signals with full cryptographic evidence.",
    developer: "0x71C...49bE (Verified Developer)",
    version: "1.2.0",
    rating: 4.8,
    ratingCount: 142,
    activeUsers: 2340,
    priceMonthly: 3.0,
    pricePerQuery: 0.02,
    riskLevel: "MEDIUM",
    performanceScore: 94,
    maxDrawdown: "-7.1%",
    historicalPnl: "+18.4%",
    capabilities: [
      "The Graph Subgraph Querying",
      "Whale Net Flow Tracking",
      "DEX Liquidity Depth Profiling",
      "Hedera x402 Micropayment API"
    ],
    requiredPermissions: [
      { name: "Read Onchain Blockchain Data", granted: true },
      { name: "Analyze Portfolio Exposure", granted: true },
      { name: "Execute Swaps via RiskGuardian", granted: true, limit: "Max $20/trade" },
      { name: "Withdraw Funds", granted: false, blocked: true },
      { name: "Change Security Permissions", granted: false, blocked: true }
    ],
    reviews: [
      {
        user: "Alex M. (+1 415***89)",
        rating: 5,
        date: "2 days ago",
        comment: "Caught the ETH accumulation 4 hours before the spike. Super clean signals sent right to my WhatsApp!"
      },
      {
        user: "Sarah K. (+44 79***12)",
        rating: 5,
        date: "1 week ago",
        comment: "Love the fail-closed protection. WhaleWatcher collaborated with RiskGuardian without any hiccups."
      }
    ]
  }
};

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = (params?.id as string) || "whalewatcher-pro";
  const agent = AGENT_DATA[agentId] || AGENT_DATA["whalewatcher-pro"];

  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = () => {
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      setSubscribed(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-[#0B0D13]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/marketplace" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Marketplace</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
              ENS: {agent.ensName}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Agent Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                      {agent.name}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        v{agent.version}
                      </span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">By {agent.developer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  {agent.rating} ({agent.ratingCount})
                </div>
              </div>

              <p className="mt-6 text-slate-300 leading-relaxed text-sm">
                {agent.longDescription}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                  <span className="text-xs text-slate-500 block">Performance</span>
                  <span className="text-base font-bold text-emerald-400">{agent.historicalPnl}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                  <span className="text-xs text-slate-500 block">Max Drawdown</span>
                  <span className="text-base font-bold text-rose-400">{agent.maxDrawdown}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                  <span className="text-xs text-slate-500 block">Active Users</span>
                  <span className="text-base font-bold text-slate-200">{agent.activeUsers.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                  <span className="text-xs text-slate-500 block">Reputation Score</span>
                  <span className="text-base font-bold text-cyan-400">{agent.performanceScore}/100</span>
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> Agent Capabilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {agent.capabilities.map((cap: string, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    {cap}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" /> User Reviews & Verifications
              </h2>
              <div className="space-y-3">
                {agent.reviews.map((rev: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-300">{rev.user}</span>
                      <span className="text-xs text-slate-500">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-400">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Security Guardrails */}
          <div className="space-y-6">
            {/* Subscribe Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 shadow-xl shadow-emerald-950/20">
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">Subscription</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">${agent.priceMonthly.toFixed(2)}</span>
                <span className="text-slate-400 text-sm">USDC / month</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Or $0.02 per query via Hedera x402 inter-agent payment</p>

              <button
                onClick={handleSubscribe}
                disabled={subscribing || subscribed}
                className={`w-full mt-6 py-3 px-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                  subscribed
                    ? "bg-emerald-600 text-white cursor-default"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                }`}
              >
                {subscribing ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Settling on Arc USDC...
                  </>
                ) : subscribed ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Subscribed via WhatsApp
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Subscribe with 1-Click
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-500 mt-2">
                No seed phrases • Privy embedded wallet • Cancel anytime in WhatsApp
              </p>
            </div>

            {/* Permission Guardrails */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Granted Permissions
              </h3>
              <div className="space-y-2.5">
                {agent.requiredPermissions.map((perm: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 flex items-center gap-2">
                      {perm.granted ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      {perm.name}
                    </span>
                    {perm.limit && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                        {perm.limit}
                      </span>
                    )}
                    {perm.blocked && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400">
                        BLOCKED
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
