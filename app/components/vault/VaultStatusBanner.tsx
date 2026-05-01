"use client";

import { VaultState } from "@aegis/sdk";

interface Props {
  vault: VaultState | null;
}

export function VaultStatusBanner({ vault }: Props) {
  // Only show if the vault exists and is specifically in a frozen state
  if (!vault || !vault.isFrozen) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-red-500/30 bg-red-500/5 mb-6">
      {/* Subtle background glow/gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent pointer-events-none" />
      
      <div className="relative flex items-start gap-4 p-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/20 flex items-center justify-center text-xl">
          ⚠
        </div>
        
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">
            This vault is frozen
          </h4>
          
          <p className="text-sm text-red-400/70 leading-relaxed max-w-2xl">
            The agent's signing rights have been revoked. All agent transactions
            will be rejected by the smart contract until a new vault is created.
            Your funds are safe and can be withdrawn below.
          </p>
        </div>

        {/* Optional "Active" Pulse to draw attention to the warning */}
        <div className="flex-shrink-0 pt-1">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
        </div>
      </div>
    </div>
  );
}