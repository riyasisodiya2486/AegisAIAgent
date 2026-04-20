import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import BN from "bn.js";
import { AegisClient } from "./client";
import { findVaultPda, findProtocolConfigPda } from "./pda";

export interface VaultState {
  /** Raw on-chain account data */
  raw: Awaited<ReturnType<AegisClient["program"]["account"]["agentVault"]["fetch"]>>;
  /** Derived / formatted fields for easy UI consumption */
  address: PublicKey;
  ownerAddress: string;
  agentAddress: string;
  isFrozen: boolean;
  /** SOL values */
  vaultBalanceSol: number;
  dailyLimitSol: number;
  spentTodaySol: number;
  remainingTodaySol: number;
  stakedAmountSol: number;
  yieldEarnedSol: number;
  pendingFeeSol: number;
  totalDepositedSol: number;
  /** Yield info */
  yieldRateBps: number;
  yieldRatePercent: number;
  feeRateBps: number;
  feeRatePercent: number;
  /** Progress: 0–100 */
  dailySpendProgressPct: number;
}

export interface ProtocolConfigState {
  address: PublicKey;
  authority: string;
  treasury: string;
  feeRateBps: number;
  feeRatePercent: number;
}

function lamportsToSol(lamports: BN | number): number {
  const n = typeof lamports === "number" ? lamports : lamports.toNumber();
  return n / LAMPORTS_PER_SOL;
}

/**
 * Fetches and formats the vault state for a given (owner, agent) pair.
 * Returns null if the vault does not exist yet.
 */
export async function getVaultState(
  client: AegisClient,
  ownerPubkey: PublicKey,
  agentPubkey: PublicKey
): Promise<VaultState | null> {
  const [vaultPda] = findVaultPda(ownerPubkey, agentPubkey, client.programId);

  try {
    const raw = await client.program.account.agentVault.fetch(vaultPda);

    const vaultBalance = lamportsToSol(raw.vaultBalance);
    const dailyLimit   = lamportsToSol(raw.dailyLimit);
    const spentToday   = lamportsToSol(raw.spentToday);

    return {
      raw,
      address: vaultPda,
      ownerAddress: raw.owner.toBase58(),
      agentAddress: raw.agentKey.toBase58(),
      isFrozen: raw.agentKey.equals(PublicKey.default),
      vaultBalanceSol: vaultBalance,
      dailyLimitSol: dailyLimit,
      spentTodaySol: spentToday,
      remainingTodaySol: Math.max(0, dailyLimit - spentToday),
      stakedAmountSol: lamportsToSol(raw.stakedAmount),
      yieldEarnedSol: lamportsToSol(raw.yieldEarned),
      pendingFeeSol: lamportsToSol(raw.pendingFee),
      totalDepositedSol: lamportsToSol(raw.totalDeposited),
      yieldRateBps: raw.yieldRateBps,
      yieldRatePercent: raw.yieldRateBps / 100,
      feeRateBps: raw.feeRateBps,
      feeRatePercent: raw.feeRateBps / 100,
      dailySpendProgressPct:
        dailyLimit > 0
          ? Math.min(100, Math.round((spentToday / dailyLimit) * 100))
          : 0,
    };
  } catch {
    return null;
  }
}

/**
 * Fetches vault state directly from a known PDA address.
 * Useful when you already have the PDA and don't need to re-derive it.
 */
export async function getVaultStateByAddress(
  client: AegisClient,
  vaultPda: PublicKey
): Promise<VaultState | null> {
  try {
    const raw = await client.program.account.agentVault.fetch(vaultPda);
    return getVaultState(client, raw.owner, raw.agentKey);
  } catch {
    return null;
  }
}

/**
 * Fetches the global ProtocolConfig.
 */
export async function getProtocolConfig(
  client: AegisClient
): Promise<ProtocolConfigState | null> {
  const [configPda] = findProtocolConfigPda(client.programId);
  try {
    const raw = await client.program.account.protocolConfig.fetch(configPda);
    return {
      address: configPda,
      authority: raw.authority.toBase58(),
      treasury: raw.treasury.toBase58(),
      feeRateBps: raw.feeRateBps,
      feeRatePercent: raw.feeRateBps / 100,
    };
  } catch {
    return null;
  }
}

/**
 * Subscribes to vault state changes via WebSocket.
 * Calls onUpdate whenever the vault account is modified on-chain.
 * Returns an unsubscribe function.
 */
export function subscribeToVault(
  client: AegisClient,
  vaultPda: PublicKey,
  onUpdate: (state: VaultState | null) => void
): () => void {
  const subId = client.connection.onAccountChange(
    vaultPda,
    async () => {
      const updated = await getVaultStateByAddress(client, vaultPda);
      onUpdate(updated);
    },
    "confirmed"
  );

  return () => {
    client.connection.removeAccountChangeListener(subId);
  };
}
