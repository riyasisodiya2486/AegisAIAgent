"use client";

import { useMemo } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { AegisClient } from "@aegis/sdk";

export function useAegisClient(): AegisClient | null {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();

  return useMemo(() => {
    // Return null safely if any required piece is missing
    if (!publicKey || !signTransaction || !signAllTransactions) return null;
    if (!connection) return null;

    try {
      return new AegisClient({
        connection,
        wallet: { publicKey, signTransaction, signAllTransactions },
      });
    } catch {
      return null;
    }
  }, [
    publicKey?.toBase58(),
    signTransaction,
    signAllTransactions,
    connection,
  ]);
}