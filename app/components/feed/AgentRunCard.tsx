"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentRunLog } from "@/hooks/useAgentLogs";
import { ChevronDown, Cpu, Clock, Layers, AlertCircle, CheckCircle2, Zap } from "lucide-react";

interface Props {
  run: AgentRunLog;
}

const TOOL_COLORS: Record<string, string> = {
  CheckBudget:      "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
  SpendViaAegis:    "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]",
  FetchWithPayment: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]",
  unknown:          "bg-white/5 text-white/40 border-white/10",
};

export function AgentRunCard({ run }: Props) {
  const [expanded, setExpanded] = useState(false);

  const toolCalls = run.steps.map(s => s.tool);
  const uniqueTools = [...new Set(toolCalls)];
  const durationSec = (run.duration_ms / 1000).toFixed(1);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[2rem] border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-md transition-all hover:border-blue-500/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      {/* Header Section */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="flex w-full items-center gap-6 p-6 text-left group"
      >
        {/* Execution Status Icon */}
        <div className="relative">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-500 ${
            run.success 
              ? "bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:border-blue-400/50" 
              : "bg-red-500/10 border-red-500/20 text-red-500"
          }`}>
            {run.success ? <Zap size={20} className="fill-blue-400/20" /> : <AlertCircle size={20} />}
          </div>
          {run.success && (
            <motion.div 
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -inset-2 bg-blue-500/20 blur-xl rounded-full -z-10"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400/40">Sequence_Init</span>
            <span className="h-px flex-1 bg-gradient-to-r from-blue-500/10 to-transparent" />
          </div>
          <h4 className="truncate text-base font-light tracking-tight text-white/90 group-hover:text-white transition-colors">
            {run.task}
          </h4>

          {/* Tool Badges */}
          <div className="mt-4 flex flex-wrap gap-2.5">
            {uniqueTools.map(tool => (
              <span
                key={tool}
                className={`rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 ${TOOL_COLORS[tool] || TOOL_COLORS.unknown}`}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Runtime Meta */}
        <div className="hidden md:flex flex-col items-end gap-2 shrink-0 px-6 border-l border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 bg-white/[0.03] px-2 py-1 rounded-md">
            <Clock size={10} className="text-blue-400/60" />
            {new Date(run.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono text-white/20">
            <span className="flex items-center gap-1.5"><Cpu size={11} className="text-blue-500/40" /> {durationSec}s</span>
            <span className="flex items-center gap-1.5"><Layers size={11} className="text-blue-500/40" /> {run.steps.length} cycles</span>
          </div>
        </div>

        <motion.div 
          animate={{ rotate: expanded ? 180 : 0, y: expanded ? 0 : [0, 2, 0] }}
          transition={{ y: { repeat: Infinity, duration: 2 } }}
          className="text-white/20 group-hover:text-blue-400 transition-colors ml-2"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      {/* Expandable Execution Trace */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          >
            <div className="border-t border-white/5 bg-black/40 p-8 space-y-10">
              
              {/* Output Summary */}
              <div className="relative p-6 rounded-[1.5rem] bg-blue-500/[0.02] border border-blue-500/10 group/output hover:border-blue-500/20 transition-colors">
                <div className="absolute -top-2.5 left-6 px-3 py-0.5 bg-[#050505] rounded-full border border-blue-500/20 text-[8px] font-black uppercase tracking-[0.4em] text-blue-400">
                  Kernel_Final_State
                </div>
                <p className="text-xs leading-relaxed text-white/50 font-mono italic">
                  "{run.output}"
                </p>
              </div>

              {/* Step Timeline */}
              {run.steps.length > 0 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 px-2">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Process_Stack</h5>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  
                  <div className="relative space-y-0 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-10px)] before:w-[2px] before:bg-gradient-to-b before:from-blue-500/40 before:via-blue-500/10 before:to-transparent">
                    {run.steps.map((step, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="relative pl-12 pb-10 last:pb-0"
                      >
                        {/* Step Marker */}
                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-black text-[10px] font-black text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] z-10 group-hover:scale-110 transition-transform">
                          {String(i + 1).padStart(2, '0')}
                        </div>

                        <div className="flex flex-col gap-3 p-5 rounded-[1.5rem] bg-white/[0.01] border border-white/[0.03] hover:bg-white/[0.02] hover:border-blue-500/10 transition-all duration-300 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300/80">{step.tool}</span>
                            <span className="text-[9px] font-mono text-white/10 tracking-widest">
                              T+{((new Date(step.timestamp).getTime() - new Date(run.timestamp).getTime()) / 1000).toFixed(3)}s
                            </span>
                          </div>
                          <div className="font-mono text-[10px] text-white/40 leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5 group-hover:text-white/60 transition-colors">
                            {step.output}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Handler */}
              {run.error && (
                <motion.div 
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-[1.5rem] border border-red-500/20 bg-red-500/5 p-5 flex items-start gap-4"
                >
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <AlertCircle size={18} className="text-red-500" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Stack_Overflow_Failure</p>
                    <p className="text-xs font-mono text-red-400/70 leading-relaxed">{run.error}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}