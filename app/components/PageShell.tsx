"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { DisclaimerFooter } from "./DisclaimerFooter";
import { RpcStatusBanner } from "./RpcStatusBanner";
import { NavBar } from "./NavBar";
import { AmbientBackground } from "./AmbientBackground";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-col min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      {/* 1. Global Background Layers */}
      <AmbientBackground />
      
      {/* 2. Global Grainy Overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* 3. Header Infrastructure */}
      <div className="relative z-[100]">
        <NavBar />
        <RpcStatusBanner />
      </div>

      {/* 4. Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="container mx-auto max-w-6xl px-6 py-12 md:py-20 lg:px-8"
        >
          {children}
        </motion.div>
      </main>

      {/* 5. Decorative Side Elements - Fixed Alignment */}
      {/* Left Side */}
      <div className="fixed left-8 inset-y-0 hidden 2xl:flex flex-col items-center justify-center gap-8 z-[5] pointer-events-none">
        <div className="flex flex-col items-center gap-6 opacity-20">
          <span className="[writing-mode:vertical-lr] text-[8px] font-black uppercase tracking-[0.6em] text-blue-400 whitespace-nowrap">
            Aegis_Handshake_Active
          </span>
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-[1px] h-32 bg-gradient-to-b from-blue-500 to-transparent" 
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="fixed right-8 inset-y-0 hidden 2xl:flex flex-col items-center justify-center gap-8 z-[5] pointer-events-none">
        <div className="flex flex-col items-center gap-6 opacity-20">
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
            className="w-[1px] h-32 bg-gradient-to-t from-blue-500 to-transparent" 
          />
          <span className="[writing-mode:vertical-lr] rotate-180 text-[8px] font-black uppercase tracking-[0.6em] text-blue-400 whitespace-nowrap">
            Aegis_Protocol_v1.0
          </span>
        </div>
      </div>

      {/* 6. Protocol Footer */}
      <div className="relative z-20">
        <DisclaimerFooter />
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #050505;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.3);
        }
        body {
          overflow-x: hidden;
          background-color: #050505;
        }
      `}</style>
    </div>
  );
}