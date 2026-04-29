"use client";

import { useState } from "react";
import { useAgentLogs } from "@/hooks/useAgentLogs";
import { TransactionRow } from "./TransactionRow";
import { AgentRunCard } from "./AgentRunCard";

type Tab = "transactions" | "runs";

export function ActivityFeed() {
  const { transactions, runs, connected, loading, refresh } = useAgentLogs();
  const [tab, setTab] = useState<Tab>("transactions");

  const isEmpty =
    tab === "transactions" ? transactions.length === 0 : runs.length === 0;

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white tracking-tight">
            Activity Feed
          </h3>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
            <div className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
              {connected ? "Live" : "Polling"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-white/20">
            {tab === "transactions" ? transactions.length : runs.length} entries
          </span>
          <button 
            onClick={refresh}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 transition-colors"
          >
            <span className="block hover:rotate-180 transition-transform duration-500">↻</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-6 border-b border-white/5">
        {(["transactions", "runs"] as Tab[]).map(t => (
          <button
            key={`tab-${t}`} // Improved key
            onClick={() => setTab(t)}
            className={`relative flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
              tab === t ? "text-violet-400" : "text-white/30 hover:text-white/50"
            }`}
          >
            {t === "transactions" ? "Transactions" : "Agent Runs"}
            {tab === t && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {loading && isEmpty ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={`skeleton-${i}`} className="h-24 w-full bg-white/5 rounded-2xl border border-white/5" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-white/5 text-2xl mb-4 border border-white/5">
              {tab === "transactions" ? "💸" : "🤖"}
            </div>
            <h4 className="text-white font-medium mb-1">
              {tab === "transactions" ? "No transactions yet" : "No agent runs yet"}
            </h4>
            <p className="text-sm text-white/30 max-w-[240px] mb-8">
              {tab === "transactions"
                ? "Run the agent to see transactions appear here in real time."
                : "Agent run logs will appear here when the agent is active."}
            </p>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg blur opacity-20" />
              <code className="relative block p-3 rounded-lg bg-black border border-white/10 text-[10px] font-mono text-violet-300">
                DRY_RUN=false npx ts-node src/index.ts
              </code>
            </div>
          </div>
        ) : tab === "transactions" ? (
          <div className="space-y-3">
            {transactions.map((tx, i) => {
              // Ensure key is unique even if signatures are identical/missing
              const txKey = tx.signature ? `tx-${tx.signature}-${i}` : `tx-fallback-${i}`;
              return <TransactionRow key={txKey} tx={tx} isNew={i === 0} />;
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {runs.map((run, i) => {
              // Ensure key is unique for agent runs
              const runKey = run.run_id ? `run-${run.run_id}-${i}` : `run-fallback-${i}`;
              return <AgentRunCard key={runKey} run={run} />;
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isEmpty && (
        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-medium text-white/20 uppercase tracking-tighter">
            Showing last {tab === "transactions" ? transactions.length : runs.length} entries
          </span>
          <span className="text-[10px] font-mono text-white/20">
            {connected ? "STABLE_WS_CONNECTED" : "FALLBACK_POLLING_ACTIVE"}
          </span>
        </div>
      )}
    </div>
  );
}