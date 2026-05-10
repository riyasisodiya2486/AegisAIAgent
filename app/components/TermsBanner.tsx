"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ChevronRight, Scale } from "lucide-react";

export function TermsBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("aegis_terms_accepted");
    if (!accepted) {
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("aegis_terms_accepted", "1");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          className="fixed bottom-4 sm:bottom-6 right-0 sm:right-6 left-0 sm:left-auto z-[100] max-w-[360px] w-full px-4 sm:px-0 mx-auto sm:mx-0"
        >
          <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-blue-500/20 bg-[#050505]/90 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 sm:p-7 group">
            {/* High-Performance Blue Glow */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-start gap-5">
                <div className="mt-1 w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-inner">
                  <ShieldAlert size={22} className="text-blue-400 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400/90">Protocol Security</h4>
                  <p className="text-[12px] leading-relaxed text-white/60 font-light">
                    Aegis is <span className="text-blue-100 font-semibold">autonomous experimental software</span>. 
                    System logic variances or node synchronization errors may result in irreversible capital loss. 
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAccept}
                  className="group relative w-full overflow-hidden py-3.5 rounded-xl bg-blue-600 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-[0.97]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Initialize & Sync
                    <ChevronRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                  </span>
                </button>
                
                <div className="flex items-center justify-center gap-2.5 opacity-30 hover:opacity-60 transition-opacity duration-300">
                  <Scale size={11} className="text-blue-200" />
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-100">Terminal_v1.0.4 // Security_First</span>
                </div>
              </div>
            </div>

            {/* Bottom Scanning Accent */}
            <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}