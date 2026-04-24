import * as http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { readTransactionLog, readRunLog } from "./logger";

const PORT = parseInt(process.env.LOG_SERVER_PORT ?? "3001", 10);

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

/**
 * Starts a small HTTP + WebSocket server.
 *
 * HTTP endpoints (for polling):
 *   GET /transactions  — returns agent_tx_log.jsonl as JSON array
 *   GET /runs          — returns agent_run_log.jsonl as JSON array
 *   GET /health        — returns { status: "ok" }
 *
 * WebSocket:
 *   Connect to ws://localhost:3001 to receive pushed log entries
 *   in real time as they are written.
 */
export function startLogServer(): void {
  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");

    if (req.url === "/transactions") {
      res.end(JSON.stringify(readTransactionLog()));
    } else if (req.url === "/runs") {
      res.end(JSON.stringify(readRunLog()));
    } else if (req.url === "/health") {
      res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Not found" }));
    }
  });

  wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    clients.add(ws);
    // Send current log snapshot on connect
    ws.send(JSON.stringify({
      type: "snapshot",
      transactions: readTransactionLog().slice(-20),
    }));

    ws.on("close", () => clients.delete(ws));
  });

  server.listen(PORT, () => {
    console.log(`[LogServer] HTTP + WS listening on http://localhost:${PORT}`);
  });
}

/**
 * Push a new log entry to all connected WebSocket clients.
 * Call this after writing to the log file.
 */
export function broadcastLogEntry(entry: unknown): void {
  const message = JSON.stringify({ type: "entry", data: entry });
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}
