"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { createVault, findVaultPda } from "@aegis/sdk";
import { TxButton } from "@/components/TxButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAegisClient } from "@/hooks/useAegisClient";
import { saveVaultAddress } from "@/lib/vaultStorage";
import { toast } from "sonner";
import { Info, ShieldCheck, Key } from "lucide-react";

export default function CreateVaultPage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const client = useAegisClient();

  const [agentKey, setAgentKey] = useState("");
  const [dailyLimit, setDailyLimit] = useState("0.1");
  const [derivedPda, setDerivedPda] = useState<string | null>(null);
  const [pdaError, setPdaError] = useState<string | null>(null);

  const handleAgentKeyChange = (val: string) => {
    const trimmed = val.trim();
    setAgentKey(trimmed);
    setDerivedPda(null);
    setPdaError(null);

    if (!publicKey || trimmed.length < 32) return;

    try {
      const agentPubkey = new PublicKey(trimmed);
      const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
      const [pda] = findVaultPda(publicKey, agentPubkey, programId);
      setDerivedPda(pda.toBase58());
    } catch {
      setPdaError("Invalid public key format.");
    }
  };

  const handleCreate = async (): Promise<string | void> => {
    if (!client || !publicKey) throw new Error("Wallet not connected");

    const limitNum = parseFloat(dailyLimit);
    if (isNaN(limitNum) || limitNum <= 0) throw new Error("Daily limit must be > 0");

    const agentPubkey = new PublicKey(agentKey.trim());
    const { signature, vaultAddress } = await createVault(
      client,
      publicKey,
      agentPubkey,
      limitNum
    );

    saveVaultAddress(publicKey.toBase58(), vaultAddress.toBase58());

    setTimeout(() => {
      router.push(`/vault/${vaultAddress.toBase58()}`);
    }, 1500);

    return signature;
  };

  const isValid = agentKey.length >= 32 && !pdaError && parseFloat(dailyLimit) > 0 && !!client;

  return (
    <div className="container max-w-2xl py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Agent Vault</h1>
        <p className="text-muted-foreground mt-2">
          Deploy a secure on-chain vault to fund your AI agent's operations.
        </p>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Vault Configuration
          </CardTitle>
          <CardDescription>
            Deterministic derivation ensures only you and your agent can interact.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="agentKey">Agent Public Key</Label>
            <Input
              id="agentKey"
              placeholder="Paste AGENT_PUBKEY from .env"
              value={agentKey}
              onChange={(e) => handleAgentKeyChange(e.target.value)}
              className="font-mono text-sm"
            />
            {pdaError && <p className="text-xs text-destructive">{pdaError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Daily Spending Limit (SOL)</Label>
            <Input
              id="limit"
              type="number"
              step="0.01"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
            />
          </div>

          {derivedPda && !pdaError && (
            <Alert className="bg-primary/5 border-primary/20 transition-all animate-in fade-in zoom-in-95">
              <Key className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Derived Vault Address</p>
                <p className="font-mono text-sm break-all select-all">{derivedPda}</p>
                <p className="text-[10px] text-muted-foreground italic">
                  Save this as VAULT_PDA_ADDRESS in your agent's .env
                </p>
              </AlertDescription>
            </Alert>
          )}

          <TxButton
            label="Initialize Vault"
            loadingLabel="Creating Vault..."
            onClick={handleCreate}
            disabled={!isValid}
            className="w-full h-12 text-lg"
          />
        </CardContent>
      </Card>

      <Alert variant="secondary" className="bg-muted/30">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs leading-relaxed">
          Need the Agent Key? Run <code>solana address -k ~/aegis-agent-keypair.json</code> in your terminal.
        </AlertDescription>
      </Alert>
    </div>
  );
}