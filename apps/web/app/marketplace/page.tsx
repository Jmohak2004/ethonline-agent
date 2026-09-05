"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot, Star, Users, Filter, Search, TrendingUp, Shield,
  ChevronRight, Zap, BarChart2, Globe, Cpu, ArrowLeft
} from "lucide-react";

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
      <div className="sticky top-0 z-40 glass-strong px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="btn-ghost">
              <ArrowLeft size={16} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Cpu size={14} className="text-white" />
              </div>
              <span className="font-bold gradient-text">AgentFi</span>
            </div>
            <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
            <span className="font-semibold text-sm">Marketplace</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView("agents")}
              className={view === "agents" ? "btn-primary text-xs py-1.5 px-3" : "btn-ghost text-xs"}
            >
              <Bot size={12} /> Agents
            </button>
            <button
              onClick={() => setView("packs")}
              className={view === "packs" ? "btn-primary text-xs py-1.5 px-3" : "btn-ghost text-xs"}
            >
              <Zap size={12} /> Packs
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {view === "agents" ? "Agent Marketplace" : "Agent Packs"}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {view === "agents"
              ? "Discover AI agents with verified ENS identities, reputation scores, and transparent performance history."
              : "Curated bundles of agents for different trading strategies."}
          </p>
        </div>

        {view === "agents" ? (
          <>
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  className="input pl-10"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="input w-auto"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ width: "auto", minWidth: 140 }}
              >
                <option value="rating">Top Rated</option>
                <option value="users">Most Popular</option>
                <option value="price">Lowest Price</option>
              </select>
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white border-transparent"
                      : "border text-secondary"
                  }`}
                  style={selectedCategory !== cat ? { border: "1px solid var(--border-default)", color: "var(--text-secondary)" } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Agent Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAgents.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <Link href={`/marketplace/${agent.id}`}>
                    <div className="agent-card group h-full flex flex-col">
                      {/* Badges */}
                      <div className="absolute top-4 right-4 flex gap-1">
                        {agent.trending && (
                          <span className="badge-positive text-xs px-2 py-0.5 rounded-full">🔥</span>
                        )}
                        {agent.featured && (
                          <span className="badge-brand text-xs px-2 py-0.5 rounded-full">⭐</span>
                        )}
                      </div>

                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: "rgba(99,102,241,0.1)", border: "1px solid var(--border-default)" }}>
                          {agent.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{agent.name}</div>
                          <div className="text-xs mt-0.5 font-mono truncate" style={{ color: "var(--text-muted)" }}>
                            {agent.ens}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs mb-4 flex-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                        {agent.description}
                      </p>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-xl"
                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <Star size={10} className="text-yellow-400" fill="#facc15" />
                            <span className="text-xs font-bold">{agent.rating}</span>
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-green-400">{agent.perf30d}</div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>30d Perf</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs font-bold text-red-400">{agent.drawdown}</div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Drawdown</div>
                        </div>
                      </div>

                      {/* Capabilities */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {agent.capabilities.slice(0, 2).map((cap) => (
                          <span key={cap} className="badge-brand text-xs px-2 py-0.5 rounded-md">
                            {cap.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3"
                        style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        <div>
                          {agent.price === 0 ? (
                            <span className="text-green-400 font-bold text-sm">Free</span>
                          ) : agent.pricingModel === "PAY_PER_USE" ? (
                            <span className="font-bold text-sm">
                              ${agent.price}
                              <span className="text-xs font-normal ml-0.5" style={{ color: "var(--text-muted)" }}>/query</span>
                            </span>
                          ) : (
                            <span className="font-bold text-sm">
                              ${agent.price}
                              <span className="text-xs font-normal ml-0.5" style={{ color: "var(--text-muted)" }}>/mo</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                          <Users size={10} />
                          {(agent.users / 1000).toFixed(1)}K
                        </div>
                        <button className="btn-primary text-xs py-1.5 px-3">
                          Subscribe
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {filteredAgents.length === 0 && (
              <div className="text-center py-20">
                <Bot size={48} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
                <p style={{ color: "var(--text-muted)" }}>No agents match your search. Try different filters.</p>
              </div>
            )}
          </>
        ) : (
          /* Packs view */
          <div className="grid md:grid-cols-3 gap-6">
            {PACKS.map((pack, i) => (
              <motion.div
                key={pack.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card card-hover"
              >
                <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center"
                  style={{ background: `${pack.color}22`, border: `1px solid ${pack.color}44` }}>
                  <Zap size={24} style={{ color: pack.color }} />
                </div>
                <h3 className="text-lg font-bold mb-2">{pack.name}</h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{pack.description}</p>
                <div className="space-y-1 mb-4">
                  {pack.agents.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <span className="text-green-400 text-xs">✓</span> {a}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4"
                  style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star size={12} className="text-yellow-400" fill="#facc15" />
                      <span className="text-sm font-semibold">{pack.rating}</span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>({pack.users.toLocaleString()} users)</span>
                    </div>
                    <div className="font-bold text-xl">${pack.price}<span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>/mo</span></div>
                  </div>
                  <button className="btn-primary text-sm">Get Pack</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
