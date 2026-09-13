"use client";

import Link from "next/link";
import { Cpu, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t-2 border-[#1E1611] bg-[#EFEBE1] py-10 px-4 sm:px-6 text-xs text-[#5E5045]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand */}
        <div className="space-y-2.5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#1E1611] flex items-center justify-center border-2 border-[#1E1611] shadow-[2px_2px_0px_#7A543A]">
              <Cpu size={14} className="text-[#F7F4EE]" />
            </div>
            <span className="font-extrabold text-base text-[#1E1611] tracking-tight">Gotrade</span>
          </Link>
          <p className="text-[#5E5045] leading-relaxed">
            AI agent economy in WhatsApp. Verified onchain intelligence, automated risk caps, and USDC settlement.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="badge-neutral">
              ETHOnline 2026
            </span>
            <span className="badge-brand">
              ERC-8004
            </span>
          </div>
        </div>

        {/* Marketplace */}
        <div>
          <h4 className="font-bold text-sm text-[#1E1611] mb-2.5 uppercase tracking-wide text-[11px]">
            Marketplace
          </h4>
          <ul className="space-y-1.5 font-medium">
            <li>
              <Link href="/marketplace" className="hover:text-[#1E1611] hover:underline transition">
                Browse Agents
              </Link>
            </li>
            <li>
              <Link href="/packs" className="hover:text-[#1E1611] hover:underline transition">
                Pre-Built Packs
              </Link>
            </li>
            <li>
              <Link href="/portfolio" className="hover:text-[#1E1611] hover:underline transition">
                Portfolio Tracker
              </Link>
            </li>
            <li>
              <Link href="/activity" className="hover:text-[#1E1611] hover:underline transition">
                Activity Stream
              </Link>
            </li>
          </ul>
        </div>

        {/* Developers */}
        <div>
          <h4 className="font-bold text-sm text-[#1E1611] mb-2.5 uppercase tracking-wide text-[11px]">
            Developers
          </h4>
          <ul className="space-y-1.5 font-medium">
            <li>
              <Link href="/demo" className="hover:text-[#1E1611] hover:underline transition">
                Interactive Demo
              </Link>
            </li>
            <li>
              <Link href="/developer" className="hover:text-[#1E1611] hover:underline transition">
                Developer Studio
              </Link>
            </li>
            <li>
              <Link href="/docs" className="hover:text-[#1E1611] hover:underline transition">
                Documentation
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-[#1E1611] hover:underline transition">
                System Admin
              </Link>
            </li>
          </ul>
        </div>

        {/* Security */}
        <div>
          <h4 className="font-bold text-sm text-[#1E1611] mb-2.5 uppercase tracking-wide text-[11px]">
            Guardrails
          </h4>
          <div className="space-y-1.5 text-[#5E5045] font-medium">
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-[#245233]" />
              <span>Fail-Closed RiskGuardian</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-[#7A543A]" />
              <span>Chainlink CRE TEE Enclave</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-[#873322]" />
              <span>Ledger Hardware Approval</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-[#1E1611]" />
              <span>GasRefuel.sol Sponsorship</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-[#DCD4C4] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#857467]">
        <div>
          Live testnet execution. AI predictions are probabilistic. All trades bound to limits.
        </div>
        <div>
          © 2026 Gotrade. Built for ETHOnline 2026.
        </div>
      </div>
    </footer>
  );
}
