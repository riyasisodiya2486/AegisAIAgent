"use client";

import Link from "next/link";
import { VaultState } from "@aegis/sdk";
import { ShieldCheck, ShieldAlert, ChevronRight } from "lucide-react";

interface Props {
  vault:   VaultState | null;
  pdaStr:  string;
  loading: boolean;
}

function StatRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-blue-500/5 last:border-0">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100/30">{label}</span>
      <span className={`text-xs font-mono font-bold ${accent ? "text-cyan-400" : "text-blue-100/70"}`}>
        {value}
      </span>
    </div>
  );
}

export function VaultSummaryCard({ vault, pdaStr, loading }: Props) {
  if (loading && !vault) {
    return (
      <div className="rounded-[2rem] border border-blue-500/15 bg-[#050505] p-7 space-y-4 animate-pulse">
        <div className="h-4 w-24 bg-blue-500/10 rounded-full" />
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex justify-between items-center py-2">
            <div className="h-2.5 w-20 bg-blue-500/5 rounded" />
            <div className="h-2.5 w-16 bg-blue-500/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!vault) return null;

  const totalBalance = vault.vaultBalanceSol + vault.stakedAmountSol;

  return (
    <div className="rounded-[2rem] border border-blue-500/15 bg-[#050505] p-7 shadow-2xl relative overflow-hidden group">
      {/* Subtle Background Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/5 blur-[60px] pointer-events-none" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <h3 className="font-black text-xs uppercase tracking-[0.3em] text-blue-400">Vault_Summary</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-colors ${
          vault.isFrozen
            ? "bg-red-500/10 text-red-400 border-red-500/20"
            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
        }`}>
          {vault.isFrozen ? (
            <><ShieldAlert size={10} /> Frozen</>
          ) : (
            <><ShieldCheck size={10} /> Active</>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <StatRow label="Total_Balance"    value={`${totalBalance.toFixed(4)} SOL`}            />
        <StatRow label="Liquid_Assets"    value={`${vault.vaultBalanceSol.toFixed(4)} SOL`}   />
        <StatRow label="Staked_Module"    value={`${vault.stakedAmountSol.toFixed(4)} SOL`} accent />
        <StatRow label="Cycle_Limit"      value={`${vault.dailyLimitSol.toFixed(4)} SOL`}    />
        <StatRow label="Available_Now"    value={`${vault.remainingTodaySol.toFixed(4)} SOL`} />
        <StatRow label="Protocol_Yield"   value={`${vault.yieldEarnedSol.toFixed(6)} SOL`} accent />
      </div>

      <Link
        href={`/vault/${pdaStr}`}
        className="mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl
          border border-blue-500/10 bg-blue-500/5 hover:bg-blue-600 hover:border-blue-400
          text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 hover:text-white transition-all group/link shadow-lg active:scale-[0.98]"
      >
        Manage_Vault 
        <ChevronRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}