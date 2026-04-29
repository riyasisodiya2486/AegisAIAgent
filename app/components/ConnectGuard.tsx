"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";

interface Props {
  children: React.ReactNode;
  message?: string;
}

export function ConnectGuard({ children, message }: Props) {
  const { connected }         = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-72 h-44 rounded-2xl bg-white/4 animate-pulse" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-sm rounded-2xl border border-white/8 bg-white/3 p-8 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/12 border border-violet-500/18 flex items-center justify-center mx-auto text-2xl">
            🔐
          </div>
          <div>
            <h2 className="text-base font-semibold">Connect your wallet</h2>
            <p className="text-sm text-white/35 mt-1">
              {message ?? "Connect to access Aegis"}
            </p>
          </div>
          <div className="flex justify-center">
            <WalletButton />
          </div>
          <p className="text-xs text-white/20">Phantom · Solflare</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}