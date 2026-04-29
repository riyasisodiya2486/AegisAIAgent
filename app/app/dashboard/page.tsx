"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { ConnectGuard } from "@/components/ConnectGuard";
import { useVaultState } from "@/hooks/useVaultState";
import { loadPrimaryVault } from "@/lib/vaultStorage";
import { ActivityFeed } from "@/components/feed/ActivityFeed";

function MetricCard({ label, value, sub }: { label: string; value?: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-5 space-y-2">
      <p className="text-xs text-white/35 font-medium tracking-wide uppercase">{label}</p>
      {value ? (
        <p className="text-2xl font-bold text-white">{value}</p>
      ) : (
        <div className="h-8 w-24 rounded-lg bg-white/8 animate-pulse" />
      )}
      {sub && <p className="text-xs text-white/30">{sub}</p>}
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
      try { setVaultPda(new PublicKey(saved)); setPdaStr(saved); } catch {}
    }
  }, [publicKey]);

  const { vault, loading } = useVaultState(vaultPda);

  return (
    <PageShell>
      <ConnectGuard>
        <div className="space-y-7">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-sm text-white/35 mt-0.5 font-mono">
                {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/create-vault"
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/4 text-sm text-white/70 hover:text-white hover:border-white/20 transition-all"
              >
                + New Vault
              </Link>
              {pdaStr && (
                <Link
                  href={`/vault/${pdaStr}`}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-sm text-white hover:bg-violet-500 transition-all"
                >
                  Manage Vault →
                </Link>
              )}
            </div>
          </div>

          {/* No vault state */}
          {!loading && !vault && !pdaStr && (
            <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center space-y-4">
              <div className="text-4xl">🏦</div>
              <div>
                <p className="font-semibold text-white/80">No vault yet</p>
                <p className="text-sm text-white/35 mt-1">
                  Create an agent vault to get started
                </p>
              </div>
              <Link
                href="/create-vault"
                className="inline-block px-5 py-2.5 rounded-xl bg-violet-600 text-sm text-white hover:bg-violet-500 transition-all"
              >
                Create your first vault
              </Link>
            </div>
          )}

          {/* Metrics grid */}
          {(vault || loading) && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Vault Balance" value={vault ? `${vault.vaultBalanceSol.toFixed(4)} SOL` : undefined} />
                <MetricCard label="Daily Limit"   value={vault ? `${vault.dailyLimitSol.toFixed(4)} SOL`   : undefined} />
                <MetricCard label="Spent Today"   value={vault ? `${vault.spentTodaySol.toFixed(4)} SOL`   : undefined} />
                <MetricCard label="Yield Earned"  value={vault ? `${vault.yieldEarnedSol.toFixed(6)} SOL`  : undefined} />
              </div>

              {/* Progress bar */}
              {vault && (
                <div className="rounded-2xl border border-white/6 bg-white/3 p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/60">Daily spend progress</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        vault.isFrozen
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                      }`}>
                        {vault.isFrozen ? "⚠ Frozen" : "● Active"}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-white/80">{vault.dailySpendProgressPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        vault.dailySpendProgressPct > 80 ? "bg-red-500" :
                        vault.dailySpendProgressPct > 50 ? "bg-amber-500" : "bg-violet-500"
                      }`}
                      style={{ width: `${vault.dailySpendProgressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/30">
                    <span>{vault.spentTodaySol.toFixed(4)} SOL spent</span>
                    <span>{vault.remainingTodaySol.toFixed(4)} SOL remaining</span>
                  </div>
                </div>
              )}

              {/* Yield / staking info */}
              {vault && vault.stakedAmountSol > 0 && (
                <div className="rounded-2xl border border-white/6 bg-white/3 p-5">
                  <div className="grid grid-cols-3 gap-6 text-sm">
                    {[
                      { label: "Staked",   value: `${vault.stakedAmountSol.toFixed(4)} SOL`  },
                      { label: "APY",      value: `${vault.yieldRatePercent.toFixed(2)}%`     },
                      { label: "Deposited",value: `${vault.totalDepositedSol.toFixed(4)} SOL` },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-white/35 uppercase tracking-wide">{label}</p>
                        <p className="font-bold mt-1 text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pdaStr && (
                <p className="text-center text-xs text-white/20 font-mono">
                  {pdaStr.slice(0, 8)}···{pdaStr.slice(-8)}
                  {" · "}
                  <Link href={`/vault/${pdaStr}`} className="text-violet-400 hover:text-violet-300 transition-colors">
                    Open vault →
                  </Link>
                </p>
              )}
            </>
          )}

          {/* Activity Feed — Added here for Step 6 */}
          <div className="mt-4 pt-4">
             <ActivityFeed />
          </div>

        </div>
      </ConnectGuard>
    </PageShell>
  );
}