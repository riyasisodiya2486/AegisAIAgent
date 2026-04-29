"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { WalletButton } from "@/components/WalletButton";
import { NavBar } from "@/components/NavBar";

export default function HomePage() {
  const { connected }         = useWallet();
  const router                = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (connected) router.push("/dashboard"); }, [connected, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <NavBar />

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[700px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] right-[5%] w-[400px] h-[300px] bg-indigo-600/8 rounded-full blur-[100px]" />
      </div>

      <main className="relative max-w-screen-xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center min-h-[82vh] text-center gap-6">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/6 text-xs text-violet-300">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Live on Solana Devnet
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
            Secure bank accounts for{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              AI agents
            </span>
          </h1>

          <p className="text-white/40 text-lg max-w-xl leading-relaxed">
            Smart contract vaults with daily spending limits, yield on idle funds,
            and a one-click kill switch for the human owner.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {[
              ["🔒", "Daily spend limits"],
              ["📈", "Yield on idle funds"],
              ["⚡", "One-click kill switch"],
              ["🤖", "x402 autonomous payments"],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-1.5 text-sm text-white/40 border border-white/6 bg-white/3 rounded-xl px-3 py-1.5">
                <span>{icon}</span>{text}
              </div>
            ))}
          </div>

          <div className="mt-3">
            {mounted ? <WalletButton /> : (
              <div className="h-10 w-36 rounded-xl bg-violet-600/25 animate-pulse" />
            )}
          </div>

          <p className="text-xs text-white/18">Phantom · Solflare · Backpack</p>
        </div>
      </main>
    </div>
  );
}