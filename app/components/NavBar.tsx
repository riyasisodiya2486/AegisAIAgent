"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/components/WalletButton";
import Link from "next/link";

export function NavBar() {
  const { connected }         = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-xl">
      <div className="max-w-screen-xl mx-auto px-6 flex h-14 items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 mr-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">Aegis</span>
        </Link>

        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-orange-500/25 bg-orange-500/8 text-orange-400 tracking-wide shrink-0">
          DEVNET
        </span>

        {mounted && connected && (
          <nav className="flex items-center gap-5 text-sm ml-2">
            <Link href="/dashboard" className="text-white/45 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/create-vault" className="text-white/45 hover:text-white transition-colors">
              Create Vault
            </Link>
          </nav>
        )}

        <div className="ml-auto">
          {mounted && <WalletButton />}
        </div>
      </div>
    </header>
  );
}