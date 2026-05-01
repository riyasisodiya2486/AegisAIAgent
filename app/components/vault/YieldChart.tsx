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

interface Props {
  vault: VaultState | null;
}

// Generate mock historical yield data points based on current vault state
// In production this would come from on-chain event history
function generateYieldHistory(vault: VaultState) {
  const now         = Date.now();
  const dayMs       = 24 * 60 * 60 * 1000;
  const totalYield  = vault.yieldEarnedSol;
  const staked      = vault.stakedAmountSol;
  const apy         = vault.yieldRatePercent / 100;
  const dailyRate   = apy / 365;

  // Generate 14 days of data points
  return Array.from({ length: 14 }, (_, i) => {
    const daysAgo    = 13 - i;
    const date       = new Date(now - daysAgo * dayMs);
    const progress   = i / 13; // 0 to 1
    const yieldAtDay = staked > 0
      ? staked * dailyRate * i * (1 + Math.sin(i * 0.5) * 0.05) // slight curve
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
    <div className="rounded-xl border border-white/10 bg-[#12121e] px-3 py-2.5 shadow-xl text-xs">
      <p className="text-white/40 mb-1">{label}</p>
      <p className="text-violet-300 font-semibold">
        {payload[0]?.value?.toFixed(6)} SOL yield
      </p>
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
      <div className="rounded-2xl border border-white/6 bg-white/3 p-6">
        <h3 className="font-semibold text-sm mb-1">Yield Over Time</h3>
        <p className="text-xs text-white/30 mb-6">
          Stake idle funds to start earning yield and see the chart.
        </p>
        <div className="h-32 flex items-center justify-center border border-dashed border-white/8 rounded-xl">
          <p className="text-xs text-white/20">No staking activity yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm">Yield Over Time</h3>
          <p className="text-xs text-white/30 mt-0.5">14-day projected earnings</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/30">Total earned</p>
          <p className="text-sm font-bold text-violet-400 mt-0.5">
            {vault.yieldEarnedSol.toFixed(6)} SOL
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="yield"
            stroke="#7c3aed"
            strokeWidth={2}
            fill="url(#yieldGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#7c3aed", stroke: "#0f0f1a", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-3 flex justify-between text-[11px] text-white/20">
        <span>{vault.stakedAmountSol.toFixed(4)} SOL staked</span>
        <span>{vault.yieldRatePercent.toFixed(2)}% APY</span>
      </div>
    </div>
  );
}