"use client";

import { useState } from "react";
import { VaultState } from "@aegis/sdk";
import { ConfirmModal } from "@/components/ConfirmModal";
import { toast } from "sonner";

interface Props {
  vault: VaultState | null;
  onRevoke: () => Promise<string>; // Defined string return for tx signature
  onSuccess: () => void;
}

export function KillSwitch({ vault, onRevoke, onSuccess }: Props) {
  const [showFreeze, setShowFreeze] = useState(false);
  const isFrozen = vault?.isFrozen ?? false;

  const handleRevoke = async () => {
    try {
      const sig = await onRevoke();
      onSuccess();
      toast.success("Agent frozen", {
        description: "The agent can no longer spend from this vault.",
        action: {
          label: "View tx",
          onClick: () =>
            window.open(
              `https://solscan.io/tx/${sig}?cluster=custom&customUrl=http://localhost:8899`,
              "_blank"
            ),
        },
      });
    } catch (err: any) {
      toast.error("Failed to freeze agent", {
        description: err?.message ?? "An unexpected error occurred.",
      });
    }
  };

  return (
    <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          {/* Header */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Emergency Controls</h3>
            <p className="text-sm text-white/40 max-w-md">
              Freeze the agent instantly if you detect abnormal behavior.
              Takes effect within one Solana block (~400ms).
            </p>
          </div>

          {/* Status badge */}
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
            isFrozen 
              ? "bg-red-500/10 border-red-500/20 text-red-400" 
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}>
            {isFrozen ? "⚠ Frozen" : "● Active"}
          </div>
        </div>

        {/* Frozen state message */}
        {isFrozen && (
          <div className="mb-8 p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
            <h4 className="text-red-400 font-semibold mb-2">Vault is frozen</h4>
            <p className="text-sm text-red-400/60 leading-relaxed">
              The agent keypair has been revoked. No further spending is possible
              until you create a new vault or re-authorize an agent.
              Your funds are safe and can be withdrawn at any time.
            </p>
          </div>
        )}

        {/* Security checklist */}
        {!isFrozen && (
          <div className="mb-8 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30">
              When to use the kill switch
            </h4>
            <div className="grid gap-3">
              {[
                "Agent is spending unexpectedly or on unauthorized services",
                "You suspect the agent process has been compromised",
                "You want to pause agent activity temporarily",
                "Daily limit is not sufficient to contain the damage",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-white/50">
                  <span className="text-red-500">›</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button Section */}
        {!isFrozen ? (
          <button
            onClick={() => setShowFreeze(true)}
            className="w-full py-4 rounded-2xl bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 transition-all font-bold shadow-lg shadow-red-500/5 hover:shadow-red-500/20 active:scale-[0.98]"
          >
            🔴 Freeze Agent Now
          </button>
        ) : (
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-sm font-semibold text-white mb-4">To re-authorize an agent:</h4>
            <div className="space-y-3">
              {[
                "Create a new vault with the same or a different agent keypair",
                "Transfer funds from this frozen vault before withdrawing",
                "Or withdraw funds here and start fresh",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/40">
                  <span className="text-white/20 font-mono">{i + 1}.</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Freeze confirmation modal */}
      <ConfirmModal
        open={showFreeze}
        onClose={() => setShowFreeze(false)}
        onConfirm={handleRevoke}
        title="Freeze Agent"
        description="This will immediately revoke the agent's signing rights. The agent will be unable to spend from this vault. This action cannot be undone — you will need to create a new vault to re-authorize."
        confirmWord="FREEZE"
        confirmLabel="Freeze Agent"
        variant="danger"
      />
    </div>
  );
}