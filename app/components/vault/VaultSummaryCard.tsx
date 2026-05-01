"use client";

import Link from "next/link";
import { VaultState } from "@aegis/sdk";

interface Props {
  vault:   VaultState | null;
  pdaStr:  string;
  loading: boolean;
}

function StatRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/4 last:border-0">
      <span className="text-xs text-white/35">{label}</span>
      <span className={`text-xs font-semibold ${accent ? "text-violet-400" : "text-white/70"}`}>
        {value}
      </span>
    </div>
  );
}

export function VaultSummaryCard({ vault, pdaStr, loading }: Props) {
  if (loading && !vault) {
    return (
      <div className="rounded-2xl border border-white/6 bg-white/3 p-6 space-y-3 animate-pulse">
        <div className="h-4 w-24 bg-white/8 rounded" />
        {[1,2,3,4].map(i => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-20 bg-white/5 rounded" />
            <div className="h-3 w-16 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!vault) return null;

  const totalBalance = vault.vaultBalanceSol + vault.stakedAmountSol;

  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Vault Summary</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
          vault.isFrozen
            ? "bg-red-500/15 text-red-400 border-red-500/20"
            : "bg-emerald-500/12 text-emerald-400 border-emerald-500/20"
        }`}>
          {vault.isFrozen ? "Frozen" : "Active"}
        </span>
      </div>

      <div>
        <StatRow label="Total balance"    value={`${totalBalance.toFixed(4)} SOL`}            />
        <StatRow label="Liquid"           value={`${vault.vaultBalanceSol.toFixed(4)} SOL`}   />
        <StatRow label="Staked"           value={`${vault.stakedAmountSol.toFixed(4)} SOL`} accent />
        <StatRow label="Daily limit"      value={`${vault.dailyLimitSol.toFixed(4)} SOL`}    />
        <StatRow label="Remaining today"  value={`${vault.remainingTodaySol.toFixed(4)} SOL`} />
        <StatRow label="Yield earned"     value={`${vault.yieldEarnedSol.toFixed(6)} SOL`} accent />
      </div>

      <Link
        href={`/vault/${pdaStr}`}
        className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl
          border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/14
          text-xs text-white/50 hover:text-white/75 transition-all"
      >
        Manage vault →
      </Link>
    </div>
  );
}