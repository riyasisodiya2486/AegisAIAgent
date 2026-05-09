"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Info, Activity } from "lucide-react";

export function DisclaimerFooter() {
  return (
    <footer className="relative w-full border-t border-white/5 bg-black/60 backdrop-blur-2xl py-12 mt-auto overflow-hidden">
      {/* Subtle Scanline & Grid Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(59,130,246,0.06),rgba(6,182,212,0.02),rgba(59,130,246,0.06))] bg-[size:100%_2px,4px_100%]" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
          
          {/* Identity & Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping opacity-20" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
                Aegis Protocol <span className="text-blue-500/30 px-2">|</span> <span className="text-white/60">v1.0.4-beta</span>
              </span>
            </div>
            <p className="text-[9px] font-mono text-white/10 tracking-[0.1em] uppercase">
              Terminal ID: <span className="text-blue-500/20">NODE_77_ALPHA</span> // DEPLOYED_SOLANA_MAINNET
            </p>
          </div>

          {/* Compliance Tags */}
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {[
              { label: "Non-Custodial", icon: ShieldCheck },
              { label: "Immutable Logic", icon: Info },
              { label: "Active Audit", icon: Activity }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 group cursor-help">
                <item.icon size={13} className="text-white/10 group-hover:text-blue-400 transition-all duration-300 group-hover:scale-110" />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 group-hover:text-white/60 transition-colors">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Block */}
        <div className="pt-10 border-t border-white/5 space-y-5">
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-[9px] font-black uppercase tracking-[0.2em]">
            <span className="text-blue-500/20 hover:text-blue-400/60 transition-colors duration-500 cursor-default"># Not_Financial_Advice</span>
            <span className="text-red-500/20 hover:text-red-500/60 transition-colors duration-500 cursor-default"># Funds_At_Risk</span>
            <span className="text-white/5 hover:text-white/30 transition-colors duration-500 cursor-default"># User_Discretion_Required</span>
          </div>
          
          <motion.div 
            initial={{ opacity: 0.3 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <p className="text-[10px] text-left text-white/20 max-w-4xl leading-relaxed font-mono uppercase tracking-tight">
              Aegis is an autonomous non-custodial smart contract framework. By interacting with 
              the Aegis Protocol, you acknowledge that protocol interaction involves inherent 
              smart contract risks and potential permanent loss of liquidity. Users retain 
              sole responsibility for cryptographic keys and transaction signatures.
            </p>
            {/* Subtle corner accent for the text block */}
            <div className="absolute -left-4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-blue-500/20 via-transparent to-transparent" />
          </motion.div>
        </div>
      </div>

      {/* Decorative Branding Element */}
      <div className="absolute bottom-0 right-0 p-6 opacity-5 pointer-events-none">
        <div className="text-[40px] font-black tracking-tighter text-white select-none">
          AEGIS
        </div>
      </div>
    </footer>
  );
}