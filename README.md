# Aegis — AI Agent Vaults on Solana

> Secure, yield-bearing smart contract vaults for autonomous AI agents.
> Built for the Solana Frontier Hackathon 2026.

**Live Demo:** https://aegis-ai-agent-app.vercel.app/
**Demo Video:** [YouTube link — see below]
**GitHub:** https://github.com/riyasisodiya2486/AegisAIAgent

---

## What is Aegis

AI agents increasingly need to transact on-chain. But giving an agent
unrestricted wallet access is dangerous — a single hallucination can
drain funds instantly. Aegis deploys a PDA vault with a hard daily
spending limit enforced by the smart contract, not application code.

## Key Features

- **Daily spend limits** — enforced on-chain, cannot be bypassed
- **Kill switch** — freeze agent in one block (~400ms)
- **Yield on idle funds** — idle SOL earns 8% APY
- **x402 payments** — agent pays HTTP 402 responses autonomously
- **Real-time dashboard** — onAccountChange WebSocket subscriptions

## Running Locally (Full Demo)

```bash
# 1. Start local validator
solana-test-validator --quiet --bind-address 0.0.0.0 --rpc-port 8899

# 2. Deploy program
cd programs && anchor deploy --provider.cluster localnet

# 3. Airdrop SOL
solana airdrop 5 YOUR_PHANTOM_ADDRESS --url localhost

# 4. Start frontend
cd ../app && npm run dev

# 5. Open http://localhost:3000
#    Connect Phantom (custom RPC: http://localhost:8899)
#    Create vault → deposit → run agent
```

## Running the Agent

```bash
cd agent
cp .env.example .env   # fill in your values

# Run all scenarios
DRY_RUN=false npx ts-node --project tsconfig.json src/run_scenarios.ts
```

## Architecture

```
Human Owner (Phantom)     Vault PDA (Anchor/Rust)     AI Agent (Ollama)
      │                          │                          │
      ├── deposit()              │                          │
      ├── update_limit()   ──────┤                          │
      ├── revoke_agent()         │                          │
      └── withdraw()             │         ├── spend() (up to limit)
                                 │         └── x402 payments
```

## Program ID

```
EnAS1LC6Rgj993Zt16LwYYSNFWEgRL4VbnarbyRQATAQ
```
Note: Program deployed on localnet for the demo video.
Devnet deployment pending SOL availability.

## Stack

- Smart contract: Anchor 0.30 / Rust
- SDK: TypeScript
- Agent: LangChain + Ollama (llama3-groq-tool-use)
- Frontend: Next.js 14 + Tailwind + shadcn/ui
- Payment: x402 protocol

## License

MIT — Experimental software, not audited, not for mainnet.
