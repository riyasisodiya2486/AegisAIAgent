"use client";

import { VaultState } from "@aegis/sdk";
import { useEffect, useState } from "react";

interface Props {
  vault: VaultState | null;
}

function useTimeUntilReset(vault: VaultState | null): string {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!vault) return;
    const update = () => {
      const lastReset = vault.raw.lastResetTs.toNumber() * 1000;
      const resetAt   = lastReset + 24 * 60 * 60 * 1000;
      const remaining = Math.max(0, resetAt - Date.now());
      const h = Math.floor(remaining / 3_600_000);
      const m = Math.floor((remaining % 3_600_000) / 60_000);
      setLabel(remaining > 0 ? `Resets in ${h}h ${m}m` : "Resets soon");
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [vault]);

  return label;
}

export function SpendProgress({ vault }: Props) {
  const resetLabel = useTimeUntilReset(vault);
  const pct        = vault?.dailySpendProgressPct ?? 0;

  const barColor =
    pct >= 90 ? "bg-red-500"    :
    pct >= 60 ? "bg-amber-500"  :
    pct >= 30 ? "bg-violet-500" : "bg-emerald-500";

  const textColor =
    pct >= 90 ? "text-red-400"    :
    pct >= 60 ? "text-amber-400"  : "text-emerald-400";

  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Daily Spend Progress</h3>
          {resetLabel && (
            <p className="text-xs text-white/30 mt-0.5">{resetLabel}</p>
          )}
        </div>
        <span className={`text-2xl font-bold ${textColor}`}>{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Row of stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Spent",     value: vault ? `${vault.spentTodaySol.toFixed(4)} SOL`     : "—" },
          { label: "Remaining", value: vault ? `${vault.remainingTodaySol.toFixed(4)} SOL` : "—" },
          { label: "Limit",     value: vault ? `${vault.dailyLimitSol.toFixed(4)} SOL`     : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="text-[11px] text-white/30 uppercase tracking-wide">{label}</p>
            <p className="text-xs font-semibold mt-1 text-white/70">{value}</p>
          </div>
        ))}
      </div>

      {/* Frozen warning */}
      {vault?.isFrozen && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
          <span className="text-red-400">⚠</span>
          <p className="text-xs text-red-400/80">
            Vault is frozen — agent cannot spend until re-authorized.
          </p>
        </div>
      )}
    </div>
  );
}
