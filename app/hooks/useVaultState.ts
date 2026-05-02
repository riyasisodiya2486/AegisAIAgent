"use client";

import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { VaultState, getVaultStateByAddress } from "@aegis/sdk";
import { useAegisClient } from "./useAegisClient";

export type VaultFetchError =
  | "not_found"
  | "rpc_error"
  | "wrong_program"
  | null;

interface UseVaultStateResult {
  vault:   VaultState | null;
  loading: boolean;
  error:   VaultFetchError;
  errorMsg: string | null;
  refresh: () => Promise<void>;
}

export function useVaultState(vaultPda: PublicKey | null): UseVaultStateResult {
  const client   = useAegisClient();
  const [vault,    setVault]    = useState<VaultState | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<VaultFetchError>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchVault = useCallback(async () => {
    if (!client || !vaultPda) return;
    setLoading(true);

    try {
      const state = await getVaultStateByAddress(client, vaultPda);
      if (state) {
        setVault(state);
        setError(null);
        setErrorMsg(null);
      } else {
        setVault(null);
        setError("not_found");
        setErrorMsg(
          `Vault not found at ${vaultPda.toBase58().slice(0,8)}...` +
          ` — it may have been closed or the program was redeployed.`
        );
      }
    } catch (err: any) {
      setVault(null);
      const msg: string = err?.message ?? String(err);
      if (msg.includes("Account does not exist") || msg.includes("has no data")) {
        setError("not_found");
        setErrorMsg("Vault account not found on-chain.");
      } else if (msg.includes("incorrect program id")) {
        setError("wrong_program");
        setErrorMsg("Program ID mismatch — redeploy the Anchor program.");
      } else {
        setError("rpc_error");
        setErrorMsg(`RPC error: ${msg.slice(0, 120)}`);
      }
    } finally {
      setLoading(false);
    }
  }, [client, vaultPda?.toBase58()]);

  useEffect(() => {
    fetchVault();
    const id = setInterval(fetchVault, 8000);
    return () => clearInterval(id);
  }, [fetchVault]);

  return { vault, loading, error, errorMsg, refresh: fetchVault };
}