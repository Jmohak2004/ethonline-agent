"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cpu, Menu, X, Bot, Boxes, Wallet, Activity, Zap, Code, BookOpen, Shield, ArrowLeft
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
    <header className="border-b-2 border-[#1E1611] bg-[#F7F4EE]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Back Button */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-[#1E1611] flex items-center justify-center border-2 border-[#1E1611] shadow-[2px_2px_0px_#7A543A] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition">
              <Cpu size={15} className="text-[#F7F4EE]" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#1E1611]">GoTrade</span>
          </Link>

          {backHref && (
            <Link
              href={backHref}
              className="hidden lg:flex items-center gap-1 text-xs font-semibold text-[#5E5045] hover:text-[#1E1611] transition pl-3 border-l-2 border-[#DCD4C4]"
            >
              <ArrowLeft size={13} />
              <span>{backLabel || "Back"}</span>
            </Link>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#1E1611] text-[#F7F4EE] border-2 border-[#1E1611] shadow-[2px_2px_0px_#7A543A]"
                    : "text-[#5E5045] hover:text-[#1E1611] hover:bg-[#EFEBE1] border-2 border-transparent"
                }`}
              >
                <Icon size={13} className={isActive ? "text-[#EFEBE1]" : "text-[#7A543A]"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Badge or Mobile Toggle */}
        <div className="flex items-center gap-2.5">
          {badge && (
            <div className="hidden sm:block">
              {badge}
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#1E1611] bg-[#EFEBE1] border-2 border-[#1E1611] shadow-[2px_2px_0px_#1E1611]"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-[#1E1611] bg-[#F7F4EE] px-4 py-3 space-y-1.5 shadow-[0_10px_0px_#1E1611]">
          {badge && (
            <div className="pb-2 mb-2 border-b border-[#DCD4C4] sm:hidden">
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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#1E1611] text-[#F7F4EE] border-2 border-[#1E1611]"
                    : "text-[#5E5045] hover:bg-[#EFEBE1]"
                }`}
              >
                <Icon size={15} className={isActive ? "text-[#EFEBE1]" : "text-[#7A543A]"} />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-[#DCD4C4]">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#5E5045] hover:text-[#1E1611]"
            >
              <Shield size={14} className="text-[#7A543A]" />
              System Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
