"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { ConnectGuard } from "@/components/ConnectGuard";
import { ActivityFeed } from "@/components/feed/ActivityFeed";
import { useVaultState } from "@/hooks/useVaultState";
import { loadPrimaryVault } from "@/lib/vaultStorage";

function MetricCard({ label, value, sub, accent }: {
  label: string; value?: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-5 space-y-2">
      <p className="text-[11px] text-white/30 font-medium tracking-widest uppercase">{label}</p>
      {value
        ? <p className={`text-2xl font-bold ${accent ? "text-violet-400" : "text-white"}`}>{value}</p>
        : <div className="h-8 w-24 rounded-lg bg-white/8 animate-pulse" />
      }
      {sub && <p className="text-xs text-white/20">{sub}</p>}
    </div>
  );
}

function DashboardContent() {
  const { publicKey } = useWallet();
  const [vaultPda, setVaultPda] = useState<PublicKey | null>(null);
  const [pdaStr,   setPdaStr]   = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;
    const saved = loadPrimaryVault(publicKey.toBase58());
    if (saved) {
      try { setVaultPda(new PublicKey(saved)); setPdaStr(saved); } catch {}
    }
  }, [publicKey?.toBase58()]);

  const { vault, loading, error, errorMsg } = useVaultState(vaultPda);

  const showNoVault = !loading && !vault && !pdaStr;
  const showError   = !loading && !vault && pdaStr && error;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-white/30 mt-0.5 font-mono">
            {publicKey?.toBase58().slice(0,8)}···{publicKey?.toBase58().slice(-8)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/create-vault"
            className="px-4 py-2 rounded-xl border border-white/8 bg-white/3 text-sm text-white/55 hover:text-white/80 hover:bg-white/6 transition-all">
            + New Vault
          </Link>
          {pdaStr && (
            <Link href={`/vault/${pdaStr}`}
              className="px-4 py-2 rounded-xl bg-violet-600 text-sm text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-500/20">
              Manage Vault →
            </Link>
          )}
        </div>
      </div>

      {/* Error state — vault exists in localStorage but can't be loaded */}
      {showError && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/6 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-amber-400 text-lg shrink-0">⚠</span>
            <div>
              <p className="text-sm font-medium text-amber-400">Vault not accessible</p>
              <p className="text-xs text-amber-400/60 mt-1">{errorMsg}</p>
            </div>
          </div>
          {error === "not_found" && (
            <div className="text-xs text-white/30 space-y-1 pl-8">
              <p>This usually means one of:</p>
              <p>• The local validator was restarted with <code>--reset</code> (chain wiped)</p>
              <p>• The Anchor program was redeployed (needs new vault)</p>
              <p>• The vault was closed via "Withdraw All"</p>
            </div>
          )}
          <div className="flex gap-2 pl-8">
            <Link href="/create-vault"
              className="px-3 py-1.5 rounded-lg bg-violet-600 text-xs text-white hover:bg-violet-500 transition-all">
              Create New Vault
            </Link>
            <button
              onClick={() => {
                if (publicKey) {
                  localStorage.removeItem(`aegis_vault_${publicKey.toBase58()}`);
                  window.location.reload();
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/40 hover:text-white/60 transition-all">
              Clear Saved Vault
            </button>
          </div>
        </div>
      )}

      {/* No vault at all */}
      {showNoVault && (
        <div className="rounded-2xl border border-dashed border-white/8 p-16 text-center space-y-4">
          <div className="text-4xl">🏦</div>
          <div>
            <p className="font-semibold text-white/70">No vault yet</p>
            <p className="text-sm text-white/30 mt-1">Create an agent vault to get started</p>
          </div>
          <Link href="/create-vault"
            className="inline-block px-5 py-2.5 rounded-xl bg-violet-600 text-sm text-white hover:bg-violet-500 transition-all">
            Create your first vault
          </Link>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !vault && pdaStr && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl border border-white/5 bg-white/3 p-5 space-y-3">
              <div className="h-2.5 w-16 bg-white/8 rounded-full" />
              <div className="h-7 w-24 bg-white/6 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Metrics — shown when vault loads */}
      {vault && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Vault Balance"
              value={`${vault.vaultBalanceSol.toFixed(4)} SOL`}
              sub={(vault.stakedAmountSol ?? 0) > 0 ? `+ ${vault.stakedAmountSol.toFixed(4)} staked` : undefined} />
            <MetricCard label="Daily Limit" value={`${vault.dailyLimitSol.toFixed(4)} SOL`} />
            <MetricCard label="Spent Today"
              value={`${vault.spentTodaySol.toFixed(4)} SOL`}
              sub={`${vault.dailySpendProgressPct}% of limit`} />
            <MetricCard label="Yield Earned"
              value={`${vault.yieldEarnedSol.toFixed(6)} SOL`}
              sub={`${vault.yieldRatePercent.toFixed(2)}% APY`} accent />
          </div>

          {/* Progress bar */}
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
              <span className="text-sm font-semibold text-white/70">{vault.dailySpendProgressPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${
                vault.dailySpendProgressPct >= 90 ? "bg-red-500"   :
                vault.dailySpendProgressPct >= 60 ? "bg-amber-500" : "bg-violet-500"
              }`} style={{ width: `${vault.dailySpendProgressPct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-white/25">
              <span>{vault.spentTodaySol.toFixed(4)} SOL spent</span>
              <span>{vault.remainingTodaySol.toFixed(4)} SOL remaining</span>
            </div>
          </div>

          {pdaStr && (
            <p className="text-center text-xs text-white/15 font-mono">
              {pdaStr.slice(0,8)}···{pdaStr.slice(-8)}{" · "}
              <Link href={`/vault/${pdaStr}`} className="text-violet-400/50 hover:text-violet-400 transition-colors">
                Open vault →
              </Link>
            </p>
          )}
        </>
      )}

      {/* Activity feed — ALWAYS shown, regardless of vault state */}
      <ActivityFeed />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <PageShell>
      <ConnectGuard>
        <DashboardContent />
      </ConnectGuard>
    </PageShell>
  );
}