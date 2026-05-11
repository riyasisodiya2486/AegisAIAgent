import { PublicKey, Keypair } from "@solana/web3.js";
import { AegisClient } from "./client";
export interface TxResult {
    signature: string;
    vaultAddress: PublicKey;
}
/**
 * Creates a new Aegis vault PDA for the given agent.
 * @param dailyLimitSol - Maximum SOL the agent can spend per 24h window
 */
export declare function createVault(client: AegisClient, ownerPubkey: PublicKey, agentPubkey: PublicKey, dailyLimitSol: number): Promise<TxResult>;
/**
 * Deposits SOL from the owner's connected wallet into the vault.
 */
export declare function deposit(client: AegisClient, ownerPubkey: PublicKey, agentPubkey: PublicKey, amountSol: number): Promise<TxResult>;
/**
 * Agent spends from the vault. The agentKeypair must be available locally.
 * Used by the AI agent on Day 7 — not from the browser frontend.
 */
export declare function spend(client: AegisClient, vaultPda: PublicKey, agentKeypair: Keypair, recipientPubkey: PublicKey, amountSol: number): Promise<string>;
/**
 * Freezes the agent instantly. Only callable by the vault owner.
 */
export declare function revokeAgent(client: AegisClient, owner: PublicKey, agentKey: PublicKey): Promise<string>;
/**
 * Updates the daily spending limit. Only callable by the vault owner.
 */
export declare function updateDailyLimit(client: AegisClient, ownerPubkey: PublicKey, originalAgentKey: PublicKey, newLimitSol: number): Promise<string>;
/**
 * Closes the vault and returns all lamports to the owner.
 * NOTE: agentPubkey needed to re-derive the PDA seeds.
 * If the agent was revoked, pass PublicKey.default.
 */
export declare function withdrawAll(client: AegisClient, owner: PublicKey, originalAgentKey: PublicKey): Promise<string>;
/**
 * Moves idle funds above the buffer into the yield-bearing staked bucket.
 */
export declare function stakeIdleFunds(client: AegisClient, ownerPubkey: PublicKey, originalAgentKey: PublicKey): Promise<string>;
/**
 * Permissionless crank — updates the yield counter.
 * Call this on page load to show fresh yield numbers.
 */
export declare function accrueYield(client: AegisClient, vaultPda: PublicKey): Promise<string>;
/**
 * Agent-triggered unstake when liquid balance is insufficient for a spend.
 * Called automatically by the agent before spend if needed.
 */
export declare function unstakeForSpend(client: AegisClient, vaultPda: PublicKey, agentKeypair: Keypair, amountNeededSol: number): Promise<string>;
//# sourceMappingURL=instructions.d.ts.map