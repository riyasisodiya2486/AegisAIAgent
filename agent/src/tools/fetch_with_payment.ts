import * as dotenv from "dotenv";
dotenv.config();

import { DynamicTool } from "@langchain/core/tools";
import { PublicKey } from "@solana/web3.js";
import { getVaultStateByAddress, spend } from "@aegis/sdk";
import { createAgentClient, loadVaultPda, DRY_RUN } from "../config/wallet";
import { logTransaction } from "../logger";

export function createFetchWithPaymentTool(): DynamicTool {
  return new DynamicTool({
    name: "FetchWithPayment",
    description: `Makes an HTTP request to a paid API endpoint using the x402 payment protocol.
If the server returns HTTP 402, this tool automatically:
  1. Reads the payment amount and recipient from the 402 response
  2. Checks your vault budget
  3. Pays via the Aegis vault on Solana
  4. Retries the original request with the payment proof
  5. Returns the API response
Input must be a JSON string with fields:
  url: string (full URL like "http://localhost:4402/api/compute")
  method: "GET" or "POST" (default GET)
  body: string (optional JSON body for POST)
  memo: string (reason for the API call)
Example: {"url":"http://localhost:4402/api/compute","method":"GET","memo":"fetch compute data"}`,

    func: async (inputStr: string): Promise<string> => {
      // Parse input
      let input: { url: string; method?: string; body?: string; memo: string };
      try {
        const cleaned = inputStr.replace(/\`\`\`json\n?/g, "").replace(/\`\`\`\n?/g, "").trim();
        input = JSON.parse(cleaned);
      } catch {
        const urlMatch  = inputStr.match(/url["\s:]+["']([^"']+)["']/);
        const memoMatch = inputStr.match(/memo["\s:]+["']([^"']+)["']/);
        if (!urlMatch) {
          return `ERROR: Could not parse input. Provide JSON like: {"url":"http://localhost:4402/api/compute","memo":"reason"}`;
        }
        input = { url: urlMatch[1], memo: memoMatch ? memoMatch[1] : "api call" };
      }

      if (!input.url) return `ERROR: url is required`;
      if (!input.memo) input.memo = "api call";
      const method = (input.method ?? "GET").toUpperCase();

      console.log(`[FetchWithPayment] ${method} ${input.url}`);

      // Step 1: Initial request
      let initialResp: Response;
      try {
        initialResp = await fetch(input.url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: method === "POST" && input.body ? input.body : undefined,
          signal: AbortSignal.timeout(10_000),
        });
      } catch (err: any) {
        return `ERROR: Cannot reach ${input.url} — ${err.message}. Is the x402 server running on port 4402?`;
      }

      // Already 200 — no payment needed
      if (initialResp.ok) {
        const data = await initialResp.json();
        return `SUCCESS (free endpoint):\n${JSON.stringify(data, null, 2)}`;
      }

      // Not 402 — unexpected error
      if (initialResp.status !== 402) {
        return `ERROR: Server returned ${initialResp.status} ${initialResp.statusText}`;
      }

      // Step 2: Parse 402 response
      let respBody: any;
      try {
        respBody = await initialResp.json();
      } catch {
        return `ERROR: Server returned 402 but response body was not valid JSON`;
      }

      const paymentDetails = respBody.payment_required;
      if (!paymentDetails) {
        return `ERROR: Server returned 402 but no payment_required field in body`;
      }

      const amountSol = parseFloat(paymentDetails.amount);
      console.log(`[FetchWithPayment] 402 — need ${amountSol} SOL → ${paymentDetails.recipient?.slice(0,8)}...`);

      // Step 3: Budget check
      let client: any, agentKeypair: any, vaultPda: any;
      try {
        const ctx = createAgentClient();
        client       = ctx.client;
        agentKeypair = ctx.agentKeypair;
        vaultPda     = loadVaultPda();
      } catch (setupErr: any) {
        return `SETUP ERROR: ${setupErr.message}`;
      }

      const state = await getVaultStateByAddress(client, vaultPda);
      if (!state)          return `ERROR: Vault not found. Cannot pay.`;
      if (state.isFrozen)  return `ERROR: Vault is frozen. Cannot pay.`;
      if (amountSol > state.remainingTodaySol) {
        return [
          `ERROR: Cannot pay — insufficient daily budget.`,
          `Required: ${amountSol} SOL`,
          `Remaining: ${state.remainingTodaySol.toFixed(4)} SOL`,
        ].join("\n");
      }

      // Step 4: Pay via vault
      let txSignature: string;
      if (DRY_RUN) {
        txSignature = `DRY_RUN_${Date.now()}`;
        console.log(`[FetchWithPayment] DRY RUN — skipping payment`);
        logTransaction({
          timestamp:        new Date().toISOString(),
          status:           "DRY_RUN",
          signature:        txSignature,
          amount_sol:       amountSol,
          recipient:        paymentDetails.recipient ?? "unknown",
          memo:             `x402: ${input.memo}`,
          remaining_budget: state.remainingTodaySol,
        });
      } else {
        try {
          const recipient = new PublicKey(paymentDetails.recipient);

          // Unstake if liquid balance is insufficient
          if (state.vaultBalanceSol < amountSol && state.stakedAmountSol > 0) {
            try {
              const { unstakeForSpend } = await import("@aegis/sdk");
              await unstakeForSpend(client, vaultPda, agentKeypair, amountSol);
              console.log(`[FetchWithPayment] Unstaked for payment`);
            } catch (unstakeErr: any) {
              return `ERROR: Could not unstake: ${unstakeErr.message}`;
            }
          }

          txSignature = await spend(client, vaultPda, agentKeypair, recipient, amountSol);
          console.log(`[FetchWithPayment] Payment tx: ${txSignature}`);

          logTransaction({
            timestamp:        new Date().toISOString(),
            status:           "SUCCESS",
            signature:        txSignature,
            amount_sol:       amountSol,
            recipient:        paymentDetails.recipient,
            memo:             `x402: ${input.memo}`,
            remaining_budget: Math.max(0, state.remainingTodaySol - amountSol),
          });
        } catch (payErr: any) {
          logTransaction({
            timestamp:  new Date().toISOString(),
            status:     "ERROR",
            signature:  "",
            amount_sol: amountSol,
            recipient:  paymentDetails.recipient ?? "unknown",
            memo:       `x402: ${input.memo}`,
            error:      payErr.message,
          });
          return `ERROR: Payment failed — ${payErr.message}`;
        }
      }

      // Step 5: Retry with payment proof
      const proof = {
        tx_signature: txSignature,
        payer: agentKeypair.publicKey.toBase58(),
        timestamp: new Date().toISOString(),
      };

      let paidResp: Response;
      try {
        paidResp = await fetch(input.url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "X-Payment-Proof": JSON.stringify(proof),
          },
          body: method === "POST" && input.body ? input.body : undefined,
          signal: AbortSignal.timeout(10_000),
        });
      } catch (err: any) {
        return `ERROR: Payment sent (${txSignature}) but retry failed — ${err.message}`;
      }

      if (!paidResp.ok) {
        const errBody = await paidResp.json().catch(() => ({})) as any;
        return [
          `ERROR: Payment sent but server rejected request.`,
          `Status: ${paidResp.status}`,
          `Reason: ${errBody.reason ?? errBody.error ?? "unknown"}`,
          `TX: ${txSignature}`,
        ].join("\n");
      }

      const result = await paidResp.json();

      return [
        `SUCCESS: API call completed with payment.`,
        `Paid: ${amountSol} SOL`,
        `TX: ${txSignature}`,
        DRY_RUN ? "" : `Solscan: https://solscan.io/tx/${txSignature}?cluster=devnet`,
        ``,
        `API Response:`,
        JSON.stringify(result, null, 2),
      ].filter(Boolean).join("\n");
    },
  });
}