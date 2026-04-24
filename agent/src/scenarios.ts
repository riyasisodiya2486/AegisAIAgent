// Replace this pubkey with any valid devnet address for testing
const TEST_RECIPIENT = "7xKX9Hs9zk7VEkGGFDpNfv7zPQJKPJbQNvvV9eakfLbP";

export const SCENARIOS = {
  /**
   * Scenario 1 — Happy path: small spend within limit.
   * Expected: CheckBudget → SpendViaAegis → SUCCESS with tx signature.
   */
  happyPath: `
    Check my current vault budget, then pay exactly 0.005 SOL to address
    ${TEST_RECIPIENT} as payment for a completed compute task.
    Use memo: "Compute batch job #001 — completed successfully".
    Report the transaction signature when done.
  `.trim(),

  /**
   * Scenario 2 — Over-limit: single spend that exceeds daily cap.
   * Expected: CheckBudget → sees limit → SpendViaAegis rejected → graceful report.
   */
  overLimit: `
    Check my vault budget, then pay 999 SOL to address ${TEST_RECIPIENT}.
    Memo: "Large payment test".
    If you cannot complete the payment, explain why clearly.
  `.trim(),

  /**
   * Scenario 3 — Cumulative limit: two spends that together exceed the daily cap.
   * Set your vault daily limit to 0.01 SOL before running this test.
   * Expected: first spend succeeds, second spend is rejected by the contract.
   */
  cumulativeLimit: `
    I need you to make two payments:
    1. Pay 0.006 SOL to ${TEST_RECIPIENT}. Memo: "Payment 1 of 2".
    2. Then pay another 0.006 SOL to ${TEST_RECIPIENT}. Memo: "Payment 2 of 2".
    Check your budget before each payment. Report the result of each separately.
  `.trim(),

  /**
   * Scenario 4 — Frozen vault.
   * Manually call revokeAgent() before running this scenario.
   * Expected: CheckBudget detects frozen state → agent refuses to spend → clear report.
   */
  frozenVault: `
    Check my vault status and then try to pay 0.001 SOL to
    ${TEST_RECIPIENT}. Memo: "Test payment".
    If the vault is frozen or unavailable, explain what that means.
  `.trim(),

  /**
   * Scenario 5 — Multi-task reasoning with budget awareness.
   * Expected: CheckBudget → Spend 1 → CheckBudget again → Spend 2 only if budget allows.
   */
  multiTask: `
    I need to make two payments but only if the budget allows both.
    First check my current budget.
    If I have at least 0.012 SOL remaining:
      - Pay 0.005 SOL to ${TEST_RECIPIENT}. Memo: "Service fee - invoice #101".
      - Pay 0.005 SOL to ${TEST_RECIPIENT}. Memo: "Service fee - invoice #102".
    If budget is insufficient for both, pay only what fits within the limit
    and report what could not be paid and why.
    Check budget again between payments and report final remaining balance.
  `.trim(),

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
} as const;

export type ScenarioKey = keyof typeof SCENARIOS;
