"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Boxes, Star, CheckCircle, ArrowLeft, Bot, Zap, Shield, Sparkles
} from "lucide-react";
import AppHeader from "@/app/components/AppHeader";
import UniversalFooter from "@/app/components/Footer";

const PACKS = [
  {
    id: "beginner-pack",
    name: "Beginner Safety Pack",
    price: 3.0,
    rating: 4.9,
    description: "Curated entry-level setup for beginners learning crypto with automated loss limits.",
    agents: [
      { name: "NewsScout", role: "News Aggregator & Catalyst Tracker" },
      { name: "MarketMind", role: "Technical Momentum & Trend Filter" },
      { name: "RiskGuardian", role: "Hard Loss Caps & Fail-Closed Guardrails" }
    ],
    recommendedRisk: "Low",
    badge: "Popular for Starters"
  },
  {
    id: "alpha-pack",
    name: "Balanced Alpha Pack",
    price: 5.0,
    rating: 4.8,
    description: "Our flagship multi-agent suite coordinating onchain whale flows, sentiment, and execution.",
    agents: [
      { name: "NewsScout", role: "News & Protocol Announcements" },
      { name: "MarketMind", role: "Technical Momentum Indicators" },
      { name: "WhaleWatcher Pro", role: "The Graph Onchain Accumulation" },
      { name: "SentimentAgent", role: "Social Narrative & Sentiment" },
      { name: "RiskGuardian", role: "Confidential TEE Risk Evaluation" }
    ],
    recommendedRisk: "Medium",
    badge: "Most Popular",
    highlight: true
  },
  {
    id: "research-pack",
    name: "Autonomous Research Pack",
    price: 8.0,
    rating: 4.7,
    description: "Deep analytics pack with inter-agent Hedera x402 data querying and custom MCP recipes.",
    agents: [
      { name: "NewsScout", role: "Global Catalysts" },
      { name: "WhaleWatcher Pro", role: "Whale Wallet Flow Deep Dives" },
      { name: "SentimentAgent", role: "Narrative Momentum" },
      { name: "Bazantic MCP Recipe", role: "Composable Multi-Tool Analysis" }
    ],
    recommendedRisk: "High / Advanced",
    badge: "For Power Users"
  }
];

export default function PacksPage() {
  const [activatedPack, setActivatedPack] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 flex flex-col justify-between">
      <AppHeader
        backHref="/marketplace"
        backLabel="Marketplace"
        badge={
          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/20">
            Pre-Built Agent Packs
          </span>
        }
      />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Pre-Composed <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Agent Packs</span>
          </h1>
          <p className="mt-3 text-slate-400 text-sm">
            Bundled AI agent teams that collaborate automatically to research, analyze, and safeguard your portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`rounded-2xl p-6 relative flex flex-col justify-between transition-all ${
                pack.highlight
                  ? "bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/30"
                  : "bg-slate-900/60 border border-slate-800/80 hover:border-slate-700"
              }`}
            >
              {pack.badge && (
                <div className="absolute -top-3 left-6">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    pack.highlight ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}>
                    {pack.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mt-2">
                  <h3 className="text-xl font-bold text-white">{pack.name}</h3>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {pack.rating}
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-white">${pack.price.toFixed(2)}</span>
                  <span className="text-slate-400 text-xs">USDC / month</span>
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {pack.description}
                </p>

                <div className="mt-6 pt-6 border-t border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-300 block mb-3">Included Agents:</span>
                  <div className="space-y-2.5">
                    {pack.agents.map((agent, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <Bot className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-200">{agent.name}</span>
                          <span className="text-slate-500 block text-[11px]">{agent.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/60">
                <button
                  onClick={() => setActivatedPack(pack.id)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                    activatedPack === pack.id
                      ? "bg-emerald-600 text-white"
                      : pack.highlight
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold shadow-lg shadow-emerald-500/20"
                      : "bg-slate-800 hover:bg-slate-700 text-white"
                  }`}
                >
                  {activatedPack === pack.id ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Activated on WhatsApp
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Activate Pack
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
