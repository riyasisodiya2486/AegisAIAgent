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
  runs:         AgentRunLog[];
  connected:    boolean;
  agentOnline:  boolean;
  loading:      boolean;
  refresh:      () => void;
}

// Use a much longer polling interval — only poll when WS is not available
const POLL_INTERVAL_MS = 15_000; // 15 seconds

export function useAgentLogs(): UseAgentLogsResult {
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);
  const [runs,         setRuns]         = useState<AgentRunLog[]>([]);
  const [connected,    setConnected]    = useState(false);
  const [agentOnline,  setAgentOnline]  = useState(false);
  const [loading,      setLoading]      = useState(false);

  const wsRef      = useRef<WebSocket | null>(null);
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const wsActiveRef = useRef(false);
  const wsFailCountRef = useRef(0);

  const fetchLogs = useCallback(async () => {
    // Don't poll if WebSocket is connected and delivering data
    if (wsActiveRef.current) return;

    try {
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), 3000);

      const [txRes, runRes] = await Promise.allSettled([
        fetch("/api/logs/transactions", {
          cache: "no-store",
          signal: controller.signal,
        }),
        fetch("/api/logs/runs", {
          cache: "no-store",
          signal: controller.signal,
        }),
      ]);

      clearTimeout(timeoutId);
      if (!mountedRef.current) return;

      let gotData = false;

      if (txRes.status === "fulfilled" && txRes.value.ok) {
        const data = await txRes.value.json();
        if (Array.isArray(data)) {
          setTransactions([...data].reverse().slice(0, 50));
          gotData = true;
        }
      }

      if (runRes.status === "fulfilled" && runRes.value.ok) {
        const data = await runRes.value.json();
        if (Array.isArray(data)) {
          setRuns([...data].reverse().slice(0, 20));
        }
      }

      // Only mark agent online if we got actual data from the API
      setAgentOnline(gotData);
    } catch {
      // Silently ignore — agent server not running is expected
      if (mountedRef.current) setAgentOnline(false);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchLogs, POLL_INTERVAL_MS);
  }, [fetchLogs]);

  const tryWebSocket = useCallback(() => {
    if (typeof window === "undefined") return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = (process.env.NEXT_PUBLIC_LOG_SERVER_URL ?? "http://localhost:3001")
      .replace(/^http/, "ws");

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        wsActiveRef.current = true;
        setConnected(true);
        setAgentOnline(true);
        // Cancel polling — WS handles updates
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data as string);
          if (msg.type === "snapshot") {
            const txs = (msg.transactions ?? []) as TransactionLog[];
            setTransactions([...txs].reverse());
            setLoading(false);
          } else if (msg.type === "entry" && msg.data) {
            setTransactions(prev => [msg.data as TransactionLog, ...prev].slice(0, 50));
          }
        } catch {
          // ignore malformed messages
        }
      };

     ws.onerror = () => {
        wsFailCountRef.current += 1;
        wsActiveRef.current = false;
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        wsActiveRef.current = false;
        wsRef.current = null;
        setConnected(false);
        // Restart polling as fallback
        startPolling();
      };
    } catch {
      // WebSocket constructor failed — just poll
      startPolling();
    }
  }, [startPolling]);

  const refresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    mountedRef.current = true;

    // Try WS first — if it fails, polling kicks in via onclose
    tryWebSocket();

    // Also do one immediate fetch for runs data
    fetchLogs();

    // Retry WS connection every 30s if not connected
    const wsRetryInterval = setInterval(() => {
      const backoffMs = Math.min(30_000 * Math.pow(2, wsFailCountRef.current), 120_000);
      if (!wsActiveRef.current && mountedRef.current) {
        tryWebSocket();
      }
    }, 60_000);

    return () => {
      mountedRef.current = false;
      wsActiveRef.current = false;
      clearInterval(wsRetryInterval);
      if (wsRef.current)   wsRef.current.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return { transactions, runs, connected, agentOnline, loading, refresh };
}