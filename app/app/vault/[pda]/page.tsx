"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { deposit, updateDailyLimit } from "@aegis/sdk";
import { TxButton } from "@/components/TxButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAegisClient } from "@/hooks/useAegisClient";
import { useVaultState } from "@/hooks/useVaultState";
import { Wallet, TrendingUp, Shield, Copy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export default function VaultPage() {
  const { pda } = useParams<{ pda: string }>();
  const { publicKey } = useWallet();
  const client = useAegisClient();

  const vaultPda = (() => {
    try { return new PublicKey(pda); } catch { return null; }
  })();

  const { vault, loading, error, refresh } = useVaultState(vaultPda);
  const [depositAmt, setDepositAmt] = useState("0.5");
  const [newLimit, setNewLimit] = useState("");

  const handleDeposit = async (): Promise<string | void> => {
    if (!client || !publicKey || !vault) throw new Error("Not ready");
    const { signature } = await deposit(
      client,
      publicKey,
      vault.raw.agentKey,
      parseFloat(depositAmt)
    );
    await refresh();
    return signature;
  };

  const handleUpdateLimit = async (): Promise<string | void> => {
    if (!client || !publicKey || !vault) throw new Error("Not ready");
    const sig = await updateDailyLimit(
      client,
      publicKey,
      vault.raw.agentKey,
      parseFloat(newLimit)
    );
    await refresh();
    return sig;
  };

  if (error) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-10 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Vault Dashboard</h1>
            {vault && (
              <Badge variant={vault.isFrozen ? "destructive" : "outline"} className="h-6">
                {vault.isFrozen ? "Frozen" : "Active"}
              </Badge>
            )}
          </div>
          <p className="text-sm font-mono text-muted-foreground mt-1 break-all">{pda}</p>
        </div>
        <button 
           onClick={() => refresh()} 
           className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <RefreshCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Metric Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Vault Balance", value: vault ? `${vault.vaultBalanceSol.toFixed(4)} SOL` : null, icon: Wallet },
          { label: "Daily Limit", value: vault ? `${vault.dailyLimitSol.toFixed(4)} SOL` : null, icon: Shield },
          { label: "Spent Today", value: vault ? `${vault.spentTodaySol.toFixed(4)} SOL` : null, icon: TrendingUp },
          { label: "Yield (APY)", value: vault ? `${vault.yieldRatePercent.toFixed(2)}%` : null, icon: TrendingUp },
        ].map((item, i) => (
          <Card key={i} className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading && !vault ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <div className="text-2xl font-bold">{item.value ?? "0.0000"}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Card */}
      {vault && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Daily Spend Allowance</span>
              <span className="font-medium">{vault.dailySpendProgressPct}% Used</span>
            </div>
            <Progress value={vault.dailySpendProgressPct} className="h-2" />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Deposit Panel */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Deposit Funds</CardTitle>
            <CardDescription>Add SOL to increase your agent's capacity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (SOL)</Label>
              <Input 
                type="number" 
                value={depositAmt} 
                onChange={(e) => setDepositAmt(e.target.value)} 
              />
            </div>
            <TxButton 
              label="Confirm Deposit" 
              onClick={handleDeposit} 
              className="w-full" 
              disabled={!vault} 
            />
          </CardContent>
        </Card>

        {/* Limit Panel */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Update Daily Limit</CardTitle>
            <CardDescription>Adjust the 24h spending ceiling.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>New Limit (SOL)</Label>
              <Input 
                type="number" 
                placeholder="e.g. 1.5" 
                value={newLimit} 
                onChange={(e) => setNewLimit(e.target.value)} 
              />
            </div>
            <TxButton 
              label="Update Limit" 
              onClick={handleUpdateLimit} 
              variant="outline" 
              className="w-full" 
              disabled={!vault || !newLimit} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Copy Helper for Agent .env */}
      <Alert className="bg-muted/30 border-dashed">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Agent Environment Config</p>
            <code className="text-xs break-all block p-2 bg-background rounded border">
              VAULT_PDA_ADDRESS={pda}
            </code>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(pda);
              toast.success("Address copied to clipboard");
            }}
            className="p-2 hover:bg-background rounded-md transition-colors"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </Alert>
    </div>
  );
}
