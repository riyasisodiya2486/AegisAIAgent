import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import {
  getVaultStateByAddress,
  spend,
  unstakeForSpend,
} from "@aegis/sdk";
import { createAgentClient, loadVaultPda, DRY_RUN } from "../config/wallet";
import { logTransaction } from "../logger";

// Input schema — LangChain validates this before calling the tool
const SpendSchema = z.object({
  amount_sol: z
    .number()
    .positive()
    .max(100)
    .describe("Amount of SOL to spend. Must be a positive number."),
  recipient_pubkey: z
    .string()
    .min(32)
    .max(44)
    .describe("Base58 Solana public key of the payment recipient."),
  memo: z
    .string()
    .max(200)
    .describe("Human-readable reason for this spend. Logged for audit trail."),
});

export type SpendInput = z.infer<typeof SpendSchema>;

export function createSpendViaAegisTool(): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: "SpendViaAegis",
    description: `
      Executes a SOL payment from the Aegis vault to a recipient address.
      The Aegis smart contract will enforce the daily spending limit on-chain —
      if the requested amount would exceed the limit, the transaction will fail.
      Always call CheckBudget first to confirm you are within limits.
      Input requires: amount_sol (number), recipient_pubkey (base58 string), memo (string).
    `.trim(),
    schema: SpendSchema,

    func: async (input: SpendInput): Promise<string> => {
      const { client, agentKeypair } = createAgentClient();
      const vaultPda = loadVaultPda();

      // ── Validate recipient pubkey ────────────────────────────────────────
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(input.recipient_pubkey);
      } catch {
        return `ERROR: Invalid recipient pubkey: "${input.recipient_pubkey}". Must be a valid base58 Solana address.`;
      }

      // ── Pre-flight: check budget ─────────────────────────────────────────
      const state = await getVaultStateByAddress(client, vaultPda);
      if (!state) {
        return "ERROR: Vault not found. Cannot spend.";
      }
      if (state.isFrozen) {
        return "ERROR: Vault is frozen. Agent has been revoked.";
      }
      if (input.amount_sol > state.remainingTodaySol) {
        return [
          `ERROR: Spend of ${input.amount_sol} SOL would exceed daily limit.`,
          `Remaining budget today: ${state.remainingTodaySol.toFixed(4)} SOL.`,
          `Daily limit: ${state.dailyLimitSol.toFixed(4)} SOL.`,
          `Spent so far: ${state.spentTodaySol.toFixed(4)} SOL.`,
          `You must wait until the 24h window resets, or the owner increases the limit.`,
        ].join("\n");
      }

      // ── Dry run: skip broadcast ──────────────────────────────────────────
      if (DRY_RUN) {
        const result = {
          status: "DRY_RUN",
          amount_sol: input.amount_sol,
          recipient: input.recipient_pubkey,
          memo: input.memo,
          would_remain: (state.remainingTodaySol - input.amount_sol).toFixed(4),
        };
        logTransaction({ 
          ...result, 
          status: "DRY_RUN" as const, // This tells TS the status is specifically "DRY_RUN"
          signature: "DRY_RUN", 
          timestamp: new Date().toISOString() 
        });
        return `[DRY RUN] Would spend ${input.amount_sol} SOL to ${input.recipient_pubkey}. Memo: ${input.memo}. Remaining after: ${result.would_remain} SOL`;
      }

      // ── Unstake if liquid balance is insufficient ────────────────────────
      if (state.vaultBalanceSol < input.amount_sol && state.stakedAmountSol > 0) {
        try {
          await unstakeForSpend(client, vaultPda, agentKeypair, input.amount_sol);
        } catch (unstakeErr: any) {
          return `ERROR: Could not unstake funds before spend: ${unstakeErr.message}`;
        }
      }

      // ── Execute the spend ────────────────────────────────────────────────
      try {
        const signature = await spend(
          client,
          vaultPda,
          agentKeypair,
          recipientPubkey,
          input.amount_sol
        );

        // Read updated state after spend
        const updatedState = await getVaultStateByAddress(client, vaultPda);
        const remainingAfter = updatedState?.remainingTodaySol ?? 0;

        // Log for audit trail and frontend feed
        logTransaction({
          status: "SUCCESS",
          signature,
          amount_sol: input.amount_sol,
          recipient: input.recipient_pubkey,
          memo: input.memo,
          remaining_budget: remainingAfter,
          timestamp: new Date().toISOString(),
        });

        return [
          `SUCCESS: Spent ${input.amount_sol} SOL`,
          `Recipient: ${input.recipient_pubkey}`,
          `Memo: ${input.memo}`,
          `Transaction: ${signature}`,
          `View on Solscan: https://solscan.io/tx/${signature}?cluster=devnet`,
          `Remaining daily budget: ${remainingAfter.toFixed(4)} SOL`,
        ].join("\n");

      } catch (err: any) {
        // Parse Anchor error codes into human-readable messages
        const msg: string = err.message ?? String(err);
        if (msg.includes("DailyLimitExceeded")) {
          return `ERROR: The smart contract rejected this spend — daily limit exceeded on-chain. Remaining: ${state.remainingTodaySol.toFixed(4)} SOL.`;
        }
        if (msg.includes("InsufficientFunds")) {
          return `ERROR: Vault has insufficient funds. Balance: ${state.vaultBalanceSol.toFixed(4)} SOL.`;
        }
        if (msg.includes("AgentRevoked")) {
          return "ERROR: Agent has been revoked. Vault is frozen.";
        }
        return `ERROR: Transaction failed — ${msg}`;
      }
    },
  });
}
