import * as dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import {
  verifyPayment,
  buildPaymentRequired,
  PaymentProof,
} from "./verifier";

const app  = express();
const PORT = parseInt(process.env.PORT ?? "4402", 10);

app.use(cors());
app.use(express.json());

// ── Payment enforcement middleware ─────────────────────────────────────────
function requirePayment(description: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const proofHeader = req.headers["x-payment-proof"] as string | undefined;

    // No proof — return 402 with payment instructions
    if (!proofHeader) {
      const payment = buildPaymentRequired(description);
      res.status(402).json({
        error: "Payment Required",
        message: `This endpoint requires ${payment.amount} SOL payment`,
        payment_required: payment,
      });
      return;
    }

    // Parse proof header
    let proof: PaymentProof;
    try {
      proof = JSON.parse(proofHeader);
    } catch {
      res.status(400).json({ error: "Invalid X-Payment-Proof header — must be valid JSON" });
      return;
    }

    // Verify payment on-chain
    const required = buildPaymentRequired(description);
    const result   = await verifyPayment(proof, required);

    if (!result.valid) {
      res.status(402).json({
        error: "Payment verification failed",
        reason: result.reason,
        payment_required: required,
      });
      return;
    }

    (req as any).paymentVerified = result;
    next();
  };
}

// ── Free endpoint ──────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    server: "Aegis x402 Mock API",
    price_sol: process.env.X402_PRICE_SOL,
    treasury: process.env.X402_TREASURY_PUBKEY?.slice(0, 8) + "...",
    timestamp: new Date().toISOString(),
  });
});

// ── Paid endpoint 1: compute ───────────────────────────────────────────────
app.get(
  "/api/compute",
  requirePayment("Pay 0.001 SOL for compute query"),
  (req: Request, res: Response) => {
    const payment = (req as any).paymentVerified;
    res.json({
      success: true,
      endpoint: "/api/compute",
      result: {
        query_id: `qry_${Date.now()}`,
        data: {
          primes_up_to_100: [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97],
          computation_ms: 42,
          node: "devnet-compute-node-1",
        },
      },
      payment_received: { amount_sol: payment.amount_sol, payer: payment.payer },
      timestamp: new Date().toISOString(),
    });
  }
);

// ── Paid endpoint 2: inference ─────────────────────────────────────────────
app.post(
  "/api/inference",
  requirePayment("Pay 0.001 SOL for AI inference"),
  (req: Request, res: Response) => {
    const payment = (req as any).paymentVerified;
    const { prompt = "Hello" } = req.body;
    res.json({
      success: true,
      endpoint: "/api/inference",
      result: {
        inference_id: `inf_${Date.now()}`,
        prompt,
        response: `[Mock AI response to: "${prompt}"] Answer: 42. Powered by Aegis x402.`,
        tokens_used: 64,
        model: "aegis-mock-v1",
      },
      payment_received: { amount_sol: payment.amount_sol, payer: payment.payer },
      timestamp: new Date().toISOString(),
    });
  }
);

// ── Paid endpoint 3: storage ───────────────────────────────────────────────
app.get(
  "/api/storage/:key",
  requirePayment("Pay 0.001 SOL for storage access"),
  (req: Request, res: Response) => {
    const payment = (req as any).paymentVerified;
    
    const key = req.params.key as string;

    const mockStore: Record<string, string> = {
      "dataset-001": "Sales Q1 2026: revenue=$1.2M, units=42000",
      "model-weights": "Binary blob [mock weights v2.1]",
    };
    res.json({
      success: true,
      endpoint: `/api/storage/${req.params.key}`,
      result: {
        key: req.params.key,
        value: mockStore[key] ?? `No data for key: ${key}`,
      },
      payment_received: { amount_sol: payment.amount_sol, payer: payment.payer },
      timestamp: new Date().toISOString(),
    });
  }
);

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n[x402 Server] Running on http://localhost:${PORT}`);
  console.log(`[x402 Server] Treasury: ${process.env.X402_TREASURY_PUBKEY}`);
  console.log(`[x402 Server] Price: ${process.env.X402_PRICE_SOL} SOL per call`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /health           (free)`);
  console.log(`  GET  /api/compute      (paid)`);
  console.log(`  POST /api/inference    (paid)`);
  console.log(`  GET  /api/storage/:key (paid)\n`);
});