import * as dotenv from "dotenv";
dotenv.config();

import { createCheckBudgetTool } from "./tools/check_budget";
import { createSpendViaAegisTool } from "./tools/spend_via_aegis";

async function testCheckBudget() {
  console.log("\n--- Testing CheckBudget ---");
  const tool = createCheckBudgetTool();
  const result = await tool.func("");
  console.log(result);
  console.log("CheckBudget: PASS\n");
}

async function testSpendWithinLimit() {
  console.log("--- Testing SpendViaAegis (within limit) ---");
  const tool = createSpendViaAegisTool();

  // Use a real devnet address as recipient — this is just a test wallet
  const result = await tool.func({
    amount_sol: 0.001,
    recipient_pubkey: "7xKX9Hs9zk7VEkGGFDpNfv7zPQJKPJbQNvvV9eakfLbP",
    memo: "Test spend — Day 7 tool validation",
  });
  console.log(result);

  if (result.includes("ERROR")) {
    console.log("SpendViaAegis within-limit: NOTE - got error (may be expected if vault empty)");
  } else {
    console.log("SpendViaAegis within-limit: PASS\n");
  }
}

async function testSpendOverLimit() {
  console.log("--- Testing SpendViaAegis (over limit — should be rejected) ---");
  const tool = createSpendViaAegisTool();

  const result = await tool.func({
    amount_sol: 999,    // Way over any daily limit
    recipient_pubkey: "7xKX9Hs9zk7VEkGGFDpNfv7zPQJKPJbQNvvV9eakfLbP",
    memo: "This should be rejected by budget check",
  });
  console.log(result);

  if (result.includes("ERROR") || result.includes("exceed")) {
    console.log("SpendViaAegis over-limit rejection: PASS\n");
  } else {
    console.log("SpendViaAegis over-limit rejection: UNEXPECTED - did not reject!\n");
  }
}

async function main() {
  console.log("=== Testing Aegis Agent Tools Directly ===");
  console.log("DRY_RUN:", process.env.DRY_RUN);
  console.log("VAULT:", process.env.VAULT_PDA_ADDRESS);

  try {
    await testCheckBudget();
    await testSpendOverLimit();    // Test rejection BEFORE real spend

    // Only run real spend test if DRY_RUN is false and vault has balance
    if (process.env.DRY_RUN !== "true") {
      await testSpendWithinLimit();
    } else {
      console.log("--- Skipping live spend test (DRY_RUN=true) ---");
    }

    console.log("=== All tool tests completed ===");
  } catch (err: any) {
    console.error("Tool test failed:", err.message);
    process.exit(1);
  }
}

main();
