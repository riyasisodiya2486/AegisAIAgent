import * as dotenv from "dotenv";
dotenv.config();

import { createCheckBudgetTool } from "./tools/check_budget";
import { createSpendViaAegisTool } from "./tools/spend_via_aegis";
import { createFetchWithPaymentTool } from "./tools/fetch_with_payment"; 

function validateEnv(): void {
  const required = [
    "VAULT_PDA_ADDRESS",
    "VAULT_OWNER_PUBKEY",
    "AGENT_PRIVATE_KEY",
    "OLLAMA_MODEL",
    "OLLAMA_BASE_URL",
  ];
  const missing = required.filter(
    (k) => !process.env[k] || process.env[k]!.trim() === ""
  );
  if (missing.length > 0) {
    throw new Error(
      `[Agent] Missing env vars: ${missing.join(", ")}\nFix agent/.env before running.`
    );
  }
}

export interface AgentStep {
  tool: string;
  input: unknown;
  output: string;
  timestamp: string;
}

export interface AgentRunResult {
  output: string;
  steps: AgentStep[];
  success: boolean;
  error?: string;
}

// Tool definitions in Ollama native format
const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "CheckBudget",
      description:
        "Checks the current Aegis vault state. Returns remaining daily budget in SOL, " +
        "liquid balance, staked amount, yield, and vault status. " +
        "ALWAYS call this before SpendViaAegis.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "SpendViaAegis",
      description:
        "Executes a SOL payment from the Aegis vault to a recipient. " +
        "The smart contract enforces the daily spending limit. " +
        "Always call CheckBudget first.",
      parameters: {
        type: "object",
        properties: {
          amount_sol: {
            type: "number",
            description: "Amount of SOL to spend (positive number)",
          },
          recipient_pubkey: {
            type: "string",
            description: "Base58 Solana public key of the payment recipient",
          },
          memo: {
            type: "string",
            description: "Reason for this payment",
          },
        },
        required: ["amount_sol", "recipient_pubkey", "memo"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "FetchWithPayment",
      description:
        "Makes an HTTP request to a paid API using x402 protocol. " +
        "If the server returns 402, automatically pays via the Aegis vault and retries. " +
        "Use for any URL that may require payment.",
      parameters: {
        type: "object",
        properties: {
          url:    { type: "string", description: "Full URL of the API endpoint" },
          method: { type: "string", description: "HTTP method: GET or POST", enum: ["GET","POST"] },
          body:   { type: "string", description: "JSON body string for POST requests (optional)" },
          memo:   { type: "string", description: "Reason for this API call" },
        },
        required: ["url", "memo"],
      },
    },
  },
];

const SYSTEM_PROMPT = `You are an autonomous financial agent for the Aegis protocol on Solana.

STRICT RULES — follow these exactly:
1. ALWAYS call CheckBudget FIRST before SpendViaAegis — no exceptions.
- FetchWithPayment: make an HTTP request to a paid API. If the server returns 402,
  automatically pay via the vault and retry. Use for any URL that may need payment.
2. Never spend more than the "Remaining today" shown by CheckBudget.
3. If CheckBudget returns VAULT NOT FOUND or FROZEN — stop, do not call SpendViaAegis.
4. If a spend is rejected — report it clearly, do not retry.
5. Always include a descriptive memo with every spend.
6. Report the transaction signature after every successful spend.`;

interface OllamaMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: Array<{
    function: { name: string; arguments: Record<string, unknown> };
  }>;
}

async function callOllama(messages: OllamaMessage[]): Promise<any> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model   = process.env.OLLAMA_MODEL    ?? "llama3-groq-tool-use";

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      tools: TOOL_DEFINITIONS,
      stream: false,
      options: { temperature: 0, num_ctx: 8192 },
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ollama API error ${response.status}: ${text}`);
  }

  return response.json();
}

async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  const checkBudgetTool = createCheckBudgetTool();
  const spendTool       = createSpendViaAegisTool();
  const fetchWithPaymentTool = createFetchWithPaymentTool();

  if (name === "CheckBudget")      return checkBudgetTool.func("");
  if (name === "SpendViaAegis")    return spendTool.func(JSON.stringify(args));
  if (name === "FetchWithPayment") return fetchWithPaymentTool.func(JSON.stringify(args));

  return `ERROR: Unknown tool: ${name}`;
}

export async function runAgent(
  task: string,
  _retryOnFailure = true
): Promise<AgentRunResult> {
  try {
    validateEnv();
  } catch (err: any) {
    return { output: err.message, steps: [], success: false, error: err.message };
  }

  const model   = process.env.OLLAMA_MODEL    ?? "llama3-groq-tool-use";
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  console.log(`[Agent] Model: ${model} @ ${baseUrl}`);

  // Check Ollama is reachable
  try {
    const healthResp = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!healthResp.ok) throw new Error("Ollama not responding");
  } catch {
    return {
      output: `Cannot reach Ollama at ${baseUrl}. Run: ollama serve`,
      steps: [],
      success: false,
      error: "Ollama not running",
    };
  }

  const messages: OllamaMessage[] = [
    { role: "system",  content: SYSTEM_PROMPT },
    { role: "user",    content: task },
  ];

  const steps: AgentStep[] = [];
  const MAX_ITERATIONS = 10;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    console.log(`\n[Agent] Iteration ${i + 1}/${MAX_ITERATIONS}`);

    let response: any;
    try {
      response = await callOllama(messages);
    } catch (err: any) {
      return {
        output: `Ollama call failed: ${err.message}`,
        steps,
        success: false,
        error: err.message,
      };
    }

    const assistantMessage = response.message;
    messages.push(assistantMessage);

    // No tool calls — model produced final answer
    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      console.log(`[Agent] Final answer received`);
      return {
        output:  assistantMessage.content ?? "Task completed.",
        steps,
        success: true,
      };
    }

    // Execute each tool call
    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = toolCall.function.arguments ?? {};

      console.log(`[Agent] Calling tool: ${toolName}`, JSON.stringify(toolArgs).slice(0, 100));

      const toolResult = await executeTool(toolName, toolArgs);

      console.log(`[Agent] Tool result: ${toolResult.slice(0, 200)}`);

      steps.push({
        tool:      toolName,
        input:     toolArgs,
        output:    toolResult,
        timestamp: new Date().toISOString(),
      });

      // Add tool result back to conversation
      messages.push({
        role:    "tool",
        content: toolResult,
      });
    }
  }

  // Reached max iterations — return what we have
  return {
    output:  "Max iterations reached. Task may be incomplete.",
    steps,
    success: steps.length > 0,
  };
}