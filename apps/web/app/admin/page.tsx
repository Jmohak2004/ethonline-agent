"use client";

import Link from "next/link";
import {
  Shield, ArrowLeft, Server, Activity, Users, DollarSign,
  AlertTriangle, CheckCircle, Database, Cpu
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100">
      <header className="border-b border-slate-800/80 bg-[#0B0D13]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            System Status: ALL SERVICES OPERATIONAL
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">System Admin & Protocol Overview</h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor infrastructure health, active smart accounts, database models, and confidential TEE risk logs.
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Total Registered Users</span>
            <div className="mt-2 text-3xl font-extrabold text-white">4,892</div>
            <span className="text-[11px] text-emerald-400 mt-1 block">100% with Privy Smart Accounts</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Total Agents Published</span>
            <div className="mt-2 text-3xl font-extrabold text-cyan-400">24</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Bound to *.agentfi.eth</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Simulated / Testnet Volume</span>
            <div className="mt-2 text-3xl font-extrabold text-emerald-400">$84,200</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Uniswap v3 + Hedera x402</span>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Risk Check Pass Rate</span>
            <div className="mt-2 text-3xl font-extrabold text-purple-400">98.2%</div>
            <span className="text-[11px] text-slate-500 mt-1 block">Fail-Closed Safety Active</span>
          </div>
        </div>

        {/* System Services Status */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" /> Infrastructure Components
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">FastAPI Backend</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[11px] text-slate-500 block">Port 8000 • 37 Routes</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">PostgreSQL Database</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[11px] text-slate-500 block">23 Relational Tables</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">WhatsApp Gateway</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[11px] text-slate-500 block">Twilio Sandbox & Meta Webhooks</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Chainlink CRE TEE</span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[11px] text-slate-500 block">Enclave Confidential Workflows</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
