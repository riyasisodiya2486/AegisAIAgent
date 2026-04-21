import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { getVaultStateByAddress, accrueYield } from "@aegis/sdk";
import { createAgentClient, loadVaultPda, DRY_RUN } from "../config/wallet";

export function createCheckBudgetTool(): DynamicStructuredTool {
  return new DynamicStructuredTool({
    name: "CheckBudget",
    description: `
      Checks the current Aegis vault state before any spend.
      Returns: remaining daily budget in SOL, current liquid balance,
      staked amount, yield earned, and whether the vault is frozen.
      ALWAYS call this before attempting any spend to confirm you are within limits.
      Input: empty string (no input needed).
    `.trim(),
    schema: z.object({}),

    func: async (): Promise<string> => {
      try {
        const { client } = createAgentClient();
        const vaultPda = loadVaultPda();

        // Refresh yield counter before reading state
        // (permissionless crank — safe to call anytime)
        if (!DRY_RUN) {
          try {
            await accrueYield(client, vaultPda);
          } catch {
            // Non-fatal: accrue might fail if staked_amount is 0
          }
        }

        const state = await getVaultStateByAddress(client, vaultPda);

        if (!state) {
          return "ERROR: Vault not found. Check VAULT_PDA_ADDRESS in .env";
        }

        if (state.isFrozen) {
          return [
            "VAULT IS FROZEN — agent has been revoked by the owner.",
            "No transactions can be executed until the owner re-authorizes.",
          ].join("\n");
        }

        const lines = [
          `Vault status: ACTIVE`,
          `Vault address: ${state.address.toBase58()}`,
          ``,
          `--- Budget ---`,
          `Daily limit:        ${state.dailyLimitSol.toFixed(4)} SOL`,
          `Spent today:        ${state.spentTodaySol.toFixed(4)} SOL`,
          `Remaining today:    ${state.remainingTodaySol.toFixed(4)} SOL`,
          `Daily progress:     ${state.dailySpendProgressPct}%`,
          ``,
          `--- Balances ---`,
          `Liquid balance:     ${state.vaultBalanceSol.toFixed(4)} SOL`,
          `Staked (yield):     ${state.stakedAmountSol.toFixed(4)} SOL`,
          `Total in vault:     ${(state.vaultBalanceSol + state.stakedAmountSol).toFixed(4)} SOL`,
          ``,
          `--- Yield ---`,
          `Yield earned:       ${state.yieldEarnedSol.toFixed(6)} SOL`,
          `Yield rate:         ${state.yieldRatePercent.toFixed(2)}% APY`,
          ``,
          `--- Instructions ---`,
          `You may spend up to ${state.remainingTodaySol.toFixed(4)} SOL more today.`,
          state.remainingTodaySol <= 0
            ? "IMPORTANT: Daily limit reached. Cannot spend until tomorrow."
            : `You can proceed with spends up to ${state.remainingTodaySol.toFixed(4)} SOL.`,
        ];

        if (DRY_RUN) {
          lines.unshift("[DRY RUN MODE — no transactions will be broadcast]\n");
        }

        return lines.join("\n");
      } catch (err: any) {
        return `CheckBudget ERROR: ${err.message}`;
      }
    },
  });
}
