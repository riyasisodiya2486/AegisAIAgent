"use client";

import { useRpcHealth } from "@/hooks/useRpcHealth";

export function RpcStatusBanner() {
  const { status, latency } = useRpcHealth();

  if (status === "ok" || status === "checking") return null;

  return (
    <div className={`w-full px-4 py-2 text-center text-xs font-medium ${
      status === "down"
        ? "bg-red-500/15 text-red-400 border-b border-red-500/20"
        : "bg-amber-500/10 text-amber-400 border-b border-amber-500/15"
    }`}>
      {status === "down"
        ? "⚠ RPC is unreachable — transactions may fail. Check your network."
        : `⚡ RPC is slow (${latency}ms) — responses may be delayed.`
      }
    </div>
  );
}
