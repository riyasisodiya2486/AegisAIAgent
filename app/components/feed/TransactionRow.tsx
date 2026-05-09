"use client";

import { TransactionLog } from "@/hooks/useAgentLogs";
import { explorerTxUrl } from "@/components/TxButton";
import { ExternalLink } from "lucide-react";

interface Props {
  tx: TransactionLog;
  isNew?: boolean;
}

const STATUS_CONFIG = {
  SUCCESS: {
    icon: "✓",
    iconBg: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
    label: "Settled",
  },
  DRY_RUN: {
    icon: "~",
    iconBg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    label: "Simulated",
  },
  ERROR: {
    icon: "✗",
    iconBg: "bg-red-500/15 text-red-400 border-red-500/20",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    label: "Reverted",
  },
} as const;

function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDate(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function TransactionRow({ tx, isNew }: Props) {
  const cfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.ERROR;

  return (
    <div className={`group flex items-start gap-5 p-5 rounded-[1.5rem] border border-white/5 bg-white/[0.01] transition-all duration-300 hover:bg-blue-500/[0.03] hover:border-blue-500/20 ${isNew ? 'animate-in fade-in slide-in-from-top-2 duration-700' : ''}`}>
      
      {/* Status icon with subtle pulse for new entries */}
      <div className="relative">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-black transition-transform group-hover:scale-110 ${cfg.iconBg}`}>
          {cfg.icon}
        </div>
        {isNew && (
          <div className="absolute -inset-1 bg-blue-400/20 blur-md rounded-xl animate-pulse" />
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="font-bold text-[15px] tracking-tight text-white/90 group-hover:text-white transition-colors">
            {tx.amount_sol > 0 ? `${tx.amount_sol} SOL` : "0.00 SOL"}
          </span>
          <span className="text-white/10 text-[10px] font-black tracking-widest">→</span>
          <span className="font-mono text-[11px] text-blue-400/40 bg-blue-500/[0.05] border border-blue-500/10 px-2 py-0.5 rounded-md group-hover:text-blue-400/60 transition-colors">
            {tx.recipient.slice(0, 6)}···{tx.recipient.slice(-4)}
          </span>
          <span className={`ml-auto text-[9px] px-2.5 py-1 rounded-lg border font-black uppercase tracking-[0.2em] transition-all ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        {tx.memo && (
          <p className="text-xs text-white/30 truncate font-light tracking-wide group-hover:text-white/40 transition-colors">
            &ldquo;{tx.memo}&rdquo;
          </p>
        )}

        {tx.error && (
          <div className="mt-2 flex items-center gap-2 text-[10px] text-red-400/80 font-mono bg-red-500/[0.05] p-2 rounded-lg border border-red-500/10">
            <span className="shrink-0 font-black px-1.5 py-0.5 rounded bg-red-500/20 text-[8px]">LOG_ERR</span>
            <span className="truncate">{tx.error}</span>
          </div>
        )}
      </div>

      {/* Right side (Desktop view) */}
      <div className="hidden sm:flex flex-col items-end gap-2 shrink-0 border-l border-white/5 pl-5">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-white/50 tracking-wider">
            {formatTime(tx.timestamp)}
          </span>
          <span className="text-[9px] text-white/15 font-medium tracking-tighter uppercase">
            {formatDate(tx.timestamp)}
          </span>
        </div>

        {tx.status === "SUCCESS" && tx.signature && (
          <a
            href={explorerTxUrl(tx.signature)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-1 group/link flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/5 text-[9px] font-black uppercase tracking-widest text-blue-400/50 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all"
          >
            Explorer
            <ExternalLink size={10} className="transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
          </a>
        )}
      </div>
    </div>
  );
}