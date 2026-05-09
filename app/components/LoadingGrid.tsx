"use client";

import { motion } from "framer-motion";

export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="relative group overflow-hidden rounded-[2.5rem] border border-blue-500/10 bg-[#050505] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
        >
          {/* 1. The "Scanner" Beam Animation - Switched to Electric Blue */}
          <motion.div
            animate={{
              top: ["-10%", "110%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2.5, // Slightly slower for better fluidity
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.25,
            }}
            className="absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent z-10"
          />

          {/* 2. Shimmer Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent" />

          {/* 3. Skeleton Content */}
          <div className="relative z-0 space-y-6">
            {/* Label Skeleton */}
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500/30 animate-pulse" />
              <div className="h-3 w-16 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div 
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
              </div>
            </div>

            {/* Value Skeleton */}
            <div className="space-y-3">
              <div className="h-9 w-32 bg-white/[0.03] rounded-xl overflow-hidden relative border border-white/5">
                <motion.div 
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.1 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
                />
              </div>
              <div className="h-3 w-20 bg-white/5 rounded-md" />
            </div>
          </div>

          {/* 4. Decorative Terminal Corner with Blue Accent */}
          <div className="absolute top-0 right-0 p-4 opacity-30">
            <div className="w-2 h-2 border-t border-r border-blue-500/40 rounded-tr" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}