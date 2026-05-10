"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let progressValue = 0;
    const duration = 2500; 
    const interval = 20; 
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      progressValue += increment;
      if (progressValue >= 100) {
        progressValue = 100;
        setProgress(100);
        clearInterval(timer);
        
        const finish = () => {
          const tl = gsap.timeline({
            onComplete: () => setIsVisible(false)
          });

          tl.to(".preloader-content", {
            opacity: 0,
            scale: 0.8,
            filter: "blur(20px)",
            duration: 0.8,
            ease: "power4.inOut"
          })
          .to(".preloader-curtain-top", {
            y: "-100%",
            duration: 1.2,
            ease: "expo.inOut"
          }, "-=0.4")
          .to(".preloader-curtain-bottom", {
            y: "100%",
            duration: 1.2,
            ease: "expo.inOut"
          }, "-=1.2");
        };

        if (document.readyState === "complete") {
          setTimeout(finish, 600);
        } else {
          window.addEventListener("load", () => setTimeout(finish, 600));
        }
      } else {
        setProgress(Math.floor(progressValue));
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Curtain: Top */}
      <div className="preloader-curtain-top absolute inset-0 bottom-1/2 bg-[#050505] z-0" />
      {/* Background Curtain: Bottom */}
      <div className="preloader-curtain-bottom absolute inset-0 top-1/2 bg-[#050505] z-0" />

      {/* Cyber Noise / Scanlines Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10" 
           style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }} />

      <div className="preloader-content relative z-20 flex flex-col items-center">
        {/* Brand Reveal */}
        <div className="mb-16 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="w-24 h-24 mb-8 relative"
          >
            <img src="/aegis_logo.png" alt="Aegis Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
          </motion.div>
          
          <div className="flex gap-1 overflow-hidden">
            {"AEGIS".split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.19, 1, 0.22, 1] }}
                className="text-6xl font-black tracking-tighter text-white"
              >
                {char}
              </motion.span>
            ))}
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-[10px] font-black tracking-[1em] text-blue-500/30 uppercase mt-4"
          >
            Terminal_Synchronization
          </motion.p>
        </div>

        {/* Counter Display */}
        <div className="relative flex items-center justify-center">
           <div className="text-8xl md:text-9xl font-light text-white tracking-tighter tabular-nums flex items-baseline">
             <span>{progress}</span>
             <span className="text-xl md:text-2xl text-blue-500 ml-2">%</span>
           </div>
        </div>

        {/* Dynamic Status Display */}
        <div className="mt-12 h-6 flex items-center">
           <AnimatePresence mode="wait">
              <motion.div 
                key={Math.floor(progress / 25)}
                initial={{ y: 20, opacity: 0, filter: "blur(10px)" }} 
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} 
                exit={{ y: -20, opacity: 0, filter: "blur(10px)" }} 
                className="flex items-center gap-3 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-full"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">
                  {progress < 25 && "Loading core modules..."}
                  {progress >= 25 && progress < 50 && "Establishing secure handshake..."}
                  {progress >= 50 && progress < 75 && "Syncing on-chain state..."}
                  {progress >= 75 && progress < 100 && "Optimizing neural filters..."}
                  {progress === 100 && "Protocol ready"}
                </span>
              </motion.div>
           </AnimatePresence>
        </div>
      </div>

      {/* Decorative Corner Borders */}
      <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-white/10 z-10" />
      <div className="absolute top-10 right-10 w-20 h-20 border-t border-r border-white/10 z-10" />
      <div className="absolute bottom-10 left-10 w-20 h-20 border-b border-l border-white/10 z-10" />
      <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-white/10 z-10" />
    </div>
  );
}
