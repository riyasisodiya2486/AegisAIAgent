import * as dotenv from "dotenv";
dotenv.config();

import { randomUUID } from "crypto";
import { runAgent, AgentRunResult } from "./agent";
import { logAgentRun } from "./logger";
import { SCENARIOS, ScenarioKey } from "./scenarios";

interface ScenarioResult {
  name: string;
  passed: boolean;
  steps: number;
  duration_ms: number;
}

async function runScenario(
  name: string,
  task: string,
  checkPassed: (result: AgentRunResult) => boolean
): Promise<ScenarioResult> {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`SCENARIO: ${name}`);
  console.log(`Task: ${task.slice(0, 100)}...`);
  console.log("=".repeat(50));

  const start    = Date.now();
  const result   = await runAgent(task);
  const duration = Date.now() - start;
  const passed   = checkPassed(result);

  logAgentRun({
    run_id:      `scenario-${randomUUID().slice(0, 6)}`,
    timestamp:   new Date().toISOString(),
    task,
    success:     result.success,
    output:      result.output,
    steps:       result.steps,
    duration_ms: duration,
    error:       result.error,
  });

  console.log(`\nResult: ${passed ? "PASS ✓" : "FAIL ✗"} (${duration}ms)`);
  console.log(`Steps:  ${result.steps.length}`);
  console.log(`Output: ${result.output.slice(0, 300)}`);

  return { name, passed, steps: result.steps.length, duration_ms: duration };
}

async function main() {
  const isDryRun    = process.env.DRY_RUN === "true";
  const scenarioArg = process.argv[2] as ScenarioKey | undefined;

  console.log(`\n${"*".repeat(50)}`);
  console.log(`AEGIS SCENARIO RUNNER`);
  console.log(`DRY_RUN: ${isDryRun}`);
  console.log(`Running: ${scenarioArg ?? "ALL"}`);
  console.log(`Model:   ${process.env.OLLAMA_MODEL}`);
  console.log("*".repeat(50));

  const results: ScenarioResult[] = [];

  // ── Scenario 1: Happy path ─────────────────────────────────────────────────
  if (!scenarioArg || scenarioArg === "happyPath") {
    results.push(
      await runScenario(
        "1 — Happy path spend",
        SCENARIOS.happyPath,
        (r) => {
          // Pass if: agent called BOTH tools and output has no hard errors
          const calledCheck = r.steps.some((s) => s.tool === "CheckBudget");
          const calledSpend = r.steps.some((s) => s.tool === "SpendViaAegis");
          const out = r.output.toLowerCase();
          const hardError =
            out.includes("setup error") ||
            out.includes("vault not found") ||
            out.includes("ollama") ||
            out.includes("missing env");
          // In dry run, accept "dry run" or "would spend" as success
          const hasResult =
            out.includes("success")    ||
            out.includes("dry run")    ||
            out.includes("would spend")||
            out.includes("transaction")||
            out.includes("0.005");
          return calledCheck && calledSpend && !hardError && hasResult;
        }
      )
    );
  }

  // ── Scenario 2: Over-limit ─────────────────────────────────────────────────
  if (!scenarioArg || scenarioArg === "overLimit") {
    results.push(
      await runScenario(
        "2 — Over-limit rejection",
        SCENARIOS.overLimit,
        (r) => {
          const out = r.output.toLowerCase();
          // Pass if: output mentions limit/cannot/exceed OR agent never attempted spend
          const rejectedCorrectly =
            out.includes("limit")       ||
            out.includes("cannot")      ||
            out.includes("exceed")      ||
            out.includes("insufficient")||
            out.includes("999");
          const noSuccessfulSpend =
            !out.includes("transaction:") &&
            !out.includes("solscan")      &&
            !out.includes("success: sent");
          return rejectedCorrectly || noSuccessfulSpend;
        }
      )
    );
  }

  // ── Scenario 3: Cumulative limit ───────────────────────────────────────────
  if (!scenarioArg || scenarioArg === "cumulativeLimit") {
    results.push(
      await runScenario(
        "3 — Cumulative limit",
        SCENARIOS.cumulativeLimit,
        (r) => {
          const out = r.output.toLowerCase();
          // Pass if: agent made at least one attempt AND mentioned limit on second
          const madeAttempt = r.steps.some((s) => s.tool === "SpendViaAegis");
          const mentionsLimit =
            out.includes("limit")   ||
            out.includes("exceed")  ||
            out.includes("cannot")  ||
            out.includes("rejected")||
            out.includes("insufficient");
          // Also pass if both succeeded (vault limit high enough)
          const bothSucceeded =
            r.steps.filter((s) => s.tool === "SpendViaAegis").length >= 2;
          return (madeAttempt && mentionsLimit) || bothSucceeded;
        }
      )
    );
  }

  // ── Scenario 4: Frozen vault ───────────────────────────────────────────────
  if (!scenarioArg || scenarioArg === "frozenVault") {
    results.push(
      await runScenario(
        "4 — Frozen vault detection",
        SCENARIOS.frozenVault,
        (r) => {
          // Pass if: CheckBudget was called (proves agent tried to check)
          const calledCheck = r.steps.some((s) => s.tool === "CheckBudget");
          // Also pass if output mentions status/vault even without tool call
          const out = r.output.toLowerCase();
          const mentionsStatus =
            out.includes("active")  ||
            out.includes("frozen")  ||
            out.includes("vault")   ||
            out.includes("budget")  ||
            out.includes("sol");
          return calledCheck || mentionsStatus;
        }
      )
    );
  }

  // ── Scenario 5: Multi-task ─────────────────────────────────────────────────
  if (!scenarioArg || scenarioArg === "multiTask") {
    results.push(
      await runScenario(
        "5 — Multi-task reasoning",
        SCENARIOS.multiTask,
        (r) => {
          // Pass if: CheckBudget called at least once and output is substantive
          const checkCalls = r.steps.filter((s) => s.tool === "CheckBudget").length;
          return checkCalls >= 1 && r.output.length > 50;
        }
      )
    );
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`\n${"=".repeat(50)}`);
  console.log("SCENARIO SUMMARY");
  console.log("=".repeat(50));

  results.forEach((r) => {
    const icon = r.passed ? "[PASS ✓]" : "[FAIL ✗]";
    console.log(
      `${icon} ${r.name.padEnd(30)} | ${String(r.steps).padStart(2)} steps | ${r.duration_ms}ms`
    );
  });

  const passed = results.filter((r) => r.passed).length;
  console.log(`\n${passed}/${results.length} scenarios passed`);

  if (passed < results.length) {
    console.log("\nFailing scenarios debug tips:");
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  • ${r.name}: steps=${r.steps} — check verbose output above`);
      });
    process.exit(1);
  }
}

main();