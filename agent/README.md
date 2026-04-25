# Aegis Agent

An autonomous AI agent that operates on the Solana blockchain via the Aegis protocol.
The agent can check its vault budget, make SOL payments, and autonomously pay for
HTTP API calls using the x402 payment protocol.

## Architecture

The agent calls Ollama locally using the native `/api/chat` endpoint with tool
definitions. It does NOT use the LangChain agent framework — it implements a direct
tool-calling loop for maximum compatibility with local LLMs.

## Tools

| Tool | Description |
|------|-------------|
| `CheckBudget` | Fetches current vault state — remaining daily budget, balances, yield |
| `SpendViaAegis` | Sends SOL from the vault. Smart contract enforces the daily limit on-chain |
| `FetchWithPayment` | Makes HTTP requests. Handles 402 responses by paying automatically |

## Prerequisites

- Ollama running locally: `ollama serve`
- Model pulled: `ollama pull llama3-groq-tool-use`
- Vault created and funded (run `cd ../sdk && npx ts-node src/smoke_test.ts`)

## Setup

1. Copy `.env.example` to `.env` and fill in all values
2. Install dependencies: `pnpm install`

## Running

\`\`\`bash
# Single task
npx ts-node --project tsconfig.json src/index.ts "Pay 0.01 SOL to ADDRESS for compute"

# Run all test scenarios
DRY_RUN=true npx ts-node --project tsconfig.json src/run_scenarios.ts

# Run a specific scenario
DRY_RUN=true npx ts-node --project tsconfig.json src/run_scenarios.ts happyPath

# Hero demo (requires x402 server running)
cd ../x402-server && npx ts-node src/server.ts &
DRY_RUN=false npx ts-node --project tsconfig.json src/run_scenarios.ts heroDemoX402
\`\`\`

## Log files

| File | Contents |
|------|----------|
| `agent_tx_log.jsonl` | One entry per spend transaction |
| `agent_run_log.jsonl` | One entry per full agent run with all steps |
| `agent_tool_log.jsonl` | One entry per individual tool call with timing |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VAULT_PDA_ADDRESS` | Yes | The Aegis vault PDA on devnet |
| `VAULT_OWNER_PUBKEY` | Yes | Owner wallet pubkey |
| `AGENT_PRIVATE_KEY` | Yes | Agent keypair base58 private key |
| `AGENT_PUBKEY` | Yes | Agent keypair public key |
| `OLLAMA_MODEL` | Yes | Ollama model name |
| `OLLAMA_BASE_URL` | Yes | Ollama API URL (default: http://localhost:11434) |
| `SOLANA_RPC_URL` | No | Devnet RPC (default: https://api.devnet.solana.com) |
| `DRY_RUN` | No | Set to `true` to skip real transactions |

## Security model

The agent keypair is a **restricted signer** — it can only call `spend` and
`unstakeForSpend` on the vault. It cannot withdraw funds, revoke itself, or change
the daily limit. All security invariants are enforced by the Solana smart contract,
not by this code. Even if the agent is compromised, an attacker can only spend up to
the daily limit before being blocked.
