import * as dotenv from "dotenv";
dotenv.config();

import { randomUUID } from "crypto";
import { runAgent } from "./agent";
import { logAgentRun } from "./logger";
import { startLogServer } from "./log_server";

// Task can come from:
// 1. CLI arg:  npx ts-node src/index.ts "Pay 0.01 SOL to  for..."
// 2. Env var:  AGENT_TASK="..." npx ts-node src/index.ts
// 3. Default hardcoded sample
const TASK =
  process.argv[2] ??
  process.env.AGENT_TASK ??
  "Check my vault budget. Then pay 0.005 SOL to address 7xKX9Hs9zk7VEkGGFDpNfv7zPQJKPJbQNvvV9eakfLbP as payment for compute services. Memo: 'API compute - batch-001'.";

async function main() {
  const runId = randomUUID().slice(0, 8);
  const startTs = Date.now();

  console.log("\n==============================");
  console.log(`[RUN ${runId}] Aegis Agent Starting`);
  console.log(`Task: ${TASK}`);
  console.log(`DRY_RUN: ${process.env.DRY_RUN === "true"}`);
  console.log("==============================\n");
  
  startLogServer();
  const result = await runAgent(TASK);
  const duration = Date.now() - startTs;

  // Write the run record to disk
  logAgentRun({
    run_id: runId,
    timestamp: new Date().toISOString(),
    task: TASK,
    success: result.success,
    output: result.output,
    steps: result.steps,
    duration_ms: duration,
    error: result.error,
  });

  // Pretty print the summary
  console.log("\n==============================");
  console.log(`[RUN ${runId}] COMPLETE (${duration}ms)`);
  console.log("------------------------------");
  console.log("Output:", result.output);

  if (result.steps.length > 0) {
    console.log("\nSteps taken:");
    result.steps.forEach((step, i) => {
      console.log(
        `  ${i + 1}. ${step.tool}(${JSON.stringify(step.input).slice(0, 80)}...)`
      );
      console.log(`     → ${step.output.slice(0, 100)}...`);
    });
  }

  if (!result.success) {
    console.error("\nAgent FAILED:", result.error);
    process.exit(1);
  }

  console.log("\nLogs written to:");
  console.log("  agent_tx_log.jsonl  — transaction history");
  console.log("  agent_run_log.jsonl — full run traces");
  console.log("==============================\n");
}

main();
