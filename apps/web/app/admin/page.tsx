"use client";

import Link from "next/link";
import {
  Shield, ArrowLeft, Server, Activity, Users, DollarSign,
  AlertTriangle, CheckCircle, Database, Cpu
} from "lucide-react";
import AppHeader from "@/app/components/AppHeader";
import UniversalFooter from "@/app/components/Footer";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1E1611] flex flex-col justify-between">
      <AppHeader
        backHref="/"
        backLabel="Home"
        badge={
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1E1611] px-2.5 py-1 bg-[#EFEBE1] border-2 border-[#1E1611]">
            <span className="w-2 h-2 rounded-full bg-[#4A6B53]" />
            All Systems Nominal
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-10 w-full space-y-8">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-[#EFEBE1] border-2 border-[#1E1611] text-[11px] font-bold uppercase tracking-wider mb-2">
            Operations & Health
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#1E1611]">
            System Admin Overview
          </h1>
          <p className="mt-1 text-sm text-[#4D382C]">
            Live infrastructure telemetry, active smart accounts, database models, and enclave status.
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4D382C] block">Registered Wallets</span>
            <div className="mt-2 text-3xl font-black text-[#1E1611]">4,892</div>
            <span className="text-[11px] font-medium text-[#4A6B53] mt-1 block">100% Privy Embedded</span>
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4D382C] block">Published Agents</span>
            <div className="mt-2 text-3xl font-black text-[#7A543A]">24</div>
            <span className="text-[11px] font-medium text-[#7C6555] mt-1 block">Bound to *.agentfi.eth</span>
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4D382C] block">Testnet Volume</span>
            <div className="mt-2 text-3xl font-black text-[#4A6B53]">$84,200</div>
            <span className="text-[11px] font-medium text-[#7C6555] mt-1 block">Uniswap v3 + Hedera x402</span>
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[3px_3px_0px_#1E1611]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4D382C] block">Risk Pass Rate</span>
            <div className="mt-2 text-3xl font-black text-[#1E1611]">98.2%</div>
            <span className="text-[11px] font-medium text-[#4A6B53] mt-1 block">Fail-closed policy active</span>
          </div>
        </div>

        {/* System Services Status */}
        <div className="p-6 bg-[#FFFFFF] border-2 border-[#1E1611] shadow-[4px_4px_0px_#1E1611]">
          <div className="flex items-center gap-2 pb-3 border-b-2 border-[#1E1611] mb-5">
            <Server className="w-5 h-5 text-[#7A543A]" />
            <h2 className="text-base font-black text-[#1E1611]">Infrastructure Services</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#F7F4EE] border-2 border-[#1E1611]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#1E1611]">FastAPI Backend</span>
                <CheckCircle className="w-4 h-4 text-[#4A6B53]" />
              </div>
              <span className="text-[11px] text-[#4D382C] block">Port 8000 • 37 Routes</span>
            </div>

            <div className="p-4 bg-[#F7F4EE] border-2 border-[#1E1611]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#1E1611]">PostgreSQL DB</span>
                <CheckCircle className="w-4 h-4 text-[#4A6B53]" />
              </div>
              <span className="text-[11px] text-[#4D382C] block">23 Relational Tables</span>
            </div>

            <div className="p-4 bg-[#F7F4EE] border-2 border-[#1E1611]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#1E1611]">WhatsApp Gateway</span>
                <CheckCircle className="w-4 h-4 text-[#4A6B53]" />
              </div>
              <span className="text-[11px] text-[#4D382C] block">Twilio & Meta Webhooks</span>
            </div>

            <div className="p-4 bg-[#F7F4EE] border-2 border-[#1E1611]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-[#1E1611]">Chainlink CRE TEE</span>
                <CheckCircle className="w-4 h-4 text-[#4A6B53]" />
              </div>
              <span className="text-[11px] text-[#4D382C] block">Confidential Enclaves</span>
            </div>
          </div>
        </div>
      </main>

      <UniversalFooter />
    </div>
  );
}
