"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@/components/WalletButton";
import Link from "next/link";

export function NavBar() {
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted]    = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-screen-xl mx-auto px-6 flex h-14 items-center gap-4">

        <Link href="/" className="flex items-center gap-2.5 mr-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">Aegis</span>
        </Link>

        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 tracking-wide">
          DEVNET
        </span>

        {mounted && connected && (
          <nav className="flex items-center gap-5 text-sm ml-2">
            <Link href="/dashboard" className="text-white/50 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/create-vault" className="text-white/50 hover:text-white transition-colors">
              Create Vault
            </Link>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3">
          {mounted && connected && publicKey && (
            <span className="hidden sm:block text-xs text-white/30 font-mono">
              {publicKey.toBase58().slice(0,4)}···{publicKey.toBase58().slice(-4)}
            </span>
          )}
          {/* WalletMultiButton is dynamically imported — never SSR */}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}