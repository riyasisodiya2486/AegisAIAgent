"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Activity, LayoutGrid, PlusCircle, Shield, ChevronRight } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutGrid },
  { href: "/create-vault", label: "Create Vault", icon: PlusCircle },
  { href: "/activity",     label: "Activity",     icon: Activity   },
  { href: "/about",        label: "About Aegis",  icon: Shield     },
];

export function NavBar() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-blue-500/10 bg-transparent backdrop-blur-3xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className="w-12 h-12 relative z-10 transition-transform duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                  <img src="/aegis_logo.png" alt="Aegis Logo" className="w-full h-full object-contain" />
                </div>
                <div className="absolute -inset-2 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-white">
                  AEGIS
                </span>
                <span className="text-[7px] font-black tracking-[0.4em] text-blue-500/40 uppercase">
                  Terminal_v1.0
                </span>
              </div>
            </Link>
          </div>

          {/* Precision Navigation (Desktop) */}
          <div 
            className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-2xl relative"
            onMouseLeave={() => setHoveredPath(null)}
          >
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onMouseEnter={() => setHoveredPath(href)}
                  className={`relative px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-300 z-10 ${
                    isActive ? "text-blue-400" : "text-white/30 hover:text-white/80"
                  }`}
                >
                  <span className="relative z-10">{label}</span>
                  
                  {/* Hover Pill */}
                  {hoveredPath === href && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-blue-500/[0.07] border border-blue-500/10 rounded-xl z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}

                  {/* Active Visualizer */}
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[1px] bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Status & Wallet */}
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end gap-0.5 border-r border-white/5 pr-6">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Sys_Status</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-mono text-blue-400/80 uppercase">Node_Active</span>
              </div>
            </div>
            
            <WalletButton />

            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="md:hidden p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10 text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Terminal Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-blue-500/10 bg-[#050505] overflow-hidden"
          >
            <div className="p-6 space-y-2">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href; // Correctly defined here
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isActive 
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400" 
                        : "bg-white/[0.02] border-white/5 text-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon size={16} strokeWidth={isActive ? 2.5 : 1.5} />
                      <span className="text-xs font-bold uppercase tracking-[0.2em]">{label}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-20" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}