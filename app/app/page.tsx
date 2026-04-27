"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { WalletMultiButton } from "@/components/WalletButton";
import { NavBar } from "@/components/NavBar";

export default function HomePage() {
  const { connected }          = useWallet();
  const router                 = useRouter();
  const [mounted, setMounted]  = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (connected) router.push("/dashboard"); }, [connected, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <NavBar />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-indigo-600/6 rounded-full blur-[100px]" />
      </div>

      <main className="relative max-w-screen-xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center min-h-[82vh] text-center gap-7">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/25 bg-violet-500/8 text-xs text-violet-300">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Built on Solana Devnet
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
            Secure bank accounts for{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              AI agents
            </span>
          </h1>

          <p className="text-white/45 text-lg max-w-xl leading-relaxed">
            Give your autonomous agents a smart contract vault with daily spending limits,
            yield on idle funds, and a one-click kill switch.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {[
              { icon: "🔒", text: "Daily spend limits" },
              { icon: "📈", text: "Yield on idle funds" },
              { icon: "⚡", text: "One-click kill switch" },
              { icon: "🤖", text: "x402 payments" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 text-sm text-white/50 border border-white/8 bg-white/3 rounded-xl px-3 py-1.5"
              >
                <span>{icon}</span> {text}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-2">
            {mounted ? (
              <WalletMultiButton />
            ) : (
              <div className="h-10 w-36 rounded-lg bg-violet-600/30 animate-pulse" />
            )}
          </div>

          <p className="text-xs text-white/20">
            Phantom · Solflare · Backpack
          </p>
        </div>
      </main>
    </div>
  );
}