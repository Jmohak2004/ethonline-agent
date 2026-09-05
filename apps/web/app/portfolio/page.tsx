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
    <div className="min-h-screen bg-[#F7F4EE] text-[#1E1611] flex flex-col justify-between">
      <AppHeader
        backHref="/"
        backLabel="Home"
        badge={
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1E1611] px-2.5 py-1 bg-[#EFEBE1] border-2 border-[#1E1611]">
            Privy Account: 0x82A...41b0
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-10 w-full space-y-8">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-[#EFEBE1] border-2 border-[#1E1611] text-[11px] font-bold uppercase tracking-wider mb-2">
            Asset Oversight
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1E1611]">
            Portfolio & Limits
          </h1>
          <p className="mt-1 text-sm text-[#4D382C]">
            Live onchain balances, autonomous risk limits, and multi-agent attribution.
          </p>
        </div>

        {/* Top Balance Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4D382C] block">Total Balance</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1E1611]">$108.40</span>
              <span className="text-xs font-black text-[#4A6B53] flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +8.4%
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#7C6555] mt-1 block">Starting: $100.00 USDC</span>
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4D382C] block">7-Day Realized P&L</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#4A6B53]">+$8.40</span>
              <span className="text-xs font-mono font-bold text-[#4D382C]">USDC</span>
            </div>
            <span className="text-[11px] font-medium text-[#7C6555] mt-1 block">4 executed swaps</span>
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4D382C] block">Max Drawdown</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#9E3A3A]">-1.8%</span>
            </div>
            <span className="text-[11px] font-medium text-[#4A6B53] mt-1 block">Within 5.0% cap</span>
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4D382C] block">Autonomous Risk Cap</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#7A543A]">$20.00</span>
              <span className="text-xs font-bold text-[#4D382C]">/ trade</span>
            </div>
            <span className="text-[11px] font-medium text-[#7C6555] mt-1 block">Daily Loss Cap: $10.00</span>
          </div>
        </div>

        {/* Positions & Allocations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Asset Holdings */}
          <div className="lg:col-span-2 p-6 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611]">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#1E1611] mb-5">
              <h2 className="text-base font-black text-[#1E1611]">Current Holdings</h2>
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 bg-[#EFEBE1] border border-[#1E1611] text-[#1E1611]">
                Base / Sepolia
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-[#F7F4EE] border-2 border-[#1E1611] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EFEBE1] border-2 border-[#1E1611] flex items-center justify-center font-black text-[#1E1611] text-sm">
                    $
                  </div>
                  <div>
                    <span className="text-sm font-black text-[#1E1611] block">USDC</span>
                    <span className="text-xs text-[#4D382C]">68.40 USDC</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#1E1611] block">$68.40</span>
                  <span className="text-xs font-bold text-[#7C6555]">63.1%</span>
                </div>
              </div>

              <div className="p-4 bg-[#F7F4EE] border-2 border-[#1E1611] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#EFEBE1] border-2 border-[#1E1611] flex items-center justify-center font-black text-[#1E1611] text-sm">
                    Ξ
                  </div>
                  <div>
                    <span className="text-sm font-black text-[#1E1611] block">Ethereum (ETH)</span>
                    <span className="text-xs text-[#4D382C]">0.01509 ETH</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#4A6B53] block">$40.00 (+8.4%)</span>
                  <span className="text-xs font-bold text-[#7C6555]">36.9%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Attribution */}
          <div className="p-6 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611]">
            <div className="flex items-center gap-2 pb-4 border-b-2 border-[#1E1611] mb-5">
              <Bot className="w-4 h-4 text-[#7A543A]" />
              <h2 className="text-base font-black text-[#1E1611]">Agent Attribution</h2>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#EFEBE1] border-2 border-[#1E1611]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-black text-[#1E1611]">WhaleWatcher Pro</span>
                  <span className="text-[#4A6B53] font-black">+$5.60</span>
                </div>
                <span className="text-[11px] text-[#4D382C] block">Onchain whale accumulation signal</span>
              </div>

              <div className="p-3 bg-[#EFEBE1] border-2 border-[#1E1611]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-black text-[#1E1611]">MarketMind</span>
                  <span className="text-[#4A6B53] font-black">+$2.80</span>
                </div>
                <span className="text-[11px] text-[#4D382C] block">Momentum breakout filter</span>
              </div>

              <div className="p-3 bg-[#EFEBE1] border-2 border-[#1E1611]">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-black text-[#1E1611]">RiskGuardian</span>
                  <span className="text-[#7A543A] font-black">0 Losses</span>
                </div>
                <span className="text-[11px] text-[#4D382C] block">Blocked 2 high-slippage trades</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <UniversalFooter />
    </div>
  );
}
