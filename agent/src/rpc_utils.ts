import * as dotenv from "dotenv";
dotenv.config();

import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";

const connection = new Connection(
  process.env.SOLANA_RPC_URL ?? clusterApiUrl("devnet"),
  { commitment: "confirmed", confirmTransactionInitialTimeout: 30_000 }
);

/**
 * Checks if the agent keypair has enough SOL for transaction fees.
 * Each Solana tx costs ~0.000005 SOL in fees.
 * Returns a warning string if balance is low, or null if fine.
 */
export async function checkAgentGasBalance(
  agentPubkey: PublicKey
): Promise<string | null> {
  try {
    const balance = await connection.getBalance(agentPubkey);
    const balanceSol = balance / LAMPORTS_PER_SOL;
    if (balanceSol < 0.002) {
      return (
        `WARNING: Agent keypair (${agentPubkey.toBase58().slice(0, 8)}...) ` +
        `has only ${balanceSol.toFixed(6)} SOL for gas fees. ` +
        `Airdrop more: solana airdrop 0.1 ${agentPubkey.toBase58()}`
      );
    }
    return null;
  } catch {
    return null; // Non-fatal — don't block if RPC is slow
  }
}

/**
 * Retries an async operation up to maxAttempts times
 * with exponential backoff on transient errors.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err: any) {
      lastError = err;
      const msg: string = err?.message ?? String(err);

      const isTransient =
        msg.includes("timeout")     ||
        msg.includes("ECONNRESET")  ||
        msg.includes("503")         ||
        msg.includes("429")         ||
        msg.includes("Too Many");

      if (!isTransient || attempt === maxAttempts) throw err;

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[RPC] Attempt ${attempt} failed, retrying in ${delay}ms: ${msg.slice(0, 80)}`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
}
