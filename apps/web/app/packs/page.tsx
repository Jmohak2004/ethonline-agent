"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, CheckCircle, Bot, Zap, ArrowLeft, Shield } from "lucide-react";
import AppHeader from "@/app/components/AppHeader";
import UniversalFooter from "@/app/components/Footer";

const PACKS = [
  {
    id: "beginner-pack",
    name: "Beginner Safety Pack",
    price: 3.0,
    rating: 4.9,
    description: "Loss limits and automated guardrails for first-time crypto users.",
    agents: [
      { name: "NewsScout", role: "Catalyst Tracker" },
      { name: "MarketMind", role: "Trend Filter" },
      { name: "RiskGuardian", role: "Fail-Closed Loss Caps" }
    ],
    badge: "Starter"
  },
  {
    id: "alpha-pack",
    name: "Balanced Alpha Pack",
    price: 5.0,
    rating: 4.8,
    description: "Multi-agent swarm coordinating whale flows, sentiment, and execution.",
    agents: [
      { name: "NewsScout", role: "Catalyst Tracker" },
      { name: "MarketMind", role: "Momentum Indicators" },
      { name: "WhaleWatcher Pro", role: "The Graph Inflow Scanner" },
      { name: "SentimentAgent", role: "Social Sentiment" },
      { name: "RiskGuardian", role: "TEE Risk Attestation" }
    ],
    badge: "Popular",
    highlight: true
  },
  {
    id: "research-pack",
    name: "Autonomous Research Pack",
    price: 8.0,
    rating: 4.7,
    description: "Deep analytics suite with Hedera x402 inter-agent data querying.",
    agents: [
      { name: "NewsScout", role: "Global Events" },
      { name: "WhaleWatcher Pro", role: "Large Transfer Analytics" },
      { name: "SentimentAgent", role: "Narrative Momentum" },
      { name: "Bazantic MCP Recipe", role: "Multi-Tool Analysis" }
    ],
    badge: "Power Users"
  }
];

export default function PacksPage() {
  const [activatedPack, setActivatedPack] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1E1611] flex flex-col justify-between">
      <AppHeader
        backHref="/marketplace"
        backLabel="Marketplace"
        badge={
          <span className="text-xs px-2.5 py-1 bg-[#EFEBE1] border-2 border-[#1E1611] font-bold text-[#1E1611]">
            Agent Suites
          </span>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-10 w-full">
        <div className="mb-8">
          <div className="inline-block px-2.5 py-0.5 bg-[#EFEBE1] border-2 border-[#1E1611] text-[11px] font-bold uppercase tracking-wider mb-2">
            Bundled Swarms
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1E1611]">
            Pre-Built Agent Packs
          </h1>
          <p className="mt-1 text-sm text-[#4D382C]">
            Coordinated agent teams collaborating autonomously on research, analysis, and risk caps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`p-6 border-2 border-[#1E1611] flex flex-col justify-between transition-all ${
                pack.highlight
                  ? "bg-[#FFFFFF] shadow-[5px_5px_0px_#1E1611] relative"
                  : "bg-[#FFFFFF] shadow-[3px_3px_0px_#1E1611]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#EFEBE1] border-2 border-[#1E1611]">
                    {pack.badge}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#1E1611]">
                    <Star className="w-3.5 h-3.5 fill-[#7A543A] text-[#7A543A]" />
                    {pack.rating}
                  </div>
                </div>

                <h3 className="text-lg font-black text-[#1E1611]">{pack.name}</h3>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#1E1611]">${pack.price.toFixed(2)}</span>
                  <span className="text-xs font-semibold text-[#4D382C]">USDC / mo</span>
                </div>

                <p className="text-xs text-[#4D382C] mt-2 leading-relaxed">
                  {pack.description}
                </p>

                <div className="mt-5 pt-4 border-t-2 border-[#1E1611]">
                  <span className="text-[11px] font-bold uppercase text-[#1E1611] block mb-2.5">Included Agents:</span>
                  <div className="space-y-2">
                    {pack.agents.map((agent, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs bg-[#EFEBE1] p-2 border border-[#1E1611]">
                        <Bot className="w-3.5 h-3.5 text-[#7A543A] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#1E1611] block">{agent.name}</span>
                          <span className="text-[11px] text-[#4D382C]">{agent.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-[#1E1611]">
                <button
                  onClick={() => setActivatedPack(pack.id)}
                  className={`w-full py-2.5 px-4 font-black text-xs uppercase tracking-wide border-2 border-[#1E1611] transition flex items-center justify-center gap-2 ${
                    activatedPack === pack.id
                      ? "bg-[#4A6B53] text-[#FFFFFF] shadow-none"
                      : "bg-[#7A543A] hover:bg-[#63412B] text-[#FFFFFF] shadow-[3px_3px_0px_#1E1611] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  }`}
                >
                  {activatedPack === pack.id ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Activated
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Subscribe via WhatsApp
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <UniversalFooter />
    </div>
  );
}
