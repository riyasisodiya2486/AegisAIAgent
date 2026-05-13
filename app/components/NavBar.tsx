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

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [menuOpen]);

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Brand Identity */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 md:gap-4 group">
              <div className="relative shrink-0">
                <div className="w-8 h-8 md:w-10 md:h-10 relative z-10 transition-transform duration-500 transform group-hover:scale-110">
                  <img src="/aegis_logo.png" alt="Aegis Logo" className="w-full h-full object-contain" />
                </div>
                <div className="absolute -inset-2 bg-[#0047AB]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-base md:text-lg font-black tracking-tighter text-white leading-tight">
                  AEGIS
                </span>
                <span className="text-[6px] md:text-[7px] font-black tracking-[0.3em] text-[#0047AB] uppercase opacity-60">
                  Terminal_v1.0
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div 
            className="hidden md:flex items-center gap-1 bg-white/[0.02] border border-white/5 p-1 rounded-xl relative"
            onMouseLeave={() => setHoveredPath(null)}
          >
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onMouseEnter={() => setHoveredPath(href)}
                  className={`relative px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-300 z-10 ${
                    isActive ? "text-white" : "text-white/40 hover:text-white/80"
                  }`}
                >
                  <span className="relative z-10">{label}</span>
                  {hoveredPath === href && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/[0.05] rounded-lg z-0"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#0047AB] shadow-[0_0_8px_#0047AB]"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions & Mobile Toggle */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden lg:flex flex-col items-end gap-0.5 border-r border-white/5 pr-4">
              <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Sys_Status</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#0047AB] animate-pulse" />
                <span className="text-[8px] font-mono text-[#0047AB] uppercase">Node_Active</span>
              </div>
            </div>
            
            <div className="scale-90 sm:scale-100 origin-right">
              <WalletButton />
            </div>

            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop for focus */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 top-[65px] bg-black/60 backdrop-blur-sm z-[-1] md:hidden"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute w-full bg-[#0A0D14] border-b border-white/5 shadow-2xl overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98] ${
                        isActive 
                          ? "bg-[#0047AB]/10 border-[#0047AB]/30 text-white" 
                          : "bg-white/[0.02] border-white/5 text-white/40"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${isActive ? "bg-[#0047AB]/20 text-[#0047AB]" : "bg-white/5 text-white/20"}`}>
                          <Icon size={18} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.15em]">{label}</span>
                      </div>
                      <ChevronRight size={16} className={isActive ? "text-[#0047AB]" : "opacity-10"} />
                    </Link>
                  );
                })}
                
                {/* Mobile-only status indicator */}
                <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                   <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Protocol Sync</span>
                   <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0047AB] animate-pulse" />
                      <span className="text-[10px] font-mono text-[#0047AB]">Active</span>
                   </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
