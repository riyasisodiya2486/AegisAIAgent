import { PublicKey } from "@solana/web3.js";
import { AegisClient } from "./client";
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
/**
 * Fetches and formats the vault state for a given (owner, agent) pair.
 */
export declare function getVaultState(client: AegisClient, ownerPubkey: PublicKey, agentPubkey: PublicKey): Promise<VaultState | null>;
/**
 * Fetches vault state directly from a known PDA address.
 * Use this when the agent key on-chain might be zeroed out (Frozen).
 */
export declare function getVaultStateByAddress(client: AegisClient, vaultPda: PublicKey): Promise<VaultState | null>;
/**
 * Fetches the global ProtocolConfig.
 */
export declare function getProtocolConfig(client: AegisClient): Promise<ProtocolConfigState | null>;
/**
 * Subscribes to vault state changes via WebSocket.
 */
export declare function subscribeToVault(client: AegisClient, vaultPda: PublicKey, onUpdate: (state: VaultState | null) => void): () => void;
//# sourceMappingURL=accounts.d.ts.map