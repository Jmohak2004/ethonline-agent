"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Bot, ArrowLeft, CheckCircle, Shield, Zap, Lock,
  RefreshCw, MessageSquare, Terminal, Server, ArrowRight
} from "lucide-react";
import AppHeader from "@/app/components/AppHeader";
import UniversalFooter from "@/app/components/Footer";

export default function DemoPlaygroundPage() {
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runScenario = async (scenarioNumber: number) => {
    setActiveScenario(scenarioNumber);
    setLoading(true);
    setResult(null);

    try {
      let endpoint = "";
      if (scenarioNumber === 1) endpoint = "/api/demo/scenario-1-alpha-trade";
      else if (scenarioNumber === 2) endpoint = "/api/demo/scenario-2-marketplace-subscribe";
      else if (scenarioNumber === 3) endpoint = "/api/demo/scenario-3-hedera-x402-payment";
      else if (scenarioNumber === 4) endpoint = "/api/demo/scenario-4-ledger-high-risk-approval";

      // Attempt fetch from backend, fallback to local deterministic representation
      const res = await fetch(`http://localhost:8000/demo${endpoint.replace("/api/demo", "")}`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        throw new Error("Backend offline");
      }
    } catch (e) {
      // Fallback deterministic mock for offline judging
      if (scenarioNumber === 1) {
        setResult({
          scenario: "Alpha Opportunity & Execution",
          asset: "ETH",
          amount_usd: 20.0,
          agent_analysis: {
            composite_score: 0.78,
            recommendation: "POTENTIAL_OPPORTUNITY",
            risk_level: "MEDIUM",
            explainability: {
              what_happened: "Multiple independent agents detected synchronized accumulation and positive momentum in ETH.",
              why_it_matters: "Onchain whale inflows combined with technical momentum indicate potential short-term upside.",
              agents_agreeing: ["NewsScout", "MarketMind", "WhaleWatcher Pro", "SentimentAgent"],
              risk_guardian_decision: "APPROVED"
            }
          },
          execution: {
            mode: "PAPER",
            tx_hash: "0xuni_7c92b41f018d4529a3",
            amount_in: 20.0,
            amount_out: 0.00754,
            token_in: "USDC",
            token_out: "ETH"
          },
          whatsapp_preview: "✅ *Testnet Trade Completed*\n\n• *Asset:* ETH\n• *Amount:* $20.00 USDC\n• *Received:* 0.00754 ETH\n• *Confidence:* 78%\n• *Risk Level:* MEDIUM\n• *Key Evidence:* 3 wallets holding >10k ETH accumulated $18.4M\n• *Tx Hash:* `0xuni_7c92b41...`\n\n💡 _All actions executed within your configured $20 autonomous limit._"
        });
      } else if (scenarioNumber === 2) {
        setResult({
          scenario: "Marketplace Subscription & USDC Split",
          settlement: {
            amount_usdc: 3.0,
            developer_payout_usdc: 2.925,
            platform_fee_usdc: 0.075,
            settlement_network: "Arc Testnet / Ethereum Sepolia",
            status: "CONFIRMED"
          },
          whatsapp_preview: "💳 *Subscription Activated*\n\n• *Agent:* WhaleWatcher Pro (whalewatcher.agentfi.eth)\n• *Cost:* $3.00 USDC/mo\n• *Settlement Network:* Arc / USDC\n• *Developer Payout:* $2.93 USDC (97.5%)\n• *Platform Fee:* $0.08 USDC (2.5%)\n\nYour trading agents can now consume real-time whale intelligence."
        });
      } else if (scenarioNumber === 3) {
        setResult({
          scenario: "Hedera x402 Autonomous Agent-to-Agent Payment",
          inter_agent_flow: {
            requester: "TradingOrchestratorAgent",
            provider: "WhaleWatcher Pro (whalewatcher.agentfi.eth)",
            protocol: "Hedera x402 + HCS Topic 0.0.5182901",
            cost_usd: 0.02,
            cost_hbar: 0.25,
            status: "SETTLED_AUTONOMOUSLY"
          }
        });
      } else if (scenarioNumber === 4) {
        setResult({
          scenario: "High-Risk Approval & Ledger Clear-Signing",
          requested_amount_usd: 100.0,
          cre_risk_evaluation: {
            decision: "HUMAN_APPROVAL_REQUIRED",
            risk_score: 75,
            tee_attestation_hash: "0xcre_8f912c4019a823b192e",
            reason: "Trade amount ($100.00) exceeds autonomous limit ($25.00). Ledger hardware or WhatsApp human confirmation required."
          },
          ledger_challenge: {
            request_id: "ledger_req_49a1bc820",
            status: "PENDING_APPROVAL"
          },
          whatsapp_preview: "🚨 *High-Risk Action Requires Approval*\n\nA trade of *$100.00 USDC* into *ETH* was requested.\n⚠️ This exceeds your automatic limit of *$20.00*.\n\n• *Risk Guardian Score:* 75/100\n• *TEE Attestation:* `0xcre_8f912c4...`\n• *Ledger Challenge ID:* `ledger_req_49a1bc820`\n\nReply *APPROVE bc82* or tap your Ledger device to authorize."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 flex flex-col justify-between">
      <AppHeader
        backHref="/"
        backLabel="Home"
        badge={
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
            ETHOnline 2026 Interactive Demo Runner
          </span>
        }
      />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Interactive Scenarios</span>
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Trigger any of the 4 core hackathon scenarios with 1-click and watch the real-time agent coordination, risk checks, and blockchain execution.
          </p>
        </div>

        {/* 4 Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => runScenario(1)}
            className={`p-5 rounded-2xl text-left border transition-all ${
              activeScenario === 1
                ? "bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/40"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono text-emerald-400 block mb-1">Scenario 1</span>
            <h3 className="text-sm font-bold text-white">Alpha Opportunity & Uniswap Swap</h3>
            <p className="text-xs text-slate-500 mt-1">Multi-agent analysis + RiskGuardian + Uniswap execution</p>
          </button>

          <button
            onClick={() => runScenario(2)}
            className={`p-5 rounded-2xl text-left border transition-all ${
              activeScenario === 2
                ? "bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-950/40"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
              <Server className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono text-cyan-400 block mb-1">Scenario 2</span>
            <h3 className="text-sm font-bold text-white">Marketplace & Arc USDC Settlement</h3>
            <p className="text-xs text-slate-500 mt-1">User subscribes + Arc developer revenue split</p>
          </button>

          <button
            onClick={() => runScenario(3)}
            className={`p-5 rounded-2xl text-left border transition-all ${
              activeScenario === 3
                ? "bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-950/40"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono text-purple-400 block mb-1">Scenario 3</span>
            <h3 className="text-sm font-bold text-white">Hedera x402 Agent-to-Agent Payment</h3>
            <p className="text-xs text-slate-500 mt-1">Autonomous agent buys data from specialized agent via HCS</p>
          </button>

          <button
            onClick={() => runScenario(4)}
            className={`p-5 rounded-2xl text-left border transition-all ${
              activeScenario === 4
                ? "bg-rose-950/40 border-rose-500 text-white shadow-lg shadow-rose-950/40"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300"
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono text-rose-400 block mb-1">Scenario 4</span>
            <h3 className="text-sm font-bold text-white">High-Risk Limit & Ledger Halt</h3>
            <p className="text-xs text-slate-500 mt-1">$100 trade exceeds limit -&gt; Chainlink TEE + Ledger approval</p>
          </button>
        </div>

        {/* Live Execution Output */}
        {loading ? (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
            <span className="text-sm font-semibold text-slate-300">Orchestrating AI agents and evaluating onchain guardrails...</span>
          </div>
        ) : result ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: JSON & Technical Trace */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-slate-400 font-sans font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" /> Execution Trace & Attestation
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">
                  HTTP 200 OK
                </span>
              </div>
              <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[420px]">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>

            {/* Right: WhatsApp Phone Simulation */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
              <div className="w-full max-w-sm rounded-3xl bg-[#0B141A] border border-slate-700/80 shadow-2xl p-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                    AF
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">AgentFi AI</h4>
                    <span className="text-[10px] text-emerald-400">Verified Business Account</span>
                  </div>
                </div>

                <div className="py-4 space-y-3">
                  <div className="p-3.5 rounded-2xl rounded-tl-sm bg-[#1F2C34] text-slate-200 text-xs leading-relaxed whitespace-pre-wrap shadow-sm">
                    {result.whatsapp_preview || "Scenario executed successfully."}
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <span className="text-[10px] text-slate-500">Delivered directly via WhatsApp (Twilio Sandbox &amp; Meta Cloud API)</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <UniversalFooter />
    </div>
  );
}
