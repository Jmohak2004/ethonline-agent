"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, TrendingUp, Shield, Zap, ChevronRight, Star, Users,
  MessageCircle, Wallet, Lock, ArrowRight,
  Activity, Cpu, DollarSign, Menu, X, CheckCircle2, XCircle
} from "lucide-react";
import UniversalFooter from "@/app/components/Footer";

// ── Agents Data ───────────────────────────────────────────────────────────────
const DEMO_AGENTS = [
  { name: "WhaleWatcher", icon: "🐋", category: "ONCHAIN", rating: 4.8, users: 2340, price: 3, risk: "Medium", perf: "+12.4%", drawdown: "-7.1%", trending: true },
  { name: "NewsScout", icon: "📰", category: "NEWS", rating: 4.7, users: 1890, price: 2, risk: "Low", perf: "+8.2%", drawdown: "-3.1%", trending: false },
  { name: "MarketMind", icon: "📊", category: "TRADING", rating: 4.6, users: 3120, price: 4, risk: "Medium", perf: "+15.6%", drawdown: "-9.2%", trending: true },
  { name: "SentimentAgent", icon: "💭", category: "SENTIMENT", rating: 4.5, users: 980, price: 2, risk: "Low", perf: "+6.8%", drawdown: "-2.4%", trending: false },
  { name: "RiskGuardian", icon: "🛡️", category: "RISK", rating: 4.9, users: 4210, price: 0, risk: "N/A", perf: "Always on", drawdown: "0%", trending: false },
  { name: "ExecutionAgent", icon: "⚡", category: "TRADING", rating: 4.7, users: 1560, price: 3, risk: "Medium", perf: "+18.1%", drawdown: "-11.0%", trending: true },
];

const STATS = [
  { label: "Active Agents", value: "24", icon: Bot },
  { label: "Subscribed Wallets", value: "12.4K", icon: Users },
  { label: "Daily Signals", value: "847", icon: Activity },
  { label: "USDC Volume", value: "$284K", icon: DollarSign },
];

const WHATSAPP_DEMO = [
  { from: "user", text: "I have $100. I want medium-risk crypto opportunities." },
  { from: "agent", text: "Profile configured:\n💰 Budget: $100\n⚖️ Risk: Medium\n🔒 Max Trade: $20\n🛑 Loss Cap: $10\n\nRecommended: Balanced Alpha Pack ($5/mo)\n• NewsScout 📰 • MarketMind 📊\n• WhaleWatcher 🐋 • RiskGuardian 🛡️\n\nActivate?" },
  { from: "user", text: "Yes" },
  { from: "agent", text: "✅ Activated.\n\n🐋 WhaleWatcher: Accumulation on ETH ($18.4M)\n📊 MarketMind: Bullish momentum confirmed\n🛡️ RiskGuardian: Trade amount $20 within limits\n\nApprove $20 testnet swap into ETH?" },
];

const INTEGRATIONS = [
  { name: "WhatsApp", desc: "Twilio Sandbox & Meta API" },
  { name: "Privy", desc: "Embedded Account Abstraction" },
  { name: "The Graph", desc: "Decentralized Subgraph Indexing" },
  { name: "Hedera", desc: "x402 Micropayments & HCS" },
  { name: "Arc / USDC", desc: "Stablecoin Revenue Splits" },
  { name: "ENS", desc: "*.agentfi.eth Subnames" },
  { name: "Uniswap", desc: "Exact Swap Execution" },
  { name: "Chainlink", desc: "CRE Confidential TEE Guard" },
  { name: "Ledger", desc: "Hardware Clear-Signing" },
];

// ── Components ────────────────────────────────────────────────────────────────
function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Marketplace", href: "/marketplace" },
    { label: "Packs", href: "/packs" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Activity", href: "/activity" },
    { label: "Demo", href: "/demo" },
    { label: "Developer", href: "/developer" },
    { label: "Docs", href: "/docs" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F7F4EE]/95 backdrop-blur-md border-b-2 border-[#1E1611]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#1E1611] flex items-center justify-center border-2 border-[#1E1611] shadow-[2px_2px_0px_#7A543A]">
            <Cpu size={15} className="text-[#F7F4EE]" />
          </div>
          <span className="font-extrabold text-lg text-[#1E1611] tracking-tight">AgentFi</span>
        </Link>

        <div className="hidden md:flex items-center gap-1.5">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3 py-1.5 text-xs font-semibold text-[#5E5045] hover:text-[#1E1611] hover:bg-[#EFEBE1] rounded-lg border-2 border-transparent transition"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/marketplace" className="btn-secondary text-xs hidden sm:flex">
            Browse Agents
          </Link>
          <Link href="/demo" className="btn-primary text-xs">
            Launch Demo <ArrowRight size={13} />
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#1E1611] bg-[#EFEBE1] border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611]"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-[#1E1611] bg-[#F7F4EE] px-4 py-3 space-y-1 shadow-[0_8px_0px_#1E1611]">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#5E5045] hover:bg-[#EFEBE1]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="pt-32 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Neu-brutal Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EFEBE1] border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#245233]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1E1611]">
            ETHOnline 2026 • Verified AI Agent Economy
          </span>
        </div>

        {/* Crisp Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#1E1611] tracking-tight leading-[1.1] mb-5">
          Your AI agent portfolio, <br />
          <span className="text-[#7A543A]">directly in WhatsApp.</span>
        </h1>

        {/* Crisp Subhead */}
        <p className="text-base sm:text-lg text-[#5E5045] max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
          Specialized data agents detect alpha, collaborate over Hedera x402, and execute onchain under hard RiskGuardian limits. No seed phrases.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3.5 justify-center items-center mb-16">
          <Link href="/marketplace" className="btn-primary text-sm px-6 py-3 w-full sm:w-auto">
            <Bot size={16} /> Explore Marketplace
          </Link>
          <Link href="/demo" className="btn-secondary text-sm px-6 py-3 w-full sm:w-auto">
            <MessageCircle size={16} /> Interactive Demo Runner
          </Link>
        </div>

        {/* Minimal Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {STATS.map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611] text-left">
              <span className="text-xs font-semibold text-[#857467] block mb-1">{stat.label}</span>
              <div className="text-2xl font-extrabold text-[#1E1611]">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatsAppDemo() {
  const [visibleMessages, setVisibleMessages] = useState(0);

  useEffect(() => {
    if (visibleMessages < WHATSAPP_DEMO.length) {
      const timer = setTimeout(() => setVisibleMessages(v => v + 1), 1100);
      return () => clearTimeout(timer);
    }
  }, [visibleMessages]);

  return (
    <section className="py-16 px-4 sm:px-6 bg-[#EFEBE1] border-y-2 border-[#1E1611]">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="badge-brand mb-4">
            Zero-Friction Interface
          </div>
          <h2 className="text-3xl font-extrabold text-[#1E1611] tracking-tight mb-4">
            Complex DeFi. <br />
            Simple Conversation.
          </h2>
          <p className="text-sm text-[#5E5045] leading-relaxed mb-6 font-medium">
            Users state goals naturally. Autonomous agents parse intent, coordinate onchain research, and present clear confirmations.
          </p>

          <div className="space-y-3 font-semibold text-xs text-[#1E1611]">
            <div className="p-3 rounded-lg bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611] flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-[#245233]" />
              <span>Privy Account Abstraction maps phone number to MPC wallet</span>
            </div>
            <div className="p-3 rounded-lg bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611] flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-[#245233]" />
              <span>RiskGuardian enforces $20 trade and $10 daily loss caps</span>
            </div>
            <div className="p-3 rounded-lg bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611] flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-[#245233]" />
              <span>Blockscout explorer verification sent with every trade</span>
            </div>
          </div>
        </div>

        {/* Phone Mockup in Neu-Brutal Frame */}
        <div className="w-full max-w-sm mx-auto rounded-2xl bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[6px_6px_0px_#1E1611] overflow-hidden">
          {/* Phone Header */}
          <div className="px-4 py-3 bg-[#1E1611] text-[#F7F4EE] flex items-center justify-between border-b-2 border-[#1E1611]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#7A543A] flex items-center justify-center font-bold text-xs text-[#F7F4EE]">
                AF
              </div>
              <div>
                <span className="text-xs font-bold block">AgentFi AI</span>
                <span className="text-[10px] text-[#DCD4C4] font-mono">WhatsApp Verified</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#245233]" />
          </div>

          {/* Messages */}
          <div className="p-4 space-y-3 bg-[#F7F4EE] min-h-[300px]">
            <AnimatePresence>
              {WHATSAPP_DEMO.slice(0, visibleMessages).map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-lg text-xs leading-relaxed border-2 border-[#1E1611] whitespace-pre-wrap ${
                      msg.from === "user"
                        ? "bg-[#EFEBE1] text-[#1E1611] shadow-[2px_2px_0px_#1E1611]"
                        : "bg-[#FFFFFF] text-[#1E1611] shadow-[2px_2px_0px_#7A543A]"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {visibleMessages >= WHATSAPP_DEMO.length && (
              <button
                onClick={() => setVisibleMessages(0)}
                className="w-full text-center text-[11px] font-bold text-[#7A543A] py-1.5 hover:underline"
              >
                ↺ Replay demo sequence
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AgentMarketplace() {
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="badge-brand mb-2.5">
              Verified Agents
            </div>
            <h2 className="text-3xl font-extrabold text-[#1E1611] tracking-tight">
              Featured Intelligence Agents
            </h2>
          </div>
          <Link href="/marketplace" className="btn-secondary text-xs">
            View All 24 Agents <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEMO_AGENTS.map((agent) => (
            <Link key={agent.name} href={`/agents/${agent.name.toLowerCase()}`} className="agent-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EFEBE1] border-2 border-[#1E1611] flex items-center justify-center text-xl shadow-[2px_2px_0px_#1E1611]">
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1E1611]">{agent.name}</h3>
                    <span className="text-[11px] font-mono text-[#857467]">{agent.name.toLowerCase()}.agentfi.eth</span>
                  </div>
                </div>
                <span className="badge-neutral text-[10px]">
                  {agent.category}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-[#EFEBE1] border border-[#DCD4C4] rounded-lg mb-3 text-center">
                <div>
                  <span className="text-[10px] text-[#857467] block">Rating</span>
                  <span className="text-xs font-bold text-[#1E1611]">{agent.rating} ★</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#857467] block">Perf</span>
                  <span className="text-xs font-bold text-[#245233]">{agent.perf}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#857467] block">Risk</span>
                  <span className="text-xs font-bold text-[#7A543A]">{agent.risk}</span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-[#DCD4C4]">
                <div className="text-xs font-extrabold text-[#1E1611]">
                  {agent.price === 0 ? "Free" : `$${agent.price}/mo`}
                </div>
                <span className="btn-primary text-xs py-1 px-3">
                  View Agent
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section className="py-16 px-4 sm:px-6 bg-[#EFEBE1] border-t-2 border-[#1E1611]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="badge-brand mb-2.5">Protocol Integrations</div>
          <h2 className="text-3xl font-extrabold text-[#1E1611] tracking-tight mb-2">
            Verifiable Web3 Architecture
          </h2>
          <p className="text-xs text-[#5E5045] font-medium">
            Every sponsor integration is actively integrated in the multi-agent pipeline.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3.5">
          {INTEGRATIONS.map((tech) => (
            <div key={tech.name} className="p-4 rounded-xl bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-[#1E1611]">{tech.name}</span>
                <span className="w-2 h-2 rounded-full bg-[#7A543A]" />
              </div>
              <p className="text-xs text-[#5E5045] font-medium">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section className="py-16 px-4 sm:px-6 border-t-2 border-[#1E1611]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="badge-brand mb-3">Hard Safety Guardrails</div>
            <h2 className="text-3xl font-extrabold text-[#1E1611] tracking-tight mb-4">
              The LLM is Never Trusted. <br />
              Funds are Always Safe.
            </h2>
            <p className="text-sm text-[#5E5045] leading-relaxed mb-6 font-medium">
              Every trade proposal is verified deterministically against smart contract permissions and Chainlink TEE enclaves.
            </p>

            <div className="grid grid-cols-2 gap-2.5 font-semibold text-xs">
              <div className="p-2.5 rounded-lg bg-[#EFEBE1] border border-[#DCD4C4] flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#245233]" />
                <span>Max $20 trade cap</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#EFEBE1] border border-[#DCD4C4] flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#245233]" />
                <span>$10 daily loss cap</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#EFEBE1] border border-[#DCD4C4] flex items-center gap-2">
                <XCircle size={14} className="text-[#873322]" />
                <span>Withdrawals blocked</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#EFEBE1] border border-[#DCD4C4] flex items-center gap-2">
                <XCircle size={14} className="text-[#873322]" />
                <span>Permission edits blocked</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[5px_5px_0px_#1E1611]">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-[#1E1611]">
              <Lock size={15} className="text-[#7A543A]" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#1E1611]">
                Fail-Closed Execution Flow
              </span>
            </div>
            <div className="space-y-2 font-mono text-xs text-[#5E5045]">
              <div className="p-2 rounded bg-[#EFEBE1] border border-[#DCD4C4]">1. User Intent (WhatsApp) → Structured Parameters</div>
              <div className="p-2 rounded bg-[#EFEBE1] border border-[#DCD4C4]">2. Multi-Agent Swarm → Consensus Alpha Score</div>
              <div className="p-2 rounded bg-[#EFEBE1] border border-[#DCD4C4]">3. Chainlink CRE TEE → Policy &amp; Limit Checks</div>
              <div className="p-2 rounded bg-[#EFEBE1] border border-[#DCD4C4]">4. If limit exceeded → Ledger Challenge Prompt</div>
              <div className="p-2 rounded bg-[#EFEBE1] border border-[#DCD4C4] font-bold text-[#245233]">5. Uniswap v3 Swap → Blockscout Receipt Link</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F7F4EE] text-[#1E1611]">
      <Navbar />
      <HeroSection />
      <WhatsAppDemo />
      <AgentMarketplace />
      <TechStack />
      <SecuritySection />
      <UniversalFooter />
    </main>
  );
}
