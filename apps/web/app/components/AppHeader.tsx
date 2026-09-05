"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cpu, Menu, X, Bot, Boxes, Wallet, Activity, Zap, Code, BookOpen, Shield
} from "lucide-react";

interface AppHeaderProps {
  badge?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

const NAV_ITEMS = [
  { label: "Marketplace", href: "/marketplace", icon: Bot },
  { label: "Packs", href: "/packs", icon: Boxes },
  { label: "Portfolio", href: "/portfolio", icon: Wallet },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Demo", href: "/demo", icon: Zap },
  { label: "Developer", href: "/developer", icon: Code },
  { label: "Docs", href: "/docs", icon: BookOpen },
];

export default function AppHeader({ badge, backHref, backLabel }: AppHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-slate-800/80 bg-[#0B0D13]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
              <Cpu size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">AgentFi</span>
          </Link>

          {backHref && (
            <Link
              href={backHref}
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition pl-3 border-l border-slate-800"
            >
              <span>← {backLabel || "Back"}</span>
            </Link>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  isActive
                    ? "bg-slate-800 text-white font-semibold shadow-inner border border-slate-700/80"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Icon size={13} className={isActive ? "text-indigo-400" : "text-slate-500"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Badge or Mobile Toggle */}
        <div className="flex items-center gap-2">
          {badge && (
            <div className="hidden sm:block">
              {badge}
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0B0D13] px-4 py-3 space-y-1 shadow-2xl">
          {badge && (
            <div className="pb-2 mb-2 border-b border-slate-800 sm:hidden">
              {badge}
            </div>
          )}
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                <Icon size={16} className={isActive ? "text-indigo-400" : "text-slate-400"} />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-slate-800/60">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200"
            >
              <Shield size={14} className="text-slate-500" />
              System Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
