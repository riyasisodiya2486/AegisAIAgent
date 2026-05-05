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
import { useVaultActions } from "@/hooks/useVaultActions";
import Link from "next/link";
import { toast } from "sonner";
import { useVaultState } from "@/hooks/useVaultState";
import { ActivityFeed } from "@/components/feed/ActivityFeed";
import { KillSwitch } from "@/components/vault/KillSwitch";
import { WithdrawPanel } from "@/components/vault/WithdrawPanel";
import { VaultStatusBanner } from "@/components/vault/VaultStatusBanner";
import { ProtocolConfigInit } from "@/components/vault/ProtocolConfigInit";

export default function VaultPage() {
  const { pda } = useParams<{ pda: string }>();
  const { publicKey } = useWallet();

  const vaultPda = (() => {
    try {
      return new PublicKey(pda);
    } catch {
      return null;
    }
  })();

  const { vault, loading, error, errorMsg, refresh } = useVaultState(vaultPda);

  const agentKey = vault
    ? (vault.raw.originalAgentKey &&
      !vault.raw.originalAgentKey.equals(PublicKey.default)
        ? vault.raw.originalAgentKey
        : vault.raw.agentKey)
    : null;
  const actions = useVaultActions(vaultPda, agentKey);

  if (!vaultPda) {
    return (
      <PageShell>
        <div className="text-center py-20">
          <p className="text-white/40">Invalid vault address.</p>
          <Link
            href="/dashboard"
            className="text-violet-400 text-sm mt-2 inline-block"
          >
            ← Back to dashboard
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ConnectGuard>
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Back link + header */}
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <Link
                href="/dashboard"
                className="text-xs text-white/30 hover:text-white/55 transition-colors"
              >
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-bold mt-1">Vault Configuration</h1>
              <p className="font-mono text-[11px] text-white/20 mt-0.5 break-all">
                {pda}
              </p>
            </div>
            <button
              onClick={refresh}
              className="p-2 rounded-xl bg-white/4 hover:bg-white/8 text-white/35 hover:text-white/60 transition-all"
              title="Refresh vault state"
            >
              ↻
            </button>
          </div>

          <VaultStatusBanner vault={vault} />
          <ProtocolConfigInit />

          {/* Error state */}
          {!loading && !vault && error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/6 p-6 space-y-3">
              <p className="text-sm font-medium text-red-400">
                {error === "not_found"   ? "Vault not found on-chain"      :
                error === "wrong_program" ? "Program ID mismatch"           :
                "Could not load vault"}
              </p>
              <p className="text-xs text-red-400/55">{errorMsg}</p>
              {error === "not_found" && (
                <div className="text-xs text-white/30 space-y-1">
                  <p>If the validator was reset, redeploy the program and create a new vault.</p>
                  <p>If you froze and withdrew this vault, it no longer exists on-chain.</p>
                </div>
              )}
              <Link href="/dashboard"
                className="inline-block px-4 py-2 rounded-xl bg-white/6 text-xs text-white/60 hover:text-white transition-all border border-white/8">
                ← Back to dashboard
              </Link>
            </div>
          )}

          {/* Loading skeleton - Updated gap */}
          {loading && !vault && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/6 bg-white/3 p-6"
                >
                  <div className="h-4 w-32 bg-white/8 rounded animate-pulse mb-3" />
                  <div className="h-8 w-24 bg-white/6 rounded animate-pulse mb-4" />
                  <div className="h-10 w-full bg-white/5 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Main 2-col grid - Updated gap */}
          {vault && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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

          {vault && <ActivityFeed />}

          {/* Emergency section */}
          {vault && (
            <>
              <div className="relative flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-red-500/15" />
                <span className="text-[11px] text-red-400/50 uppercase tracking-widest shrink-0">
                  Danger Zone
                </span>
                <div className="flex-1 h-px bg-red-500/15" />
              </div>

              {/* Danger grid - Updated gap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <KillSwitch
                  vault={vault}
                  onRevoke={actions.revoke}
                  onSuccess={refresh}
                />
                <WithdrawPanel vault={vault} onWithdraw={actions.withdraw} />
              </div>
            </>
          )}

          {/* Agent info */}
          {vault && (
            <div className="rounded-2xl border border-white/5 bg-white/2 p-5">
              {/* Info grid - Updated gap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs">
                <div>
                  <p className="text-white/25 uppercase tracking-wide mb-1">
                    Agent key
                  </p>
                  <p className="font-mono text-white/40 break-all">
                    {vault.agentAddress}
                  </p>
                </div>
                <div>
                  <p className="text-white/25 uppercase tracking-wide mb-1">
                    Owner
                  </p>
                  <p className="font-mono text-white/40 break-all">
                    {vault.ownerAddress}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/4 flex items-center gap-2">
                <code className="flex-1 text-[11px] bg-black/30 px-3 py-2 rounded-lg text-white/35 font-mono break-all">
                  VAULT_PDA_ADDRESS={pda}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`VAULT_PDA_ADDRESS=${pda}`);
                    toast.success("Copied");
                  }}
                  className="shrink-0 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/35 hover:text-white/60 transition-all"
                >
                  copy
                </button>
              </div>
            </div>
          )}
        </div>
      </ConnectGuard>
    </PageShell>
  );
}