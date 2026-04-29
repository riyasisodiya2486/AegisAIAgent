"use client";

import { useState } from "react";
import { AgentRunLog } from "@/hooks/useAgentLogs";

interface Props {
  run: AgentRunLog;
}

const TOOL_COLORS: Record<string, string> = {
  CheckBudget:      "bg-blue-500/15 text-blue-400 border-blue-500/20",
  SpendViaAegis:    "bg-violet-500/15 text-violet-400 border-violet-500/20",
  FetchWithPayment: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  unknown:          "bg-white/5 text-white/40 border-white/10",
};

export function AgentRunCard({ run }: Props) {
  const [expanded, setExpanded] = useState(false);

  const toolCalls = run.steps.map(s => s.tool);
  const uniqueTools = [...new Set(toolCalls)];
  const durationSec = (run.duration_ms / 1000).toFixed(1);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] transition-all hover:bg-white/[0.03]">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        {/* Status dot */}
        <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${run.success ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`} />

        <div className="flex-1 min-w-0">
          {/* Task title */}
          <h4 className="truncate font-medium text-white/90">
            {run.task.slice(0, 120)}{run.task.length > 120 ? "..." : ""}
          </h4>

          {/* Tool badges */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {uniqueTools.map(tool => (
              <span
                key={tool}
                className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-tight ${TOOL_COLORS[tool] || TOOL_COLORS.unknown}`}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Meta Info */}
        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 text-[11px] font-medium text-white/30">
          <span>{new Date(run.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <div className="flex gap-2">
            <span>{durationSec}s</span>
            <span>•</span>
            <span>{run.steps.length} steps</span>
          </div>
        </div>

        {/* Expand chevron */}
        <div className={`ml-2 text-white/20 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
          <span className="text-xs">▼</span>
        </div>
      </button>

      {/* Expanded step trace */}
      {expanded && (
        <div className="border-t border-white/5 bg-black/20 p-4">
          {/* Final Output Section */}
          <div className="mb-6 rounded-xl bg-white/[0.03] p-3 border border-white/5">
            <h5 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Final output</h5>
            <p className="text-sm leading-relaxed text-white/70">
              {run.output.slice(0, 500)}{run.output.length > 500 ? "..." : ""}
            </p>
          </div>

          {/* Steps Trace */}
          {run.steps.length > 0 && (
            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/30">Step trace</h5>
              <div className="relative space-y-4 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-white/10">
                {run.steps.map((step, i) => (
                  <div key={i} className="relative pl-8">
                    {/* Step Number Dot */}
                    <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-[10px] font-bold text-white/40">
                      {i + 1}
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white/80">{step.tool}</span>
                        <span className="text-[10px] font-mono text-white/20">
                          {new Date(step.timestamp).toLocaleTimeString([], {
                            hour: "2-digit", minute: "2-digit", second: "2-digit"
                          })}
                        </span>
                      </div>
                      <div className="rounded-lg bg-white/5 p-2 font-mono text-[11px] text-white/50 border border-white/5">
                        {step.output.slice(0, 200)}{step.output.length > 200 ? "..." : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {run.error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              <strong>Error:</strong> {run.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}