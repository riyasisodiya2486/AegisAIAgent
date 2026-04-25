import { AgentRunResult } from "./agent";

/**
 * Prints a clean dry-run summary to stdout.
 * Called at the end of every dry-run agent execution.
 */
export function printDryRunReport(result: AgentRunResult, task: string): void {
  const border = "─".repeat(50);

  console.log(`\n${border}`);
  console.log("DRY RUN REPORT");
  console.log(border);
  console.log(`Task: ${task.slice(0, 100)}`);
  console.log(`Steps taken: ${result.steps.length}`);
  console.log(`Success: ${result.success}`);

  if (result.steps.length > 0) {
    console.log(`\nTool calls:`);
    result.steps.forEach((step, i) => {
      const inputStr = JSON.stringify(step.input).slice(0, 120);
      const outputPreview = step.output.slice(0, 150).replace(/\n/g, " ");
      console.log(`  ${i + 1}. [${step.tool}]`);
      console.log(`     Input:  ${inputStr}`);
      console.log(`     Output: ${outputPreview}`);
    });
  }

  // Extract would-spend amounts from DRY_RUN tool outputs
  const spendSteps = result.steps.filter(s => s.tool === "SpendViaAegis");
  const fetchSteps = result.steps.filter(s => s.tool === "FetchWithPayment");

  if (spendSteps.length > 0 || fetchSteps.length > 0) {
    console.log(`\nSimulated payments:`);
    [...spendSteps, ...fetchSteps].forEach(step => {
      const amountMatch = step.output.match(/([0-9.]+)\s*SOL/);
      const amount = amountMatch ? amountMatch[1] : "unknown";
      console.log(`  • ${step.tool}: ${amount} SOL [NOT SENT — dry run]`);
    });
  }

  console.log(`\nFinal answer:`);
  console.log(result.output);
  console.log(`${border}\n`);
}
