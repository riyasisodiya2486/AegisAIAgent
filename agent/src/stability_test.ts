import * as dotenv from "dotenv";
dotenv.config();

import { runAgent } from "./agent";
import { SCENARIOS } from "./scenarios";

const RUNS = 10;

async function main() {
  console.log(`\nRunning ${RUNS} consecutive agent loops (DRY_RUN=${process.env.DRY_RUN})...\n`);

  let passed = 0;
  let failed = 0;

  for (let i = 1; i <= RUNS; i++) {
    process.stdout.write(`Run ${String(i).padStart(2, "0")}/${RUNS}: `);
    const start  = Date.now();

    try {
      const result = await runAgent(SCENARIOS.happyPath);
      const ms     = Date.now() - start;
      const steps  = result.steps.length;

      if (result.success && steps > 0) {
        console.log(`OK  | ${steps} steps | ${ms}ms`);
        passed++;
      } else {
        console.log(`FAIL| ${steps} steps | ${ms}ms | ${result.output.slice(0, 60)}`);
        failed++;
      }
    } catch (err: any) {
      console.log(`ERR | ${err.message.slice(0, 60)}`);
      failed++;
    }

    // Small delay between runs to avoid rate-limiting the RPC
    if (i < RUNS) await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nResult: ${passed}/${RUNS} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
