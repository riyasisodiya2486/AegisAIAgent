"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface TransactionLog {
  timestamp: string;
  status: "SUCCESS" | "DRY_RUN" | "ERROR";
  signature: string;
  amount_sol: number;
  recipient: string;
  memo: string;
  remaining_budget?: number;
  error?: string;
}

export interface AgentRunLog {
  run_id: string;
  timestamp: string;
  task: string;
  success: boolean;
  output: string;
  steps: Array<{
    tool: string;
    input: unknown;
    output: string;
    timestamp: string;
  }>;
  duration_ms: number;
  error?: string;
}

interface UseAgentLogsResult {
  transactions: TransactionLog[];
  runs: AgentRunLog[];
  connected: boolean;
  loading: boolean;
  refresh: () => void;
}

const LOG_SERVER_WS = process.env.NEXT_PUBLIC_LOG_SERVER_URL?.replace("http", "ws") ?? "ws://localhost:3001";
const POLL_INTERVAL = 5000;

export function useAgentLogs(): UseAgentLogsResult {
  // FIX: Added explicit types to useState to avoid never[]
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);
  const [runs, setRuns] = useState<AgentRunLog[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // FIX: Added proper types for refs
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Fetch from API route (polling fallback)
  const fetchLogs = useCallback(async () => {
    try {
      const [txRes, runRes] = await Promise.all([
        fetch("/api/logs/transactions", { cache: "no-store" }),
        fetch("/api/logs/runs", { cache: "no-store" }),
      ]);

      if (!mountedRef.current) return;

      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions([...txData].reverse().slice(0, 50));
      }
      if (runRes.ok) {
        const runData = await runRes.json();
        setRuns([...runData].reverse().slice(0, 20));
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  // FIX: startPolling needed to be declared before connectWs to avoid reference errors
  const startPolling = useCallback(() => {
    fetchLogs();
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchLogs, POLL_INTERVAL);
  }, [fetchLogs]);

  const connectWs = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const ws = new WebSocket(LOG_SERVER_WS);
      wsRef.current = ws;

      ws.onopen = () => {
        if (mountedRef.current) setConnected(true);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "snapshot") {
            setTransactions([...(msg.transactions ?? [])].reverse());
            setLoading(false);
          } else if (msg.type === "entry" && msg.data) {
            setTransactions(prev => [msg.data, ...prev].slice(0, 50));
          }
        } catch (e) {
          console.warn("Malformed WS message", e);
        }
      };

      ws.onerror = () => {
        if (mountedRef.current) setConnected(false);
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        wsRef.current = null;
        startPolling(); // Fallback to polling
      };
    } catch (e) {
      console.error("WS Connection failed", e);
      startPolling();
    }
  }, [startPolling]); // FIX: Added startPolling to dependency array

  const refresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    mountedRef.current = true;
    connectWs();
    fetchLogs();

    return () => {
      mountedRef.current = false;
      // FIX: Optional chaining for cleanup
      wsRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [connectWs, fetchLogs]); // FIX: Added missing dependencies

  return { transactions, runs, connected, loading, refresh };
}