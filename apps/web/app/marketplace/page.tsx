"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot, Star, Users, Filter, Search, TrendingUp, Shield,
  ChevronRight, Zap, BarChart2, Globe, Cpu, ArrowLeft
} from "lucide-react";
import AppHeader from "@/app/components/AppHeader";
import UniversalFooter from "@/app/components/Footer";

const CATEGORIES = ["ALL", "TRADING", "NEWS", "RESEARCH", "SENTIMENT", "ONCHAIN", "RISK", "AUTOMATION"];

const AGENTS = [
  {
    id: "whalewatcher",
    name: "WhaleWatcher",
    icon: "🐋",
    ens: "whalewatcher.agentfi.eth",
    category: "ONCHAIN",
    rating: 4.8,
    users: 2340,
    price: 3,
    pricingModel: "SUBSCRIPTION",
    risk: "Medium",
    perf30d: "+12.4%",
    drawdown: "-7.1%",
    description: "Monitors whale wallet movements, exchange flows, and DEX activity using The Graph protocol. Detects accumulation and distribution patterns before they move markets.",
    capabilities: ["ONCHAIN_ANALYSIS", "WHALE_TRACKING", "EXCHANGE_FLOW"],
    trending: true,
    featured: true,
  },
  {
    id: "newsscout",
    name: "NewsScout",
    icon: "📰",
    ens: "newsscout.agentfi.eth",
    category: "NEWS",
    rating: 4.7,
    users: 1890,
    price: 2,
    pricingModel: "SUBSCRIPTION",
    risk: "Low",
    perf30d: "+8.2%",
    drawdown: "-3.1%",
    description: "Scans protocol announcements, market events, and ecosystem news in real-time. Provides confidence-scored signals for any asset.",
    capabilities: ["NEWS_MONITORING", "SIGNAL_GENERATION"],
    trending: false,
    featured: false,
  },
  {
    id: "marketmind",
    name: "MarketMind",
    icon: "📊",
    ens: "marketmind.agentfi.eth",
    category: "TRADING",
    rating: 4.6,
    users: 3120,
    price: 4,
    pricingModel: "SUBSCRIPTION",
    risk: "Medium",
    perf30d: "+15.6%",
    drawdown: "-9.2%",
    description: "Analyzes price, volume, momentum, and technical indicators to identify market trends. Provides explainable signals with confidence scores.",
    capabilities: ["TECHNICAL_ANALYSIS", "TREND_DETECTION", "VOLATILITY_ANALYSIS"],
    trending: true,
    featured: true,
  },
  {
    id: "sentimentagent",
    name: "SentimentAgent",
    icon: "💭",
    ens: "sentimentagent.agentfi.eth",
    category: "SENTIMENT",
    rating: 4.5,
    users: 980,
    price: 2,
    pricingModel: "SUBSCRIPTION",
    risk: "Low",
    perf30d: "+6.8%",
    drawdown: "-2.4%",
    description: "Tracks market narrative and social signals to provide sentiment analysis. Always labels uncertainty—never treats social sentiment as fact.",
    capabilities: ["SENTIMENT_ANALYSIS", "SOCIAL_MONITORING"],
    trending: false,
    featured: false,
  },
  {
    id: "riskguardian",
    name: "RiskGuardian",
    icon: "🛡️",
    ens: "riskguardian.agentfi.eth",
    category: "RISK",
    rating: 4.9,
    users: 4210,
    price: 0,
    pricingModel: "FREE",
    risk: "N/A",
    perf30d: "Always on",
    drawdown: "N/A",
    description: "Mandatory risk validation layer. Checks every proposed trade against your risk profile, position limits, and daily loss limits. Required for all trading agents.",
    capabilities: ["RISK_VALIDATION", "POSITION_SIZING", "LOSS_PREVENTION"],
    trending: false,
    featured: true,
  },
  {
    id: "executionagent",
    name: "ExecutionAgent",
    icon: "⚡",
    ens: "executionagent.agentfi.eth",
    category: "TRADING",
    rating: 4.7,
    users: 1560,
    price: 3,
    pricingModel: "SUBSCRIPTION",
    risk: "Medium",
    perf30d: "+18.1%",
    drawdown: "-11.0%",
    description: "Executes approved trades through Uniswap on testnet. Always runs after RiskGuardian approval and permission validation. Tracks every transaction.",
    capabilities: ["SWAP_EXECUTION", "TRANSACTION_TRACKING"],
    trending: true,
    featured: false,
  },
  {
    id: "whalewatcher-pro",
    name: "WhaleWatcher Pro",
    icon: "🐋",
    ens: "whalewatcher-pro.agentfi.eth",
    category: "ONCHAIN",
    rating: 4.8,
    users: 2100,
    price: 5,
    pricingModel: "SUBSCRIPTION",
    risk: "Medium",
    perf30d: "+14.2%",
    drawdown: "-8.3%",
    description: "Enhanced whale tracking with cross-chain analysis, MEV detection, and 15-minute advance warnings before large movements.",
    capabilities: ["ONCHAIN_ANALYSIS", "CROSS_CHAIN", "MEV_DETECTION"],
    trending: true,
    featured: false,
  },
  {
    id: "chainwhale",
    name: "ChainWhale",
    icon: "⛓️",
    ens: "chainwhale.agentfi.eth",
    category: "ONCHAIN",
    rating: 4.6,
    users: 870,
    price: 2,
    pricingModel: "PAY_PER_USE",
    risk: "Medium",
    perf30d: "+9.4%",
    drawdown: "-5.1%",
    description: "Affordable pay-per-use whale tracking. Query whale positions for specific assets on demand.",
    capabilities: ["ONCHAIN_ANALYSIS", "WHALE_TRACKING"],
    trending: false,
    featured: false,
  },
  {
    id: "alphawhale",
    name: "AlphaWhale",
    icon: "🌊",
    ens: "alphawhale.agentfi.eth",
    category: "ONCHAIN",
    rating: 4.4,
    users: 450,
    price: 0.02,
    pricingModel: "PAY_PER_USE",
    risk: "Low",
    perf30d: "+7.1%",
    drawdown: "-3.8%",
    description: "Ultra-affordable $0.02 per query whale analysis. Powered by Hedera x402 micropayments.",
    capabilities: ["ONCHAIN_ANALYSIS"],
    trending: false,
    featured: false,
  },
];

const PACKS = [
  {
    name: "Beginner Pack",
    description: "Perfect for new crypto investors. Covers news, market analysis, and risk management.",
    agents: ["NewsScout", "MarketMind", "RiskGuardian"],
    price: 3,
    rating: 4.5,
    users: 1234,
    color: "#10b981",
  },
  {
    name: "Balanced Alpha Pack",
    description: "The complete set for active traders. Whale tracking, sentiment, and full risk control.",
    agents: ["NewsScout", "MarketMind", "WhaleWatcher", "SentimentAgent", "RiskGuardian"],
    price: 5,
    rating: 4.8,
    users: 2340,
    color: "#6366f1",
  },
  {
    name: "Autonomous Research Pack",
    description: "Deep onchain research for serious DeFi researchers.",
    agents: ["NewsScout", "WhaleWatcher", "SentimentAgent"],
    price: 8,
    rating: 4.6,
    users: 890,
    color: "#a855f7",
  },
];

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"agents" | "packs">("agents");
  const [sortBy, setSortBy] = useState("rating");

  const filteredAgents = AGENTS.filter((a) => {
    const matchCat = selectedCategory === "ALL" || a.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "users") return b.users - a.users;
    return 0;
  });

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh" }}>
      {/* Header */}
      <AppHeader
        backHref="/"
        backLabel="Home"
        badge={
          <div className="flex gap-1 bg-[#EFEBE1] p-1 rounded-lg border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611]">
            <button
              onClick={() => setView("agents")}
              className={`flex items-center gap-1 text-xs py-1 px-3 rounded-md font-bold transition ${
                view === "agents" ? "bg-[#1E1611] text-[#F7F4EE]" : "text-[#5E5045] hover:text-[#1E1611]"
              }`}
            >
              <Bot size={12} /> Agents
            </button>
            <button
              onClick={() => setView("packs")}
              className={`flex items-center gap-1 text-xs py-1 px-3 rounded-md font-bold transition ${
                view === "packs" ? "bg-[#1E1611] text-[#F7F4EE]" : "text-[#5E5045] hover:text-[#1E1611]"
              }`}
            >
              <Zap size={12} /> Packs
            </button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <div className="badge-brand mb-2">
            {view === "agents" ? "Directory" : "Curated Bundles"}
          </div>
          <h1 className="text-3xl font-extrabold text-[#1E1611] tracking-tight mb-2">
            {view === "agents" ? "Agent Marketplace" : "Pre-Built Agent Packs"}
          </h1>
          <p className="text-sm text-[#5E5045] font-medium">
            {view === "agents"
              ? "Verified ENS agents on Ethereum with onchain reputations and transparent limits."
              : "Pre-composed agent teams for balanced alpha and risk monitoring."}
          </p>
        </div>

        {view === "agents" ? (
          <>
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3.5 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#857467]" />
                <input
                  className="input pl-10"
                  placeholder="Search agents by name, ENS, or capability..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="input w-auto font-semibold"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: "auto", minWidth: 150 }}
              >
                <option value="rating">Sort: Top Rated</option>
                <option value="users">Sort: Most Popular</option>
                <option value="price">Sort: Lowest Price</option>
              </select>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition border-2 border-[#1E1611] ${
                    selectedCategory === cat
                      ? "bg-[#1E1611] text-[#F7F4EE] shadow-[2px_2px_0px_#7A543A]"
                      : "bg-[#FFFFFF] text-[#5E5045] hover:bg-[#EFEBE1]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Agent Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAgents.map((agent) => (
                <Link key={agent.id} href={`/agents/${agent.id}`} className="agent-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#EFEBE1] border-2 border-[#1E1611] flex items-center justify-center text-xl shadow-[2px_2px_0px_#1E1611]">
                        {agent.icon}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#1E1611]">{agent.name}</div>
                        <div className="text-[11px] font-mono text-[#857467]">{agent.ens}</div>
                      </div>
                    </div>
                    <span className="badge-neutral text-[10px]">
                      {agent.category}
                    </span>
                  </div>

                  <p className="text-xs text-[#5E5045] mb-3 line-clamp-2 leading-relaxed">
                    {agent.description}
                  </p>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 p-2 bg-[#EFEBE1] border border-[#DCD4C4] rounded-lg mb-3 text-center">
                    <div>
                      <span className="text-[10px] text-[#857467] block">Rating</span>
                      <span className="text-xs font-bold text-[#1E1611]">{agent.rating} ★</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#857467] block">Perf (30d)</span>
                      <span className="text-xs font-bold text-[#245233]">{agent.perf30d}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#857467] block">Drawdown</span>
                      <span className="text-xs font-bold text-[#873322]">{agent.drawdown}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#DCD4C4]">
                    <div>
                      {agent.price === 0 ? (
                        <span className="text-xs font-extrabold text-[#245233]">Free</span>
                      ) : (
                        <span className="text-xs font-extrabold text-[#1E1611]">
                          ${agent.price}
                          <span className="text-[10px] font-normal text-[#857467]">
                            {agent.pricingModel === "PAY_PER_USE" ? "/query" : "/mo"}
                          </span>
                        </span>
                      )}
                    </div>
                    <span className="btn-primary text-xs py-1 px-3">
                      View Profile
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {filteredAgents.length === 0 && (
              <div className="text-center py-16 p-8 rounded-xl bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611]">
                <Bot size={40} className="mx-auto mb-2 text-[#857467]" />
                <p className="text-sm font-bold text-[#1E1611]">No agents match this category filter.</p>
              </div>
            )}
          </>
        ) : (
          /* Packs view */
          <div className="grid md:grid-cols-3 gap-5">
            {PACKS.map((pack) => (
              <div
                key={pack.name}
                className="card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-extrabold text-[#1E1611]">{pack.name}</h3>
                    <span className="badge-brand text-[10px]">${pack.price}/mo</span>
                  </div>
                  <p className="text-xs text-[#5E5045] mb-4 leading-relaxed font-medium">{pack.description}</p>
                  <div className="space-y-1.5 mb-4 p-3 bg-[#EFEBE1] rounded-lg border border-[#DCD4C4]">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#857467] block mb-1">
                      Included Agents:
                    </span>
                    {pack.agents.map((a) => (
                      <div key={a} className="flex items-center gap-2 text-xs font-semibold text-[#1E1611]">
                        <span className="text-[#245233]">✓</span> {a}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#DCD4C4]">
                  <div className="text-xs font-bold text-[#1E1611]">
                    {pack.rating} ★ <span className="font-normal text-[#857467]">({pack.users.toLocaleString()} users)</span>
                  </div>
                  <Link href="/packs" className="btn-primary text-xs py-1.5 px-3">
                    Activate Pack
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <UniversalFooter />
    </div>
  );
}
