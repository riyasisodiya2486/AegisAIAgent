"use client";

import dynamic from "next/dynamic";

// This is THE fix for the WalletContext SSR error.
// WalletMultiButton must NEVER render on the server.
// dynamic + ssr:false guarantees it only runs in the browser
// after the WalletProvider has hydrated.
const WalletMultiButton = dynamic(
  async () => {
    const { WalletMultiButton } = await import(
      "@solana/wallet-adapter-react-ui"
    );
    return WalletMultiButton;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-9 w-32 rounded-lg bg-slate-800 animate-pulse" />
    ),
  }
);

export { WalletMultiButton };