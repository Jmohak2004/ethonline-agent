"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, TrendingUp, Shield, Zap, ChevronRight, Star, Users,
  MessageCircle, Wallet, BarChart2, Globe, Lock, ArrowRight,
  Activity, Cpu, DollarSign
} from "lucide-react";

// ── Mock Data ─────────────────────────────────────────────────────────────────
const DEMO_AGENTS = [
  { name: "WhaleWatcher", icon: "🐋", category: "ONCHAIN", rating: 4.8, users: 2340, price: 3, risk: "Medium", perf: "+12.4%", drawdown: "-7.1%", trending: true },
  { name: "NewsScout", icon: "📰", category: "NEWS", rating: 4.7, users: 1890, price: 2, risk: "Low", perf: "+8.2%", drawdown: "-3.1%", trending: false },
  { name: "MarketMind", icon: "📊", category: "TRADING", rating: 4.6, users: 3120, price: 4, risk: "Medium", perf: "+15.6%", drawdown: "-9.2%", trending: true },
  { name: "SentimentAgent", icon: "💭", category: "SENTIMENT", rating: 4.5, users: 980, price: 2, risk: "Low", perf: "+6.8%", drawdown: "-2.4%", trending: false },
  { name: "RiskGuardian", icon: "🛡️", category: "RISK", rating: 4.9, users: 4210, price: 0, risk: "N/A", perf: "Always on", drawdown: "N/A", trending: false },
  { name: "ExecutionAgent", icon: "⚡", category: "TRADING", rating: 4.7, users: 1560, price: 3, risk: "Medium", perf: "+18.1%", drawdown: "-11.0%", trending: true },
];

const STATS = [
  { label: "Active Agents", value: "24", icon: Bot, color: "#818cf8" },
  { label: "Users", value: "12.4K", icon: Users, color: "#10b981" },
  { label: "Signals Today", value: "847", icon: Activity, color: "#f59e0b" },
  { label: "Volume (USDC)", value: "$284K", icon: DollarSign, color: "#a855f7" },
];

const WHATSAPP_DEMO = [
  { from: "user", text: "I have $100. I want medium-risk crypto opportunities." },
  { from: "agent", text: "Got it! Your profile:\n\n💰 Budget: $100\n⚖️ Risk: Medium\n🔒 Max trade: $20\n🛑 Daily loss limit: $10\n\nI found a great match for you:\n\n🌟 Balanced Alpha Pack\n• NewsScout 📰\n• MarketMind 📊\n• WhaleWatcher 🐋\n• RiskGuardian 🛡️\n\n$5/month\n\nActivate?" },
  { from: "user", text: "Yes" },
  { from: "agent", text: "✅ Activated! Your agents are now working...\n\n🐋 WhaleWatcher: Large accumulation detected on ETH\n📰 NewsScout: Positive protocol news\n📊 MarketMind: Bullish trend confirmed\n\n🔮 Signal: POTENTIAL_UPSIDE\nConfidence: 78%\n\nApprove $20 trade on ETH?" },
];

const INTEGRATIONS = [
  { name: "WhatsApp", desc: "Primary interface", color: "#25d366" },
  { name: "Privy", desc: "Embedded wallets", color: "#7c3aed" },
  { name: "The Graph", desc: "Onchain data", color: "#6f4ef2" },
  { name: "Hedera", desc: "Agent payments", color: "#00c2cb" },
  { name: "Arc/USDC", desc: "Stablecoin layer", color: "#2563eb" },
  { name: "ENS", desc: "Agent identity", color: "#4c51bf" },
  { name: "Uniswap", desc: "DEX execution", color: "#ff007a" },
  { name: "Chainlink", desc: "Confidential risk", color: "#375bd2" },
  { name: "Ledger", desc: "Secure signing", color: "#f97316" },
];

// ── Components ────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong py-3 shadow-lg" : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Cpu size={16} className="text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">AgentFi</span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {["Marketplace", "Portfolio", "Developer", "Docs"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="btn-ghost text-sm"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/marketplace" className="btn-secondary text-sm hidden sm:flex">
            Browse Agents
          </Link>
          <Link href="/app" className="btn-primary text-sm">
            Launch App <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
          style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8" }}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          ETHOnline 2026 Hackathon Project
          <ChevronRight size={14} />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight"
        >
          Your AI Agent Economy,
          <br />
          <span className="gradient-text">Directly in WhatsApp</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Discover AI agents that research markets, track whales, and execute trades.
          No MetaMask. No seed phrases. No complexity.
          <br />
          <strong className="text-indigo-400">Just WhatsApp.</strong>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/marketplace" className="btn-primary text-base px-7 py-3.5 animate-pulse-glow">
            <Bot size={18} />
            Explore Agent Marketplace
          </Link>
          <Link href="#demo" className="btn-secondary text-base px-7 py-3.5">
            <MessageCircle size={18} />
            See Live Demo
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="card text-center">
              <stat.icon size={20} className="mx-auto mb-2" style={{ color: stat.color }} />
              <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function WhatsAppDemo() {
  const [visibleMessages, setVisibleMessages] = useState(0);

  useEffect(() => {
    if (visibleMessages < WHATSAPP_DEMO.length) {
      const timer = setTimeout(() => setVisibleMessages(v => v + 1), 1200);
      return () => clearTimeout(timer);
    }
  }, [visibleMessages]);

  return (
    <section id="demo" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <div className="badge-brand inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6">
              <MessageCircle size={12} />
              WhatsApp Interface
            </div>
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Web3 should be{" "}
              <span className="gradient-text">infrastructure</span>,
              <br />not user experience.
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
              Users shouldn't need to understand seed phrases, gas fees, or wallet addresses.
              They should just say what they want, in plain English, on WhatsApp.
            </p>
            <ul className="space-y-4">
              {[
                { icon: Wallet, text: "Embedded wallet created automatically — no MetaMask" },
                { icon: Bot, text: "AI agents work in the background on your behalf" },
                { icon: Shield, text: "Your risk limits are always enforced by RiskGuardian" },
                { icon: TrendingUp, text: "Trades executed on testnet until you're ready" },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
                    <item.icon size={14} style={{ color: "#818cf8" }} />
                  </div>
                  <span style={{ color: "var(--text-secondary)" }}>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Mock WhatsApp chat */}
          <div>
            <div
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ border: "1px solid var(--border-default)", maxWidth: 380, margin: "0 auto" }}
            >
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4"
                style={{ background: "#128C7E" }}>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Cpu size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">AgentFi</div>
                  <div className="text-white/70 text-xs">AI Agent Economy</div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-white/70 text-xs">online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="p-4 space-y-3 min-h-80" style={{ background: "#e5ddd5" }}>
                <AnimatePresence>
                  {WHATSAPP_DEMO.slice(0, visibleMessages).map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className="max-w-xs px-4 py-2.5 rounded-2xl text-sm shadow-sm whitespace-pre-wrap"
                        style={{
                          background: msg.from === "user" ? "#dcf8c6" : "white",
                          color: "#1a1a1a",
                          borderTopRightRadius: msg.from === "user" ? 4 : undefined,
                          borderTopLeftRadius: msg.from === "agent" ? 4 : undefined,
                        }}
                      >
                        {msg.text}
                        <div className="text-right text-xs mt-1" style={{ color: "#666" }}>
                          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {msg.from === "user" && " ✓✓"}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {visibleMessages < WHATSAPP_DEMO.length && (
                  <motion.div className="flex justify-start" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }}>
                    <div className="px-4 py-2 rounded-2xl bg-white shadow-sm">
                      <div className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {visibleMessages >= WHATSAPP_DEMO.length && (
                  <button
                    onClick={() => setVisibleMessages(0)}
                    className="w-full text-center text-xs py-2 rounded-xl"
                    style={{ background: "rgba(0,0,0,0.05)", color: "#666" }}
                  >
                    ↺ Replay demo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AgentMarketplace() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--bg-elevated)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="badge-brand inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5">
            <Globe size={12} />
            Agent Marketplace
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Discover & Subscribe to <span className="gradient-text">AI Agents</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Every agent has a verified ENS identity, reputation score, and transparent performance history.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEMO_AGENTS.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link href={`/marketplace/${agent.name.toLowerCase()}`}>
                <div className="agent-card group">
                  {agent.trending && (
                    <div className="absolute top-4 right-4">
                      <span className="badge-positive text-xs px-2 py-0.5 rounded-full">🔥 Trending</span>
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "rgba(99,102,241,0.1)", border: "1px solid var(--border-default)" }}>
                      {agent.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">{agent.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge-brand text-xs px-2 py-0.5 rounded-md">{agent.category}</span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {agent.name.toLowerCase()}.agentfi.eth
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Rating</div>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400" fill="#facc15" />
                        <span className="text-sm font-semibold">{agent.rating}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Users</div>
                      <div className="flex items-center gap-1">
                        <Users size={12} style={{ color: "var(--text-secondary)" }} />
                        <span className="text-sm font-semibold">{(agent.users / 1000).toFixed(1)}K</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Risk</div>
                      <div className="text-sm font-medium">
                        <span className={
                          agent.risk === "Low" ? "text-green-400" :
                          agent.risk === "High" ? "text-red-400" :
                          agent.risk === "N/A" ? "text-indigo-400" : "text-yellow-400"
                        }>{agent.risk}</span>
                      </div>
                    </div>
                  </div>

                  {agent.perf !== "Always on" && (
                    <div className="flex items-center gap-3 mb-4 p-3 rounded-xl"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                      <div>
                        <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>30d Performance</div>
                        <div className="text-sm font-bold text-green-400">{agent.perf}</div>
                      </div>
                      <div className="ml-auto">
                        <div className="text-xs mb-0.5 text-right" style={{ color: "var(--text-muted)" }}>Max Drawdown</div>
                        <div className="text-sm font-bold text-red-400">{agent.drawdown}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2"
                    style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <div>
                      {agent.price === 0 ? (
                        <span className="text-green-400 font-bold text-sm">Free</span>
                      ) : (
                        <span className="font-bold">${agent.price}<span className="text-xs font-normal ml-0.5" style={{ color: "var(--text-muted)" }}>/mo</span></span>
                      )}
                    </div>
                    <button className="btn-primary text-xs py-1.5 px-4 group-hover:shadow-lg transition-shadow">
                      Subscribe
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/marketplace" className="btn-secondary text-sm">
            View All 24 Agents <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function TechStack() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">
            Built on the <span className="gradient-text">Best of Web3</span>
          </h2>
          <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
            Every sponsor integration is meaningful, visible in the architecture, and demonstrated in the live system.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATIONS.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="card card-hover flex items-center gap-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0"
                style={{ background: `${tech.color}22`, border: `1px solid ${tech.color}44` }}
              >
                <div className="w-full h-full flex items-center justify-center rounded-xl">
                  <span className="font-bold text-xs" style={{ color: tech.color }}>
                    {tech.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <div className="font-semibold text-sm">{tech.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{tech.desc}</div>
              </div>
              <div className="ml-auto">
                <div className="w-2 h-2 rounded-full" style={{ background: tech.color }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section className="py-24 px-6" style={{ background: "var(--bg-elevated)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="badge-brand inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6">
              <Lock size={12} />
              Security-First Design
            </div>
            <h2 className="text-4xl font-bold mb-6">
              The LLM is <span className="text-red-400">never trusted</span>.
              <br />
              Your funds are <span className="gradient-text">always protected</span>.
            </h2>
            <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
              Every financial action passes through a 14-step policy engine before execution.
              Agents can never withdraw funds, modify their own permissions, or bypass RiskGuardian.
            </p>

            <div className="space-y-3">
              {[
                { text: "Read blockchain data", allowed: true },
                { text: "Analyze your portfolio", allowed: true },
                { text: "Trade up to your set limit", allowed: true },
                { text: "Withdraw funds", allowed: false },
                { text: "Change permissions", allowed: false },
                { text: "Transfer wallet ownership", allowed: false },
              ].map((perm) => (
                <div key={perm.text} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    perm.allowed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {perm.allowed ? "✓" : "✗"}
                  </div>
                  <span className="text-sm" style={{ color: perm.allowed ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {perm.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="card gradient-border">
              <div className="flex items-center gap-3 mb-3">
                <Zap size={16} style={{ color: "#818cf8" }} />
                <span className="font-semibold text-sm">14-Step Transaction Policy Engine</span>
              </div>
              <div className="space-y-2">
                {[
                  "User authenticated?",
                  "Agent permission valid?",
                  "Amount below limit?",
                  "Daily limit available?",
                  "RiskGuardian approved?",
                  "Slippage acceptable?",
                  "Human approval required?",
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold"
                      style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}>
                      {i + 1}
                    </span>
                    {step}
                    <span className="ml-auto text-green-400">✓</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="text-xs font-mono mb-2" style={{ color: "var(--text-muted)" }}>// AI Safety Architecture</div>
              <div className="font-mono text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
                <div><span style={{ color: "#818cf8" }}>LLM output</span> → Structured validation</div>
                <div className="pl-4">→ Business rules</div>
                <div className="pl-4">→ Risk engine</div>
                <div className="pl-4">→ Permission engine</div>
                <div className="pl-4">→ Transaction simulation</div>
                <div className="pl-4">→ <span className="text-green-400">Execution</span></div>
                <div className="mt-2 text-red-400">// Never: LLM → Private key → Blockchain</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-16 px-6" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Cpu size={16} className="text-white" />
            </div>
            <span className="font-bold gradient-text">AgentFi</span>
          </div>
          <div className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
            ⚠️ Paper trading only. AI predictions are uncertain. Past performance doesn't guarantee future results.
            This is an ETHOnline 2026 hackathon project.
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            © 2026 AgentFi
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <WhatsAppDemo />
      <AgentMarketplace />
      <TechStack />
      <SecuritySection />
      <Footer />
    </main>
  );
}
