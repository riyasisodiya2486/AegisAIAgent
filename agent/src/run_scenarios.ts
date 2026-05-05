// ~/aegis/agent/src/run_scenarios.ts

import * as dotenv from "dotenv";
dotenv.config();

import { runAgent, AgentRunResult } from "./agent";
import { SCENARIOS } from "./scenarios";
import { startLogServer } from "./log_server";
import { logAgentRun } from "./logger";

// ── Types ─────────────────────────────────────────────────────────────────

interface ScenarioResult {
  name:       string;
  passed:     boolean;
  steps:      number;
  durationMs: number;
  output:     string;
  reason:     string;   // why it passed or failed
}

// ── Strict validation helpers ──────────────────────────────────────────────

function hasSuccessfulSpend(r: AgentRunResult): boolean {
  return r.steps.some(
    s => s.tool === "SpendViaAegis" && String(s.output).includes("SUCCESS")
  );
}

function hasSpendError(r: AgentRunResult, errorType: string): boolean {
  return r.steps.some(
    s => s.tool === "SpendViaAegis" && String(s.output).includes(errorType)
  );
}

function countSuccessfulSpends(r: AgentRunResult): number {
  return r.steps.filter(
    s => s.tool === "SpendViaAegis" && String(s.output).includes("SUCCESS")
  ).length;
}

function spendWasAttempted(r: AgentRunResult): boolean {
  return r.steps.some(s => s.tool === "SpendViaAegis");
}

function checkBudgetWasCalled(r: AgentRunResult): boolean {
  return r.steps.some(s => s.tool === "CheckBudget");
}

function vaultIsFrozenInOutput(r: AgentRunResult): boolean {
  const checkStep = r.steps.find(s => s.tool === "CheckBudget");
  return checkStep ? String(checkStep.output).includes("FROZEN") : false;
}

function fetchWithPaymentWasCalled(r: AgentRunResult): boolean {
  return r.steps.some(s => s.tool === "FetchWithPayment");
}

function fetchWithPaymentSucceeded(r: AgentRunResult): boolean {
  return r.steps.some(
    s => s.tool === "FetchWithPayment" && String(s.output).includes("SUCCESS")
  );
}

// ── Runner ────────────────────────────────────────────────────────────────

async function runScenario(
  name: string,
  task: string,
  validate: (r: AgentRunResult) => { passed: boolean; reason: string }
): Promise<ScenarioResult> {
  const divider = "=".repeat(50);
  console.log(`\n${divider}`);
  console.log(`SCENARIO: ${name}`);
  console.log(`Task: ${task.slice(0, 80)}...`);
  console.log(`${divider}`);

  const start  = Date.now();
  const result = await runAgent(task);
  const ms     = Date.now() - start;

  logAgentRun({
    run_id:     `scenario-${Math.random().toString(36).slice(2, 8)}`,
    timestamp:  new Date().toISOString(),
    task,
    success:    result.success,
    output:     result.output,
    steps:      result.steps,
    duration_ms: ms,
    error:      result.error,
  });

  const { passed, reason } = validate(result);

  const icon = passed ? "PASS ✓" : "FAIL ✗";
  console.log(`\n[RUN] ${icon} (${ms}ms)`);
  console.log(`Steps:  ${result.steps.length}`);
  console.log(`Reason: ${reason}`);
  console.log(`Output: ${result.output.slice(0, 200)}`);

  return { name, passed, steps: result.steps.length, durationMs: ms, output: result.output, reason };
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  startLogServer();

  const scenarioArg = process.argv[2];
  const dryRun      = process.env.DRY_RUN === "true";

  console.log("\n" + "*".repeat(50));
  console.log("AEGIS SCENARIO RUNNER");
  console.log(`DRY_RUN: ${dryRun}`);
  console.log(`Running: ${scenarioArg ?? "ALL"}`);
  console.log(`Model:   ${process.env.OLLAMA_MODEL ?? "llama3-groq-tool-use"}`);
  console.log("*".repeat(50));

  const results: ScenarioResult[] = [];

  // ── Scenario 1: Happy path ───────────────────────────────────────────────
  if (!scenarioArg || scenarioArg === "happyPath") {
    results.push(await runScenario(
      "1 — Happy path spend",
      SCENARIOS.happyPath,
      (r) => {
        if (!checkBudgetWasCalled(r)) {
          return { passed: false, reason: "CheckBudget was never called" };
        }
        if (!spendWasAttempted(r)) {
          return { passed: false, reason: "SpendViaAegis was never called" };
        }
        if (!hasSuccessfulSpend(r)) {
          const spendStep = r.steps.find(s => s.tool === "SpendViaAegis");
          const err = spendStep ? String(spendStep.output).slice(0, 100) : "unknown";
          return { passed: false, reason: `Spend failed: ${err}` };
        }
        const txStep = r.steps.find(
          s => s.tool === "SpendViaAegis" && String(s.output).includes("Transaction:")
        );
        if (!txStep) {
          return { passed: false, reason: "No transaction signature in output" };
        }
        return { passed: true, reason: "CheckBudget called + spend succeeded with tx signature" };
      }
    ));
  }

  // ── Scenario 2: Over-limit rejection ────────────────────────────────────
  if (!scenarioArg || scenarioArg === "overLimit") {
    results.push(await runScenario(
      "2 — Over-limit rejection",
      SCENARIOS.overLimit,
      (r) => {
        if (!checkBudgetWasCalled(r)) {
          return { passed: false, reason: "CheckBudget was never called" };
        }
        // STRICT: the agent must NOT have successfully sent 999 SOL
        if (hasSuccessfulSpend(r)) {
          return { passed: false, reason: "CRITICAL: Agent sent 999 SOL — limit enforcement failed" };
        }
        // The agent should have either:
        // a) called SpendViaAegis and got a rejection
        // b) decided NOT to call SpendViaAegis after seeing the budget
        const spendStep = r.steps.find(s => s.tool === "SpendViaAegis");
        if (spendStep) {
          const out = String(spendStep.output);
          if (out.includes("exceeds daily budget") || out.includes("Insufficient")) {
            return { passed: true, reason: "Spend correctly rejected by limit check" };
          }
          return { passed: false, reason: `Unexpected spend result: ${out.slice(0, 80)}` };
        }
        // Agent decided not to attempt the spend — also acceptable
        const outputLower = r.output.toLowerCase();
        if (
          outputLower.includes("exceed") ||
          outputLower.includes("not enough") ||
          outputLower.includes("insufficient") ||
          outputLower.includes("cannot") ||
          outputLower.includes("limit")
        ) {
          return { passed: true, reason: "Agent correctly refused to attempt over-limit payment" };
        }
        return {
          passed: false,
          reason: `Agent output does not mention budget limit. Output: ${r.output.slice(0, 100)}`
        };
      }
    ));
  }

  // ── Scenario 3: Cumulative limit ─────────────────────────────────────────
  if (!scenarioArg || scenarioArg === "cumulativeLimit") {
    results.push(await runScenario(
      "3 — Cumulative limit",
      SCENARIOS.cumulativeLimit,
      (r) => {
        if (!checkBudgetWasCalled(r)) {
          return { passed: false, reason: "CheckBudget was never called" };
        }
        const successCount = countSuccessfulSpends(r);
        if (successCount < 2) {
          // Check if second was blocked by limit (cumulative test)
          const spendSteps = r.steps.filter(s => s.tool === "SpendViaAegis");
          const firstOk   = spendSteps[0] && String(spendSteps[0].output).includes("SUCCESS");
          const secondErr = spendSteps[1] && (
            String(spendSteps[1].output).includes("exceeds") ||
            String(spendSteps[1].output).includes("limit")
          );
          if (firstOk && secondErr) {
            return { passed: true, reason: "First payment succeeded, second correctly blocked by limit" };
          }
          if (successCount === 0) {
            return { passed: false, reason: "Neither payment succeeded" };
          }
          return {
            passed: false,
            reason: `Only ${successCount}/2 payments succeeded and second was not blocked by limit`
          };
        }
        return { passed: true, reason: `Both payments succeeded (${successCount}/2 confirmed)` };
      }
    ));
  }

  // ── Scenario 4: Frozen vault ──────────────────────────────────────────────
  if (!scenarioArg || scenarioArg === "frozenVault") {
    results.push(await runScenario(
      "4 — Frozen vault detection",
      SCENARIOS.frozenVault,
      (r) => {
        if (!checkBudgetWasCalled(r)) {
          return { passed: false, reason: "CheckBudget was never called" };
        }
        // STRICT: vault must actually be frozen for this test to be meaningful
        if (!vaultIsFrozenInOutput(r)) {
          return {
            passed: false,
            reason: "Vault is ACTIVE — freeze the vault in the browser first, then run this scenario"
          };
        }
        // Spend must NOT have succeeded on a frozen vault
        if (hasSuccessfulSpend(r)) {
          return { passed: false, reason: "CRITICAL: Payment succeeded on a frozen vault" };
        }
        // Agent should have reported the frozen state
        const outputLower = r.output.toLowerCase();
        if (outputLower.includes("frozen") || outputLower.includes("revoked") || outputLower.includes("cannot")) {
          return { passed: true, reason: "Vault correctly detected as frozen, payment blocked" };
        }
        return { passed: false, reason: "Agent did not clearly report the frozen state" };
      }
    ));
  }

  // ── Scenario 5: Multi-task reasoning ─────────────────────────────────────
  if (!scenarioArg || scenarioArg === "multiTask") {
    results.push(await runScenario(
      "5 — Multi-task reasoning",
      SCENARIOS.multiTask,
      (r) => {
        if (!checkBudgetWasCalled(r)) {
          return { passed: false, reason: "CheckBudget was never called" };
        }
        const successCount = countSuccessfulSpends(r);
        // If budget allows both — both should succeed
        if (successCount === 2) {
          return { passed: true, reason: "Both conditional payments executed successfully" };
        }
        // If budget was insufficient for both — agent should have made zero payments
        if (successCount === 0 && !spendWasAttempted(r)) {
          const outputLower = r.output.toLowerCase();
          if (outputLower.includes("cannot") || outputLower.includes("budget") || outputLower.includes("insufficient")) {
            return { passed: true, reason: "Agent correctly decided not to pay when budget was insufficient" };
          }
        }
        // Partial: 1 of 2 — only acceptable if second was over limit
        if (successCount === 1) {
          return {
            passed: false,
            reason: "Only 1/2 payments made — either both should succeed or neither (conditional logic)"
          };
        }
        return {
          passed: false,
          reason: `Unexpected state: ${successCount} successful spends, ${r.steps.length} total steps`
        };
      }
    ));
  }

  // ── Scenario 6: Hero demo x402 ───────────────────────────────────────────
  if (!scenarioArg || scenarioArg === "heroDemoX402") {
    results.push(await runScenario(
      "6 — Hero demo x402",
      SCENARIOS.heroDemoX402,
      (r) => {
        if (!checkBudgetWasCalled(r)) {
          return { passed: false, reason: "CheckBudget was never called" };
        }
        if (!fetchWithPaymentWasCalled(r)) {
          return { passed: false, reason: "FetchWithPayment was never called" };
        }
        const fetchStep = r.steps.find(s => s.tool === "FetchWithPayment");
        const fetchOut  = fetchStep ? String(fetchStep.output) : "";
        if (fetchOut.includes("Is the x402 server running")) {
          return {
            passed: false,
            reason: "x402 server is not running — start it: cd x402-server && npx ts-node src/server.ts"
          };
        }
        if (!fetchWithPaymentSucceeded(r)) {
          return {
            passed: false,
            reason: `FetchWithPayment failed: ${fetchOut.slice(0, 100)}`
          };
        }
        return { passed: true, reason: "x402 payment flow completed — budget checked, API paid, data received" };
      }
    ));
  }

  // ── Scenario 7: x402 inference ───────────────────────────────────────────
  if (!scenarioArg || scenarioArg === "x402Inference") {
    results.push(await runScenario(
      "7 — x402 inference",
      SCENARIOS.x402Inference,
      (r) => {
        if (!fetchWithPaymentWasCalled(r)) {
          return { passed: false, reason: "FetchWithPayment was never called" };
        }
        const fetchStep = r.steps.find(s => s.tool === "FetchWithPayment");
        const fetchOut  = fetchStep ? String(fetchStep.output) : "";
        if (fetchOut.includes("Is the x402 server running")) {
          return {
            passed: false,
            reason: "x402 server is not running — start it first"
          };
        }
        if (!fetchWithPaymentSucceeded(r)) {
          return { passed: false, reason: `Inference call failed: ${fetchOut.slice(0, 100)}` };
        }
        return { passed: true, reason: "x402 inference paid and completed successfully" };
      }
    ));
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const passed = results.filter(r => r.passed).length;
  const total  = results.length;

  console.log("\n" + "=".repeat(50));
  console.log("SCENARIO SUMMARY");
  console.log("=".repeat(50));

  results.forEach(r => {
    const icon = r.passed ? "PASS ✓" : "FAIL ✗";
    console.log(`[${icon}] ${r.name.padEnd(30)} | ${r.steps} steps | ${r.durationMs}ms`);
    if (!r.passed) {
      console.log(`        Reason: ${r.reason}`);
    }
  });

  console.log(`\n${passed}/${total} scenarios passed`);

  if (passed < total) {
    console.log("\nFailing scenario fix guide:");
    results.filter(r => !r.passed).forEach(r => {
      console.log(`\n  ✗ ${r.name}`);
      console.log(`    ${r.reason}`);

      if (r.reason.includes("x402 server")) {
        console.log("    Fix: cd ~/aegis/x402-server && npx ts-node src/server.ts");
      }
      if (r.reason.includes("freeze") || r.reason.includes("ACTIVE")) {
        console.log("    Fix: go to browser → vault page → Danger Zone → Freeze Agent → type FREEZE");
      }
      if (r.reason.includes("Insufficient") || r.reason.includes("balance")) {
        console.log("    Fix: deposit more SOL via browser vault page");
      }
      if (r.reason.includes("999 SOL") || r.reason.includes("limit enforcement")) {
        console.log("    Fix: CRITICAL — daily limit is not being enforced. Check smart contract.");
      }
    });

    process.exit(1);
  }
}

main().catch(err => {
  console.error("[FATAL]", err);
  process.exit(1);
});