"use client";

import Link from "next/link";
import {
  Wallet, TrendingUp, Shield, ArrowLeft, ArrowUpRight,
  PieChart, DollarSign, Activity, Lock, Bot
} from "lucide-react";
import AppHeader from "@/app/components/AppHeader";
import UniversalFooter from "@/app/components/Footer";

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 flex flex-col justify-between">
      <AppHeader
        backHref="/"
        backLabel="Home"
        badge={
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Privy Embedded Account: 0x82A...41b0
          </div>
        }
      />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Top Balance Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <span className="text-xs text-slate-400 font-medium">Total Portfolio Value</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">$108.40</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +8.4%
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Starting Capital: $100.00 USDC</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <span className="text-xs text-slate-400 font-medium">7-Day Realized P&L</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">+$8.40</span>
              <span className="text-xs text-slate-400 font-mono">USDC</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">4 successful simulated swaps</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <span className="text-xs text-slate-400 font-medium">Max Drawdown</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-rose-400">-1.8%</span>
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 block">✓ Well within 5.0% cap</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <span className="text-xs text-slate-400 font-medium">Active Autonomous Risk Cap</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-cyan-400">$20.00</span>
              <span className="text-xs text-slate-400">/ trade</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Daily Loss Limit: $10.00</span>
          </div>
        </div>

        {/* Positions & Allocations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Asset Holdings */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4 flex items-center justify-between">
              <span>Current Holdings</span>
              <span className="text-xs font-normal text-slate-400">Real-time Paper / Testnet</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400 text-sm">
                    $
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">USDC (Base / Sepolia)</span>
                    <span className="text-xs text-slate-500">68.40 USDC</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white block">$68.40</span>
                  <span className="text-xs text-slate-400">63.1% Allocation</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-400 text-sm">
                    Ξ
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">Ethereum (ETH)</span>
                    <span className="text-xs text-slate-500">0.01509 ETH</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400 block">$40.00 (+8.4%)</span>
                  <span className="text-xs text-slate-400">36.9% Allocation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Attribution */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" /> Agent-Attributed ROI
            </h3>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200">WhaleWatcher Pro</span>
                  <span className="text-emerald-400 font-bold">+$5.60</span>
                </div>
                <span className="text-[11px] text-slate-500 block">Identified whale accumulation on ETH</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200">MarketMind</span>
                  <span className="text-emerald-400 font-bold">+$2.80</span>
                </div>
                <span className="text-[11px] text-slate-500 block">Momentum breakout trigger</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200">RiskGuardian</span>
                  <span className="text-cyan-400 font-bold">0 Losses</span>
                </div>
                <span className="text-[11px] text-slate-500 block">Prevented 2 high-slippage trades</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <UniversalFooter />
    </div>
  );
}
