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
    <div className="min-h-screen bg-[#F7F4EE] text-[#1E1611] flex flex-col justify-between">
      <AppHeader
        backHref="/"
        backLabel="Home"
        badge={
          <span className="text-xs px-2.5 py-1 bg-[#EFEBE1] border-2 border-[#1E1611] font-bold text-[#1E1611]">
            System Reference
          </span>
        }
      />

      <main className="max-w-5xl mx-auto px-4 py-10 w-full space-y-8">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-[#EFEBE1] border-2 border-[#1E1611] text-[11px] font-bold uppercase tracking-wider mb-2">
            Architecture & Reference
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1E1611]">
            Technical Documentation
          </h1>
          <p className="mt-1 text-sm text-[#4D382C]">
            Reference architecture for the WhatsApp-native autonomous agent economy.
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/demo"
            className="p-4 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611] hover:bg-[#EFEBE1] transition"
          >
            <Zap className="w-5 h-5 text-[#7A543A] mb-2" />
            <h3 className="text-xs font-black text-[#1E1611]">Demo Runner</h3>
            <p className="text-[10px] text-[#4D382C] mt-0.5">Test 4 scenarios</p>
          </Link>

          <Link
            href="/marketplace"
            className="p-4 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611] hover:bg-[#EFEBE1] transition"
          >
            <Bot className="w-5 h-5 text-[#7A543A] mb-2" />
            <h3 className="text-xs font-black text-[#1E1611]">Marketplace</h3>
            <p className="text-[10px] text-[#4D382C] mt-0.5">Verified agents</p>
          </Link>

          <Link
            href="/packs"
            className="p-4 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611] hover:bg-[#EFEBE1] transition"
          >
            <Server className="w-5 h-5 text-[#7A543A] mb-2" />
            <h3 className="text-xs font-black text-[#1E1611]">Agent Packs</h3>
            <p className="text-[10px] text-[#4D382C] mt-0.5">Curated suites</p>
          </Link>

          <Link
            href="/developer"
            className="p-4 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611] hover:bg-[#EFEBE1] transition"
          >
            <Code className="w-5 h-5 text-[#7A543A] mb-2" />
            <h3 className="text-xs font-black text-[#1E1611]">Dev Studio</h3>
            <p className="text-[10px] text-[#4D382C] mt-0.5">Monetize agents</p>
          </Link>

          <Link
            href="/admin"
            className="p-4 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611] hover:bg-[#EFEBE1] transition"
          >
            <Shield className="w-5 h-5 text-[#7A543A] mb-2" />
            <h3 className="text-xs font-black text-[#1E1611]">System Admin</h3>
            <p className="text-[10px] text-[#4D382C] mt-0.5">Status monitor</p>
          </Link>
        </div>

        {/* Section 1: WhatsApp Commands */}
        <div className="p-6 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611] space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-[#1E1611]">
            <MessageSquare className="w-5 h-5 text-[#7A543A]" />
            <h2 className="text-base font-black text-[#1E1611]">WhatsApp Commands</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#F7F4EE] border-2 border-[#1E1611] text-xs">
              <span className="font-black text-[#1E1611] block mb-2 uppercase text-[11px]">Onboarding & Balances</span>
              <ul className="space-y-1 text-[#4D382C]">
                <li>• <code className="bg-[#EFEBE1] px-1 font-bold">"Create my account"</code> — Generates Privy smart wallet</li>
                <li>• <code className="bg-[#EFEBE1] px-1 font-bold">"What is my balance?"</code> — Shows cash & holdings</li>
                <li>• <code className="bg-[#EFEBE1] px-1 font-bold">"Show my portfolio"</code> — Real-time P&L breakdown</li>
              </ul>
            </div>

            <div className="p-4 bg-[#F7F4EE] border-2 border-[#1E1611] text-xs">
              <span className="font-black text-[#1E1611] block mb-2 uppercase text-[11px]">Research & Alpha</span>
              <ul className="space-y-1 text-[#4D382C]">
                <li>• <code className="bg-[#EFEBE1] px-1 font-bold">"I have $100. I want medium risk"</code> — Recommends Alpha Pack</li>
                <li>• <code className="bg-[#EFEBE1] px-1 font-bold">"Analyze ETH"</code> — Queries the 5-agent swarm</li>
                <li>• <code className="bg-[#EFEBE1] px-1 font-bold">"Execute"</code> or <code className="bg-[#EFEBE1] px-1 font-bold">"Approve"</code> — Confirms Uniswap trade</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Multi-Agent Architecture */}
        <div className="p-6 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611] space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-[#1E1611]">
            <Bot className="w-5 h-5 text-[#7A543A]" />
            <h2 className="text-base font-black text-[#1E1611]">Multi-Agent Consensus Formula</h2>
          </div>
          <p className="text-xs text-[#4D382C]">
            Financial advice requires diversified data streams. Gotrade aggregates 5 specialized sources:
          </p>
          <div className="p-3 bg-[#EFEBE1] font-mono text-xs text-[#1E1611] font-bold border-2 border-[#1E1611]">
            Composite Score = 25% MarketMind + 25% WhaleWatcher + 20% NewsScout + 15% Sentiment + 15% RiskGuardian
          </div>
        </div>

        {/* Section 3: Smart Contracts & Security */}
        <div className="p-6 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611] space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-[#1E1611]">
            <Shield className="w-5 h-5 text-[#7A543A]" />
            <h2 className="text-base font-black text-[#1E1611]">Smart Contracts & Verification</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#F7F4EE] border-2 border-[#1E1611]">
              <strong className="text-[#1E1611] block mb-0.5">AgentMarketplace.sol</strong>
              <p className="text-[#4D382C]">Registry for agent manifests with 97.5% dev / 2.5% protocol revenue split.</p>
            </div>
            <div className="p-3 bg-[#F7F4EE] border-2 border-[#1E1611]">
              <strong className="text-[#1E1611] block mb-0.5">GasRefuel.sol</strong>
              <p className="text-[#4D382C]">Autonomous ETH refuel when balance &lt; 0.001 ETH to eliminate out-of-gas errors.</p>
            </div>
            <div className="p-3 bg-[#F7F4EE] border-2 border-[#1E1611]">
              <strong className="text-[#1E1611] block mb-0.5">ReputationRegistry.sol</strong>
              <p className="text-[#4D382C]">Anti-sybil verifiable reviews and performance track records.</p>
            </div>
            <div className="p-3 bg-[#F7F4EE] border-2 border-[#1E1611]">
              <strong className="text-[#1E1611] block mb-0.5">Chainlink CRE TEE & Ledger</strong>
              <p className="text-[#4D382C]">Confidential enclave risk verification and hardware clear-sign halt on limit breach.</p>
            </div>
          </div>
        </div>
      </main>

      <UniversalFooter />
    </div>
  );
}
