import * as dotenv from "dotenv";
dotenv.config();

import { createAegisAgent, SYSTEM_PROMPT } from "./agent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// ── Sample tasks — change this to test different scenarios ────────────────────
const TASK = process.env.AGENT_TASK ??
  "Check my current budget, then pay 0.01 SOL to address 7xKX9Hs9zk7VEkGGFDpNfv7zPQJKPJbQNvvV9eakfLbP as payment for compute services. Use memo: 'API compute - batch job 001'.";

async function main() {
  console.log("\n=== Aegis AI Agent Starting ===");
  console.log("Task:", TASK);
  console.log("DRY_RUN:", process.env.DRY_RUN === "true");
  console.log("================================\n");

  const agent = await createAegisAgent();

  try {
    const result = await agent.invoke({
      messages: [new HumanMessage(TASK)],
    });

    // The executor returns the full list of messages; the last one is the AI response.
    const lastMessage = result.messages[result.messages.length - 1];

    console.log("\n=== Agent Output ===");
    console.log(lastMessage.content);

    //  Tool tracking works slightly differently in LangGraph
    // Check if any message in the history has tool_calls
    const toolCalls = result.messages.filter((m: any) => m.tool_calls?.length > 0);
    if (toolCalls.length > 0) {
      console.log("\n=== Tool Calls Made ===");
      toolCalls.forEach((m: any, i: number) => {
        m.tool_calls.forEach((tc: any) => {
          console.log(`\nTool: ${tc.name}`);
          console.log("Args:", JSON.stringify(tc.args, null, 2));
        });
      });
    }

  } catch (err: any) {
    console.error("\nAgent error:", err.message);
    process.exit(1);
  }
}

main();
