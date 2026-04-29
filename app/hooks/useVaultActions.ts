"use client";

import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  deposit,
  updateDailyLimit,
  stakeIdleFunds,
  accrueYield,
  revokeAgent,
  withdrawAll,
} from "@aegis/sdk";
import { useAegisClient } from "./useAegisClient";
import { toast } from "sonner";

export function useVaultActions(vaultPda: PublicKey | null, agentKey: PublicKey | null) {
  const client        = useAegisClient();
  const { publicKey } = useWallet();

  const requireReady = () => {
    if (!client)    throw new Error("Wallet not connected");
    if (!publicKey) throw new Error("No wallet public key");
    if (!vaultPda)  throw new Error("No vault address");
    if (!agentKey)  throw new Error("No agent key");
    return { client, owner: publicKey };
  };

  const handleDeposit = useCallback(async (amountSol: number): Promise<string> => {
    const { client, owner } = requireReady();
    const { signature } = await deposit(client, owner, agentKey!, amountSol);
    return signature;
  }, [client, publicKey, vaultPda, agentKey]);

  const handleUpdateLimit = useCallback(async (newLimitSol: number): Promise<string> => {
    const { client, owner } = requireReady();
    return updateDailyLimit(client, owner, agentKey!, newLimitSol);
  }, [client, publicKey, vaultPda, agentKey]);

  const handleStake = useCallback(async (): Promise<string> => {
    const { client, owner } = requireReady();
    return stakeIdleFunds(client, owner, agentKey!);
  }, [client, publicKey, vaultPda, agentKey]);

  const handleAccrueYield = useCallback(async (): Promise<string> => {
    const { client } = requireReady();
    return accrueYield(client, vaultPda!);
  }, [client, vaultPda]);

  const handleRevoke = useCallback(async (): Promise<string> => {
    const { client, owner } = requireReady();
    return revokeAgent(client, owner, agentKey!);
  }, [client, publicKey, vaultPda, agentKey]);

  const handleWithdraw = useCallback(async (): Promise<string> => {
    const { client, owner } = requireReady();
    return withdrawAll(client, owner, agentKey!);
  }, [client, publicKey, vaultPda, agentKey]);

  return {
    deposit:      handleDeposit,
    updateLimit:  handleUpdateLimit,
    stake:        handleStake,
    accrueYield:  handleAccrueYield,
    revoke:       handleRevoke,
    withdraw:     handleWithdraw,
  };
}
