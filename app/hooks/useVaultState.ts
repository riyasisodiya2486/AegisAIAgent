"use client";

import { useState, useEffect, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { VaultState, getVaultStateByAddress } from "@aegis/sdk";
import { useAegisClient } from "./useAegisClient";

interface UseVaultStateResult {
  vault: VaultState | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useVaultState(vaultPda: PublicKey | null): UseVaultStateResult {
  const client = useAegisClient();
  const [vault, setVault] = useState<VaultState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!client || !vaultPda) return;
    
    // We only set 'loading' on the initial fetch to avoid 
    // flickering the UI every 8 seconds (Better UX!)
    if (!vault) setLoading(true); 
    
    setError(null);
    try {
      const state = await getVaultStateByAddress(client, vaultPda);
      setVault(state);
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch vault state.");
    } finally {
      setLoading(false);
    }
  }, [client, vaultPda, vault]);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 8000);
    return () => clearInterval(interval);
  }, [fetch]);

  return { vault, loading, error, refresh: fetch };
}
