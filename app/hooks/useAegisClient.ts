"use client";

import { useMemo } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { AegisClient } from "@aegis/sdk";
import { PublicKey } from "@solana/web3.js";

// Copy this exactly from your anchor.toml [programs.localnet]
const PROGRAM_ID = new PublicKey("EnAS1LC6Rgj993Zt16LwYYSNFWEgRL4VbnarbyRQATAQ");

export function useAegisClient(): AegisClient | null {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { connection } = useConnection();

  return useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;

    return new AegisClient({
      connection,
      programId: PROGRAM_ID, // <--- Add this line!
      wallet: {
        publicKey,
        signTransaction,
        signAllTransactions,
      },
    });
  }, [publicKey, signTransaction, signAllTransactions, connection]);
}