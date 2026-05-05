"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { VaultState, getVaultStateByAddress } from "@aegis/sdk";
import { useAegisClient } from "./useAegisClient";

export type VaultFetchError = "not_found" | "rpc_error" | "wrong_program" | null;

interface UseVaultStateResult {
  vault:    VaultState | null;
  loading:  boolean;
  error:    VaultFetchError;
  errorMsg: string | null;
  refresh:  () => Promise<void>;
}

export function useVaultState(vaultPda: PublicKey | null): UseVaultStateResult {
  const client           = useAegisClient();
  const { connection }   = useConnection();
  const [vault,    setVault]    = useState<VaultState | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<VaultFetchError>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const subIdRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const fetchVault = useCallback(async () => {
    if (!client || !vaultPda) return;
    if (!mountedRef.current) return;
    setLoading(true);

    try {
      const state = await getVaultStateByAddress(client, vaultPda);
      if (!mountedRef.current) return;

      if (state) {
        setVault(state);
        setError(null);
        setErrorMsg(null);
      } else {
        setVault(null);
        setError("not_found");
        setErrorMsg(
          `Vault not found at ${vaultPda.toBase58().slice(0,8)}... ` +
          `— it may have been closed or the validator was reset.`
        );
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      setVault(null);
      const msg: string = err?.message ?? String(err);
      if (msg.includes("Account does not exist") || msg.includes("has no data")) {
        setError("not_found");
        setErrorMsg("Vault account not found on-chain.");
      } else if (msg.includes("incorrect program id")) {
        setError("wrong_program");
        setErrorMsg("Program ID mismatch — redeploy and create a new vault.");
      } else {
        setError("rpc_error");
        setErrorMsg(`RPC error: ${msg.slice(0, 120)}`);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [client, vaultPda?.toBase58()]);

  // Subscribe to on-chain account changes — instant updates, no polling
  useEffect(() => {
    mountedRef.current = true;
    if (!vaultPda || !connection || !client) return;

    // Initial fetch
    fetchVault();

    // Subscribe to account changes via WebSocket
    try {
      subIdRef.current = connection.onAccountChange(
        vaultPda,
        (_accountInfo) => {
          // Account changed on-chain — re-fetch decoded state
          if (mountedRef.current) fetchVault();
        },
        "confirmed"
      );
    } catch {
      // WebSocket subscription failed — fall back to polling
      const pollId = setInterval(() => {
        if (mountedRef.current) fetchVault();
      }, 10_000);
      return () => {
        mountedRef.current = false;
        clearInterval(pollId);
      };
    }

    return () => {
      mountedRef.current = false;
      if (subIdRef.current !== null) {
        connection.removeAccountChangeListener(subIdRef.current).catch(() => {});
        subIdRef.current = null;
      }
    };
  }, [vaultPda?.toBase58(), connection, client]);

  return { vault, loading, error, errorMsg, refresh: fetchVault };
}
