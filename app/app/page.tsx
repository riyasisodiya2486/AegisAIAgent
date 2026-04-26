"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { ConnectGuard } from "@/components/ConnectGuard";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected) router.push("/dashboard");
  }, [connected, router]);

  return (
    <PageShell>
      {!connected && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-6 -mt-8">
          <Badge variant="outline" className="text-xs">Built on Solana Devnet</Badge>
          <h1 className="text-4xl font-bold tracking-tight max-w-2xl">
            Secure bank accounts for <span className="text-primary">AI agents</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
            Aegis gives AI agents a smart contract vault with spending limits,
            yield on idle funds, and a one-click kill switch for the human owner.
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center mt-2">
            {["🔒 Daily spend limits", "📈 Yield on idle funds", "⚡ One-click kill switch"].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground border rounded-lg px-3 py-2">{f}</div>
            ))}
          </div>
          <ConnectGuard message="Connect to get started" />
        </div>
      )}
    </PageShell>
  );
}