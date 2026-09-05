"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity, ArrowLeft, Bot, CheckCircle, ExternalLink,
  Shield, Zap, Filter, ArrowUpRight, Lock, Clock
} from "lucide-react";
import AppHeader from "@/app/components/AppHeader";
import UniversalFooter from "@/app/components/Footer";

const INITIAL_ACTIVITIES = [
  {
    id: "act-1",
    type: "SWAP_EXECUTED",
    title: "Uniswap v3 Swap Executed",
    description: "Swapped $20.00 USDC -> 0.00754 ETH on Ethereum Sepolia Testnet",
    agent: "ExecutionAgent",
    status: "CONFIRMED",
    time: "2m ago",
    txHash: "0xuni_7c92b41f018d4529a3",
    tag: "DeFi Execution"
  },
  {
    id: "act-2",
    type: "RISK_APPROVED",
    title: "Chainlink CRE TEE Risk Evaluation",
    description: "Evaluated $20 trade against $100 portfolio. Attestation verified.",
    agent: "RiskGuardian",
    status: "APPROVED",
    time: "4m ago",
    tag: "Security Guardrail"
  },
  {
    id: "act-3",
    type: "HEDERA_X402",
    title: "Hedera x402 Micropayment Settled",
    description: "Paid 0.25 HBAR ($0.02) to WhaleWatcher Pro via HCS Topic 0.0.5182901",
    agent: "WhaleWatcher Pro",
    status: "SETTLED",
    time: "6m ago",
    txHash: "0.0.1715000@x402_whalesvc",
    tag: "Agent-to-Agent"
  },
  {
    id: "act-4",
    type: "SIGNAL_GENERATED",
    title: "The Graph Whale Inflow Detected",
    description: "3 wallets accumulated $18.4M in ETH in 24h. Confidence: 81%",
    agent: "WhaleWatcher Pro",
    status: "BROADCASTED",
    time: "8m ago",
    tag: "The Graph"
  },
  {
    id: "act-5",
    type: "LEDGER_CLEAR_SIGN",
    title: "Ledger Clear-Signing Challenge",
    description: "Challenge created for $100 trade exceeding $20 autonomous limit",
    agent: "LedgerSecurity",
    status: "PENDING",
    time: "15m ago",
    tag: "Hardware Clear-Signing"
  }
];

export default function ActivityPage() {
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL"
    ? INITIAL_ACTIVITIES
    : INITIAL_ACTIVITIES.filter(a => a.tag.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1E1611] flex flex-col justify-between">
      <AppHeader
        backHref="/"
        backLabel="Home"
        badge={
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1E1611] px-2.5 py-1 bg-[#EFEBE1] border-2 border-[#1E1611]">
            <span className="w-2 h-2 rounded-full bg-[#4A6B53]" />
            Live Audit Stream
          </div>
        }
      />

      <main className="max-w-5xl mx-auto px-4 py-10 w-full space-y-6">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-[#EFEBE1] border-2 border-[#1E1611] text-[11px] font-bold uppercase tracking-wider mb-2">
            Audit Trail
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1E1611]">
            Activity & Execution Stream
          </h1>
          <p className="mt-1 text-sm text-[#4D382C]">
            Deterministic log of multi-agent signals, Hedera x402 payments, and Uniswap trades.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 pb-2 overflow-x-auto">
          {["ALL", "DeFi", "Agent-to-Agent", "The Graph", "Security"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-[#1E1611] transition ${
                filter === f
                  ? "bg-[#1E1611] text-[#F7F4EE] shadow-none"
                  : "bg-[#FFFFFF] text-[#1E1611] hover:bg-[#EFEBE1] shadow-[2px_2px_0px_#1E1611] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Activity Stream */}
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611] flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#EFEBE1] border-2 border-[#1E1611] flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-4 h-4 text-[#7A543A]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black text-[#1E1611]">{item.title}</h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#EFEBE1] border border-[#1E1611] text-[#1E1611]">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#4D382C] mt-1">{item.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-[#7C6555]">
                    <span>Agent: <strong className="text-[#1E1611]">{item.agent}</strong></span>
                    {item.txHash && (
                      <span className="font-mono text-[#7A543A] font-bold">Tx: {item.txHash.slice(0, 16)}...</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#EFEBE1] border-2 border-[#1E1611] text-[#1E1611] block mb-1">
                  {item.status}
                </span>
                <span className="text-[10px] text-[#7C6555] font-medium flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" /> {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <UniversalFooter />
    </div>
  );
}
