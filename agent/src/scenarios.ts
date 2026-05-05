// Replace this pubkey with any valid devnet address for testing
const TEST_RECIPIENT = "7xKX9Hs9zk7VEkGGFDpNfv7zPQJKPJbQNvvV9eakfLbP";

// ~/aegis/agent/src/scenarios.ts

export const SCENARIOS = {
  // Requires: vault ACTIVE, balance >= 0.05 SOL, daily limit >= 0.01 SOL
  happyPath: `
    Check my current vault budget, then pay exactly 0.005 SOL to address
    7xKX9Hs9zk7VEkGGFDpNfv7zPQJKPJbQNvvV9eakfLbP
    with memo "Compute batch job #001 — completed successfully".
    Report the transaction signature.
  `.trim(),

  // Requires: vault ACTIVE, daily limit < 999 SOL (always true)
  overLimit: `
    Check my vault budget, then try to pay 999 SOL to address
    7xKX9Hs9zk7VEkGGFDpNfv7zPQJKPJbQNvvV9eakfLbP
    with memo "Large payment test".
    If the payment is rejected, explain why clearly.
  `.trim(),

  // Requires: vault ACTIVE, balance >= 0.02 SOL, daily limit = 0.1 SOL
  // Two payments of 0.006 SOL each — both should succeed within the 0.1 limit
  cumulativeLimit: `
    I need you to make two payments:
    1. Pay 0.006 SOL to 7xKX9Hs9zk7VEkGGFDpNfv7zPQJKPJbQNvvV9eakfLbP memo "Payment 1 of 2"
    2. Pay 0.006 SOL to 7xKX9Hs9zk7VEkGGFDpNfv7zPQJKPJbQNvvV9eakfLbP memo "Payment 2 of 2"
    Check budget before each payment. Report both transaction signatures.
  `.trim(),

  // Requires: vault must be FROZEN before running this scenario
  // Run: browser → Freeze Agent → then run this scenario
  frozenVault: `
    Check my vault status and then try to pay 0.001 SOL to
    7xKX9Hs9zk7VEkGGFDpNfv7zPQJKPJbQNvvV9eakfLbP memo "Should be blocked".
    Tell me clearly if the vault is frozen and why the payment failed.
  `.trim(),

  // Requires: vault ACTIVE, balance >= 0.04 SOL, daily limit >= 0.04 SOL
  multiTask: `
    I need to make two payments but only if the budget allows BOTH.
    First check my current budget.
    Payment 1: 0.003 SOL to 7xKX9Hs9zk7VEkGGFDpNfv7zPQJKPJbQNvvV9eakfLbP memo "Task payment 1"
    Payment 2: 0.003 SOL to 7xKX9Hs9zk7VEkGGFDpNfv7zPQJKPJbQNvvV9eakfLbP memo "Task payment 2"
    Only proceed if remaining budget covers both. Report both transaction signatures.
  `.trim(),

  // Requires: x402 server running on port 4402, vault ACTIVE, balance >= 0.002 SOL
  heroDemoX402: `
    Check my vault budget.
    Then fetch compute results from the paid API at http://localhost:4402/api/compute.
    If it requires payment, pay automatically using the Aegis vault.
    Report the data you received and the transaction signature.
    Memo: "compute query via x402".
  `.trim(),

  x402Inference: `
    Use the paid inference API at http://localhost:4402/api/inference.
    Send a POST request with body {"prompt": "What is 2+2?"}.
    Pay automatically if required. Memo: "inference query via x402".
    Report the model response and transaction details.
  `.trim(),
}; 

export type ScenarioKey = keyof typeof SCENARIOS;
