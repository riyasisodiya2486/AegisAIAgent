"use client";

import { VaultState } from "@aegis/sdk";
import { useEffect, useState } from "react";
import { Timer, AlertCircle } from "lucide-react";

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
      setLabel(remaining > 0 ? `${h}H ${m}M` : "RESET_PENDING");
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [vault]);

  return label;
}

export function SpendProgress({ vault }: Props) {
  const resetLabel = useTimeUntilReset(vault);
  const pct         = vault?.dailySpendProgressPct ?? 0;

  const barColor =
    pct >= 90 ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" :
    pct >= 60 ? "bg-cyan-400"  :
    pct >= 30 ? "bg-blue-500"  : "bg-blue-700";

  const textColor =
    pct >= 90 ? "text-red-400"  :
    pct >= 60 ? "text-cyan-400" : "text-blue-400";

  return (
    <div className="rounded-[2rem] border border-blue-500/15 bg-[#050505] p-7 space-y-6 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-xs uppercase tracking-[0.3em] text-blue-400">Resource_Allocation</h3>
          {resetLabel && (
            <div className="flex items-center gap-1.5 mt-1.5 text-blue-100/20">
              <Timer size={10} />
              <p className="text-[10px] font-mono tracking-widest uppercase">Cycle_Refresh: {resetLabel}</p>
            </div>
          )}
        </div>
        <span className={`text-3xl font-mono font-black italic tracking-tighter ${textColor}`}>{pct}%</span>
      </div>

      {/* Progress bar - Terminal Track Style */}
      <div className="h-2.5 rounded-full bg-blue-950/20 border border-blue-500/5 overflow-hidden p-[2px]">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Row of stats - Monospace Terminal Style */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        {[
          { label: "Consumed",  value: vault ? `${vault.spentTodaySol.toFixed(3)}` : "0.000" },
          { label: "Available", value: vault ? `${vault.remainingTodaySol.toFixed(3)}` : "0.000" },
          { label: "Threshold", value: vault ? `${vault.dailyLimitSol.toFixed(3)}` : "0.000" },
        ].map(({ label, value }) => (
          <div key={label} className="p-3 rounded-xl bg-blue-500/[0.02] border border-blue-500/5">
            <p className="text-[8px] font-black text-blue-500/30 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-[11px] font-mono font-bold text-blue-100/60">{value} <span className="text-[9px] opacity-30">SOL</span></p>
          </div>
        ))}
      </div>

      {/* Frozen warning - High Contrast Neon Alert */}
      {vault?.isFrozen && (
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/5 border border-red-500/20 animate-pulse">
          <AlertCircle className="text-red-500 shrink-0" size={16} />
          <p className="text-[10px] font-black text-red-400 uppercase tracking-wider leading-relaxed">
            Critical: Security breach or manual freeze active. Execution halted.
          </p>
        </div>
      )}
    </div>
  );
}