"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  label: string;
  loadingLabel?: string;
  onClick: () => Promise<string | void>; // Expects the transaction signature back
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  disabled?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * A standard Aegis button for on-chain actions.
 * Handles loading states and provides toast feedback with Explorer links.
 */
export function TxButton({
  label,
  loadingLabel,
  onClick,
  variant = "default",
  disabled = false,
  className,
  size = "default",
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || disabled) return;
    
    setLoading(true);
    const toastId = toast.loading(loadingLabel ?? `${label}...`);

    try {
      const sig = await onClick();

      // If we get a signature string, show the success toast with Solscan link
      if (sig && typeof sig === "string") {
        toast.success(`${label} Successful`, {
          id: toastId,
          description: `Signature: ${sig.slice(0, 8)}...${sig.slice(-8)}`,
          action: {
            label: "Explorer",
            onClick: () =>
              window.open(
                `https://solscan.io/tx/${sig}?cluster=devnet`,
                "_blank"
              ),
          },
          duration: 6000,
        });
      } else {
        toast.success(`${label} completed`, { id: toastId });
      }
    } catch (err: any) {
      console.error("Transaction Error:", err);
      const msg = err?.message ?? String(err);
      
      // Better error parsing for common Solana/Anchor errors
      const display = msg.includes("User rejected")
        ? "Transaction cancelled by user."
        : msg.includes("custom program error")
        ? `Program Error: ${msg.split(":").pop()?.trim()}`
        : msg.slice(0, 100);

      toast.error(`${label} Failed`, {
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
      disabled={disabled || loading}
      onClick={handleClick}
      className={className}
      size={size}
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
