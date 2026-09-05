"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity, ArrowLeft, Bot, CheckCircle, ExternalLink,
  Shield, Zap, Filter, ArrowUpRight, Lock, Clock
} from "lucide-react";

const INITIAL_ACTIVITIES = [
  {
    id: "act-1",
    type: "SWAP_EXECUTED",
    title: "Uniswap v3 Swap Executed",
    description: "Swapped $20.00 USDC -> 0.00754 ETH on Ethereum Sepolia Testnet",
    agent: "ExecutionAgent",
    status: "CONFIRMED",
    time: "2 mins ago",
    txHash: "0xuni_7c92b41f018d4529a3",
    tag: "DeFi Execution",
    color: "emerald"
  },
  {
    id: "act-2",
    type: "RISK_APPROVED",
    title: "Chainlink CRE TEE Risk Evaluation",
    description: "Evaluated $20 trade against $100 portfolio. Attestation: 0xcre_8f912c...",
    agent: "RiskGuardian",
    status: "APPROVED",
    time: "4 mins ago",
    tag: "Security Guardrail",
    color: "cyan"
  },
  {
    id: "act-3",
    type: "HEDERA_X402",
    title: "Hedera x402 Micropayment Settled",
    description: "TradingOrchestrator paid 0.25 HBAR ($0.02) to WhaleWatcher Pro via HCS Topic 0.0.5182901",
    agent: "WhaleWatcher Pro",
    status: "SETTLED",
    time: "6 mins ago",
    txHash: "0.0.1715000@x402_whalesvc",
    tag: "Agent-to-Agent Economy",
    color: "purple"
  },
  {
    id: "act-4",
    type: "SIGNAL_GENERATED",
    title: "The Graph Whale Inflow Detected",
    description: "3 wallets accumulated $18.4M in ETH in 24h. Signal confidence: 81%",
    agent: "WhaleWatcher Pro",
    status: "BROADCASTED",
    time: "8 mins ago",
    tag: "The Graph Intelligence",
    color: "blue"
  },
  {
    id: "act-5",
    type: "LEDGER_CLEAR_SIGN",
    title: "Ledger Clear-Signing Challenge",
    description: "Challenge ledger_req_49a1bc820 created for $100 trade exceeding $20 limit",
    agent: "LedgerSecurity",
    status: "PENDING_APPROVAL",
    time: "15 mins ago",
    tag: "Hardware Clear-Signing",
    color: "amber"
  }
];

export default function ActivityPage() {
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL"
    ? INITIAL_ACTIVITIES
    : INITIAL_ACTIVITIES.filter(a => a.tag.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100">
      <header className="border-b border-slate-800/80 bg-[#0B0D13]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-emerald-400">Live Network Stream</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Live Activity & Audit Stream</h1>
          <p className="mt-2 text-sm text-slate-400">
            Real-time feed of multi-agent signals, Hedera x402 payments, Chainlink CRE checks, and Uniswap swaps.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-slate-800 pb-4 overflow-x-auto">
          {["ALL", "DeFi", "Agent-to-Agent", "The Graph", "Security"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === f
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-800"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Activity Stream */}
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{item.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span>Agent: <strong className="text-slate-400">{item.agent}</strong></span>
                    {item.txHash && (
                      <span className="font-mono text-emerald-400/80">Tx: {item.txHash.slice(0, 16)}...</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 block mb-1">
                  {item.status}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" /> {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
