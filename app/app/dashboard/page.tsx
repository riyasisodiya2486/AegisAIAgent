"use client";

import { PageShell } from "@/components/PageShell";
import { ConnectGuard } from "@/components/ConnectGuard";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { publicKey } = useWallet();

  return (
    <PageShell>
      <ConnectGuard>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {publicKey ? `${publicKey.toBase58().slice(0,8)}...${publicKey.toBase58().slice(-8)}` : "Loading..."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Vault Balance", "Daily Limit", "Spent Today", "Yield Earned"].map((label) => (
              <Card key={label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-muted-foreground font-normal">{label}</CardTitle>
                </CardHeader>
                <CardContent><Skeleton className="h-7 w-24" /></CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Activity Feed</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </ConnectGuard>
    </PageShell>
  );
}