"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { ConnectGuard } from "@/components/ConnectGuard";
import { ActivityFeed } from "@/components/feed/ActivityFeed";
import { YieldChart } from "@/components/vault/YieldChart";
import { VaultSummaryCard } from "@/components/vault/VaultSummaryCard";
import { useVaultState } from "@/hooks/useVaultState";
import { loadPrimaryVault } from "@/lib/vaultStorage";

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label:   string;
  value?:  string;
  sub?:    string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-5 space-y-2">
      <p className="text-[11px] text-white/30 font-medium tracking-widest uppercase">{label}</p>
      {value ? (
        <p className={`text-2xl font-bold ${accent ? "text-violet-400" : "text-white"}`}>
          {value}
        </p>
      ) : (
        <div className="h-8 w-24 rounded-lg bg-white/8 animate-pulse" />
      )}
      {sub && <p className="text-xs text-white/20">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { publicKey }           = useWallet();
  const [vaultPda, setVaultPda] = useState<PublicKey | null>(null);
  const [pdaStr,   setPdaStr]   = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;
    const saved = loadPrimaryVault(publicKey.toBase58());
    if (saved) {
      try {
        setVaultPda(new PublicKey(saved));
        setPdaStr(saved);
      } catch {}
    }
  }, [publicKey]);

  const { vault, loading } = useVaultState(vaultPda);

  return (
    <PageShell>
      <ConnectGuard>
        <div className="space-y-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-white/30 mt-0.5 font-mono">
                {publicKey?.toBase58().slice(0,8)}···{publicKey?.toBase58().slice(-8)}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/create-vault"
                className="px-4 py-2 rounded-xl border border-white/8 bg-white/3
                  text-sm text-white/55 hover:text-white/80 hover:bg-white/6 transition-all"
              >
                + New Vault
              </Link>
              {pdaStr && (
                <Link
                  href={`/vault/${pdaStr}`}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-sm text-white
                    hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20"
                >
                  Manage Vault →
                </Link>
              )}
            </div>
          </div>

          {/* ── No vault ── */}
          {!loading && !vault && !pdaStr && (
            <div className="rounded-2xl border border-dashed border-white/8 p-16 text-center space-y-4">
              <div className="text-4xl">🏦</div>
              <div>
                <p className="font-semibold text-white/70">No vault yet</p>
                <p className="text-sm text-white/30 mt-1">
                  Create an agent vault to get started
                </p>
              </div>
              <Link
                href="/create-vault"
                className="inline-block px-5 py-2.5 rounded-xl bg-violet-600
                  text-sm text-white hover:bg-violet-500 transition-all"
              >
                Create your first vault
              </Link>
            </div>
          )}

          {/* ── Metrics grid ── */}
          {(vault || loading) && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label="Vault Balance"
                  value={vault ? `${vault.vaultBalanceSol.toFixed(4)} SOL` : undefined}
                  sub={vault && vault.stakedAmountSol > 0
                    ? `+ ${vault.stakedAmountSol.toFixed(4)} staked` : undefined}
                />
                <MetricCard
                  label="Daily Limit"
                  value={vault ? `${vault.dailyLimitSol.toFixed(4)} SOL` : undefined}
                />
                <MetricCard
                  label="Spent Today"
                  value={vault ? `${vault.spentTodaySol.toFixed(4)} SOL` : undefined}
                  sub={vault ? `${vault.dailySpendProgressPct}% of limit` : undefined}
                />
                <MetricCard
                  label="Yield Earned"
                  value={vault ? `${vault.yieldEarnedSol.toFixed(6)} SOL` : undefined}
                  sub={vault?.yieldRatePercent ? `${vault.yieldRatePercent.toFixed(2)}% APY` : undefined}
                  accent
                />
              </div>

              {/* ── Spend progress bar ── */}
              {vault && (
                <div className="rounded-2xl border border-white/6 bg-white/3 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/55">Daily spend progress</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                        vault.isFrozen
                          ? "bg-red-500/15 text-red-400 border-red-500/20"
                          : "bg-emerald-500/12 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {vault.isFrozen ? "⚠ Frozen" : "● Active"}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-white/70">
                      {vault.dailySpendProgressPct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        vault.dailySpendProgressPct >= 90 ? "bg-red-500"    :
                        vault.dailySpendProgressPct >= 60 ? "bg-amber-500"  :
                        "bg-violet-500"
                      }`}
                      style={{ width: `${vault.dailySpendProgressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/25">
                    <span>{vault.spentTodaySol.toFixed(4)} SOL spent</span>
                    <span>{vault.remainingTodaySol.toFixed(4)} SOL remaining</span>
                  </div>
                </div>
              )}

              {/* ── Chart + Summary side by side ── */}
              {vault && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <YieldChart vault={vault} />
                  </div>
                  <div>
                    <VaultSummaryCard vault={vault} pdaStr={pdaStr ?? ""} loading={loading} />
                  </div>
                </div>
              )}

              {/* ── Activity feed ── */}
              <ActivityFeed />

              {pdaStr && (
                <p className="text-center text-xs text-white/15 font-mono">
                  {pdaStr.slice(0,8)}···{pdaStr.slice(-8)}
                  {" · "}
                  <Link href={`/vault/${pdaStr}`} className="text-violet-400/50 hover:text-violet-400 transition-colors">
                    Open vault →
                  </Link>
                </p>
              )}
            </>
          )}
        </div>
      </ConnectGuard>
    </PageShell>
  );
}