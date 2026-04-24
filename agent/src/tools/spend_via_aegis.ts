import * as dotenv from "dotenv";
dotenv.config();

import { DynamicTool } from "@langchain/core/tools";
import { PublicKey } from "@solana/web3.js";
import { getVaultStateByAddress, spend, unstakeForSpend } from "@aegis/sdk";
import { createAgentClient, loadVaultPda, DRY_RUN } from "../config/wallet";
import { logTransaction } from "../logger";

export function createSpendViaAegisTool(): DynamicTool {
  return new DynamicTool({
    name: "SpendViaAegis",
    description: `Executes a SOL payment from the Aegis vault to a recipient.
The smart contract enforces the daily spending limit on-chain.
Always call CheckBudget first before calling this tool.
Input must be a JSON string with these exact fields:
  amount_sol: number (e.g. 0.005)
  recipient_pubkey: string (base58 Solana address)
  memo: string (reason for the payment)
Example input: {"amount_sol": 0.005, "recipient_pubkey": "7xKX9Hs...", "memo": "API payment"}`,

    func: async (inputStr: string): Promise<string> => {
      // Parse the JSON input from the LLM
      let input: { amount_sol: number; recipient_pubkey: string; memo: string };

      try {
        // Handle cases where LLM wraps in markdown code blocks
        const cleaned = inputStr
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        input = JSON.parse(cleaned);
      } catch {
        // Try to extract values with regex if JSON parse fails
        const amountMatch    = inputStr.match(/amount_sol["\s:]+([0-9.]+)/);
        const recipientMatch = inputStr.match(/recipient_pubkey["\s:]+["']?([A-Za-z0-9]{32,44})/);
        const memoMatch      = inputStr.match(/memo["\s:]+["']([^"']+)["']/);

        if (!amountMatch || !recipientMatch) {
          return `ERROR: Could not parse input. Provide JSON like: {"amount_sol": 0.005, "recipient_pubkey": "ADDRESS", "memo": "reason"}. Got: ${inputStr.slice(0, 100)}`;
        }

        input = {
          amount_sol:       parseFloat(amountMatch[1]),
          recipient_pubkey: recipientMatch[1],
          memo:             memoMatch ? memoMatch[1] : "payment",
        };
      }

      // Validate parsed values
      if (!input.amount_sol || input.amount_sol <= 0) {
        return `ERROR: amount_sol must be a positive number. Got: ${input.amount_sol}`;
      }
      if (!input.recipient_pubkey || input.recipient_pubkey.length < 32) {
        return `ERROR: recipient_pubkey is missing or invalid.`;
      }
      if (!input.memo) {
        input.memo = "payment";
      }

      // Load context
      let client: any, agentKeypair: any, vaultPda: any;
      try {
        const ctx = createAgentClient();
        client       = ctx.client;
        agentKeypair = ctx.agentKeypair;
        vaultPda     = loadVaultPda();
      } catch (setupErr: any) {
        return `SETUP ERROR: ${setupErr.message}`;
      }

      // Validate recipient pubkey
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(input.recipient_pubkey);
      } catch {
        return `ERROR: Invalid recipient pubkey: "${input.recipient_pubkey}"`;
      }

      // Pre-flight budget check
      let state: any;
      try {
        state = await getVaultStateByAddress(client, vaultPda);
      } catch (rpcErr: any) {
        return `RPC ERROR: ${rpcErr.message}`;
      }

      if (!state) {
        return `ERROR: Vault not found at ${vaultPda.toBase58()}. Cannot spend.`;
      }
      if (state.isFrozen) {
        return `ERROR: Vault is frozen. Cannot spend.`;
      }
      if (input.amount_sol > state.remainingTodaySol) {
        return [
          `ERROR: Spend of ${input.amount_sol} SOL exceeds daily budget.`,
          `Remaining today: ${state.remainingTodaySol.toFixed(4)} SOL`,
          `Daily limit:     ${state.dailyLimitSol.toFixed(4)} SOL`,
          `Spent so far:    ${state.spentTodaySol.toFixed(4)} SOL`,
        ].join("\n");
      }

      // Dry run — no broadcast
      if (DRY_RUN) {
        const entry = {
          status:           "DRY_RUN" as const,
          signature:        `DRY_RUN_${Date.now()}`,
          amount_sol:       input.amount_sol,
          recipient:        input.recipient_pubkey,
          memo:             input.memo,
          remaining_budget: state.remainingTodaySol - input.amount_sol,
          timestamp:        new Date().toISOString(),
        };
        logTransaction(entry);
        return [
          `[DRY RUN] Would spend ${input.amount_sol} SOL`,
          `Recipient: ${input.recipient_pubkey}`,
          `Memo: ${input.memo}`,
          `Would remain: ${entry.remaining_budget.toFixed(4)} SOL`,
        ].join("\n");
      }

      // Unstake if liquid balance is insufficient
      if (state.vaultBalanceSol < input.amount_sol && state.stakedAmountSol > 0) {
        try {
          await unstakeForSpend(client, vaultPda, agentKeypair, input.amount_sol);
        } catch (unstakeErr: any) {
          return `ERROR: Could not unstake: ${unstakeErr.message}`;
        }
      }

      // Execute spend
      try {
        const signature = await spend(
          client,
          vaultPda,
          agentKeypair,
          recipientPubkey,
          input.amount_sol
        );

        const updated   = await getVaultStateByAddress(client, vaultPda);
        const remaining = updated?.remainingTodaySol ?? 0;

        logTransaction({
          status:           "SUCCESS",
          signature,
          amount_sol:       input.amount_sol,
          recipient:        input.recipient_pubkey,
          memo:             input.memo,
          remaining_budget: remaining,
          timestamp:        new Date().toISOString(),
        });

        return [
          `SUCCESS: Sent ${input.amount_sol} SOL`,
          `Recipient: ${input.recipient_pubkey}`,
          `Memo: ${input.memo}`,
          `Transaction: ${signature}`,
          `Solscan: https://solscan.io/tx/${signature}?cluster=devnet`,
          `Remaining budget: ${remaining.toFixed(4)} SOL`,
        ].join("\n");
      } catch (err: any) {
        const msg = err?.message ?? String(err);

        logTransaction({
          status:     "ERROR",
          signature:  "",
          amount_sol: input.amount_sol,
          recipient:  input.recipient_pubkey,
          memo:       input.memo,
          error:      msg,
          timestamp:  new Date().toISOString(),
        });

        if (msg.includes("DailyLimitExceeded")) {
          return `ERROR: Contract rejected — daily limit exceeded. Remaining: ${state.remainingTodaySol.toFixed(4)} SOL`;
        }
        if (msg.includes("InsufficientFunds")) {
          return `ERROR: Insufficient vault balance: ${state.vaultBalanceSol.toFixed(4)} SOL liquid`;
        }
        if (msg.includes("AgentRevoked")) {
          return `ERROR: Agent revoked. Vault is frozen.`;
        }
        return `ERROR: Transaction failed — ${msg}`;
      }
    },
  });
}