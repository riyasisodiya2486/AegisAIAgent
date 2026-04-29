"use client";

import { TransactionLog } from "@/hooks/useAgentLogs";

interface Props {
  tx: TransactionLog;
  isNew?: boolean;
}

const STATUS_CONFIG = {
  SUCCESS: {
    icon: "✓",
    iconBg: "bg-emerald-500/15 text-emerald-400",
    badge: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
    label: "Success",
  },
  DRY_RUN: {
    icon: "~",
    iconBg: "bg-blue-500/15 text-blue-400",
    badge: "bg-blue-500/12 text-blue-400 border-blue-500/20",
    label: "Dry Run",
  },
  ERROR: {
    icon: "✗",
    iconBg: "bg-red-500/15 text-red-400",
    badge: "bg-red-500/12 text-red-400 border-red-500/20",
    label: "Failed",
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
    <div className={`group flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] transition-all hover:bg-white/[0.04] ${isNew ? 'animate-in fade-in slide-in-from-top-2 duration-500' : ''}`}>
      
      {/* Status icon */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${cfg.iconBg}`}>
        {cfg.icon}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-white">
            {tx.amount_sol > 0 ? `${tx.amount_sol} SOL` : "0 SOL"}
          </span>
          <span className="text-white/20">→</span>
          <span className="font-mono text-sm text-white/50 bg-white/5 px-1.5 py-0.5 rounded">
            {tx.recipient.slice(0, 6)}···{tx.recipient.slice(-4)}
          </span>
          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        {tx.memo && (
          <p className="text-sm text-white/40 truncate italic">
            "{tx.memo}"
          </p>
        )}

        {tx.error && (
          <p className="mt-1 text-xs text-red-400/80 font-mono line-clamp-2">
            Error: {tx.error}
          </p>
        )}
      </div>

      {/* Right side (Desktop view) */}
      <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs font-medium text-white/60">
          {formatTime(tx.timestamp)}
        </span>
        <span className="text-[10px] text-white/20">
          {formatDate(tx.timestamp)}
        </span>

        {tx.status === "SUCCESS" && tx.signature && (
          <a
            href={`https://solscan.io/tx/${tx.signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="mt-2 text-[10px] text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-0.5"
          >
            Solscan ↗
          </a>
        )}
      </div>
    </div>
  );
}