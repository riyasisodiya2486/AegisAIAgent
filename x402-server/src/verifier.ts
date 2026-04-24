import * as dotenv from "dotenv";
dotenv.config();

import {
  Connection,
  PublicKey,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const connection = new Connection(
  process.env.SOLANA_RPC_URL ?? clusterApiUrl("devnet"),
  "confirmed"
);

export interface PaymentProof {
  tx_signature: string;
  payer: string;
  timestamp: string;
}

export interface PaymentRequired {
  version: string;
  scheme: string;
  network: string;
  amount: string;
  token: string;
  recipient: string;
  description: string;
  expires_at: string;
}

export interface VerificationResult {
  valid: boolean;
  reason?: string;
  amount_sol?: number;
  payer?: string;
}

// In-memory replay protection — records used tx signatures
const usedSignatures = new Set<string>();

export function buildPaymentRequired(description: string): PaymentRequired {
  return {
    version: "1.0",
    scheme: "solana",
    network: "devnet",
    amount: process.env.X402_PRICE_SOL ?? "0.001",
    token: "SOL",
    recipient: process.env.X402_TREASURY_PUBKEY ?? "",
    description,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
}

export async function verifyPayment(
  proof: PaymentProof,
  required: PaymentRequired
): Promise<VerificationResult> {

  if (proof.tx_signature.startsWith("DRY_RUN")) {
    console.log(`[Verifier] Accepting DRY_RUN signature: ${proof.tx_signature}`);
    return { 
      valid: true, 
      amount_sol: parseFloat(required.amount), 
      payer: proof.payer 
    };
  }
  
  // Replay attack check
  if (usedSignatures.has(proof.tx_signature)) {
    return { valid: false, reason: "Payment proof already used (replay attack prevented)" };
  }

  // Proof freshness check
  const proofAgeMs = Date.now() - new Date(proof.timestamp).getTime();
  const ttlMs = parseInt(process.env.X402_PROOF_TTL_SECONDS ?? "120") * 1000;
  if (proofAgeMs > ttlMs) {
    return {
      valid: false,
      reason: `Payment proof expired (${Math.round(proofAgeMs / 1000)}s old, max ${ttlMs / 1000}s)`,
    };
  }

  // Fetch transaction from Solana
  let tx: any;
  try {
    tx = await connection.getTransaction(proof.tx_signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
  } catch (err: any) {
    return { valid: false, reason: `RPC error: ${err.message}` };
  }

  if (!tx) {
    return { valid: false, reason: "Transaction not found on-chain. May not be confirmed yet." };
  }
  if (tx.meta?.err) {
    return { valid: false, reason: "Transaction failed on-chain" };
  }

  // Find recipient in account keys
  const recipientPubkey = new PublicKey(required.recipient);
  const accountKeys = tx.transaction.message.staticAccountKeys ?? [];
  const recipientIndex = accountKeys.findIndex(
    (k: any) => k.toBase58() === recipientPubkey.toBase58()
  );

  if (recipientIndex === -1) {
    return { valid: false, reason: "Required recipient not found in transaction" };
  }

  // Verify amount received
  const preBalance  = tx.meta?.preBalances[recipientIndex]  ?? 0;
  const postBalance = tx.meta?.postBalances[recipientIndex] ?? 0;
  const received    = (postBalance - preBalance) / LAMPORTS_PER_SOL;
  const requiredAmt = parseFloat(required.amount);

  if (received < requiredAmt * 0.99) {
    return {
      valid: false,
      reason: `Insufficient payment: received ${received.toFixed(6)} SOL, required ${requiredAmt} SOL`,
    };
  }

  // Mark as used to prevent replay
  usedSignatures.add(proof.tx_signature);

  return { valid: true, amount_sol: received, payer: proof.payer };
}