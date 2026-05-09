"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { createVault, findVaultPda } from "@aegis/sdk";
import { motion, useMotionValue, useTransform, Variants } from "framer-motion";
import { ShieldCheck, Key, ArrowRight, Fingerprint, Info, Cpu } from "lucide-react";

import { TxButton } from "@/components/TxButton";
import { useAegisClient } from "@/hooks/useAegisClient";
import { saveVaultAddress } from "@/lib/vaultStorage";
import { PageShell } from "@/components/PageShell";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};

export default function CreateVaultPage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const client = useAegisClient();

  const [agentKey, setAgentKey] = useState("");
  const [dailyLimit, setDailyLimit] = useState("0.1");
  const [derivedPda, setDerivedPda] = useState<string | null>(null);
  const [pdaError, setPdaError] = useState<string | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Updated radial gradient to Electric Blue
  const radialBg = useTransform(
    [mouseX, mouseY],
    ([x, y]: any) => `radial-gradient(400px circle at ${x}px ${y}px, rgba(37, 99, 235, 0.1), transparent 40%)`
  );

  const handleAgentKeyChange = (val: string) => {
    const trimmed = val.trim();
    setAgentKey(trimmed);
    setDerivedPda(null);
    setPdaError(null);

    if (!publicKey || trimmed.length < 32) return;

    try {
      const agentPubkey = new PublicKey(trimmed);
      const programId = client ? client.programId : new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);
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
    const { signature, vaultAddress } = await createVault(client, publicKey, agentPubkey, limitNum);

    saveVaultAddress(publicKey.toBase58(), vaultAddress.toBase58());
    setTimeout(() => router.push(`/vault/${vaultAddress.toBase58()}`), 1500);
    return signature;
  };

  const isValid = agentKey.length >= 32 && !pdaError && parseFloat(dailyLimit) > 0 && !!client;

  return (
    <PageShell>
      <div className="relative max-w-2xl mx-auto py-12 px-6">
        {/* Updated Blur Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <div className="mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Cpu size={12} className="text-blue-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Deployment Module</span>
            </div>
            <h1 className="text-4xl font-light tracking-tight text-white leading-tight">
              Create <span className="font-medium text-blue-400">Agent Vault</span>
            </h1>
            <p className="text-white/40 text-sm font-light">
              Deploy a secure on-chain vault to fund your AI agent's operations.
            </p>
          </div>

          <motion.div
            onMouseMove={handleMouseMove}
            className="group relative p-8 rounded-[2rem] border border-white/5 bg-black/40 backdrop-blur-2xl overflow-hidden"
          >
            <motion.div
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300"
              style={{ background: radialBg }}
            />

            <div className="relative z-10 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Agent Public Key</label>
                </div>
                <input
                  type="text"
                  placeholder="Paste AGENT_PUBKEY from .env"
                  value={agentKey}
                  onChange={(e) => handleAgentKeyChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white font-mono text-sm placeholder:text-white/10 focus:outline-none focus:border-blue-500/30 transition-all"
                />
                {pdaError && <p className="text-[10px] text-red-400 font-mono">{pdaError}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest px-1">Daily Spending Limit (SOL)</label>
                <input
                  type="number"
                  step="0.01"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-blue-500/30 transition-all"
                />
              </div>

              {derivedPda && !pdaError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Fingerprint size={12} className="text-blue-400" />
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Derived Vault Address</span>
                  </div>
                  <p className="text-xs font-mono text-white/60 break-all select-all leading-relaxed">
                    {derivedPda}
                  </p>
                  <p className="text-[9px] text-white/20 italic">
                    Save this as <span className="text-blue-400/40">VAULT_PDA_ADDRESS</span> in your agent's .env
                  </p>
                </motion.div>
              )}

              <TxButton
                label={
                  (<span className="flex items-center justify-center gap-2">
                    Initialize Vault <ArrowRight size={16} />
                  </span>) as any
                }
                loadingLabel="Creating Vault..."
                onClick={handleCreate}
                disabled={!isValid}
                className={`w-full h-14 rounded-xl font-bold transition-all duration-300 ${
                    isValid 
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500" 
                    : "bg-white/5 text-white/20 border border-white/5"
                }`}
              />
            </div>
          </motion.div>

          {/* Code block helper with blue accent */}
          <div className="mt-8 p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex items-start gap-4">
            <div className="p-2 rounded-lg bg-white/5">
              <Info size={14} className="text-white/40" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-white/40 leading-relaxed">
                Need the Agent Key? Run the following in your terminal:
              </p>
              <code className="block text-[10px] text-blue-400/60 font-mono bg-black/20 p-2 rounded border border-white/5 mt-2">
                solana address -k ~/aegis-agent-keypair.json
              </code>
            </div>
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}