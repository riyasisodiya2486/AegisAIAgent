"use client";

import { useRpcHealth } from "@/hooks/useRpcHealth";
import { AlertCircle, Zap } from "lucide-react";

export function RpcStatusBanner() {
  const { status, latency } = useRpcHealth();

  if (status === "ok" || status === "checking") return null;

  const isDown = status === "down";

  return (
    <div 
      className={`w-full px-6 py-2.5 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] backdrop-blur-md transition-all duration-500 ${
        isDown
          ? "bg-red-500/10 text-red-500 border-b border-red-500/20 shadow-[0_4px_20px_rgba(239,68,68,0.1)]"
          : "bg-orange-500/10 text-orange-400 border-b border-orange-500/20 shadow-[0_4px_20px_rgba(251,146,60,0.1)]"
      }`}
    >
      {isDown ? (
        <AlertCircle size={14} strokeWidth={3} className="animate-pulse" />
      ) : (
        <Zap size={14} strokeWidth={3} />
      )}

      <span className="flex items-center gap-2">
        {isDown ? (
          "Critical: RPC_Unreachable // Interface_Degraded"
        ) : (
          <>
            Latency_Warning: <span className="font-mono text-xs text-white/80">[{latency}ms]</span> // Performance_Impacted
          </>
        )}
      </span>

      {/* Decorative side markers for professional "Terminal" look */}
      <div className={`absolute right-4 hidden md:block h-1 w-8 rounded-full ${isDown ? 'bg-red-500/20' : 'bg-orange-500/20'}`} />
      <div className={`absolute left-4 hidden md:block h-1 w-8 rounded-full ${isDown ? 'bg-red-500/20' : 'bg-orange-500/20'}`} />
    </div>
  );
}