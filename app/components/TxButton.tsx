"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react"; // Assuming you have lucide-react installed

// Map common Anchor error codes to readable messages
const ANCHOR_ERRORS: Record<string, string> = {
  DailyLimitExceeded: "Daily spending limit reached — wait for reset or increase the limit.",
  InsufficientFunds:  "Vault has insufficient balance.",
  UnauthorizedAgent:  "This wallet is not the authorized agent.",
  UnauthorizedOwner:  "This wallet is not the vault owner.",
  AgentRevoked:       "Agent has been revoked — vault is frozen.",
  InvalidDailyLimit:  "Daily limit must be greater than zero.",
  InvalidDepositAmount: "Deposit amount must be greater than zero.",
};

function parseAnchorError(msg: string): string {
  for (const [code, readable] of Object.entries(ANCHOR_ERRORS)) {
    if (msg.includes(code)) return readable;
  }
  if (msg.includes("custom program error")) {
    const match = msg.match(/0x[0-9a-f]+/i);
    return match ? `Contract error ${match[0]}` : "Transaction rejected by contract.";
  }
  if (msg.includes("insufficient lamports")) return "Insufficient SOL for transaction fees.";
  if (msg.includes("blockhash")) return "Transaction expired — please try again.";
  if (msg.includes("User rejected")) return "Transaction cancelled by user.";
  
  return msg.length > 100 ? msg.slice(0, 100) + "..." : msg;
}

interface Props {
  label:         string;
  loadingLabel?: string;
  onClick:       () => Promise<string | void | null>;
  variant?:      "default" | "destructive" | "outline" | "secondary" | "ghost";
  disabled?:     boolean;
  className?:    string;
  size?:         "default" | "sm" | "lg";
  successMsg?:   string;
}

export function TxButton({
  label, loadingLabel, onClick, variant = "default",
  disabled = false, className, size = "default", successMsg,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const toastId = toast.loading(loadingLabel ?? `${label}...`);
    
    try {
      const sig = await onClick();
      
      if (sig && typeof sig === "string") {
        toast.success(successMsg ?? `${label} confirmed`, {
          id: toastId,
          description: `${sig.slice(0, 8)}...${sig.slice(-8)}`,
          action: {
            label: "View",
            onClick: () => window.open(
              `https://explorer.solana.com/tx/${sig}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`,
              "_blank"
            ),
          },
          duration: 6000,
        });
      } else {
        toast.success(successMsg ?? `${label} confirmed`, { id: toastId });
      }
    } catch (err: any) {
      console.error("Transaction Error:", err);
      const raw     = err?.message ?? String(err);
      const display = parseAnchorError(raw);
      
      toast.error(`${label} failed`, {
        id: toastId,
        description: display,
        duration: 8000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      onClick={handleClick}
      className={className}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingLabel ?? label}</span>
        </div>
      ) : (
        label
      )}
    </Button>
  );
}