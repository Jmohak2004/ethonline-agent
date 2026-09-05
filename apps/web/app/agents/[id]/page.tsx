"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot, Star, Users, Shield, ArrowLeft, CheckCircle,
  ExternalLink, Zap, Lock, Activity, TrendingUp, AlertTriangle, MessageSquare
} from "lucide-react";
import AppHeader from "@/app/components/AppHeader";
import UniversalFooter from "@/app/components/Footer";

const AGENT_DATA: Record<string, any> = {
  "whalewatcher": {
    id: "whalewatcher",
    name: "WhaleWatcher Pro",
    ensName: "whalewatcher.agentfi.eth",
    category: "ONCHAIN",
    description: "Detects large whale transactions, exchange reserve shifts, and liquidity movements across decentralized protocols.",
    longDescription: "WhaleWatcher Pro connects directly to The Graph decentralized subgraphs and real-time mempool monitors. When large wallets transfer funds or liquidity pools experience sudden depth shifts, WhaleWatcher scores the activity into ACCUMULATION or DISTRIBUTION signals with full cryptographic evidence.",
    developer: "0x71C...49bE (Verified Developer)",
    version: "1.2.0",
    rating: 4.8,
    ratingCount: 142,
    activeUsers: 2340,
    priceMonthly: 3.0,
    pricePerQuery: 0.02,
    riskLevel: "MEDIUM",
    performanceScore: 94,
    maxDrawdown: "-7.1%",
    historicalPnl: "+18.4%",
    capabilities: [
      "The Graph Subgraph Querying",
      "Whale Net Flow Tracking",
      "DEX Liquidity Depth Profiling",
      "Hedera x402 Micropayment API"
    ],
    requiredPermissions: [
      { name: "Read Onchain Blockchain Data", granted: true },
      { name: "Analyze Portfolio Exposure", granted: true },
      { name: "Execute Swaps via RiskGuardian", granted: true, limit: "Max $20/trade" },
      { name: "Withdraw Funds", granted: false, blocked: true },
      { name: "Change Security Permissions", granted: false, blocked: true }
    ],
    reviews: [
      {
        user: "Alex M. (+1 415***89)",
        rating: 5,
        date: "2 days ago",
        comment: "Caught the ETH accumulation 4 hours before the spike. Super clean signals sent right to my WhatsApp!"
      },
      {
        user: "Sarah K. (+44 79***12)",
        rating: 5,
        date: "1 week ago",
        comment: "Love the fail-closed protection. WhaleWatcher collaborated with RiskGuardian without any hiccups."
      }
    ]
  },
  "whalewatcher-pro": {
    id: "whalewatcher-pro",
    name: "WhaleWatcher Pro",
    ensName: "whalewatcher.agentfi.eth",
    category: "ONCHAIN",
    description: "Detects large whale transactions, exchange reserve shifts, and liquidity movements across decentralized protocols.",
    longDescription: "WhaleWatcher Pro connects directly to The Graph decentralized subgraphs and real-time mempool monitors. When large wallets transfer funds or liquidity pools experience sudden depth shifts, WhaleWatcher scores the activity into ACCUMULATION or DISTRIBUTION signals with full cryptographic evidence.",
    developer: "0x71C...49bE (Verified Developer)",
    version: "1.2.0",
    rating: 4.8,
    ratingCount: 142,
    activeUsers: 2340,
    priceMonthly: 3.0,
    pricePerQuery: 0.02,
    riskLevel: "MEDIUM",
    performanceScore: 94,
    maxDrawdown: "-7.1%",
    historicalPnl: "+18.4%",
    capabilities: [
      "The Graph Subgraph Querying",
      "Whale Net Flow Tracking",
      "DEX Liquidity Depth Profiling",
      "Hedera x402 Micropayment API"
    ],
    requiredPermissions: [
      { name: "Read Onchain Blockchain Data", granted: true },
      { name: "Analyze Portfolio Exposure", granted: true },
      { name: "Execute Swaps via RiskGuardian", granted: true, limit: "Max $20/trade" },
      { name: "Withdraw Funds", granted: false, blocked: true },
      { name: "Change Security Permissions", granted: false, blocked: true }
    ],
    reviews: [
      {
        user: "Alex M. (+1 415***89)",
        rating: 5,
        date: "2 days ago",
        comment: "Caught the ETH accumulation 4 hours before the spike. Super clean signals sent right to my WhatsApp!"
      },
      {
        user: "Sarah K. (+44 79***12)",
        rating: 5,
        date: "1 week ago",
        comment: "Love the fail-closed protection. WhaleWatcher collaborated with RiskGuardian without any hiccups."
      }
    ]
  },
  "newsscout": {
    id: "newsscout",
    name: "NewsScout",
    ensName: "newsscout.agentfi.eth",
    category: "NEWS",
    description: "Monitors breaking protocol governance, Layer 2 throughput milestones, and market-moving catalysts.",
    longDescription: "NewsScout aggregates institutional feeds, developer commits, and protocol announcements in real-time. It filters noise from actionable alpha, outputting positive or negative confidence ratings before narrative trends reach mainstream social media.",
    developer: "0x89A...12cF (Verified Developer)",
    version: "1.0.4",
    rating: 4.9,
    ratingCount: 204,
    activeUsers: 3120,
    priceMonthly: 0.0,
    pricePerQuery: 0.0,
    riskLevel: "LOW",
    performanceScore: 88,
    maxDrawdown: "-3.1%",
    historicalPnl: "+8.2%",
    capabilities: [
      "Protocol Announcement Feed Filtering",
      "Governance Catalyst Tracking",
      "NLP Sentiment Scoring"
    ],
    requiredPermissions: [
      { name: "Read Market News Feeds", granted: true },
      { name: "Withdraw Funds", granted: false, blocked: true }
    ],
    reviews: [
      {
        user: "Elena R. (+33 61***45)",
        rating: 5,
        date: "3 days ago",
        comment: "Instant alerts on WhatsApp when Layer-2 throughput broke record highs."
      }
    ]
  },
  "marketmind": {
    id: "marketmind",
    name: "MarketMind",
    ensName: "marketmind.agentfi.eth",
    category: "TRADING",
    description: "Calculates multi-timeframe RSI, MACD golden crosses, and momentum trends.",
    longDescription: "MarketMind computes technical indicators over multiple timeframes to distinguish genuine breakout momentum from low-volume range traps. Never claims guaranteed predictions, but provides probabilistic trend ratings with explainable indicator values.",
    developer: "0x33B...87a1 (Verified Developer)",
    version: "2.1.0",
    rating: 4.7,
    ratingCount: 118,
    activeUsers: 1890,
    priceMonthly: 3.0,
    pricePerQuery: 0.02,
    riskLevel: "MEDIUM",
    performanceScore: 91,
    maxDrawdown: "-9.2%",
    historicalPnl: "+15.6%",
    capabilities: [
      "Multi-Timeframe RSI Calculation",
      "MACD & EMA Momentum Profiling",
      "Support & Resistance Range Finding"
    ],
    requiredPermissions: [
      { name: "Analyze Historical Price Charts", granted: true },
      { name: "Execute Swaps via RiskGuardian", granted: true, limit: "Max $20/trade" },
      { name: "Withdraw Funds", granted: false, blocked: true }
    ],
    reviews: [
      {
        user: "David L. (+1 312***90)",
        rating: 5,
        date: "4 days ago",
        comment: "The RSI + EMA golden cross trigger is remarkably accurate when paired with WhaleWatcher."
      }
    ]
  },
  "sentimentagent": {
    id: "sentimentagent",
    name: "SentimentAgent",
    ensName: "sentiment.agentfi.eth",
    category: "SENTIMENT",
    description: "Tracks social volume momentum, narrative shifts, and community sentiment.",
    longDescription: "SentimentAgent monitors decentralized social feeds and developer communities to gauge retail crowd momentum and protocol narrative velocity.",
    developer: "0x55C...33e9 (Verified Developer)",
    version: "1.1.0",
    rating: 4.6,
    ratingCount: 92,
    activeUsers: 1450,
    priceMonthly: 2.0,
    pricePerQuery: 0.01,
    riskLevel: "MEDIUM",
    performanceScore: 86,
    maxDrawdown: "-4.5%",
    historicalPnl: "+9.4%",
    capabilities: [
      "Social Volume Spike Detection",
      "Narrative Acceleration Profiling"
    ],
    requiredPermissions: [
      { name: "Read Public Social Alpha", granted: true },
      { name: "Withdraw Funds", granted: false, blocked: true }
    ],
    reviews: [
      {
        user: "Tobi B. (+234 80***77)",
        rating: 5,
        date: "5 days ago",
        comment: "Great at spotting early organic momentum before coins trend on Twitter."
      }
    ]
  },
  "sentiment-agent": {
    id: "sentiment-agent",
    name: "SentimentAgent",
    ensName: "sentiment.agentfi.eth",
    category: "SENTIMENT",
    description: "Tracks social volume momentum, narrative shifts, and community sentiment.",
    longDescription: "SentimentAgent monitors decentralized social feeds and developer communities to gauge retail crowd momentum and protocol narrative velocity.",
    developer: "0x55C...33e9 (Verified Developer)",
    version: "1.1.0",
    rating: 4.6,
    ratingCount: 92,
    activeUsers: 1450,
    priceMonthly: 2.0,
    pricePerQuery: 0.01,
    riskLevel: "MEDIUM",
    performanceScore: 86,
    maxDrawdown: "-4.5%",
    historicalPnl: "+9.4%",
    capabilities: [
      "Social Volume Spike Detection",
      "Narrative Acceleration Profiling"
    ],
    requiredPermissions: [
      { name: "Read Public Social Alpha", granted: true },
      { name: "Withdraw Funds", granted: false, blocked: true }
    ],
    reviews: [
      {
        user: "Tobi B. (+234 80***77)",
        rating: 5,
        date: "5 days ago",
        comment: "Great at spotting early organic momentum before coins trend on Twitter."
      }
    ]
  },
  "riskguardian": {
    id: "riskguardian",
    name: "RiskGuardian",
    ensName: "riskguardian.agentfi.eth",
    category: "RISK",
    description: "Strict Chainlink CRE confidential TEE risk engine with fail-closed financial guardrails.",
    longDescription: "RiskGuardian is the mandatory safety gatekeeper of AgentFi. No trade can ever execute without passing RiskGuardian's confidential checks. It verifies max trade limits, portfolio exposure, daily loss thresholds, and triggers Ledger hardware clear-signing whenever limits are exceeded.",
    developer: "0xAgentFiProtocol (Core Governance)",
    version: "3.0.0",
    rating: 5.0,
    ratingCount: 380,
    activeUsers: 4890,
    priceMonthly: 0.0,
    pricePerQuery: 0.0,
    riskLevel: "LOW",
    performanceScore: 99,
    maxDrawdown: "0.0%",
    historicalPnl: "Protected $12K+",
    capabilities: [
      "Chainlink CRE TEE Confidential Enclave",
      "Fail-Closed Financial Safety",
      "Ledger Clear-Signing Challenge Generation"
    ],
    requiredPermissions: [
      { name: "Enforce Hard Spending Limits", granted: true },
      { name: "Halt Trades Over Threshold", granted: true },
      { name: "Withdraw Funds", granted: false, blocked: true }
    ],
    reviews: [
      {
        user: "Marcus V. (+49 151***23)",
        rating: 5,
        date: "1 day ago",
        comment: "Saved me from an unauthorized trade by requiring WhatsApp approval. Top-tier security."
      }
    ]
  },
  "executionagent": {
    id: "executionagent",
    name: "ExecutionAgent",
    ensName: "execution.agentfi.eth",
    category: "TRADING",
    description: "Uniswap v3 automated swap router with strict slippage protection and gas refuel.",
    longDescription: "ExecutionAgent executes trades on Uniswap v3 on Ethereum Sepolia, Base Sepolia, and Arbitrum. It operates under strict session keys, verifies slippage, and coordinates with GasRefuel.sol to ensure zero out-of-gas errors.",
    developer: "0xAgentFiProtocol (Core Infrastructure)",
    version: "2.0.0",
    rating: 4.9,
    ratingCount: 165,
    activeUsers: 2100,
    priceMonthly: 0.0,
    pricePerQuery: 0.0,
    riskLevel: "MEDIUM",
    performanceScore: 96,
    maxDrawdown: "-5.0%",
    historicalPnl: "+18.1%",
    capabilities: [
      "Uniswap v3 Universal Router & SwapRouter02",
      "Max 0.5% Slippage Guardrail",
      "GasRefuel.sol Auto-Sponsorship"
    ],
    requiredPermissions: [
      { name: "Execute Swaps via RiskGuardian", granted: true, limit: "Max $20/trade" },
      { name: "Withdraw Funds", granted: false, blocked: true }
    ],
    reviews: [
      {
        user: "Kenji T. (+81 90***11)",
        rating: 5,
        date: "2 days ago",
        comment: "Fast testnet execution, and the Blockscout receipt link right in WhatsApp is awesome."
      }
    ]
  },
  "execution-agent": {
    id: "execution-agent",
    name: "ExecutionAgent",
    ensName: "execution.agentfi.eth",
    category: "TRADING",
    description: "Uniswap v3 automated swap router with strict slippage protection and gas refuel.",
    longDescription: "ExecutionAgent executes trades on Uniswap v3 on Ethereum Sepolia, Base Sepolia, and Arbitrum. It operates under strict session keys, verifies slippage, and coordinates with GasRefuel.sol to ensure zero out-of-gas errors.",
    developer: "0xAgentFiProtocol (Core Infrastructure)",
    version: "2.0.0",
    rating: 4.9,
    ratingCount: 165,
    activeUsers: 2100,
    priceMonthly: 0.0,
    pricePerQuery: 0.0,
    riskLevel: "MEDIUM",
    performanceScore: 96,
    maxDrawdown: "-5.0%",
    historicalPnl: "+18.1%",
    capabilities: [
      "Uniswap v3 Universal Router & SwapRouter02",
      "Max 0.5% Slippage Guardrail",
      "GasRefuel.sol Auto-Sponsorship"
    ],
    requiredPermissions: [
      { name: "Execute Swaps via RiskGuardian", granted: true, limit: "Max $20/trade" },
      { name: "Withdraw Funds", granted: false, blocked: true }
    ],
    reviews: [
      {
        user: "Kenji T. (+81 90***11)",
        rating: 5,
        date: "2 days ago",
        comment: "Fast testnet execution, and the Blockscout receipt link right in WhatsApp is awesome."
      }
    ]
  },
  "chainwhale": {
    id: "chainwhale",
    name: "ChainWhale",
    ensName: "chainwhale.agentfi.eth",
    category: "ONCHAIN",
    description: "Affordable pay-per-use whale tracking. Query whale positions for specific assets on demand.",
    longDescription: "ChainWhale provides on-demand queries for large wallet flows and DEX liquidity shifts. Instead of a recurring monthly subscription, pay only 0.25 HBAR ($0.02) or 2 USDC per deep onchain query.",
    developer: "0x34A...12dE (Verified Developer)",
    version: "1.1.0",
    rating: 4.6,
    ratingCount: 88,
    activeUsers: 870,
    priceMonthly: 2.0,
    pricePerQuery: 0.02,
    riskLevel: "MEDIUM",
    performanceScore: 89,
    maxDrawdown: "-5.1%",
    historicalPnl: "+9.4%",
    capabilities: [
      "On-Demand Whale Tracking",
      "Pay-Per-Use Hedera x402 Channels",
      "DEX Liquidity Depth Profiling"
    ],
    requiredPermissions: [
      { name: "Read Onchain Blockchain Data", granted: true },
      { name: "Execute Swaps via RiskGuardian", granted: true, limit: "Max $20/trade" },
      { name: "Withdraw Funds", granted: false, blocked: true }
    ],
    reviews: [
      {
        user: "David L. (+1 312***44)",
        rating: 5,
        date: "5 days ago",
        comment: "Great for quick spot checks without paying a full monthly fee."
      }
    ]
  },
  "alphawhale": {
    id: "alphawhale",
    name: "AlphaWhale",
    ensName: "alphawhale.agentfi.eth",
    category: "ONCHAIN",
    description: "Real-time micro-whale accumulation signals with instant push alerts.",
    longDescription: "AlphaWhale monitors high-velocity accumulation from sub-whale tier wallets (100-1,000 ETH). Gives traders an edge before mega-whales appear in headlines.",
    developer: "0x98F...77bA (Verified Developer)",
    version: "1.0.4",
    rating: 4.4,
    ratingCount: 52,
    activeUsers: 450,
    priceMonthly: 1.5,
    pricePerQuery: 0.02,
    riskLevel: "LOW",
    performanceScore: 86,
    maxDrawdown: "-3.8%",
    historicalPnl: "+7.1%",
    capabilities: [
      "Micro-Whale Tracking",
      "Fast Mempool Detection",
      "Telegram & WhatsApp Push Alerts"
    ],
    requiredPermissions: [
      { name: "Read Onchain Blockchain Data", granted: true },
      { name: "Execute Swaps via RiskGuardian", granted: true, limit: "Max $20/trade" },
      { name: "Withdraw Funds", granted: false, blocked: true }
    ],
    reviews: [
      {
        user: "Elena R. (+49 15***90)",
        rating: 4,
        date: "1 week ago",
        comment: "Very quick alerts on Arbitrum and Base."
      }
    ]
  }
};

function getAgentData(rawId: string) {
  const agentKey = (rawId || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (AGENT_DATA[agentKey]) return AGENT_DATA[agentKey];

  const formattedName = agentKey
    ? agentKey.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Autonomous Agent";

  return {
    id: agentKey || "custom-agent",
    name: formattedName,
    ensName: `${agentKey || "custom"}.agentfi.eth`,
    category: "ONCHAIN",
    description: "Specialized AI agent operating within the AgentFi verifiable economy.",
    longDescription: `${formattedName} is an active AI agent registered on the AgentFi smart contract registry. It communicates via Hedera x402 micropayment channels and operates strictly under the RiskGuardian fail-closed safety invariant.`,
    developer: "0x71C...49bE (Verified Developer)",
    version: "1.0.0",
    rating: 4.8,
    ratingCount: 42,
    activeUsers: 950,
    priceMonthly: 3.0,
    pricePerQuery: 0.02,
    riskLevel: "MEDIUM",
    performanceScore: 91,
    maxDrawdown: "-5.0%",
    historicalPnl: "+12.0%",
    capabilities: [
      "Onchain Subgraph Data Intelligence",
      "Hedera x402 Micropayments",
      "RiskGuardian Guardrail Compliance",
      "WhatsApp Command Routing"
    ],
    requiredPermissions: [
      { name: "Read Onchain Blockchain Data", granted: true },
      { name: "Analyze Portfolio Exposure", granted: true },
      { name: "Execute Swaps via RiskGuardian", granted: true, limit: "Max $20/trade" },
      { name: "Withdraw Funds", granted: false, blocked: true },
      { name: "Change Security Permissions", granted: false, blocked: true }
    ],
    reviews: [
      {
        user: "Verified Tester (+1 415***88)",
        rating: 5,
        date: "Just now",
        comment: "Autonomous signals and risk limits working seamlessly."
      }
    ]
  };
}

export default function AgentDetailPage() {
  const params = useParams();
  const rawId = (params?.id as string) || "whalewatcher-pro";
  const agent = getAgentData(rawId);

  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = () => {
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      setSubscribed(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1E1611]">
      {/* Header */}
      <AppHeader
        backHref="/marketplace"
        backLabel="Marketplace"
        badge={
          <span className="badge-brand">
            ENS: {agent.ensName}
          </span>
        }
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Agent Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-xl bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-[#EFEBE1] border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611] flex items-center justify-center text-2xl">
                    <Bot className="w-7 h-7 text-[#7A543A]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-[#1E1611] tracking-tight flex items-center gap-2">
                      {agent.name}
                      <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-[#EFEBE1] border border-[#DCD4C4] text-[#857467]">
                        v{agent.version}
                      </span>
                    </h1>
                    <p className="text-xs font-semibold text-[#857467] mt-0.5">Developer: {agent.developer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EFEBE1] border border-[#1E1611] text-xs font-extrabold text-[#1E1611]">
                  <Star className="w-3.5 h-3.5 fill-[#1E1611] text-[#1E1611]" />
                  {agent.rating} ({agent.ratingCount})
                </div>
              </div>

              <p className="mt-5 text-[#5E5045] leading-relaxed text-sm font-medium">
                {agent.longDescription}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#DCD4C4]">
                <div className="p-3 rounded-lg bg-[#EFEBE1] border border-[#DCD4C4]">
                  <span className="text-[10px] font-bold text-[#857467] block uppercase tracking-wider">Performance</span>
                  <span className="text-base font-extrabold text-[#245233]">{agent.historicalPnl}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#EFEBE1] border border-[#DCD4C4]">
                  <span className="text-[10px] font-bold text-[#857467] block uppercase tracking-wider">Max Drawdown</span>
                  <span className="text-base font-extrabold text-[#873322]">{agent.maxDrawdown}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#EFEBE1] border border-[#DCD4C4]">
                  <span className="text-[10px] font-bold text-[#857467] block uppercase tracking-wider">Active Users</span>
                  <span className="text-base font-extrabold text-[#1E1611]">{agent.activeUsers.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#EFEBE1] border border-[#DCD4C4]">
                  <span className="text-[10px] font-bold text-[#857467] block uppercase tracking-wider">Reputation</span>
                  <span className="text-base font-extrabold text-[#7A543A]">{agent.performanceScore}/100</span>
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="p-6 rounded-xl bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611]">
              <h2 className="text-base font-extrabold text-[#1E1611] mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#7A543A]" /> Capabilities &amp; Recipes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {agent.capabilities.map((cap: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#EFEBE1] border border-[#DCD4C4] text-xs font-semibold text-[#1E1611]">
                    <CheckCircle className="w-3.5 h-3.5 text-[#245233] shrink-0" />
                    {cap}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="p-6 rounded-xl bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611]">
              <h2 className="text-base font-extrabold text-[#1E1611] mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#7A543A]" /> Verified Community Feedback
              </h2>
              <div className="space-y-3">
                {agent.reviews.map((rev: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-[#EFEBE1] border border-[#DCD4C4]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#1E1611]">{rev.user}</span>
                      <span className="text-[11px] text-[#857467]">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-1.5 text-xs text-[#1E1611]">
                      {"★".repeat(rev.rating)}
                    </div>
                    <p className="text-xs text-[#5E5045] font-medium leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Security Guardrails */}
          <div className="space-y-6">
            {/* Subscribe Card */}
            <div className="p-6 rounded-xl bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[5px_5px_0px_#1E1611]">
              <span className="badge-brand text-[10px] mb-2">Verified Plan</span>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-[#1E1611]">${agent.priceMonthly.toFixed(2)}</span>
                <span className="text-xs font-bold text-[#857467]">USDC / month</span>
              </div>
              <p className="text-xs text-[#5E5045] mt-1 font-medium">Or 0.25 HBAR ($0.02) per query via Hedera x402</p>

              <button
                onClick={handleSubscribe}
                disabled={subscribing || subscribed}
                className="w-full mt-5 btn-primary py-3 text-sm font-bold"
              >
                {subscribing ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Settling on Arc USDC...
                  </>
                ) : subscribed ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Subscribed via WhatsApp
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Subscribe with 1-Click
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-[#857467] font-medium mt-2.5">
                No seed phrases • Privy embedded account • Cancel in WhatsApp
              </p>
            </div>

            {/* Permission Guardrails */}
            <div className="p-6 rounded-xl bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611]">
              <h3 className="text-sm font-extrabold text-[#1E1611] mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#7A543A]" /> Security Policy &amp; Limits
              </h3>
              <div className="space-y-2">
                {agent.requiredPermissions.map((perm: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-[#EFEBE1] border border-[#DCD4C4] text-xs">
                    <span className="text-[#1E1611] font-semibold flex items-center gap-2">
                      {perm.granted ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#245233]" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-[#873322]" />
                      )}
                      {perm.name}
                    </span>
                    {perm.limit && (
                      <span className="badge-brand text-[10px]">
                        {perm.limit}
                      </span>
                    )}
                    {perm.blocked && (
                      <span className="badge-negative text-[10px]">
                        BLOCKED
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <UniversalFooter />
    </div>
  );
}
