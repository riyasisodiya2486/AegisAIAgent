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
 * Common formatting logic for raw vault data.
 * Handles the "Frozen Vault" logic by falling back to originalAgentKey.
 */
function formatVaultState(raw: any, vaultPda: PublicKey): VaultState {
  const vaultBalance = lamportsToSol(raw.vaultBalance);
  const dailyLimit   = lamportsToSol(raw.dailyLimit);
  
  // FIX: The on-chain state only updates spent_today on the next spend transaction.
  // We must visually reset it in the UI if 24 hours have passed.
  const now = Math.floor(Date.now() / 1000);
  const lastResetTs = raw.lastResetTs.toNumber();
  const spentTodayLamports = (now - lastResetTs >= 86400) ? new BN(0) : raw.spentToday;
  
  const spentToday   = lamportsToSol(spentTodayLamports);

  // KEY FIX: If agentKey is zero (frozen), use originalAgentKey for UI display
  const isFrozen = raw.agentKey.equals(PublicKey.default);
  const displayAgentKey = isFrozen ? raw.originalAgentKey : raw.agentKey;

  return {
    raw,
    address: vaultPda,
    ownerAddress: raw.owner.toBase58(),
    agentAddress: displayAgentKey.toBase58(),
    isFrozen,
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
}

/**
 * Fetches and formats the vault state for a given (owner, agent) pair.
 */
export async function getVaultState(
  client: AegisClient,
  ownerPubkey: PublicKey,
  agentPubkey: PublicKey
): Promise<VaultState | null> {
  const [vaultPda] = findVaultPda(ownerPubkey, agentPubkey, client.programId);

  try {
    const raw = await client.program.account.agentVault.fetch(vaultPda);
    return formatVaultState(raw, vaultPda);
  } catch {
    return null;
  }
}

/**
 * Fetches vault state directly from a known PDA address.
 * Use this when the agent key on-chain might be zeroed out (Frozen).
 */
export async function getVaultStateByAddress(
  client: AegisClient,
  vaultPda: PublicKey
): Promise<VaultState | null> {
  try {
    const raw = await client.program.account.agentVault.fetch(vaultPda);
    return formatVaultState(raw, vaultPda);
  } catch (err: any) {
    const msg: string = err?.message ?? String(err);
    // Anchor throws when the account simply doesn't exist — treat as null
    if (
      msg.includes("Account does not exist") ||
      msg.includes("has no data") ||
      msg.includes("could not find account")
    ) {
      return null;
    }
    // Re-throw RPC / network / program errors so callers can classify them
    throw err;
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