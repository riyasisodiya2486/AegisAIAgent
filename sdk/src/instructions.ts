import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import BN from "bn.js";
import { AegisClient } from "./client";
import { findVaultPda } from "./pda";
import * as anchor from "@coral-xyz/anchor";

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
  const amountLamports = solToLamports(amountSol);
  

  // Build the transaction manually to avoid the toString error
    const tx = await client.program.methods
    .spend(new anchor.BN(amountLamports.toString())) 
    .accountsPartial({                               
      vault:         vaultPda,
      agent:         agentKeypair.publicKey,
      recipient:     recipientPubkey,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  // Set recent blockhash manually
  const { blockhash, lastValidBlockHeight } =
    await client.connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash    = blockhash;
  tx.feePayer           = agentKeypair.publicKey;

  // Sign with agent keypair
  tx.sign(agentKeypair);

  // Send and confirm
  const rawTx = tx.serialize();
  const signature = await client.connection.sendRawTransaction(rawTx, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });

  if (!signature) throw new Error("No signature returned");
  
  await client.connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  return signature;
}

// ─── Owner controls ───────────────────────────────────────────────────────────

/**
 * Freezes the agent instantly. Only callable by the vault owner.
 */
export async function revokeAgent(
  client: AegisClient,
  owner: PublicKey,
  agentKey: PublicKey     // this is the ORIGINAL agent key
): Promise<string> {
  const programId = client.programId;
  const [vaultPda] = findVaultPda(owner, agentKey, programId);

  const tx = await client.program.methods
    .revokeAgent()
    .accountsPartial({ // Use accountsPartial instead of .accounts
      vault: vaultPda,
      owner: owner,
      originalAgentKey: agentKey, 
    })
    .transaction();

  const { blockhash, lastValidBlockHeight } =
    await client.connection.getLatestBlockhash("confirmed");
    
  tx.recentBlockhash = blockhash;
  tx.feePayer = owner;

  // Use the provider's sendAndConfirm for a cleaner implementation if possible, 
  // but keeping your manual signing logic below:
  const signedTx = await (client.program.provider as any).wallet.signTransaction(tx);
  const signature = await client.connection.sendRawTransaction(signedTx.serialize());
  
  await client.connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );
  
  return signature;
}
/**
 * Updates the daily spending limit. Only callable by the vault owner.
 */
export async function updateDailyLimit(
  client: AegisClient,
  ownerPubkey: PublicKey,
  originalAgentKey: PublicKey,
  newLimitSol: number
): Promise<string> {
  const [vaultPda] = findVaultPda(ownerPubkey, originalAgentKey, client.programId);

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
  owner: PublicKey,
  originalAgentKey: PublicKey  // must be original, not current (which is zero when frozen)
): Promise<string> {
  const programId = client.programId;
  const [vaultPda] = findVaultPda(owner, originalAgentKey, programId);

  const tx = await client.program.methods
    .withdraw()
    .accounts({
      vault:         vaultPda,
      owner:         owner,
      systemProgram: SystemProgram.programId,
    })
    .transaction();

  const { blockhash, lastValidBlockHeight } =
    await client.connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.feePayer        = owner;

  const signedTx = await (client.program.provider as any).wallet.signTransaction(tx);
  const signature = await client.connection.sendRawTransaction(signedTx.serialize());
  await client.connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );
  return signature;
}

// ─── Yield management ────────────────────────────────────────────────────────

/**
 * Moves idle funds above the buffer into the yield-bearing staked bucket.
 */
export async function stakeIdleFunds(
  client: AegisClient,
  ownerPubkey: PublicKey,
  originalAgentKey: PublicKey
): Promise<string> {
  const [vaultPda] = findVaultPda(ownerPubkey, originalAgentKey, client.programId);

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
