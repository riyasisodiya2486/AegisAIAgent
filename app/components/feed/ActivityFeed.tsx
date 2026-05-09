"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentLogs } from "@/hooks/useAgentLogs";
import { TransactionRow } from "./TransactionRow";
import { AgentRunCard } from "./AgentRunCard";
import { RefreshCcw, Activity, Shield, Terminal, Zap } from "lucide-react";

type Tab = "transactions" | "runs";

export function ActivityFeed() {
  const { transactions, runs, connected, agentOnline, loading, refresh } = useAgentLogs();
  const [tab, setTab] = useState<Tab>("transactions");

  const isEmpty = tab === "transactions"
    ? transactions.length === 0
    : runs.length === 0;

  return (
    <div className="relative rounded-[2.5rem] border border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      
      {/* 1. Technical Header */}
      <div className="flex items-center justify-between px-8 py-7 border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 group-hover:border-blue-400/40 transition-colors">
            <Terminal size={16} className="text-blue-400" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/90">Protocol Activity</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`relative w-1.5 h-1.5 rounded-full ${
                connected ? "bg-blue-400 shadow-[0_0_10px_#60a5fa]" : "bg-white/10"
              }`}>
                {connected && (
                  <motion.span 
                    animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }} 
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} 
                    className="absolute inset-0 bg-blue-400 rounded-full" 
                  />
                )}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
                {connected ? "Neural Link Active" : agentOnline ? "Polling Uplink" : "Link Severed"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="group relative p-3 rounded-xl bg-blue-500/5 border border-white/5 text-white/30 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all active:scale-90"
        >
          <RefreshCcw size={14} className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"}`} />
        </button>
      </div>

      {/* 2. Magnetic Segmented Control (Tabs) */}
      <div className="p-3 bg-white/[0.01] border-b border-white/5">
        <div className="flex p-1.5 gap-1.5 bg-black/40 rounded-2xl relative border border-white/5">
          {(["transactions", "runs"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative flex-1 py-3 text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500 z-10 ${
                tab === t ? "text-white" : "text-white/20 hover:text-white/40"
              }`}
            >
              <span className="relative z-10 flex items-center justify-center gap-2.5">
                {t === "transactions" ? <Zap size={11} className={tab === t ? "text-blue-400" : ""} /> : <Activity size={11} className={tab === t ? "text-cyan-400" : ""} />}
                {t === "transactions" ? "Transactions" : "Agent Runs"}
                <span className={`text-[9px] transition-opacity ${tab === t ? "opacity-40" : "opacity-20"} tabular-nums`}>
                  ({t === "transactions" ? transactions.length : runs.length})
                </span>
              </span>
              
              {tab === t && (
                <motion.div
                  layoutId="active-tab-bg"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/10 rounded-[12px] z-0 border border-blue-500/30 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Dynamic Content Area */}
      <div className="relative max-h-[520px] overflow-y-auto custom-scrollbar min-h-[350px] bg-gradient-to-b from-transparent to-blue-500/[0.02]">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-24 flex flex-col items-center justify-center text-center px-12"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-500/10 blur-[50px] rounded-full" />
                <div className="relative p-7 rounded-[2rem] bg-white/[0.03] border border-white/10 group-hover:border-blue-500/20 transition-colors">
                  <Shield size={42} className="text-white/5 group-hover:text-blue-500/10 transition-colors" />
                </div>
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/50 mb-3">
                Zero Logs Detected
              </h4>
              <p className="text-[10px] text-white/20 font-mono leading-relaxed uppercase tracking-normal max-w-[280px]">
                {agentOnline
                  ? "Awaiting next blockchain state change. Protocol is in standby mode."
                  : "Bridge disconnect. Manual override required to re-establish node link."}
              </p>
              
              {!agentOnline && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 p-4 rounded-xl bg-black/60 border border-blue-500/10 group/code cursor-copy hover:border-blue-500/30 transition-all"
                >
                  <code className="text-[10px] text-blue-400/60 font-mono tracking-tight group-hover:text-blue-400 transition-colors">
                    $ aegis-node --connect-vault {tab.toUpperCase()}
                  </code>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={tab}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              className="divide-y divide-white/[0.03]"
            >
              {tab === "transactions" ? (
                transactions.map((tx, i) => (
                  <div key={`${tx.signature}-${i}`} className="hover:bg-blue-500/[0.03] transition-colors group/row">
                    <TransactionRow tx={tx} isNew={i === 0} />
                  </div>
                ))
              ) : (
                <div className="p-6 space-y-5">
                  {runs.map((run, i) => (
                    <AgentRunCard key={`${run.run_id}-${i}`} run={run} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Technical Footer */}
      {!isEmpty && (
        <div className="px-8 py-4 border-t border-white/5 bg-black/20">
          <div className="flex justify-between items-center">
             <p className="text-[9px] font-mono text-white/10 uppercase tracking-[0.2em]">
              {connected ? "Sync_Status: Websocket_Encrypted" : "Sync_Status: REST_Polling_Active"}
            </p>
            <div className="flex gap-1.5">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i} 
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                  className="w-1 h-1 rounded-full bg-blue-500/40" 
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}