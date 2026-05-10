"use client";

import { motion, Variants } from "framer-motion";
import { Activity, Radio, Terminal } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ConnectGuard } from "@/components/ConnectGuard";
import { ActivityFeed } from "@/components/feed/ActivityFeed";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};

export default function ActivityPage() {
  return (
    <PageShell>
      <ConnectGuard>
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-5xl mx-auto space-y-10 py-12 px-6"
        >
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
            <div className="space-y-4">
              {/* Updated to Blue Theme */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Radio size={12} className="text-blue-400 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Live Transmission</span>
              </div>
              <h1 className="text-5xl font-light tracking-tight text-white leading-none">
                AGENT <span className="font-medium text-blue-400">ACTIVITY</span>
              </h1>
              <p className="text-sm text-white/40 max-w-xl font-light leading-relaxed">
                Real-time log of all agent transactions and autonomous runs. 
                Streamed directly via encrypted WebSocket.
              </p>
            </div>

            {/* Status Indicator */}
            <div className="hidden md:flex items-center gap-4 px-5 py-3 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest text-right">Node Status</p>
                    <div className="flex items-center gap-2">
                        {/* Glow updated to Blue */}
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                        <span className="text-xs font-mono text-blue-400 font-bold uppercase">Active</span>
                    </div>
                </div>
                <div className="w-[1px] h-8 bg-white/5 mx-2" />
                <Terminal size={18} className="text-white/20" />
            </div>
          </div>

          {/* Activity Feed Container */}
          <motion.div 
            variants={fadeIn}
            className="relative rounded-[2.5rem] border border-white/5 bg-black/20 backdrop-blur-md overflow-hidden group"
          >
            {/* Corner Decorative Glow - Updated to Blue */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-600/10 transition-colors duration-1000" />
            
            <div className="p-2 min-h-[600px] h-[calc(100vh-320px)]">
              <ActivityFeed />
            </div>

            {/* Bottom Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </motion.div>

          {/* Ledger Metadata */}
          <div className="flex justify-between items-center text-[10px] font-mono text-white/20 uppercase tracking-[0.3em] px-4">
            <span className="flex items-center gap-2">
                <Activity size={12} />
                Indexing Blocks...
            </span>
            <span>Aegis Protocol v1.0.4</span>
          </div>
        </motion.div>
      </ConnectGuard>
    </PageShell>
  );
}