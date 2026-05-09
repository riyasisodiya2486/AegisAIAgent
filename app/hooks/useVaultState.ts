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

// Simple module-level cache — shared across all hook instances
const cache = new Map<string, { state: VaultState; ts: number }>();
const CACHE_TTL_MS = 3000; // 3 seconds

export function useVaultState(vaultPda: PublicKey | null): UseVaultStateResult {
  const client          = useAegisClient();
  const { connection }  = useConnection();
  const [vault,    setVault]    = useState<VaultState | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<VaultFetchError>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchVault = useCallback(async () => {
    if (!client || !vaultPda) return;
    const key = vaultPda.toBase58();

    // Return cached value if fresh enough
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      setVault(cached.state);
      setError(null);
      setErrorMsg(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const state = await getVaultStateByAddress(client, vaultPda);
      if (!mountedRef.current) return;

      if (state) {
        cache.set(key, { state, ts: Date.now() });
        setVault(state);
        setError(null);
        setErrorMsg(null);
      } else {
        cache.delete(key);
        setVault(null);
        setError("not_found");
        setErrorMsg(
          `Vault not found at ${key.slice(0, 8)}... ` +
          `— may have been closed or the validator was reset.`
        );
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      cache.delete(key);
      setVault(null);
      const msg = err?.message ?? String(err);
      if (msg.includes("Account does not exist") || msg.includes("has no data")) {
        setError("not_found");
        setErrorMsg("Vault account not found on-chain.");
      } else if (msg.includes("incorrect program id")) {
        setError("wrong_program");
        setErrorMsg("Program ID mismatch — redeploy and create a new vault.");
      } else {
        setError("rpc_error");
        setErrorMsg(`RPC error: ${msg.slice(0, 100)}`);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [client, vaultPda?.toBase58()]);

  useEffect(() => {
    mountedRef.current = true;
    if (!vaultPda || !connection || !client) return;

    fetchVault();

    // Use onAccountChange subscription — fires immediately when vault changes
    let subId: number | null = null;
    try {
      subId = connection.onAccountChange(
        vaultPda,
        () => {
          // Invalidate cache on account change
          cache.delete(vaultPda.toBase58());
          if (mountedRef.current) fetchVault();
        },
        "confirmed"
      );
    } catch {
      // Fallback to polling every 10s
      const id = setInterval(() => {
        if (mountedRef.current) fetchVault();
      }, 10_000);
      return () => {
        mountedRef.current = false;
        clearInterval(id);
      };
    }

    return () => {
      mountedRef.current = false;
      if (subId !== null) {
        connection.removeAccountChangeListener(subId).catch(() => {});
      }
    };
  }, [vaultPda?.toBase58(), connection, client]);

  return { vault, loading, error, errorMsg, refresh: fetchVault };
}