"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: React.ReactNode;
  message?: string;
}

export function ConnectGuard({ children, message }: Props) {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🔐</span>
            </div>
            <CardTitle>Connect your wallet</CardTitle>
            <CardDescription>
              {message ?? "Connect your Solana wallet to access Aegis."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <WalletMultiButton />
            </div>
            <p className="text-xs text-muted-foreground mt-4">Supports Phantom and Solflare</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}