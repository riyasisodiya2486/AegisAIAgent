"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VaultState } from "@aegis/sdk";
import { ConfirmModal } from "@/components/ConfirmModal";
import { toast } from "sonner";
import { Wallet, LogOut, AlertTriangle } from "lucide-react";

interface Props {
  vault: VaultState | null;
  onWithdraw: () => Promise<string>; // Expects a transaction signature string
}

export function WithdrawPanel({ vault, onWithdraw }: Props) {
  const router = useRouter();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalBalance = vault
    ? vault.vaultBalanceSol + vault.stakedAmountSol
    : 0;

  const handleWithdraw = async () => {
    setIsProcessing(true);
    try {
      const sig = await onWithdraw();
      toast.success("VAULT_TERMINATED", {
        description: `${totalBalance.toFixed(4)} SOL has been routed to your wallet.`,
      });
      // Redirect to dashboard after vault is closed
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      toast.error("WITHDRAWAL_FAILED", {
        description: err?.message ?? "Handshake error. Verify wallet connection.",
      });
      setIsProcessing(false); // Only reset loading on error; on success, we redirect
    }
  };

  return (
    <div className="bg-[#050505] border border-blue-500/15 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] relative">
      {/* Decorative Corner Accent */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <LogOut size={40} className="text-blue-500" />
      </div>

      <div className="p-10 relative z-10">
        <div className="mb-10">
          <h3 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <Wallet className="text-blue-500" size={24} />
            Withdraw_Protocol
          </h3>
          <p className="text-[11px] font-medium text-blue-100/30 mt-3 max-w-sm uppercase tracking-[0.2em] leading-relaxed">
            Execute final liquidity extraction and decommission the vault kernel permanently.
          </p>
        </div>

        {/* Balance preview - Terminal Style */}
        {vault && (
          <div className="space-y-4 mb-10 p-8 rounded-3xl bg-blue-500/[0.02] border border-blue-500/5">
            {[
              { label: "Liquid_Assets", value: vault.vaultBalanceSol, note: "immediate_transfer" },
              { label: "Staked_Module", value: vault.stakedAmountSol, note: "auto_unstake_triggered" },
              { label: "Final_Settlement", value: totalBalance, note: "net_liquidity_return", bold: true },
            ].map(({ label, value, note, bold }, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${bold ? "text-cyan-400" : "text-blue-100/30"}`}>
                    {label}
                  </span>
                  <span className="text-[8px] font-mono text-blue-500/20 uppercase tracking-tighter mt-0.5">{note}</span>
                </div>
                <div className={`text-sm font-mono font-bold ${bold ? "text-cyan-400" : "text-blue-100/70"}`}>
                  {value.toFixed(4)} <span className="text-[10px] opacity-40 ml-1">SOL</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Technical Warning */}
        <div className="mb-10 flex gap-4 p-5 rounded-2xl bg-blue-500/[0.03] border border-blue-500/10">
          <AlertTriangle className="text-blue-500/40 shrink-0" size={18} />
          <p className="text-[11px] font-medium text-blue-100/40 leading-relaxed uppercase tracking-tight">
            Critical: This operation is non-reversible on the Solana ledger. All agent processing 
            cycles will terminate immediately upon block confirmation.
          </p>
        </div>

        <button
          onClick={() => setShowWithdraw(true)}
          disabled={!vault || totalBalance <= 0 || isProcessing}
          className="w-full py-5 rounded-[1.5rem] bg-blue-600 border-t border-blue-400 text-white font-black uppercase tracking-[0.3em] text-xs shadow-[0_20px_50px_rgba(37,99,235,0.2)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Executing_Protocol..." : "Decommission_&_Withdraw"}
        </button>
      </div>

      {/* Confirmation Modal - Injected with Theme variant */}
      <ConfirmModal
        open={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        onConfirm={handleWithdraw}
        title="DECOMMISSION_CONFIRMATION"
        description={`Initiating full decommission sequence for ${totalBalance.toFixed(4)} SOL. This will destroy the vault PDA and return all fragments to your authority wallet.`}
        confirmWord="WITHDRAW"
        confirmLabel="Confirm Decommission"
        variant="danger" 
      />
    </div>
  );
}