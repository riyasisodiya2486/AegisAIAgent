import * as fs from "fs";
import * as path from "path";

const LOG_FILE = path.join(__dirname, "..", "agent_log.jsonl");

export interface TransactionLog {
  timestamp: string;
  status: "SUCCESS" | "DRY_RUN" | "ERROR";
  signature: string;
  amount_sol: number;
  recipient: string;
  memo: string;
  remaining_budget?: number;
  error?: string;
}

/**
 * Appends a structured JSON log entry to agent_log.jsonl.
 * Each line is a valid JSON object — easy to tail, stream, or parse.
 */
export function logTransaction(entry: TransactionLog): void {
  const line = JSON.stringify(entry) + "\n";
  fs.appendFileSync(LOG_FILE, line, "utf-8");

  // Also print to stdout so the terminal shows activity
  const icon = entry.status === "SUCCESS" ? "✓" : entry.status === "DRY_RUN" ? "~" : "✗";
  console.log(
    `[${entry.timestamp}] ${icon} ${entry.status} | ${entry.amount_sol} SOL → ${entry.recipient.slice(0, 8)}... | ${entry.memo}`
  );
}

/**
 * Reads and returns all log entries (for the frontend to display).
 */
export function readTransactionLog(): TransactionLog[] {
  if (!fs.existsSync(LOG_FILE)) return [];
  return fs
    .readFileSync(LOG_FILE, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}
