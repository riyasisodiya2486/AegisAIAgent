"use client";

import { useParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { PageShell } from "@/components/PageShell";
import { ConnectGuard } from "@/components/ConnectGuard";
import { DepositPanel } from "@/components/vault/DepositPanel";
import { LimitSlider } from "@/components/vault/LimitSlider";
import { YieldDisplay } from "@/components/vault/YieldDisplay";
import { SpendProgress } from "@/components/vault/SpendProgress";
import { useVaultActions } from "@/hooks/useVaultActions";
import Link from "next/link";
import { toast } from "sonner";
import { useVaultState } from "@/hooks/useVaultState";
import { ActivityFeed } from "@/components/feed/ActivityFeed";
import { KillSwitch } from "@/components/vault/KillSwitch";
import { WithdrawPanel } from "@/components/vault/WithdrawPanel";
import { VaultStatusBanner } from "@/components/vault/VaultStatusBanner";
import { ProtocolConfigInit } from "@/components/vault/ProtocolConfigInit";
import { RefreshCcw, ArrowLeft, ShieldAlert, Copy, Terminal, Sparkles } from "lucide-react";
import { motion, Variants } from "framer-motion";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};

const containerVariants: Variants = {
  visible: { 
    transition: { staggerChildren: 0.08 } 
  }
};

export default function VaultPage() {
  const { pda } = useParams<{ pda: string }>();
  const { publicKey } = useWallet();

  const vaultPda = (() => {
    try {
      return new PublicKey(pda);
    } catch {
      return null;
    }
  })();

  const { vault, loading, error, errorMsg, refresh } = useVaultState(vaultPda);

  const agentKey = vault
    ? (vault.raw.originalAgentKey &&
      !vault.raw.originalAgentKey.equals(PublicKey.default)
        ? vault.raw.originalAgentKey
        : vault.raw.agentKey)
    : null;
  const actions = useVaultActions(vaultPda, agentKey);

  if (!vaultPda) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 rounded-full bg-red-500/5 border border-red-500/20 mb-6"
          >
            <ShieldAlert className="text-red-400" size={32} />
          </motion.div>
          <p className="text-white/40 font-light text-lg">Invalid vault address detected.</p>
          <Link
            href="/dashboard"
            className="mt-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <ConnectGuard>
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-5xl mx-auto space-y-10 py-12 px-6 relative"
        >
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10" />

          {/* Header Section */}
          <motion.div variants={fadeIn} className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-blue-400 transition-all group"
              >
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Dashboard
              </Link>
              <h1 className="text-5xl font-light tracking-tighter text-white">
                Vault <span className="font-medium bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Configuration</span>
              </h1>
              <div 
                className="flex items-center gap-3 group cursor-pointer w-fit" 
                onClick={() => {
                  navigator.clipboard.writeText(pda);
                  toast.success("Address copied to clipboard");
                }}
              >
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/10 group-hover:border-blue-500/30 transition-colors">
                  <Terminal size={12} className="text-blue-400/60" />
                </div>
                <p className="font-mono text-[11px] text-white/30 group-hover:text-white/60 transition-colors break-all max-w-xs md:max-w-none">
                  {pda}
                </p>
              </div>
            </div>
            
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500/[0.03] border border-blue-500/10 text-white/40 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
              <span className="text-[10px] font-black uppercase tracking-widest">Sync State</span>
            </button>
          </motion.div>

          <motion.div variants={fadeIn}>
            <VaultStatusBanner vault={vault} />
          </motion.div>
          
          <motion.div variants={fadeIn}>
             <ProtocolConfigInit />
          </motion.div>

          {/* Main Controls Grid */}
          {vault && (
            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <motion.div whileHover={{ y: -4 }} className="group rounded-[2.5rem] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-2xl overflow-hidden p-1 transition-all hover:border-blue-500/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.05)]">
                  <DepositPanel vault={vault} onDeposit={actions.deposit} onSuccess={refresh} />
                </motion.div>
                <motion.div whileHover={{ y: -4 }} className="group rounded-[2.5rem] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-2xl overflow-hidden p-1 transition-all hover:border-blue-500/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.05)]">
                  <LimitSlider vault={vault} onUpdateLimit={actions.updateLimit} onSuccess={refresh} />
                </motion.div>
              </div>
              <div className="space-y-6">
                <motion.div whileHover={{ y: -4 }} className="group rounded-[2.5rem] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-2xl overflow-hidden p-1 transition-all hover:border-blue-500/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.05)]">
                  <SpendProgress vault={vault} />
                </motion.div>
                <motion.div whileHover={{ y: -4 }} className="group rounded-[2.5rem] border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-2xl overflow-hidden p-1 transition-all hover:border-blue-500/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.05)]">
                  <YieldDisplay vault={vault} onStake={actions.stake} onAccrueYield={actions.accrueYield} onSuccess={refresh} />
                </motion.div>
              </div>
            </motion.div>
          )}

          {vault && (
            <motion.div variants={fadeIn} className="rounded-[2.5rem] border border-white/5 bg-black/20 backdrop-blur-md overflow-hidden">
              <ActivityFeed />
            </motion.div>
          )}

          {/* Emergency Section */}
          {vault && (
            <motion.div variants={fadeIn} className="space-y-8 pt-10">
              <div className="relative flex items-center gap-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-red-500/20" />
                <div className="flex items-center gap-3 px-5 py-2 rounded-full border border-red-500/20 bg-red-500/5 backdrop-blur-md">
                  <ShieldAlert size={14} className="text-red-500 animate-pulse" />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">
                    Danger Zone
                  </span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-red-500/20" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-[2.5rem] border border-red-500/10 bg-red-500/[0.01] hover:bg-red-500/[0.03] transition-all overflow-hidden p-1">
                  <KillSwitch vault={vault} onRevoke={actions.revoke} onSuccess={refresh} />
                </div>
                <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all overflow-hidden p-1">
                  <WithdrawPanel vault={vault} onWithdraw={actions.withdraw} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Infrastructure Metadata */}
          {vault && (
            <motion.div variants={fadeIn} className="rounded-[3rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-10 space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles size={40} className="text-blue-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-blue-400/40 uppercase tracking-[0.3em]">Agent Identity</label>
                  <p className="font-mono text-xs text-white/40 break-all leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/5 group-hover:border-blue-500/20 transition-colors">
                    {vault.agentAddress}
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-blue-400/40 uppercase tracking-[0.3em]">Authority Owner</label>
                  <p className="font-mono text-xs text-white/40 break-all leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/5 group-hover:border-blue-500/20 transition-colors">
                    {vault.ownerAddress}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-8 border-t border-white/5 relative z-10">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-blue-500/50">
                    <Terminal size={14} />
                  </div>
                  <code className="block w-full text-[11px] bg-black/60 pl-11 pr-4 py-4 rounded-2xl text-blue-400/60 font-mono border border-white/5">
                    VAULT_PDA_ADDRESS={pda}
                  </code>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`VAULT_PDA_ADDRESS=${pda}`);
                    toast.success("Environment variable copied");
                  }}
                  className="group flex items-center gap-3 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                >
                  <Copy size={16} />
                  <span className="text-[10px] uppercase tracking-widest">Copy .env</span>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </ConnectGuard>
    </PageShell>
  );
}