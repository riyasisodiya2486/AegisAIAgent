import { PageShell } from "@/components/PageShell";

export default function AboutPage() {
  return (
    <PageShell>
      <div className="max-w-2xl mx-auto space-y-8 py-8">
        <div>
          <h1 className="text-3xl font-bold">About Aegis</h1>
          <p className="text-white/40 mt-2">
            Secure, yield-bearing smart contract vaults for autonomous AI agents.
          </p>
        </div>

        {[
          {
            title: "The Problem",
            body: "Autonomous AI agents increasingly need to transact on-chain — paying for APIs, compute, and services. But giving an LLM direct access to a funded wallet is a massive security risk. A single hallucination or prompt injection can drain funds instantly.",
          },
          {
            title: "The Solution",
            body: "Aegis deploys a Program Derived Address (PDA) smart contract vault on Solana. The human owner funds the vault and sets a daily spending limit. The AI agent gets restricted signing rights — it can spend up to the limit, but nothing more. The owner keeps a one-click kill switch.",
          },
          {
            title: "Yield on Idle Funds",
            body: "When the agent isn't spending, idle funds automatically earn yield through Kamino Finance integration. The Aegis protocol takes a 5% performance fee on yield — the rest goes to the vault owner.",
          },
          {
            title: "x402 Protocol",
            body: "Aegis integrates with the x402 HTTP payment protocol, allowing AI agents to autonomously pay for API access by responding to HTTP 402 responses with on-chain payment proofs.",
          },
          {
            title: "Legal Compliance",
            body: "Aegis is working with NeosLegal (Colosseum Frontier Hackathon sponsor) to structure the protocol appropriately. US users have yield features disabled pending regulatory clarity.",
          },
        ].map(({ title, body }) => (
          <div key={title} className="rounded-2xl border border-white/6 bg-white/3 p-6">
            <h2 className="font-semibold text-base mb-2">{title}</h2>
            <p className="text-sm text-white/45 leading-relaxed">{body}</p>
          </div>
        ))}

        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
          <p className="text-xs text-white/30">
            Built for the Solana Foundation Frontier Hackathon 2026.
            Aegis is experimental software. Not financial advice.
            Deployed on Solana Devnet.
          </p>
        </div>
      </div>
    </PageShell>
  );
}