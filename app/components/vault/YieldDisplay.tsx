"use client";

import { VaultState } from "@aegis/sdk";
import { TxButton } from "@/components/TxButton";

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
    <div className="rounded-2xl border border-white/6 bg-white/3 p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-sm">Yield & Staking</h3>
        <p className="text-xs text-white/35 mt-0.5">
          Idle funds earn yield automatically. The agent unstakes when it needs to spend.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: "Staked",
            value: vault ? `${vault.stakedAmountSol.toFixed(4)} SOL` : "—",
            color: hasStaked ? "text-emerald-400" : "text-white/50",
          },
          {
            label: "Yield earned",
            value: vault ? `${vault.yieldEarnedSol.toFixed(6)} SOL` : "—",
            color: "text-violet-400",
          },
          {
            label: "APY",
            value: vault ? `${vault.yieldRatePercent.toFixed(2)}%` : "—",
            color: "text-white",
          },
          {
            label: "Daily earnings",
            value: dailyEarnings > 0
              ? `~${dailyEarnings.toFixed(6)} SOL`
              : "—",
            color: "text-white/60",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl bg-white/3 border border-white/5 px-3 py-2.5"
          >
            <p className="text-[11px] text-white/30 uppercase tracking-wide">{label}</p>
            <p className={`text-sm font-semibold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Fee info */}
      {vault && vault.feeRateBps > 0 && (
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white/2 border border-white/4">
          <span className="text-white/35">Protocol performance fee</span>
          <span className="text-white/50">{vault.feeRatePercent.toFixed(2)}% of yield</span>
        </div>
      )}

      {/* Stake idle funds CTA */}
      {canStake && !hasStaked && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-emerald-400">Idle funds detected</p>
            <p className="text-xs text-white/35 mt-0.5">
              You have {vault ? (vault.vaultBalanceSol - vault.dailyLimitSol).toFixed(4) : "0"} SOL
              above your daily limit. Stake it to earn {vault?.yieldRatePercent.toFixed(0)}% APY.
            </p>
          </div>
          <TxButton
            label="Stake idle funds"
            loadingLabel="Staking..."
            onClick={async () => {
              const sig = await onStake();
              onSuccess();
              return sig;
            }}
            className="w-full"
            size="sm"
          />
        </div>
      )}

      {/* Accrue yield button */}
      {hasStaked && (
        <TxButton
          label="Refresh yield"
          loadingLabel="Accruing..."
          onClick={async () => {
            const sig = await onAccrueYield();
            onSuccess();
            return sig;
          }}
          variant="outline"
          className="w-full text-xs"
          size="sm"
        />
      )}

      {/* No stake state */}
      {!canStake && !hasStaked && vault && (
        <div className="text-center py-3">
          <p className="text-xs text-white/25">
            Deposit more than {vault.dailyLimitSol.toFixed(3)} SOL to unlock staking.
          </p>
        </div>
      )}
    </div>
  );
}
