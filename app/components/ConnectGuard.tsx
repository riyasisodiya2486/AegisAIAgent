"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Cpu, Globe } from "lucide-react";
import { PremiumButton } from "@/components/PremiumButton";

interface Props {
  children: React.ReactNode;
  message?: string;
}

export function ConnectGuard({ children, message }: Props) {
  const { connected, select, wallets } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // 1. Initializing State (Skeleton)
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative w-80 h-96 rounded-[3rem] border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent animate-pulse" />
        </div>
      </div>
    );
  }

  // 2. Restricted State (Disconnected)
  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[75vh] px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md"
        >
          {/* Decorative Cyber Grid Background */}
          <div className="absolute inset-0 z-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#3b82f612_1px,transparent_1px),linear-gradient(to_bottom,#3b82f612_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>

          <div className="relative z-10 overflow-hidden rounded-3xl sm:rounded-[3rem] border border-blue-500/10 bg-[#050505]/80 backdrop-blur-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            {/* Grainy Texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="relative space-y-10 text-center">
              {/* Animated Icon Scanner */}
              <div className="relative mx-auto w-24 h-24">
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-dashed border-blue-500/20"
                />
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-2 rounded-full border border-blue-400/10 bg-blue-500/[0.02]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-6 rounded-[2rem] bg-blue-600/10 border border-blue-500/20 text-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
                    <Lock size={32} strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Textual Content */}
              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500/50">
                  Authentication Required
                </h2>
                <h3 className="text-3xl font-light tracking-tight text-white/90">
                  Initialize <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Nucleus</span>
                </h3>
                <p className="text-sm text-white/25 leading-relaxed max-w-[260px] mx-auto font-light">
                  {message ?? "Establish a secure handshake with the Aegis network to unlock the vault."}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-8">
                <PremiumButton 
                  variant="primary" 
                  onClick={() => {
                    if (wallets.length > 0) select(wallets[0].adapter.name);
                  }}
                  className="shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                >
                  <ShieldCheck size={18} className="mr-2" /> Establish Connection
                </PremiumButton>

                <div className="flex items-center gap-5 text-[9px] font-black uppercase tracking-[0.25em] text-white/10">
                  <span className="flex items-center gap-2 hover:text-blue-400/40 transition-colors"><Globe size={11}/> SOL_MAINNET</span>
                  <div className="h-4 w-[1px] bg-white/5" />
                  <span className="flex items-center gap-2 hover:text-blue-400/40 transition-colors"><Cpu size={11}/> CRYPTO_256</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Shadow Glow */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-blue-600/10 blur-[80px] pointer-events-none opacity-50" />
        </motion.div>
      </div>
    );
  }

  // 3. Authorized State
  return <>{children}</>;
}