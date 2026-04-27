
"use client";



import { useMemo } from "react";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";

import { AegisClient } from "@aegis/sdk";



export function useAegisClient(): AegisClient | null {

  const { publicKey, signTransaction, signAllTransactions } = useWallet();

  const { connection } = useConnection();



  return useMemo(() => {

    // If wallet isn't fully ready, don't return a client

    if (!publicKey || !signTransaction || !signAllTransactions) return null;



    return new AegisClient({

      connection,

      wallet: {

        publicKey,

        signTransaction,

        signAllTransactions,

      },

    });

  }, [publicKey, signTransaction, signAllTransactions, connection]);

}

