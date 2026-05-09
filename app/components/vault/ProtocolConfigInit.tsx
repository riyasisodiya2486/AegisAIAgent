"use client";

import { useState, useEffect } from "react";
import { useAegisClient } from "@/hooks/useAegisClient";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { toast } from "sonner";
import { Settings, Cpu, Activity } from "lucide-react";

export function ProtocolConfigInit() {
  const client        = useAegisClient();
  const { publicKey } = useWallet();
  const [needed,   setNeeded]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!client) return;

    const check = async () => {
      try {
        const programId = client.programId;
        const [configPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("aegis-protocol-config")],
          programId
        );
        await client.program.account.protocolConfig.fetch(configPda);
        setNeeded(false); 
      } catch {
        setNeeded(true);  
      } finally {
        setChecking(false);
      }
    };

    check();
  }, [client]);

  const handleInit = async () => {
    if (!client || !publicKey) return;
    setLoading(true);

    try {
      const programId = client.programId;
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("aegis-protocol-config")],
        programId
      );

      const tx = await client.program.methods
        .initializeProtocolConfig() 
        .accountsPartial({
          config:         configPda,
          authority:      publicKey,
          treasury:       publicKey,
          systemProgram: SystemProgram.programId, 
        })
        .rpc();

      toast.success("PROTOCOL_SYNCED", { 
        description: "Kernel configuration finalized: " + tx.slice(0, 12) + "..." 
      });
      setNeeded(false);
    } catch (err: any) {
      toast.error("HANDSHAKE_FAILED", { 
        description: err?.message?.slice(0, 100) 
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking || !needed) return null;

  return (
    <div className="rounded-[2rem] border border-blue-500/20 bg-blue-500/[0.03] backdrop-blur-md px-8 py-6 relative overflow-hidden group">
      {/* Background Scanning Animation */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.05),transparent)] bg-[length:200%_100%] animate-[shimmer_3s_infinite] pointer-events-none" />
      
      <div className="flex items-center justify-between gap-8 flex-wrap relative z-10">
        <div className="flex items-start gap-5">
          <div className="mt-1 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <Settings size={20} className="text-blue-400 animate-[spin_8s_linear_infinite]" />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">System_Initialization_Required</h4>
            <p className="text-[12px] text-blue-100/40 mt-1.5 leading-relaxed max-w-lg font-medium">
              Kernel configuration account is missing from current deployment. One-time synchronization 
              is required to enable staking modules and treasury logic.
            </p>
          </div>
        </div>

        <button
          onClick={handleInit}
          disabled={loading}
          className="shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-blue-600 text-white border-t border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 group/btn"
        >
          {loading ? (
            <Cpu size={16} className="animate-spin" />
          ) : (
            <Activity size={16} className="group-hover/btn:scale-110 transition-transform" />
          )}
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            {loading ? "Initializing..." : "Finalize Handshake"}
          </span>
        </button>
      </div>

      {/* Decorative corner accent */}
      <div className="absolute bottom-0 right-0 p-3 opacity-20">
        <div className="w-2 h-2 border-r border-b border-blue-500/40" />
      </div>
    </div>
  );
}