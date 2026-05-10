"use client";

import { useState, useEffect } from "react";
import { TxButton } from "@/components/TxButton";
import { VaultState } from "@aegis/sdk";
import { motion, AnimatePresence } from "framer-motion";
import { Gauge, ArrowRight, Activity } from "lucide-react";

interface Props {
  vault:           VaultState | null;
  onUpdateLimit:   (newLimitSol: number) => Promise<string>;
  onSuccess:       () => void;
}

export function LimitSlider({ vault, onUpdateLimit, onSuccess }: Props) {
  const currentLimit = vault?.dailyLimitSol ?? 0.1;
  const [value,     setValue]     = useState(currentLimit);
  const [inputVal, setInputVal] = useState(String(currentLimit));

  // Sync with vault state when it loads
  useEffect(() => {
    if (vault) {
      setValue(vault.dailyLimitSol);
      setInputVal(vault.dailyLimitSol.toFixed(4));
    }
  }, [vault?.dailyLimitSol]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setValue(v);
    setInputVal(v.toFixed(3));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v > 0) setValue(v);
  };

  const isDirty = Math.abs(value - currentLimit) > 0.00001;

  return (
    <div className="rounded-[2rem] border border-blue-500/15 bg-[#050505] p-5 sm:p-7 space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Subtle Glow */}
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 blur-[100px] pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-black text-xs uppercase tracking-[0.3em] text-blue-400">Risk_Parameters</h3>
          <p className="text-[10px] sm:text-[11px] text-blue-100/30 mt-1.5 leading-relaxed max-w-[260px]">
            The agent process cannot exceed this liquidity threshold per 24-hour cycle.
          </p>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <Gauge size={16} className="text-blue-500/50" />
        </div>
      </div>

      {/* Current vs new - Terminal Readout Style */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/[0.02] border border-blue-500/5">
        <div>
          <p className="text-[9px] font-black text-blue-400/40 uppercase tracking-[0.2em]">Active_Limit</p>
          <p className="text-2xl font-mono font-bold mt-1 text-white/90">
            {currentLimit.toFixed(3)}
            <span className="text-[10px] font-black text-blue-500/30 ml-2 tracking-tighter">SOL</span>
          </p>
        </div>
        
        <AnimatePresence>
          {isDirty && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="text-right"
            >
              <p className="text-[9px] font-black text-cyan-400/40 uppercase tracking-[0.2em]">Proposed_Limit</p>
              <div className="flex items-center gap-2 mt-1 justify-end">
                <ArrowRight size={14} className="text-cyan-500/40" />
                <p className="text-2xl font-mono font-bold text-cyan-400">
                  {value.toFixed(3)}
                  <span className="text-[10px] font-black text-cyan-500/40 ml-2 tracking-tighter">SOL</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Range Slider - High Performance Custom Styling */}
      <div className="space-y-4 px-1">
        <input
          type="range"
          min="0.01"
          max="10"
          step="0.01"
          value={value}
          onChange={handleSliderChange}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer
            bg-blue-900/20
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-lg
            [&::-webkit-slider-thumb]:bg-blue-500
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-blue-400
            [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(59,130,246,0.5)]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:active:scale-90"
          style={{
            background: `linear-gradient(to right, #2563eb ${(value / 10) * 100}%, rgba(30,58,138,0.2) ${(value / 10) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-[10px] font-mono font-black text-blue-500/20 tracking-widest">
          <span>MIN: 0.01 SOL</span>
          <span>MAX: 10.00 SOL</span>
        </div>
      </div>

      {/* Manual Input - Terminal Style */}
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <span className="text-[9px] font-black text-blue-400/30 uppercase tracking-[0.1em]">Manual_Override</span>
        </div>
        <input
          type="number"
          min="0.001"
          max="100"
          step="0.001"
          value={inputVal}
          onChange={handleInputChange}
          className="w-full bg-blue-500/[0.02] border border-blue-500/10 rounded-xl pl-24 pr-20 py-3.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/[0.05] transition-all"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
          <span className="text-[9px] font-black text-blue-400 tracking-tighter uppercase">SOL / Cycle</span>
        </div>
      </div>

      <TxButton
        label={isDirty ? `Authorize ${value.toFixed(3)} SOL Limit` : "No Change Detected"}
        loadingLabel="Syncing Protocol..."
        onClick={async () => {
          const sig = await onUpdateLimit(value);
          onSuccess();
          return sig;
        }}
        disabled={!isDirty || value <= 0}
        className="w-full h-14"
      />
    </div>
  );
}