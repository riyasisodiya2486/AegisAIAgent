"use client";

import { FC, ReactNode, useMemo, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const network  = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl(network),
    [network]
  );

  // Pass empty array — Phantom, Solflare, Backpack all register
  // themselves automatically via the Wallet Standard protocol.
  // Passing PhantomWalletAdapter() explicitly causes double-registration.
  const wallets = useMemo(() => [], []);

  // We remove the !mounted early return to ensure that 
  // children (like NavBar) always have a WalletContext available,
  // preventing the "read 'wallets' on a WalletContext without providing one" error.
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};