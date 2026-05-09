"use client";

import { VaultState } from "@aegis/sdk";
import { TxButton } from "@/components/TxButton";
import { Activity, Zap } from "lucide-react";

interface Props {
  vault:         VaultState | null;
  onStake:       () => Promise<string>;
  onAccrueYield: () => Promise<string>;
  onSuccess:     () => void;
}

export function YieldDisplay({ vault, onStake, onAccrueYield, onSuccess }: Props) {
  const hasStaked   = vault ? vault.stakedAmountSol > 0 : false;
  const canStake    = vault
    ? vault.vaultBalanceSol > vault.dailyLimitSol
    : false;

  // Project daily earnings
  const dailyEarnings = vault && vault.stakedAmountSol > 0
    ? (vault.stakedAmountSol * (vault.yieldRatePercent / 100)) / 365
    : 0;

  return (
    <div className="rounded-[2rem] border border-blue-500/15 bg-[#050505] p-7 shadow-2xl relative overflow-hidden">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <Activity size={14} className="text-blue-500" />
          <h3 className="font-black text-xs uppercase tracking-[0.3em] text-blue-400">Yield_Engine</h3>
        </div>
        <p className="text-[11px] font-medium text-blue-100/30 uppercase tracking-tight leading-relaxed max-w-xs">
          Automated capital optimization. Assets remain liquid via the agent's dynamic unstaking protocol.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          {
            label: "Staked_Assets",
            value: vault ? `${vault.stakedAmountSol.toFixed(4)} SOL` : "—",
            color: hasStaked ? "text-cyan-400" : "text-blue-100/20",
          },
          {
            label: "Accrued_Value",
            value: vault ? `${vault.yieldEarnedSol.toFixed(6)} SOL` : "—",
            color: "text-blue-400",
          },
          {
            label: "Performance_APY",
            value: vault ? `${vault.yieldRatePercent.toFixed(2)}%` : "—",
            color: "text-white",
          },
          {
            label: "Daily_Projection",
            value: dailyEarnings > 0
              ? `~${dailyEarnings.toFixed(6)} SOL`
              : "—",
            color: "text-blue-100/40",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl bg-blue-500/[0.02] border border-blue-500/5 px-4 py-3.5 transition-colors hover:border-blue-500/10"
          >
            <p className="text-[9px] font-black text-blue-500/30 uppercase tracking-widest">{label}</p>
            <p className={`text-sm font-mono font-bold mt-1.5 tracking-tighter ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Fee info */}
      {vault && vault.feeRateBps > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-500/[0.03] border border-blue-500/10 mb-6">
          <span className="text-[9px] font-black text-blue-500/30 uppercase tracking-widest">Protocol_Fee</span>
          <span className="text-[10px] font-mono font-bold text-blue-100/50">{vault.feeRatePercent.toFixed(2)}% Performance</span>
        </div>
      )}

      {/* Stake idle funds CTA */}
      {canStake && !hasStaked && (
        <div className="rounded-[1.5rem] border border-blue-500/20 bg-blue-500/5 p-5 space-y-4 shadow-[0_0_30px_rgba(37,99,235,0.05)]">
          <div className="flex items-start gap-3">
            <Zap size={16} className="text-cyan-400 animate-pulse mt-0.5" />
            <div>
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Excess_Liquidity_Found</p>
              <p className="text-[11px] font-medium text-blue-100/40 mt-1 uppercase tracking-tight">
                {vault ? (vault.vaultBalanceSol - vault.dailyLimitSol).toFixed(4) : "0"} SOL available for optimization.
              </p>
            </div>
          </div>
          <TxButton
            label="Initialize_Staking"
            loadingLabel="Broadcasting..."
            onClick={async () => {
              const sig = await onStake();
              onSuccess();
              return sig;
            }}
            className="w-full !rounded-xl !bg-blue-600 hover:!bg-blue-500 !text-[10px] !font-black !tracking-[0.2em] !uppercase shadow-lg shadow-blue-900/20"
            size="sm"
          />
        </div>
      )}

      {/* Accrue yield button */}
      {hasStaked && (
        <TxButton
          label="Refresh_Yield_State"
          loadingLabel="Synchronizing..."
          onClick={async () => {
            try {
              const sig = await onAccrueYield();
              onSuccess();
              return sig;
            } catch (err: any) {
              const msg = err?.message ?? String(err);
              if (msg.includes("AccountNotInitialized") || msg.includes("3012")) {
                throw new Error("CORE_INIT_REQUIRED: Initialize Protocol kernel first.");
              }
              throw err;
            }
          }}
          variant="outline"
          className="w-full !rounded-xl border-blue-500/20 hover:border-blue-500/40 !bg-transparent !text-[10px] !font-black !tracking-[0.2em] !uppercase !text-blue-400/70 hover:!text-blue-400"
          size="sm"
        />
      )}

      {/* No stake state */}
      {!canStake && !hasStaked && vault && (
        <div className="text-center py-4 border-t border-blue-500/5">
          <p className="text-[9px] font-mono font-bold text-blue-500/20 uppercase tracking-[0.2em]">
            Status: Insufficient_Surplus_For_Stake_Trigger
          </p>
        </div>
      )}
    </div>
  );
}