"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink, Terminal } from "lucide-react";

export function JudgeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isDeployed = !window.location.hostname.includes("localhost");
    const dismissed = sessionStorage.getItem("judge_banner_dismissed");
    if (isDeployed && !dismissed) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="relative w-full z-[100] bg-[#05070A]/80 backdrop-blur-md border-b border-[#0047AB]/30 px-4 py-2.5">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-6">
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg bg-[#0047AB]/10 border border-[#0047AB]/20">
            <Terminal size={14} className="text-[#0047AB]" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0047AB] flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0047AB] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#0047AB]"></span>
              </span>
              Judge Access
            </span>
            
            <p className="text-[11px] font-mono text-white/50 leading-none">
              Connect Phantom (Devnet) · 
              <a href="https://faucet.solana.com" target="_blank" rel="noreferrer" className="text-white hover:text-[#0047AB] transition-colors mx-1 underline decoration-[#0047AB]/50">
                Faucet
              </a> · 
              <a href="https://github.com/riyasisodiya2486/AegisAIAgent" target="_blank" rel="noreferrer" className="text-white hover:text-[#0047AB] transition-colors mx-1 underline decoration-[#0047AB]/50">
                Setup README
              </a>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sessionStorage.setItem("judge_banner_dismissed", "1");
            setShow(false);
          }}
          className="group flex items-center justify-center w-6 h-6 rounded-md hover:bg-white/5 transition-all"
        >
          <X size={14} className="text-white/20 group-hover:text-white transition-colors" />
        </button>
      </div>
      
      {/* Decorative Cobalt line pulse */}
      <div className="absolute bottom-0 left-0 h-[1px] bg-[#0047AB] animate-[shimmer_2s_infinite] w-full shadow-[0_0_10px_#0047AB]" />
    </div>
  );
}