"use client";

import { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";

type RpcStatus = "ok" | "slow" | "down" | "checking";

export function useRpcHealth() {
  const { connection } = useConnection();
  const [status,  setStatus]  = useState<RpcStatus>("checking");
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const start = Date.now();
      try {
        await connection.getSlot("confirmed");
        const ms = Date.now() - start;
        if (!mounted) return;
        setLatency(ms);
        setStatus(ms > 3000 ? "slow" : "ok");
      } catch {
        if (!mounted) return;
        setStatus("down");
        setLatency(null);
      }
    };

    check();
    const id = setInterval(check, 30_000); // check every 30s
    return () => { mounted = false; clearInterval(id); };
  }, [connection]);

  return { status, latency };
}
