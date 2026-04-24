import * as dotenv from "dotenv";
dotenv.config();

import { DynamicTool } from "@langchain/core/tools";
import { getVaultStateByAddress, accrueYield } from "@aegis/sdk";
import { createAgentClient, loadVaultPda, DRY_RUN } from "../config/wallet";

export function createCheckBudgetTool(): DynamicTool {
  return new DynamicTool({
    name: "CheckBudget",
    description:
      "Checks the current Aegis vault state. Returns remaining daily budget in SOL, " +
      "liquid balance, staked amount, yield earned, and vault status. " +
      "Always call this before any spend. Input: empty string.",

    func: async (_input: string): Promise<string> => {
      // Validate env first — give a clear message if misconfigured
      let client: ReturnType<typeof createAgentClient>["client"];
      let vaultPda: ReturnType<typeof loadVaultPda>;

      try {
        const ctx = createAgentClient();
        client   = ctx.client;
        vaultPda = loadVaultPda();
      } catch (setupErr: any) {
        return `SETUP ERROR: ${setupErr.message}`;
      }

      // Accrue yield — non-fatal
      if (!DRY_RUN) {
        try {
          await accrueYield(client, vaultPda);
        } catch {
          // staked_amount may be 0 — ignore
        }
      }

      // Fetch vault
      let state;
      try {
        state = await getVaultStateByAddress(client, vaultPda);
      } catch (rpcErr: any) {
        return `RPC ERROR: ${rpcErr.message}. Devnet may be rate-limiting — wait and retry.`;
      }

      if (!state) {
        return [
          `VAULT NOT FOUND at: ${vaultPda.toBase58()}`,
          `Possible causes:`,
          `  1. VAULT_PDA_ADDRESS in .env is wrong`,
          `  2. Vault was never created — run the SDK smoke test`,
          `  3. Vault was closed with withdrawAll()`,
          `DO NOT call SpendViaAegis — there is no vault.`,
        ].join("\n");
      }

      if (state.isFrozen) {
        return [
          `VAULT IS FROZEN — agent revoked by owner.`,
          `Address: ${state.address.toBase58()}`,
          `DO NOT call SpendViaAegis.`,
        ].join("\n");
      }

      const prefix = DRY_RUN ? "[DRY RUN — no transactions broadcast]\n\n" : "";

      return (
        prefix +
        [
          `Vault: ACTIVE`,
          `Address: ${state.address.toBase58()}`,
          ``,
          `Daily limit:     ${state.dailyLimitSol.toFixed(4)} SOL`,
          `Spent today:     ${state.spentTodaySol.toFixed(4)} SOL`,
          `Remaining today: ${state.remainingTodaySol.toFixed(4)} SOL`,
          `Progress:        ${state.dailySpendProgressPct}%`,
          ``,
          `Liquid balance:  ${state.vaultBalanceSol.toFixed(4)} SOL`,
          `Staked:          ${state.stakedAmountSol.toFixed(4)} SOL`,
          `Yield earned:    ${state.yieldEarnedSol.toFixed(6)} SOL`,
          `Yield rate:      ${state.yieldRatePercent.toFixed(2)}% APY`,
          ``,
          state.remainingTodaySol <= 0
            ? `STATUS: Daily limit reached. Cannot spend until window resets.`
            : `STATUS: OK. You may spend up to ${state.remainingTodaySol.toFixed(4)} SOL today.`,
        ].join("\n")
      );
    },
  });
}