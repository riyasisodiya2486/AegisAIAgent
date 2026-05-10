"use client";

import { useEffect, useState, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { motion, useMotionValue, useTransform, Variants } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { ShieldCheck, Zap, BarChart3, Fingerprint, ArrowUpRight, Plus, AlertCircle, Activity } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { ConnectGuard } from "@/components/ConnectGuard";
import { ActivityFeed } from "@/components/feed/ActivityFeed";
import { useVaultState } from "@/hooks/useVaultState";
import { loadPrimaryVault, saveVaultAddress } from "@/lib/vaultStorage";
import { PremiumButton } from "@/components/PremiumButton";
import { findVaultPda, DEVNET_PROGRAM_ID } from "@aegis/sdk";

// --- Constants ---
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  }
};

const staggerContainer: Variants = {
  visible: { transition: { staggerChildren: 0.08 } }
};

// --- Sub-Components ---

const AgentStatCard = ({ label, value, sub, icon: Icon, chartData, loading, smallerValue }: any) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useTransform(
    [mouseX, mouseY],
    ([x, y]: any) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(37, 99, 235, 0.1), transparent 40%)`
  );

  return (
    <motion.div
      variants={fadeIn}
      onMouseMove={onMouseMove}
      className="group relative p-6 lg:p-8 rounded-[2rem] border border-white/5 bg-black/40 backdrop-blur-2xl overflow-hidden transition-all hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)]"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300"
        style={{ background }}
      />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500 text-blue-400">
            <Icon size={20} />
          </div>
          <ArrowUpRight size={16} className="text-white/20 group-hover:text-blue-400 transition-colors" />
        </div>
        <div className="mt-8">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] mb-2">{label}</p>
          {loading ? (
            <div className="h-9 w-32 bg-white/5 animate-pulse rounded-lg" />
          ) : (
            <h3 className={`${smallerValue ? 'text-xl' : 'text-2xl lg:text-3xl'} font-medium tracking-tighter text-white break-all`}>
              {value}
            </h3>
          )}
          {sub && <p className="text-[10px] text-blue-400/40 mt-2 font-mono uppercase tracking-wider">{sub}</p>}
        </div>
      </div>
      {chartData && !loading && (
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none translate-y-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`colorVal-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill={`url(#colorVal-${label})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

const HealthIndex = ({ progress }: { progress: number }) => (
  <div className="lg:col-span-2 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-blue-900/20 to-transparent relative overflow-hidden group backdrop-blur-sm">
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-4 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Agent Health Index</h4>
      </div>
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-5xl sm:text-7xl font-light tracking-tighter text-white">{progress}%</span>
        <span className="text-[10px] sm:text-sm text-blue-400/60 uppercase font-bold tracking-widest">Utilized</span>
      </div>
      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden mb-4 p-[2px]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-300 shadow-[0_0_25px_rgba(37,99,235,0.5)] rounded-full" 
        />
      </div>
    </div>
    <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-1000" />
  </div>
);

const SecurityNodes = ({ isFrozen }: { isFrozen: boolean }) => (
  <div className="p-8 rounded-[2.5rem] border border-white/5 bg-black/40 backdrop-blur-xl flex flex-col justify-between border-t-blue-500/20">
    <div className="space-y-6">
      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Security Nodes</h4>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="text-white/40 font-light">Protocol State</span>
          <span className={`flex items-center gap-2 font-bold ${isFrozen ? "text-red-400" : "text-blue-400"}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${isFrozen ? "bg-red-500" : "bg-blue-400 shadow-[0_0_8px_#60a5fa]"}`} />
            {isFrozen ? "Locked" : "Operational"}
          </span>
        </div>
        <div className="h-[1px] w-full bg-white/5" />
        <div className="flex justify-between items-center text-xs">
          <span className="text-white/40 font-light">Node Latency</span>
          <span className="text-blue-200/60 font-mono">24ms</span>
        </div>
      </div>
    </div>
    <div className="pt-8 text-[9px] text-white/20 uppercase tracking-[0.2em] leading-relaxed">
      AI safeguards active. Encrypted tunnel established via Solana Mainnet.
    </div>
  </div>
);

// --- Main Dashboard Component ---

function DashboardContent() {
  const { publicKey } = useWallet();
  const [vaultPda, setVaultPda] = useState<PublicKey | null>(null);
  const [pdaStr, setPdaStr] = useState<string | null>(null);

  const mockData = useMemo(() => Array.from({ length: 12 }, () => ({ value: 40 + Math.random() * 60 })), []);

  useEffect(() => {
    if (!publicKey) return;

    // 1. Try localStorage first (fastest path)
    const saved = loadPrimaryVault(publicKey.toBase58());
    if (saved) {
      try {
        setVaultPda(new PublicKey(saved));
        setPdaStr(saved);
        return;
      } catch (e) {
        console.error("Invalid Vault PDA in storage");
      }
    }

    // 2. Fallback: derive PDA from wallet + configured agent key
    // This recovers the dashboard after a cache clear or on a new device.
    const agentKeyStr = process.env.NEXT_PUBLIC_AGENT_PUBKEY;
    if (!agentKeyStr) return;
    try {
      const programId = new PublicKey(
        process.env.NEXT_PUBLIC_PROGRAM_ID ?? DEVNET_PROGRAM_ID.toBase58()
      );
      const agentKey = new PublicKey(agentKeyStr);
      const [derived] = findVaultPda(publicKey, agentKey, programId);
      const derivedStr = derived.toBase58();
      // Save it so next load is instant
      saveVaultAddress(publicKey.toBase58(), derivedStr);
      setVaultPda(derived);
      setPdaStr(derivedStr);
    } catch (e) {
      console.error("PDA derivation fallback failed:", e);
    }
  }, [publicKey]);

  const { vault, loading, error, errorMsg } = useVaultState(vaultPda);

  const showNoVault = !loading && !vault && !pdaStr;
  const showError = !loading && !vault && pdaStr && error;

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-7xl mx-auto space-y-10 pb-24 px-6">
      
      {/* Header */}
      <motion.div variants={fadeIn} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10 pt-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
            <Fingerprint size={12} className="text-blue-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/80">
              {publicKey ? `AUTH_ID: ${publicKey.toBase58().slice(0, 6)}...${publicKey.toBase58().slice(-6)}` : "Authenticating"}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extralight tracking-tighter text-white leading-none">
            CENTRAL <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">HUB</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Primary Action */}
          <PremiumButton 
            href="/create-vault" 
            variant="primary"
          >
            <Plus size={14} className="mr-1" /> New Vault
          </PremiumButton>

          {/* Secondary Action */}
          {pdaStr && (
            <PremiumButton 
              href={`/vault/${pdaStr}`} 
              variant="secondary"
            >
              Manage Vault
            </PremiumButton>
          )}
        </div>
      </motion.div>

      {/* Logic Screens */}
      {showError && (
        <motion.div variants={fadeIn} className="p-6 rounded-3xl border border-red-500/20 bg-red-500/5 flex items-center gap-4">
          <AlertCircle className="text-red-500 shrink-0" />
          <p className="text-[10px] text-red-400/60 font-mono">{errorMsg || "Connection Error."}</p>
        </motion.div>
      )}

      {showNoVault && (
        <motion.div variants={fadeIn} className="p-10 sm:p-20 rounded-2xl sm:rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center text-center bg-blue-500/[0.02]">
            <ShieldCheck className="text-white/20 mb-6" size={28} />
            <h3 className="text-lg sm:text-xl text-white font-light">No Protocol Detected</h3>
            <PremiumButton href="/create-vault" className="mt-8">Initialize Vault</PremiumButton>
        </motion.div>
      )}

      {/* Stats Grid */}
      {(vault || loading) && !showNoVault && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AgentStatCard 
              label="Current Holdings" 
              value={`${vault?.vaultBalanceSol || "0"} SOL`} 
              sub={`+${vault?.stakedAmountSol || "0"} Staked`} 
              icon={ShieldCheck} 
              chartData={mockData} 
              loading={loading} 
            />
            <AgentStatCard 
              label="Spend Pipeline" 
              value={`${vault?.dailyLimitSol || "0"} SOL`} 
              sub="24h Rolling Window" 
              icon={Zap} 
              loading={loading} 
            />
            <AgentStatCard 
              label="Resource Drain" 
              value={`${vault?.spentTodaySol || "0"} SOL`} 
              sub={`${vault?.dailySpendProgressPct || 0}% exhaustion`} 
              icon={BarChart3} 
              loading={loading} 
            />
            <AgentStatCard 
              label="Yield Accrued" 
              value={`${vault?.yieldEarnedSol || "0"} SOL`} 
              sub={`${vault?.yieldRatePercent || "0"}% Est. APY`} 
              icon={Activity} 
              chartData={mockData} 
              loading={loading}
              smallerValue={true} 
            />
        </div>
      )}

      {/* Panels */}
      {vault && (
        <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <HealthIndex progress={vault.dailySpendProgressPct} />
          <SecurityNodes isFrozen={vault.isFrozen} />
        </motion.div>
      )}

      {/* Activity Feed */}
      <motion.div variants={fadeIn} className="space-y-6">
        <div className="flex items-center gap-6">
          <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] whitespace-nowrap italic">Encrypted Log Stream</h3>
          <div className="h-[1px] w-full bg-gradient-to-r from-white/10 to-transparent" />
        </div>
        <div className="rounded-[2.5rem] border border-white/5 bg-blue-950/5 p-2 overflow-hidden backdrop-blur-md relative">
          <ActivityFeed />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DashboardPage() {
  return (
    <PageShell> 
      <ConnectGuard>
        <DashboardContent />
      </ConnectGuard>
    </PageShell>
  );
}