"use client";

import { useState } from "react";
import Link from "next/link";
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/demo${endpoint.replace("/api/demo", "")}`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        throw new Error("Backend offline");
      }
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Live scenario execution failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1E1611] flex flex-col justify-between">
      <AppHeader
        backHref="/"
        backLabel="Home"
        badge={
          <span className="text-xs px-2.5 py-1 bg-[#EFEBE1] border-2 border-[#1E1611] font-bold text-[#1E1611]">
            Scenario Runner
          </span>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-10 w-full space-y-8">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-[#EFEBE1] border-2 border-[#1E1611] text-[11px] font-bold uppercase tracking-wider mb-2">
            Execution Testbed
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1E1611]">
            Interactive Demo Runner
          </h1>
          <p className="mt-1 text-sm text-[#4D382C]">
            Execute the 4 core workflows with 1 click to test agent orchestration, risk caps, and onchain settlement.
          </p>
        </div>

        {/* 4 Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => runScenario(1)}
            className={`p-4 text-left border-2 border-[#1E1611] transition-all ${
              activeScenario === 1
                ? "bg-[#EFEBE1] shadow-[4px_4px_0px_#1E1611]"
                : "bg-[#FFFFFF] hover:bg-[#F7F4EE] shadow-[2px_2px_0px_#1E1611]"
            }`}
          >
            <div className="w-8 h-8 bg-[#EFEBE1] border-2 border-[#1E1611] flex items-center justify-center text-[#7A543A] mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-[#7A543A] block mb-1">Scenario 1</span>
            <h3 className="text-sm font-black text-[#1E1611]">Alpha Swap</h3>
            <p className="text-xs text-[#4D382C] mt-1">Multi-agent consensus + RiskGuardian + Uniswap execution</p>
          </button>

          <button
            onClick={() => runScenario(2)}
            className={`p-4 text-left border-2 border-[#1E1611] transition-all ${
              activeScenario === 2
                ? "bg-[#EFEBE1] shadow-[4px_4px_0px_#1E1611]"
                : "bg-[#FFFFFF] hover:bg-[#F7F4EE] shadow-[2px_2px_0px_#1E1611]"
            }`}
          >
            <div className="w-8 h-8 bg-[#EFEBE1] border-2 border-[#1E1611] flex items-center justify-center text-[#7A543A] mb-3">
              <Server className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-[#7A543A] block mb-1">Scenario 2</span>
            <h3 className="text-sm font-black text-[#1E1611]">Arc Settlement</h3>
            <p className="text-xs text-[#4D382C] mt-1">Marketplace subscription + 97.5% developer split via Arc</p>
          </button>

          <button
            onClick={() => runScenario(3)}
            className={`p-4 text-left border-2 border-[#1E1611] transition-all ${
              activeScenario === 3
                ? "bg-[#EFEBE1] shadow-[4px_4px_0px_#1E1611]"
                : "bg-[#FFFFFF] hover:bg-[#F7F4EE] shadow-[2px_2px_0px_#1E1611]"
            }`}
          >
            <div className="w-8 h-8 bg-[#EFEBE1] border-2 border-[#1E1611] flex items-center justify-center text-[#7A543A] mb-3">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-[#7A543A] block mb-1">Scenario 3</span>
            <h3 className="text-sm font-black text-[#1E1611]">Hedera x402</h3>
            <p className="text-xs text-[#4D382C] mt-1">Autonomous micro-payment for data via HCS topic</p>
          </button>

          <button
            onClick={() => runScenario(4)}
            className={`p-4 text-left border-2 border-[#1E1611] transition-all ${
              activeScenario === 4
                ? "bg-[#EFEBE1] shadow-[4px_4px_0px_#1E1611]"
                : "bg-[#FFFFFF] hover:bg-[#F7F4EE] shadow-[2px_2px_0px_#1E1611]"
            }`}
          >
            <div className="w-8 h-8 bg-[#EFEBE1] border-2 border-[#1E1611] flex items-center justify-center text-[#7A543A] mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase text-[#7A543A] block mb-1">Scenario 4</span>
            <h3 className="text-sm font-black text-[#1E1611]">Ledger Halt</h3>
            <p className="text-xs text-[#4D382C] mt-1">Limit breach -&gt; TEE attestation + Hardware clear-sign</p>
          </button>
        </div>

        {/* Execution Output */}
        {loading ? (
          <div className="p-10 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611] text-center">
            <RefreshCw className="w-6 h-6 text-[#7A543A] animate-spin mx-auto mb-2" />
            <span className="text-xs font-bold text-[#1E1611]">Orchestrating AI agents and evaluating guardrails...</span>
          </div>
        ) : result ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technical Trace */}
            <div className="p-5 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611] font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#1E1611] mb-4">
                <span className="font-sans font-black text-sm text-[#1E1611] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#7A543A]" /> Attestation Trace
                </span>
                <span className="px-2 py-0.5 bg-[#EFEBE1] border border-[#1E1611] text-[#1E1611] font-bold text-[10px]">
                  {result.error ? "LIVE ERROR" : "LIVE RESPONSE"}
                </span>
              </div>
              <pre className="bg-[#F7F4EE] p-3 border-2 border-[#1E1611] text-[#1E1611] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[360px]">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>

            {/* WhatsApp Preview */}
            <div className="p-5 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611] flex flex-col items-center justify-center">
              <div className="w-full max-w-sm border-2 border-[#1E1611] bg-[#F7F4EE] shadow-[4px_4px_0px_#1E1611] p-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-[#1E1611]">
                  <div className="w-8 h-8 bg-[#1E1611] text-[#F7F4EE] border border-[#1E1611] flex items-center justify-center font-black text-xs">
                    AF
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#1E1611]">AgentFi Bot</h4>
                    <span className="text-[10px] font-bold text-[#4A6B53]">Verified Phone Account</span>
                  </div>
                </div>

                <div className="py-4">
                  <div className="p-3 bg-[#FFFFFF] border-2 border-[#1E1611] text-[#1E1611] text-xs leading-relaxed whitespace-pre-wrap shadow-[2px_2px_0px_#1E1611]">
                    {result.whatsapp_preview || "Scenario completed."}
                  </div>
                </div>

                <div className="pt-2 text-center border-t border-[#1E1611]">
                  <span className="text-[10px] font-bold text-[#7C6555]">Delivered via WhatsApp Bot Gateway</span>
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
