"use client";

import Link from "next/link";
import { Cpu, Shield, Bot, Terminal, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#06080D] py-12 px-4 sm:px-6 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Col 1: Brand */}
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Cpu size={14} className="text-white" />
            </div>
            <span className="font-bold text-base gradient-text">AgentFi</span>
          </Link>
          <p className="text-slate-400 leading-relaxed">
            Your AI agent economy, directly in WhatsApp. Discovers opportunities, coordinates specialized data agents, and executes onchain with fail-closed safety.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
              ETHOnline 2026
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] border border-indigo-500/20">
              ERC-8004 Standard
            </span>
          </div>
        </div>

        {/* Col 2: Marketplace & Features */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Agent Marketplace</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/marketplace" className="hover:text-white transition">
                Browse All Agents
              </Link>
            </li>
            <li>
              <Link href="/packs" className="hover:text-white transition">
                Pre-Built Agent Packs
              </Link>
            </li>
            <li>
              <Link href="/portfolio" className="hover:text-white transition">
                Portfolio &amp; P&amp;L Tracker
              </Link>
            </li>
            <li>
              <Link href="/activity" className="hover:text-white transition">
                Live Activity &amp; Audit Stream
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Developers & Protocol */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Developers &amp; Protocol</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/demo" className="hover:text-white transition">
                Interactive Demo Playground
              </Link>
            </li>
            <li>
              <Link href="/developer" className="hover:text-white transition">
                Agent Developer Studio
              </Link>
            </li>
            <li>
              <Link href="/docs" className="hover:text-white transition">
                Technical Documentation
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white transition">
                System Admin &amp; Node Status
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Safety & Security */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Security &amp; Invariants</h4>
          <div className="space-y-2 text-slate-500">
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-emerald-400" />
              <span>Fail-Closed RiskGuardian</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-cyan-400" />
              <span>Chainlink CRE TEE Enclave</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-amber-400" />
              <span>Ledger Clear-Signing Challenge</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-indigo-400" />
              <span>GasRefuel.sol Auto-Sponsorship</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
        <div>
          ⚠️ Paper trading &amp; testnet simulation. AI predictions are probabilistic. All trades guarded by hard limits.
        </div>
        <div>
          © 2026 AgentFi Protocol. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
