"use client";

import { VaultState } from "@aegis/sdk";
import { ShieldAlert, Info } from "lucide-react";

interface Props {
  vault: VaultState | null;
}

export function VaultStatusBanner({ vault }: Props) {
  // Only show if the vault exists and is specifically in a frozen state
  if (!vault || !vault.isFrozen) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] border border-red-500/30 bg-[#050505] mb-6 md:mb-8 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
      {/* High-intensity terminal scanline gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      
      <div className="relative flex flex-col sm:flex-row items-start gap-4 md:gap-6 p-5 md:p-6">
        {/* Status Icon with Glow */}
        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <ShieldAlert size={20} className="md:w-5 md:h-5" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h4 className="text-[9px] md:text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">
              Vault_Status: SEQUESTERED
            </h4>
            <div className="h-px flex-1 bg-red-500/10" />
          </div>
          
          <p className="text-[11px] md:text-[12px] font-medium text-red-200/40 leading-relaxed max-w-3xl uppercase tracking-tight">
            Cryptographic signing authority has been severed. Automated agent execution is 
            permanently disabled for this terminal. Asset liquidity remains secured 
            within the vault kernel and is accessible for manual withdrawal protocols.
          </p>
        </div>

        {/* Diagnostic Status Pulse - Hidden on very small screens to save space */}
        <div className="hidden sm:flex flex-col items-center gap-2 shrink-0 pt-1">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
          <span className="text-[8px] font-black text-red-500/40 tracking-tighter uppercase">Lockout</span>
        </div>
      </div>

      {/* Footer System Info */}
      <div className="bg-red-500/[0.03] border-t border-red-500/10 px-5 md:px-6 py-2 md:py-2.5 flex items-center gap-2">
        <Info size={10} className="text-red-500/30 shrink-0" />
        <span className="text-[8px] md:text-[9px] font-mono font-bold text-red-500/30 uppercase tracking-widest truncate">
          Error_Code: SIG_REVOKED_BY_AUTHORITY
        </span>
      </div>
    </div>
  );
}