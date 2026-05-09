"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ExternalLink, ShieldAlert, CheckCircle2, Cpu } from "lucide-react";

const ANCHOR_ERRORS: Record<string, string> = {
  DailyLimitExceeded: "Daily spending limit reached — wait for reset or increase the limit.",
  InsufficientFunds: "Vault has insufficient balance.",
  UnauthorizedAgent: "This wallet is not the authorized agent.",
  UnauthorizedOwner: "This wallet is not the vault owner.",
  AgentRevoked: "Agent has been revoked — vault is frozen.",
  InvalidDailyLimit: "Daily limit must be greater than zero.",
  InvalidDepositAmount: "Deposit amount must be greater than zero.",
};

export function explorerTxUrl(signature: string): string {
  const network = process.env.NEXT_PUBLIC_NETWORK ?? "localnet";
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "http://localhost:8899";
  
  if (network === "mainnet-beta") return `https://explorer.solana.com/tx/${signature}`;
  if (network === "devnet") return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  
  return `https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=${encodeURIComponent(rpcUrl)}`;
}

function parseAnchorError(msg: string): string {
  for (const [code, readable] of Object.entries(ANCHOR_ERRORS)) {
    if (msg.includes(code)) return readable;
  }
  if (msg.includes("custom program error")) {
    const match = msg.match(/0x[0-9a-f]+/i);
    return match ? `Contract error ${match[0]}` : "Transaction rejected by contract.";
  }
  if (msg.includes("insufficient lamports")) return "Insufficient SOL for fees.";
  if (msg.includes("blockhash")) return "Transaction expired — please retry.";
  if (msg.includes("User rejected")) return "Cancelled by user.";
  
  return msg.length > 100 ? msg.slice(0, 100) + "..." : msg;
}

interface Props {
  label: string;
  loadingLabel?: string;
  onClick: () => Promise<string | void | null>;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg";
  successMsg?: string;
}

export function TxButton({
  label, loadingLabel, onClick, variant = "default",
  disabled = false, className, size = "default", successMsg,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const toastId = toast.loading(
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Cpu size={12} className="text-blue-400 animate-pulse" />
          <span className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-400/60">Node_Broadcasting</span>
        </div>
        <span className="text-xs font-medium">{loadingLabel ?? `${label} in progress...`}</span>
      </div>
    );
    
    try {
      const sig = await onClick();
      
      if (sig && typeof sig === "string") {
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-400">Signature_Confirmed</span>
            <span className="text-xs">{successMsg ?? `${label} successful`}</span>
          </div>, 
          {
            id: toastId,
            description: <span className="font-mono text-[9px] text-blue-300/40 tracking-wider">TXID: {sig.slice(0, 8)}...{sig.slice(-8)}</span>,
            action: {
              label: <div className="flex items-center gap-1.5 text-blue-400 font-bold hover:text-blue-300 transition-colors"><ExternalLink size={12} /> Explorer</div>,
              onClick: () => window.open(explorerTxUrl(sig), "_blank"),
            },
            duration: 6000,
          }
        );
      } else {
        toast.success(successMsg ?? `${label} confirmed`, { id: toastId });
      }
    } catch (err: any) {
      console.error("Tx Failure:", err);
      const display = parseAnchorError(err?.message ?? String(err));
      
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-black text-[10px] uppercase tracking-[0.2em] text-red-500">System_Failure</span>
          <span className="text-xs text-red-400/90">{display}</span>
        </div>, 
        { id: toastId, duration: 8000 }
      );
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
      className={`
        relative overflow-hidden group transition-all duration-500
        ${loading ? 'opacity-80 scale-[0.98] border-blue-500/50' : 'active:scale-95'}
        text-white border border-blue-500/10 bg-[#050505] hover:bg-blue-500/5 hover:border-blue-500/30
        ${className}
      `}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2.5"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-200">
              {loadingLabel ?? "Syncing"}
            </span>
          </motion.div>
        ) : (
          <motion.span 
            key="label"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-[11px] font-black uppercase tracking-[0.25em] text-white/90 group-hover:text-blue-400 transition-colors"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* High-Performance Visualizer Overlay */}
      {!disabled && !loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
      )}
    </Button>
  );
}