"use client";

import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { PageShell } from "@/components/PageShell";
import { ConnectGuard } from "@/components/ConnectGuard";
import { DepositPanel } from "@/components/vault/DepositPanel";
import { LimitSlider } from "@/components/vault/LimitSlider";
import { YieldDisplay } from "@/components/vault/YieldDisplay";
import { SpendProgress } from "@/components/vault/SpendProgress";
import { useVaultState } from "@/hooks/useVaultState";
import { useVaultActions } from "@/hooks/useVaultActions";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "sonner";

export default function VaultPage() {
  const { pda }       = useParams<{ pda: string }>();
  const { publicKey } = useWallet();

  const vaultPda = (() => {
    try { return new PublicKey(pda); } catch { return null; }
  })();

  const { vault, loading, error, refresh } = useVaultState(vaultPda);

  // Derive agent key from vault state (stored on-chain)
  const agentKey = vault ? vault.raw.agentKey : null;

  const actions = useVaultActions(vaultPda, agentKey);

  if (!vaultPda) {
    return (
      <PageShell>
        <div className="text-center py-20">
          <p className="text-white/40">Invalid vault address.</p>
          <Link href="/dashboard" className="text-violet-400 text-sm mt-2 inline-block">
            ← Back to dashboard
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ConnectGuard>
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/dashboard"
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  ← Dashboard
                </Link>
              </div>
              <h1 className="text-2xl font-bold">Vault Configuration</h1>
              <p className="font-mono text-[11px] text-white/25 mt-0.5 break-all">
                {pda}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {vault && (
                <span className={[
                  "text-xs px-3 py-1 rounded-full font-medium border",
                  vault.isFrozen
                    ? "bg-red-500/15 text-red-400 border-red-500/25"
                    : "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
                ].join(" ")}>
                  {vault.isFrozen ? "⚠ Frozen" : "● Active"}
                </span>
              )}
              <button
                onClick={refresh}
                className="p-2 rounded-xl bg-white/4 hover:bg-white/8 transition-colors text-white/40 hover:text-white/70"
                title="Refresh"
              >
                ↻
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-5 py-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && !vault && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-2xl border border-white/6 bg-white/3 p-6">
                  <Skeleton className="h-4 w-32 mb-3" />
                  <Skeleton className="h-8 w-24 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Main content grid */}
          {vault && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-4">
                <DepositPanel
                  vault={vault}
                  onDeposit={actions.deposit}
                  onSuccess={refresh}
                />
                <LimitSlider
                  vault={vault}
                  onUpdateLimit={actions.updateLimit}
                  onSuccess={refresh}
                />
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <SpendProgress vault={vault} />
                <YieldDisplay
                  vault={vault}
                  onStake={actions.stake}
                  onAccrueYield={actions.accrueYield}
                  onSuccess={refresh}
                />
              </div>
            </div>
          )}

          {/* Agent info card */}
          {vault && (
            <div className="rounded-2xl border border-white/5 bg-white/2 p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-white/30 uppercase tracking-wide mb-1">Agent address</p>
                  <p className="font-mono text-white/50 break-all">
                    {vault.agentAddress}
                  </p>
                </div>
                <div>
                  <p className="text-white/30 uppercase tracking-wide mb-1">Owner address</p>
                  <p className="font-mono text-white/50 break-all">
                    {vault.ownerAddress}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[11px] text-white/25 uppercase tracking-wide mb-2">
                  Update your agent .env
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[11px] bg-black/30 px-3 py-2 rounded-lg text-white/40 font-mono break-all">
                    VAULT_PDA_ADDRESS={pda}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`VAULT_PDA_ADDRESS=${pda}`);
                      toast.success("Copied to clipboard");
                    }}
                    className="shrink-0 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/40 hover:text-white/70 transition-all"
                  >
                    copy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ConnectGuard>
    </PageShell>
  );
}
