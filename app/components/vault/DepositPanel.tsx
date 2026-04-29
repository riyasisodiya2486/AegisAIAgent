"use client";

import { useState } from "react";
import { TxButton } from "@/components/TxButton";
import { VaultState } from "@aegis/sdk";

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
    <div className="rounded-2xl border border-white/6 bg-white/3 p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-sm">Deposit SOL</h3>
        <p className="text-xs text-white/35 mt-0.5">
          Add funds to the vault. The agent spends from this balance.
        </p>
      </div>

      {/* Quick select buttons */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_AMOUNTS.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(String(a))}
            className={[
              "px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
              amountNum === a
                ? "bg-violet-600 text-white"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70",
            ].join(" ")}
          >
            {a} SOL
          </button>
        ))}
      </div>

      {/* Amount input */}
      <div className="space-y-2">
        <label className="text-xs text-white/40 uppercase tracking-wide">Amount (SOL)</label>
        <div className="relative">
          <input
            type="number"
            min="0.001"
            step="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/6 transition-all"
            placeholder="0.00"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">SOL</span>
        </div>
      </div>

      {/* Projection row */}
      {vault && amountNum > 0 && (
        <div className="rounded-xl bg-violet-500/6 border border-violet-500/12 px-4 py-3">
          <div className="flex justify-between text-xs">
            <span className="text-white/40">Current balance</span>
            <span className="text-white/60">{vault.vaultBalanceSol.toFixed(4)} SOL</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-white/40">After deposit</span>
            <span className="text-emerald-400 font-medium">{projectedBalance.toFixed(4)} SOL</span>
          </div>
        </div>
      )}

      <TxButton
        label="Deposit"
        loadingLabel="Depositing..."
        onClick={async () => {
          const sig = await onDeposit(amountNum);
          onSuccess();
          return sig;
        }}
        disabled={amountNum <= 0}
        className="w-full"
      />
    </div>
  );
}
