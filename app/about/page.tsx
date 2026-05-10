"use client";

import { motion, Variants } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { ShieldAlert, Zap, Coins, Landmark, ArrowRight, BrainCircuit, LucideIcon, Sparkles } from "lucide-react";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  }
};

const staggerContainer: Variants = {
  visible: { 
    transition: { staggerChildren: 0.12 } 
  }
};

// Fixed the Type Error by removing the 'Variants' type 
// (since this is used for a keyframe animation, not a variant toggle)
const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut" as const // Fixes the easing string error
    }
  }
};

interface Feature {
  title: string;
  icon: LucideIcon;
  body: string;
  color: string;
  glow: string;
}

export default function AboutPage() {
  const features: Feature[] = [
    {
      title: "The Problem",
      icon: ShieldAlert,
      body: "Autonomous AI agents need to transact—paying for APIs and compute. But giving an LLM direct wallet access is a massive risk. A single hallucination or prompt injection can drain funds instantly.",
      color: "text-blue-400",
      glow: "group-hover:shadow-[0_0_30px_rgba(96,165,250,0.2)]"
    },
    {
      title: "The Solution",
      icon: BrainCircuit,
      body: "Aegis deploys a PDA smart contract on Solana. The owner sets a daily limit. The agent gets restricted signing rights—spending up to the limit, while the owner keeps a one-click kill switch.",
      color: "text-blue-300",
      glow: "group-hover:shadow-[0_0_30px_rgba(147,197,253,0.2)]"
    },
    {
      title: "Yield on Idle Funds",
      icon: Coins,
      body: "Idle funds automatically earn yield via Kamino Finance. Aegis takes a 5% performance fee—the rest goes to you. Your capital works even when your agent is offline.",
      color: "text-cyan-400",
      glow: "group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
    },
    {
      title: "x402 Protocol",
      icon: Zap,
      body: "Aegis integrates with the x402 HTTP payment protocol, allowing agents to autonomously pay for API access by responding to 402 errors with on-chain payment proofs.",
      color: "text-blue-500",
      glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
    },
    {
      title: "Legal Compliance",
      icon: Landmark,
      body: "Working with NeosLegal to structure the protocol. US users have yield features disabled pending regulatory clarity to ensure long-term sustainability.",
      color: "text-white/40",
      glow: "group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
    }
  ];

  return (
    <PageShell>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-6xl mx-auto py-24 px-6 space-y-32 relative"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20" />

        <motion.div variants={fadeIn} className="relative text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/5 border border-blue-500/10 backdrop-blur-xl mb-4"
          >
            <Sparkles size={14} className="text-blue-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400/80">Protocol Manifesto v1.0</span>
          </motion.div>
          
          <h1 className="text-7xl md:text-9xl font-light tracking-tighter text-white">
            THE <span className="font-medium bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text text-transparent">AEGIS</span> LAYER
          </h1>
          <p className="text-lg md:text-xl text-white/30 max-w-2xl mx-auto font-light leading-relaxed">
            Engineered financial guardrails for the <span className="text-white/60">next generation</span> of autonomous on-chain intelligence.
          </p>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-blue-600/[0.04] blur-[140px] rounded-full pointer-events-none -z-10" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeIn}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-2xl flex flex-col justify-between group transition-all duration-500 ${f.glow} ${i === 1 ? 'lg:col-span-2' : ''}`}
            >
              <div className="space-y-8">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10 group-hover:border-blue-500/40 group-hover:bg-blue-500/5 transition-all duration-500">
                  <f.icon className={`${f.color} group-hover:scale-110 transition-transform duration-500`} size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-light text-white mb-4 tracking-tight">{f.title}</h3>
                  <p className="text-sm text-white/30 leading-relaxed font-light group-hover:text-white/50 transition-colors">{f.body}</p>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-white/5 flex justify-end">
                <ArrowRight size={18} className="text-white/10 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
            variants={fadeIn}
            className="relative p-1 bg-gradient-to-br from-blue-500/20 via-transparent to-white/5 rounded-[3.5rem] overflow-hidden group"
        >
            <div className="relative z-10 p-16 rounded-[3.4rem] bg-[#050505] flex flex-col md:flex-row items-center justify-between gap-16">
                <div className="max-w-lg space-y-8">
                    <h2 className="text-4xl md:text-5xl font-light text-white leading-tight">Empower your <span className="text-blue-400 font-medium">Agent</span> with safety.</h2>
                    <p className="text-base text-white/20 leading-relaxed font-light">
                        Deploy your first secure vault on Solana Devnet today. 
                    </p>
                    <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(37,99,235,0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        className="px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl transition-all"
                    >
                        Initialize Protocol
                    </motion.button>
                </div>
                
                <motion.div 
                  {...floatingAnimation} // Passing props directly
                  className="relative w-72 h-72 flex items-center justify-center"
                >
                    <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full" />
                    <BrainCircuit size={140} className="text-blue-500/20 relative z-10" />
                    <div className="absolute inset-0 border-[1.5px] border-blue-500/10 rounded-full animate-[spin_12s_linear_infinite]" />
                    <div className="absolute inset-6 border-[1px] border-blue-400/5 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
                </motion.div>
            </div>
        </motion.div>
      </motion.div>
    </PageShell>
  );
}