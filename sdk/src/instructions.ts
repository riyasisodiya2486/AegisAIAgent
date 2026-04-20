import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import BN from "bn.js";
import { AegisClient } from "./client";
import { findVaultPda } from "./pda";

function solToLamports(sol: number): BN {
  return new BN(Math.round(sol * LAMPORTS_PER_SOL));
}

export interface TxResult {
  signature: string;
  vaultAddress: PublicKey;
}

// ─── Vault lifecycle ─────────────────────────────────────────────────────────

/**
 * Creates a new Aegis vault PDA for the given agent.
 * @param dailyLimitSol - Maximum SOL the agent can spend per 24h window
 */
export async function createVault(
  client: AegisClient,
  ownerPubkey: PublicKey,
  agentPubkey: PublicKey,
  dailyLimitSol: number
): Promise<TxResult> {
  const [vaultPda] = findVaultPda(ownerPubkey, agentPubkey, client.programId);

  const sig = await client.program.methods
    .initializeVault(solToLamports(dailyLimitSol))
    .accounts({
      vault: vaultPda,
      owner: ownerPubkey,
      agentKey: agentPubkey,
      systemProgram: SystemProgram.programId,
    } as any)
    .rpc();

  return { signature: sig, vaultAddress: vaultPda };
}

/**
 * Deposits SOL from the owner's connected wallet into the vault.
 */
export async function deposit(
  client: AegisClient,
  ownerPubkey: PublicKey,
  agentPubkey: PublicKey,
  amountSol: number
): Promise<TxResult> {
  const [vaultPda] = findVaultPda(ownerPubkey, agentPubkey, client.programId);

  const sig = await client.program.methods
    .deposit(solToLamports(amountSol))
    .accounts({
      vault: vaultPda,
      owner: ownerPubkey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { signature: sig, vaultAddress: vaultPda };
}

/**
 * Agent spends from the vault. The agentKeypair must be available locally.
 * Used by the AI agent on Day 7 — not from the browser frontend.
 */
export async function spend(
  client: AegisClient,
  vaultPda: PublicKey,
  agentKeypair: Keypair,
  recipientPubkey: PublicKey,
  amountSol: number
): Promise<string> {
  const sig = await client.program.methods
    .spend(solToLamports(amountSol))
    .accounts({
      vault: vaultPda,
      agent: agentKeypair.publicKey,
      recipient: recipientPubkey,
      systemProgram: SystemProgram.programId,
    } as any)
    .signers([agentKeypair])
    .rpc();

  return sig;
}

// ─── Owner controls ───────────────────────────────────────────────────────────

/**
 * Freezes the agent instantly. Only callable by the vault owner.
 */
export async function revokeAgent(
  client: AegisClient,
  ownerPubkey: PublicKey,
  agentPubkey: PublicKey
): Promise<string> {
  const [vaultPda] = findVaultPda(ownerPubkey, agentPubkey, client.programId);

  return client.program.methods
    .revokeAgent()
    .accounts({
      vault: vaultPda,
      owner: ownerPubkey,
    })
    .rpc();
}

/**
 * Updates the daily spending limit. Only callable by the vault owner.
 */
export async function updateDailyLimit(
  client: AegisClient,
  ownerPubkey: PublicKey,
  agentPubkey: PublicKey,
  newLimitSol: number
): Promise<string> {
  const [vaultPda] = findVaultPda(ownerPubkey, agentPubkey, client.programId);

  return client.program.methods
    .updateLimit(solToLamports(newLimitSol))
    .accounts({
      vault: vaultPda,
      owner: ownerPubkey,
    })
    .rpc();
}

/**
 * Closes the vault and returns all lamports to the owner.
 * NOTE: agentPubkey needed to re-derive the PDA seeds.
 * If the agent was revoked, pass PublicKey.default.
 */
export async function withdrawAll(
  client: AegisClient,
  ownerPubkey: PublicKey,
  agentPubkey: PublicKey
): Promise<string> {
  const [vaultPda] = findVaultPda(ownerPubkey, agentPubkey, client.programId);

  return client.program.methods
    .withdraw()
    .accounts({
      vault: vaultPda,
      owner: ownerPubkey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

// ─── Yield management ────────────────────────────────────────────────────────

/**
 * Moves idle funds above the buffer into the yield-bearing staked bucket.
 */
export async function stakeIdleFunds(
  client: AegisClient,
  ownerPubkey: PublicKey,
  agentPubkey: PublicKey
): Promise<string> {
  const [vaultPda] = findVaultPda(ownerPubkey, agentPubkey, client.programId);

  return client.program.methods
    .stakeIdleFunds()
    .accounts({
      vault: vaultPda,
      owner: ownerPubkey,
      config: client.configPda,
    })
    .rpc();
}

/**
 * Permissionless crank — updates the yield counter.
 * Call this on page load to show fresh yield numbers.
 */
export async function accrueYield(
  client: AegisClient,
  vaultPda: PublicKey
): Promise<string> {
  return client.program.methods
    .accrueYield()
    .accounts({
      vault: vaultPda,
      config: client.configPda,
    })
    .rpc();
}

/**
 * Agent-triggered unstake when liquid balance is insufficient for a spend.
 * Called automatically by the agent before spend if needed.
 */
export async function unstakeForSpend(
  client: AegisClient,
  vaultPda: PublicKey,
  agentKeypair: Keypair,
  amountNeededSol: number
): Promise<string> {
  return client.program.methods
    .unstakeForSpend(solToLamports(amountNeededSol))
    .accounts({
      vault: vaultPda,
      agent: agentKeypair.publicKey,
    }as any)
    .signers([agentKeypair])
    .rpc();
}
