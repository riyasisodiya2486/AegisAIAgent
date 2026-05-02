import * as dotenv from "dotenv";
dotenv.config();

import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import bs58 from "bs58";
import { AegisClient } from "@aegis/sdk";

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

// ── Load agent keypair from base58 private key in .env ───────────────────────
export function loadAgentKeypair(): Keypair {
  const privateKeyBase58 = requireEnv("AGENT_PRIVATE_KEY");
  const secretKey = bs58.decode(privateKeyBase58);
  return Keypair.fromSecretKey(secretKey);
}

// ── Load vault PDA from .env ──────────────────────────────────────────────────
export function loadVaultPda(): PublicKey {
  return new PublicKey(requireEnv("VAULT_PDA_ADDRESS"));
}

// ── Load owner pubkey from .env ───────────────────────────────────────────────
export function loadOwnerPubkey(): PublicKey {
  return new PublicKey(requireEnv("VAULT_OWNER_PUBKEY"));
}

// ── Build an AegisClient using the AGENT keypair ──────────────────────────────
// The agent's keypair is only used to sign spend transactions.
// It is NOT a funded wallet — it just proves identity.
export function createAgentClient(): {
  client: AegisClient;
  agentKeypair: Keypair;
  vaultPda: PublicKey;
} {
  const agentKeypair = loadAgentKeypair();
  const vaultPda = loadVaultPda();
  const rpcUrl = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

  const client = AegisClient.fromKeypair(agentKeypair, rpcUrl);

  return { client, agentKeypair, vaultPda };
}

export async function ensureAgentHasGas(): Promise<void> {
  const agentKeypair = loadAgentKeypair();
  const rpcUrl = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
  const { Connection, LAMPORTS_PER_SOL } = await import("@solana/web3.js");
  const conn = new Connection(rpcUrl, "confirmed");
  const balance = await conn.getBalance(agentKeypair.publicKey);
  if (balance < 0.01 * LAMPORTS_PER_SOL) {
    console.warn(`[Agent] LOW GAS: agent keypair has only ${balance / LAMPORTS_PER_SOL} SOL`);
    console.warn(`[Agent] Run: solana airdrop 1 ${agentKeypair.publicKey.toBase58()} --url localhost`);
  }
}

// ── Dry-run flag ──────────────────────────────────────────────────────────────
export const DRY_RUN = process.env.DRY_RUN === "true";
