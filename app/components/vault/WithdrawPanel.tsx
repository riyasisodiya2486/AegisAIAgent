"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VaultState } from "@aegis/sdk";
import { ConfirmModal } from "@/components/ConfirmModal";
import { toast } from "sonner";

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
      toast.success("Vault closed", {
        description: `${totalBalance.toFixed(4)} SOL returned to your wallet.`,
      });
      // Redirect to dashboard after vault is closed
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      toast.error("Withdrawal failed", {
        description: err?.message ?? "Check your wallet and try again.",
      });
      setIsProcessing(false); // Only reset loading on error; on success, we redirect
    }
  };

  return (
    <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Withdraw & Close Vault</h3>
          <p className="text-sm text-white/40 leading-relaxed">
            Permanently close this vault and return all funds to your wallet.
          </p>
        </div>

        {/* Balance preview */}
        {vault && (
          <div className="space-y-3 mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            {[
              { label: "Liquid balance", value: vault.vaultBalanceSol, note: "available now" },
              { label: "Staked balance", value: vault.stakedAmountSol, note: "will be unstaked" },
              { label: "Total to receive", value: totalBalance, note: "to your wallet", bold: true },
            ].map(({ label, value, note, bold }, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={`text-sm ${bold ? "text-white font-bold" : "text-white/60"}`}>
                    {label}
                  </span>
                  <span className="text-[10px] text-white/20 uppercase tracking-wider">{note}</span>
                </div>
                <div className={`text-sm font-mono ${bold ? "text-amber-400" : "text-white/80"}`}>
                  {value.toFixed(4)} SOL
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warning */}
        <div className="mb-8 flex gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <span className="text-amber-500 text-lg">⚠</span>
          <p className="text-xs text-amber-500/70 leading-relaxed">
            This is irreversible. The vault account will be
            closed on-chain. All agent activity will stop immediately.
            You can create a new vault at any time.
          </p>
        </div>

        <button
          onClick={() => setShowWithdraw(true)}
          disabled={!vault || totalBalance <= 0 || isProcessing}
          className="w-full py-4 rounded-2xl border border-amber-500/25 bg-amber-500/5
            text-amber-400 text-sm font-bold hover:bg-amber-500 hover:text-black
            transition-all disabled:opacity-20 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {isProcessing ? "Processing Withdrawal..." : "Withdraw All & Close Vault"}
        </button>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        onConfirm={handleWithdraw}
        title="Withdraw & Close Vault"
        description={`This will close the vault permanently and return ${totalBalance.toFixed(4)} SOL to your wallet. The agent will lose access immediately.`}
        confirmWord="WITHDRAW"
        confirmLabel="Withdraw All"
        variant="warning"
      />
    </div>
  );
}