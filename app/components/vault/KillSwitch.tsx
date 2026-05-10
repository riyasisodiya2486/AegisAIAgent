"use client";

import { useState } from "react";
import { VaultState } from "@aegis/sdk";
import { ConfirmModal } from "@/components/ConfirmModal";
import { toast } from "sonner";
import { ShieldAlert, Zap, AlertTriangle, Lock } from "lucide-react";

interface Props {
  vault: VaultState | null;
  onRevoke: () => Promise<string>;
  onSuccess: () => void;
}

export function KillSwitch({ vault, onRevoke, onSuccess }: Props) {
  const [showFreeze, setShowFreeze] = useState(false);
  const isFrozen = vault?.isFrozen ?? false;

  const handleRevoke = async () => {
    try {
      const sig = await onRevoke();
      onSuccess();
      toast.success("PROTOCOL_TERMINATED", {
        description: "The agent process has been severed from the vault.",
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
      toast.error("TERMINATION_FAILED", {
        description: err?.message ?? "An unexpected handshake error occurred.",
      });
    }
  };

  return (
    <div className="bg-[#050505] border border-blue-500/20 rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] relative">
      {/* Decorative Glow */}
      <div className={`absolute -top-24 -left-24 w-64 h-64 blur-[120px] pointer-events-none opacity-20 ${isFrozen ? 'bg-red-600' : 'bg-blue-600'}`} />
      
      <div className="p-6 md:p-10 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6 md:mb-10">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter flex items-center gap-3">
              <ShieldAlert className={isFrozen ? "text-red-500" : "text-blue-500"} size={24} />
              EMERGENCY_CONTROLS
            </h3>
            <p className="text-[10px] md:text-[11px] font-medium text-blue-100/30 mt-3 max-w-sm uppercase tracking-[0.2em] leading-relaxed">
              Instantly revoke agent signing rights. Execution finalized within ~400ms of block confirmation.
            </p>
          </div>

          <div className={`w-fit px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] border animate-pulse shadow-[0_0_15px_rgba(0,0,0,0.5)] ${
            isFrozen 
              ? "bg-red-500/10 border-red-500/40 text-red-400" 
              : "bg-blue-500/10 border-blue-500/40 text-blue-400"
          }`}>
            {isFrozen ? "STATUS: FROZEN" : "STATUS: ACTIVE"}
          </div>
        </div>

        {/* Frozen State: High Intensity Alert */}
        {isFrozen && (
          <div className="mb-6 md:mb-10 p-6 md:p-8 rounded-2xl md:rounded-3xl bg-red-950/10 border border-red-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <h4 className="text-red-400 text-[10px] md:text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertTriangle size={14} /> Critical: Vault Sequestration Active
            </h4>
            <p className="text-[11px] md:text-[12px] text-red-200/40 leading-relaxed font-medium">
              The cryptographic link to the agent has been purged. No further out-bound 
              spending is authorized. Your liquidity remains secured in the vault and 
              is accessible for immediate manual withdrawal.
            </p>
          </div>
        )}

        {/* Security Checklist: Terminal Style */}
        {!isFrozen && (
          <div className="mb-6 md:mb-10 space-y-5">
            <div className="flex items-center gap-4">
              <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/40">
                Termination_Triggers
              </h4>
              <div className="h-px flex-1 bg-gradient-to-r from-blue-500/20 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {[
                "Unauthorized spending patterns detected",
                "Process integrity compromise suspected",
                "Temporary operational pause required",
                "Daily risk thresholds exceeded",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-blue-500/[0.02] border border-blue-500/5 group hover:border-blue-500/20 transition-all">
                  <Zap size={12} className="text-blue-500/20 group-hover:text-blue-400 transition-colors" />
                  <span className="text-[10px] md:text-[11px] font-bold text-blue-100/40 group-hover:text-blue-100/70 transition-colors uppercase tracking-tight">{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button: The Big Red Button */}
        {!isFrozen ? (
          <button
            onClick={() => setShowFreeze(true)}
            className="w-full py-4 md:py-5 rounded-2xl md:rounded-[1.5rem] bg-red-600 border-t border-red-400 text-white transition-all font-black uppercase tracking-[0.3em] text-xs shadow-[0_20px_50px_rgba(220,38,38,0.2)] hover:shadow-[0_25px_60px_rgba(220,38,38,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98]"
          >
            Purge_Agent_Authority
          </button>
        ) : (
          <div className="p-6 md:p-8 rounded-2xl md:rounded-3xl bg-blue-500/[0.02] border border-blue-500/10">
            <h4 className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Lock size={12} /> Recovery_Protocol
            </h4>
            <div className="space-y-4">
              {[
                "Generate fresh vault with updated agent pair",
                "Migrate remaining assets to active terminal",
                "Finalize withdrawal of sequestered funds",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4 text-[10px] md:text-[11px] font-bold text-blue-100/30 uppercase tracking-tight">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-mono text-[9px]">{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        open={showFreeze}
        onClose={() => setShowFreeze(false)}
        onConfirm={handleRevoke}
        title="TERMINATION_CONFIRMATION"
        description="Executing this protocol will permanently sever the agent's signing capability. All automated operations will cease immediately. This process is cryptographically irreversible."
        confirmWord="TERMINATE"
        confirmLabel="Confirm Termination"
        variant="danger"
      />
    </div>
  );
}