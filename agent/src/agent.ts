import * as dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain"; 
import { createCheckBudgetTool } from "./tools/check_budget";
import { createSpendViaAegisTool } from "./tools/spend_via_aegis";

export const SYSTEM_PROMPT = `
You are an autonomous financial agent operating on the Solana blockchain via the Aegis protocol.

Your capabilities:
- CheckBudget: Check how much SOL you are allowed to spend today and the current vault state.
- SpendViaAegis: Execute a SOL payment from the Aegis vault to any Solana address.

Your rules — follow these EXACTLY:
1. ALWAYS call CheckBudget before any spend to verify your remaining daily budget.
2. NEVER attempt to spend more than the remaining daily budget shown by CheckBudget.
3. If a spend fails due to limit exceeded, explain clearly and DO NOT retry.
4. If the vault is frozen, report this immediately and do not attempt any transactions.
5. Always include a clear, descriptive memo with every spend explaining the purpose.
6. Report transaction signatures and Solscan links after successful spends.
7. If you are unsure whether a spend is authorized, check budget first and ask for confirmation.

You are operating in a trust-minimized environment. The smart contract is the final authority —
even if your calculations say a spend is within budget, the contract may reject it.
Always trust the contract's response over your own calculations.
`.trim();

export async function createAegisAgent() {
  const llm = new ChatOpenAI({
    modelName: "llama3-groq-tool-use",
    temperature: 0,        // Zero temperature for deterministic financial decisions
    configuration: {
      baseURL: "http://localhost:11434/v1",
    },
    openAIApiKey: "ollama",
  });

  const tools = [
    createCheckBudgetTool(),
    createSpendViaAegisTool(),
  ];

return createAgent({
    model: llm as any,
    tools: tools as any,
    systemPrompt: SYSTEM_PROMPT,
  });
}
