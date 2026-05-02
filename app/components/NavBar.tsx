"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react"; // Using Lucide for cleaner icons

const NAV_LINKS = [
  { href: "/dashboard",    label: "Dashboard"    },
  { href: "/create-vault", label: "Create Vault" },
  { href: "/activity",     label: "Activity"     },
];

export function NavBar() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  if (!mounted) return null; // Prevents layout shift during hydration

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white group-hover:bg-indigo-500 transition-colors">
                A
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Aegis
              </span>
            </Link>
            <span className="hidden sm:block px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 tracking-wider">
              LOCALNET
            </span>
          </div>

          {/* Desktop Navigation */}
          {connected && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-white/10 text-white" 
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Action Area */}
          <div className="flex items-center gap-3">
            <WalletButton />

            {/* Mobile Toggle */}
            {connected && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-xl bg-white/5 text-white/70 hover:bg-white/10 transition-all"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && connected && (
        <div className="md:hidden border-t border-white/5 bg-black/95 animate-in slide-in-from-top duration-200">
          <div className="px-4 py-4 space-y-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`block px-4 py-3 rounded-xl text-base font-medium ${
                  pathname === href 
                    ? "bg-indigo-600 text-white" 
                    : "text-white/60 hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}