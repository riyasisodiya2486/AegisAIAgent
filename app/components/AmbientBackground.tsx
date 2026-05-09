"use client";

import { motion } from "framer-motion";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#02040a]">
      {/* 1. Grain/Noise Overlay - Essential for the 'Premium' texture */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* 2. Primary Orbital (Electric Cobalt) */}
      <motion.div
        animate={{
          x: [-200, 200, -100, -200],
          y: [-100, 100, 200, -100],
          scale: [1, 1.3, 1, 1.1],
          opacity: [0.2, 0.35, 0.2] 
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          // Swapped Emerald for a strong Royal/Cobalt Blue
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* 3. Secondary Orbital (Deep Indigo/Violet) */}
      <motion.div
        animate={{
          x: [300, -200, 100, 300],
          y: [200, -100, 50, 200],
          scale: [1, 1.2, 0.9, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full"
        style={{
          // Swapped Cyan for a Deep Indigo to add sophistication
          background: "radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, transparent 70%)",
          filter: "blur(110px)",
        }}
      />

      {/* 4. Subtle Cyan Accent (Sharp Glow) */}
      <motion.div
        animate={{
          opacity: [0.1, 0.2, 0.1],
          scale: [0.8, 1.1, 0.8]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 60%)",
          filter: "blur(70px)",
        }}
      />

      {/* 5. Deep Vignette - Creates focus in the center */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, transparent 30%, rgba(2, 4, 10, 1) 100%)"
        }}
      />
    </div>
  );
}