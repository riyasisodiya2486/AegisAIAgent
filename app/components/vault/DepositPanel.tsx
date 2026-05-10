"use client";

import { useState } from "react";
import { TxButton } from "@/components/TxButton";
import { VaultState } from "@aegis/sdk";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, ArrowUpRight, Activity } from "lucide-react";

const QUICK_AMOUNTS = [0.1, 0.5, 1, 5];

interface Props {
  vault:    VaultState | null;
  onDeposit: (amount: number) => Promise<string>;
  onSuccess: () => void;
}

export function DepositPanel({ vault, onDeposit, onSuccess }: Props) {
  const [amount, setAmount] = useState("0.5");
  const amountNum = parseFloat(amount) || 0;

  const projectedBalance = vault
    ? vault.vaultBalanceSol + amountNum
    : amountNum;

  return (
    <div className="rounded-[2rem] border border-blue-500/15 bg-[#050505] p-5 sm:p-7 space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Subtle Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] pointer-events-none" />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-black text-xs uppercase tracking-[0.3em] text-blue-400">Initialize_Deposit</h3>
          <p className="text-[10px] sm:text-[11px] text-blue-100/30 mt-1.5 leading-relaxed max-w-[240px]">
            Allocate SOL to the vault terminal. These funds are used for autonomous agent operations.
          </p>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <Coins size={16} className="text-blue-500/50" />
        </div>
      </div>

      {/* Quick select buttons */}
      <div className="flex gap-2.5 flex-wrap">
        {QUICK_AMOUNTS.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(String(a))}
            className={`
              px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all duration-300
              ${amountNum === a
                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border-blue-400"
                : "bg-blue-500/[0.03] border border-blue-500/10 text-blue-100/40 hover:bg-blue-500/10 hover:text-blue-300"}
            `}
          >
            {a} SOL
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <label className="text-[9px] font-black text-blue-400/40 uppercase tracking-[0.2em]">Transmission_Amount</label>
          <span className="text-[9px] font-mono text-blue-500/40">Network: Solana_Mainnet</span>
        </div>
        <div className="relative group">
          <input
            type="number"
            min="0.001"
            step="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-blue-500/[0.02] border border-blue-500/10 rounded-xl px-5 py-4 text-sm font-mono text-white placeholder-blue-900 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/[0.05] transition-all"
            placeholder="0.00"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <div className="w-[1px] h-4 bg-blue-500/20 mx-1" />
            <span className="text-[10px] font-black text-blue-400/60 tracking-tighter">SOL</span>
          </div>
        </div>
      </div>

      {/* Projection row */}
      <AnimatePresence>
        {vault && amountNum > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl bg-blue-500/[0.03] border border-blue-500/10 p-4 space-y-3 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-1">
              <Activity size={10} className="text-blue-500/40" />
              <span className="text-[8px] font-black text-blue-500/30 uppercase tracking-[0.2em]">Simulated_Outcome</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-blue-100/30">Current_Vault_State</span>
              <span className="text-blue-100/60 font-mono">{vault.vaultBalanceSol.toFixed(4)} SOL</span>
            </div>
            <div className="flex justify-between text-[11px] items-center pt-1 border-t border-blue-500/5">
              <span className="text-blue-100/30">Post_Transaction_State</span>
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono">
                <ArrowUpRight size={12} />
                {projectedBalance.toFixed(4)} SOL
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TxButton
        label="Confirm_Deposit"
        loadingLabel="Broadcasting..."
        onClick={async () => {
          const sig = await onDeposit(amountNum);
          onSuccess();
          return sig;
        }}
        disabled={amountNum <= 0}
        className="w-full h-14"
      />
    </div>
  );
}