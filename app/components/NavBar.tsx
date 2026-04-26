"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function NavBar() {
  const { connected, publicKey } = useWallet();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 max-w-screen-xl items-center px-4 mx-auto">

        <Link href="/" className="flex items-center gap-2 mr-6">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">A</span>
          </div>
          <span className="font-semibold text-sm">Aegis</span>
        </Link>

        <Badge variant="outline" className="text-xs text-orange-500 border-orange-500/30 bg-orange-500/10">
          devnet
        </Badge>

        {connected && (
          <nav className="flex items-center gap-4 text-sm ml-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/create-vault" className="text-muted-foreground hover:text-foreground transition-colors">
              Create Vault
            </Link>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-3">
          {connected && publicKey && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
            </span>
          )}
          <WalletMultiButton style={{ height: "36px", fontSize: "13px", padding: "0 16px", borderRadius: "8px" }} />
        </div>
      </div>
    </header>
  );
}