"use client";

import Link from "next/link";
import {
  BookOpen, ArrowLeft, Bot, Shield, Zap, Server,
  Lock, MessageSquare, Terminal, ExternalLink, Code
} from "lucide-react";
import AppHeader from "@/app/components/AppHeader";
import UniversalFooter from "@/app/components/Footer";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 flex flex-col justify-between">
      <AppHeader
        backHref="/"
        backLabel="Home"
        badge={
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
            AgentFi Documentation & Guides
          </span>
        }
      />

      <main className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <div>
          <h1 className="text-4xl font-extrabold text-white">AgentFi Technical Documentation</h1>
          <p className="mt-3 text-slate-400 text-base leading-relaxed">
            Everything you need to understand, build on, and test the WhatsApp-native autonomous AI agent economy.
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            href="/demo"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition group"
          >
            <Zap className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition" />
            <h3 className="text-sm font-bold text-white">Interactive Demo</h3>
            <p className="text-xs text-slate-500 mt-1">Test all 4 scenarios in browser</p>
          </Link>

          <Link
            href="/marketplace"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition group"
          >
            <Bot className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition" />
            <h3 className="text-sm font-bold text-white">Agent Directory</h3>
            <p className="text-xs text-slate-500 mt-1">Explore verified ENS agents</p>
          </Link>

          <Link
            href="/packs"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition group"
          >
            <Server className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition" />
            <h3 className="text-sm font-bold text-white">Agent Packs</h3>
            <p className="text-xs text-slate-500 mt-1">Pre-composed alpha suites</p>
          </Link>

          <Link
            href="/developer"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 transition group"
          >
            <Code className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition" />
            <h3 className="text-sm font-bold text-white">Developer Studio</h3>
            <p className="text-xs text-slate-500 mt-1">Publish agents & earn USDC</p>
          </Link>

          <Link
            href="/admin"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/50 transition group"
          >
            <Shield className="w-6 h-6 text-rose-400 mb-2 group-hover:scale-110 transition" />
            <h3 className="text-sm font-bold text-white">System Admin</h3>
            <p className="text-xs text-slate-500 mt-1">Infrastructure health monitor</p>
          </Link>
        </div>

        {/* Section 1: WhatsApp Commands */}
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" /> WhatsApp Conversational Commands
          </h2>
          <p className="text-xs text-slate-400">
            AgentFi features a hybrid regex + NLP intent classifier that guarantees 100% uptime:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <strong className="text-emerald-400 block mb-2">Onboarding & Balances</strong>
              <ul className="space-y-1.5 text-slate-300">
                <li>• <code>"Create my account"</code> — Auto-generates Privy wallet</li>
                <li>• <code>"What is my balance?"</code> — Shows cash & holdings</li>
                <li>• <code>"Show my portfolio"</code> — Real-time P&L breakdown</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
              <strong className="text-cyan-400 block mb-2">Research & Alpha</strong>
              <ul className="space-y-1.5 text-slate-300">
                <li>• <code>"I have $100. I want medium risk"</code> — Recommends Alpha Pack</li>
                <li>• <code>"Analyze ETH"</code> — Coordinates the 5-agent swarm</li>
                <li>• <code>"Execute"</code> or <code>"Approve"</code> — Confirms Uniswap swap</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Multi-Agent Architecture */}
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" /> Multi-Agent Decision Engine
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Single LLMs hallucinate financial advice. AgentFi aggregates 5 independent specialized data agents:
          </p>

          <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800">
            Composite Alpha Score = 25% MarketMind + 25% WhaleWatcher (The Graph) + 20% NewsScout + 15% Sentiment + 15% RiskGuardian
          </div>
        </div>

        {/* Section 3: Smart Contracts & Security Invariants */}
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" /> Smart Contracts & Security Stack
          </h2>
          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
              <strong className="text-white block mb-0.5">AgentMarketplace.sol</strong>
              Onchain agent registry, manifest verification, and developer payout splits (97.5% dev / 2.5% protocol).
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
              <strong className="text-white block mb-0.5">GasRefuel.sol</strong>
              Auto-sponsors gas for embedded wallets when balance &lt; 0.001 ETH with 12h cooldowns to eliminate gas errors.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
              <strong className="text-white block mb-0.5">ReputationRegistry.sol</strong>
              Anti-self-review onchain rating registry tracking verified user ratings and task reliability.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
              <strong className="text-white block mb-0.5">Chainlink CRE &amp; Ledger Agent Stack</strong>
              Confidential TEE risk checks with hardware clear-signing halt whenever a trade exceeds autonomous limits.
            </div>
          </div>
        </div>
      </main>
      <UniversalFooter />
    </div>
  );
}
