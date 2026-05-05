"use client";

import { useState, useEffect } from "react";
import { useAegisClient } from "@/hooks/useAegisClient";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { toast } from "sonner";

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
        setNeeded(false); // exists — no action needed
      } catch {
        setNeeded(true);  // not initialized
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
        .initializeProtocolConfig() // 5% fee
        .accountsPartial({
          config:        configPda,
          authority:     publicKey,
          treasury:      publicKey,
          systemProgram: SystemProgram.programId, 
        })
        .rpc();

      toast.success("Protocol initialized", { description: tx.slice(0, 16) + "..." });
      setNeeded(false);
    } catch (err: any) {
      toast.error("Init failed", { description: err?.message?.slice(0, 100) });
    } finally {
      setLoading(false);
    }
  };

  if (checking || !needed) return null;

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/6 px-5 py-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-amber-400">One-time protocol setup required</p>
          <p className="text-xs text-amber-400/60 mt-0.5">
            The protocol config account needs to be initialized before staking works.
            This only needs to be done once per deployment.
          </p>
        </div>
        <button
          onClick={handleInit}
          disabled={loading}
          className="shrink-0 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30
            text-sm text-amber-300 hover:bg-amber-500/30 transition-all disabled:opacity-50"
        >
          {loading ? "Initializing..." : "Initialize Protocol"}
        </button>
      </div>
    </div>
  );
}