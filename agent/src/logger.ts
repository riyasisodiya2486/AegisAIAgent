import * as fs from "fs";
import * as path from "path";
import { broadcastLogEntry } from "./log_server";

const TX_LOG_FILE   = path.join(__dirname, "..", "agent_tx_log.jsonl");
const RUN_LOG_FILE  = path.join(__dirname, "..", "agent_run_log.jsonl");

// ── Transaction log (one entry per spend attempt) ─────────────────────────────
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

export function logTransaction(entry: TransactionLog): void {
  fs.appendFileSync(TX_LOG_FILE, JSON.stringify(entry) + "\n", "utf-8");
  broadcastLogEntry(entry);
  const icon =
    entry.status === "SUCCESS" ? "[OK]" :
    entry.status === "DRY_RUN" ? "[DRY]" : "[ERR]";

  console.log(
    `${icon} ${entry.timestamp} | ${entry.amount_sol} SOL → ` +
    `${entry.recipient.slice(0, 8)}... | ${entry.memo}`
  );
}

// ── Run log (one entry per full agent invocation) ─────────────────────────────
export interface AgentRunLog {
  run_id: string;
  timestamp: string;
  task: string;
  success: boolean;
  output: string;
  steps: Array<{
    tool: string;
    input: unknown;
    output: string;
    timestamp: string;
  }>;
  duration_ms: number;
  error?: string;
}

export function logAgentRun(entry: AgentRunLog): void {
  fs.appendFileSync(RUN_LOG_FILE, JSON.stringify(entry) + "\n", "utf-8");
  console.log(
    `\n[RUN ${entry.run_id}] ${entry.success ? "SUCCESS" : "FAILED"} ` +
    `in ${entry.duration_ms}ms | Steps: ${entry.steps.length}`
  );
}

// ── Readers (for API routes on Day 14) ────────────────────────────────────────
export function readTransactionLog(): TransactionLog[] {
  if (!fs.existsSync(TX_LOG_FILE)) return [];
  return fs
    .readFileSync(TX_LOG_FILE, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

export function readRunLog(): AgentRunLog[] {
  if (!fs.existsSync(RUN_LOG_FILE)) return [];
  return fs
    .readFileSync(RUN_LOG_FILE, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}


const TOOL_LOG_FILE = path.join(__dirname, "..", "agent_tool_log.jsonl");

export interface ToolCallLog {
  timestamp: string;
  tool: string;
  input: unknown;
  output: string;
  duration_ms: number;
  success: boolean;
}

export function logToolCall(entry: ToolCallLog): void {
  fs.appendFileSync(TOOL_LOG_FILE, JSON.stringify(entry) + "\n", "utf-8");
}

export function readToolLog(): ToolCallLog[] {
  if (!fs.existsSync(TOOL_LOG_FILE)) return [];
  return fs
    .readFileSync(TOOL_LOG_FILE, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}
