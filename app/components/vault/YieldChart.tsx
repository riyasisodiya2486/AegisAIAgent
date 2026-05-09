"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { VaultState } from "@aegis/sdk";
import { TrendingUp, BarChart3 } from "lucide-react";

interface Props {
  vault: VaultState | null;
}

/**
 * Generate mock historical yield data points based on current vault state.
 * In production, this would be replaced by real historical data from an API or indexer.
 */
function generateYieldHistory(vault: VaultState) {
  const now         = Date.now();
  const dayMs       = 24 * 60 * 60 * 1000;
  const totalYield  = vault.yieldEarnedSol;
  const staked      = vault.stakedAmountSol;
  const apy         = vault.yieldRatePercent / 100;
  const dailyRate   = apy / 365;

  return Array.from({ length: 14 }, (_, i) => {
    const daysAgo    = 13 - i;
    const date       = new Date(now - daysAgo * dayMs);
    const progress   = i / 13; 
    const yieldAtDay = staked > 0
      ? staked * dailyRate * i * (1 + Math.sin(i * 0.5) * 0.05) 
      : totalYield * progress;

    return {
      date:  date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      yield: parseFloat(yieldAtDay.toFixed(6)),
      staked: staked,
    };
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-blue-500/20 bg-[#050505] px-4 py-3 shadow-2xl backdrop-blur-md">
      <p className="text-[9px] font-black text-blue-500/40 uppercase tracking-[0.2em] mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
        <p className="text-sm font-mono font-bold text-white">
          {payload[0]?.value?.toFixed(6)} <span className="text-[10px] text-blue-500/50">SOL</span>
        </p>
      </div>
    </div>
  );
};

export function YieldChart({ vault }: Props) {
  const data = useMemo(() => {
    if (!vault || vault.stakedAmountSol === 0) return [];
    return generateYieldHistory(vault);
  }, [vault?.yieldEarnedSol, vault?.stakedAmountSol]);

  if (!vault || vault.stakedAmountSol === 0) {
    return (
      <div className="rounded-[2rem] border border-blue-500/15 bg-[#050505] p-7">
        <h3 className="font-black text-xs uppercase tracking-[0.3em] text-blue-400 mb-1">Yield_Trajectory</h3>
        <p className="text-[11px] text-blue-100/30 mb-8 leading-relaxed">
          Stake idle liquidity into the yield module to generate performance analytics.
        </p>
        <div className="h-32 flex flex-col items-center justify-center border border-dashed border-blue-500/10 rounded-2xl bg-blue-500/[0.01]">
          <BarChart3 className="text-blue-500/10 mb-2" size={24} />
          <p className="text-[9px] font-black text-blue-500/20 uppercase tracking-widest">Awaiting_Staking_Input</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-blue-500/15 bg-[#050505] p-7 shadow-2xl relative overflow-hidden">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h3 className="font-black text-xs uppercase tracking-[0.3em] text-blue-400">Yield_Trajectory</h3>
          <p className="text-[10px] font-mono text-blue-100/20 mt-1.5 tracking-widest uppercase">14_Day_Projections</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-blue-500/30 uppercase tracking-[0.2em]">Total_Harvested</p>
          <div className="flex items-center gap-2 justify-end mt-1">
            <TrendingUp size={14} className="text-cyan-400" />
            <p className="text-xl font-mono font-bold text-white tracking-tighter">
              {vault.yieldEarnedSol.toFixed(6)}
              <span className="text-[10px] text-blue-500/40 ml-1.5 font-black uppercase tracking-tighter">SOL</span>
            </p>
          </div>
        </div>
      </div>

      <div className="h-[140px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(59, 130, 246, 0.2)", fontSize: 9, fontWeight: 900 }}
              axisLine={false}
              tickLine={false}
              interval={3}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="yield"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#yieldGradient)"
              dot={false}
              activeDot={{ 
                r: 5, 
                fill: "#22d3ee", 
                stroke: "#050505", 
                strokeWidth: 2,
                style: {
                  filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.8))"
                }
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex justify-between p-3 rounded-xl bg-blue-500/[0.02] border border-blue-500/5">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-blue-500/30 uppercase tracking-[0.2em]">Active_Stake</span>
          <span className="text-[11px] font-mono font-bold text-blue-100/60 mt-0.5">{vault.stakedAmountSol.toFixed(4)} SOL</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[8px] font-black text-blue-500/30 uppercase tracking-[0.2em]">Current_APY</span>
          <span className="text-[11px] font-mono font-bold text-cyan-400 mt-0.5">{vault.yieldRatePercent.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}