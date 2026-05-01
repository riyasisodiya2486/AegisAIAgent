"use client";

import { useState } from "react";
import { useAgentLogs } from "@/hooks/useAgentLogs";
import { TransactionRow } from "./TransactionRow";
import { AgentRunCard } from "./AgentRunCard";

type Tab = "transactions" | "runs";

export function ActivityFeed() {
  const { transactions, runs, connected, agentOnline, loading, refresh } = useAgentLogs();
  const [tab, setTab] = useState<Tab>("transactions");

  const isEmpty = tab === "transactions"
    ? transactions.length === 0
    : runs.length === 0;

  return (
    <div className="rounded-2xl border border-white/6 bg-white/2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">Activity Feed</h3>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${
              connected    ? "bg-emerald-400 animate-pulse" :
              agentOnline  ? "bg-blue-400" : "bg-white/15"
            }`} />
            <span className="text-[10px] text-white/25">
              {connected ? "Live" : agentOnline ? "Polling" : "Agent offline"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/20">
            {tab === "transactions" ? transactions.length : runs.length} entries
          </span>
          <button
            onClick={refresh}
            className="w-7 h-7 rounded-lg bg-white/4 hover:bg-white/8 flex items-center justify-center text-white/30 hover:text-white/55 transition-all text-xs"
          >↻</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {(["transactions", "runs"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "flex-1 py-2.5 text-xs font-medium transition-all",
              tab === t
                ? "text-white border-b-2 border-violet-500"
                : "text-white/30 hover:text-white/50",
            ].join(" ")}
          >
            {t === "transactions" ? "Transactions" : "Agent Runs"}
            {t === "transactions" && transactions.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-violet-500/18 text-violet-300 text-[10px]">
                {transactions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-h-[480px] overflow-y-auto">
        {isEmpty ? (
          <div className="py-14 text-center space-y-3">
            <div className="text-3xl">{tab === "transactions" ? "💸" : "🤖"}</div>
            <div>
              <p className="text-sm text-white/35 font-medium">
                {tab === "transactions" ? "No transactions yet" : "No agent runs yet"}
              </p>
              <p className="text-xs text-white/20 mt-1">
                {agentOnline
                  ? "Agent is online but has no activity yet."
                  : "Start the agent to see activity here."}
              </p>
            </div>
            {!agentOnline && (
              <div className="inline-block mx-auto px-4 py-2 rounded-xl bg-white/3 border border-white/6">
                <code className="text-[11px] text-white/25">
                  cd agent && npx ts-node src/index.ts
                </code>
              </div>
            )}
          </div>
        ) : tab === "transactions" ? (
          <div className="divide-y divide-white/3">
            {transactions.map((tx, i) => (
              <TransactionRow key={`${tx.signature}-${i}`} tx={tx} isNew={i === 0} />
            ))}
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {runs.map((run, i) => (
              <AgentRunCard key={`${run.run_id}-${i}`} run={run} />
            ))}
          </div>
        )}
      </div>

      {!isEmpty && (
        <div className="px-5 py-2 border-t border-white/4">
          <p className="text-[10px] text-white/15 text-center">
            {connected ? "WebSocket live" : "Polling every 15s · Start agent to enable live updates"}
          </p>
        </div>
      )}
    </div>
  );
}