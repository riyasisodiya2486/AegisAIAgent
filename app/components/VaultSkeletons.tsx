"use client";

import { motion } from "framer-motion";

const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
);

export function VaultMetricsSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="relative overflow-hidden rounded-xl border border-blue-500/10 bg-blue-500/[0.01] p-4"
          >
            <Shimmer />
            <div className="h-2 w-12 bg-blue-400/10 rounded mb-2" />
            <div className="h-5 w-20 bg-blue-400/20 rounded" />
          </div>
        ))}
      </div>

      {/* Progress bar / Detailed Metric */}
      <div className="relative overflow-hidden rounded-[2rem] border border-blue-500/15 bg-black/40 p-6 space-y-5 backdrop-blur-md">
        <Shimmer />
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-2 w-24 bg-blue-400/10 rounded" />
            <div className="h-6 w-40 bg-blue-400/20 rounded" />
          </div>
          <div className="h-3 w-10 bg-blue-400/10 rounded" />
        </div>

        <div className="space-y-4">
          <div className="h-1.5 w-full bg-blue-900/20 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-blue-500/30 rounded-full animate-pulse" />
          </div>
          <div className="flex justify-between">
            <div className="h-2 w-16 bg-blue-400/[0.05] rounded" />
            <div className="h-2 w-16 bg-blue-400/[0.05] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function VaultFormSkeleton() {
  return (
    <div className="space-y-6 pt-2">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-3 relative overflow-hidden">
          <div className="h-3 w-20 bg-blue-400/10 rounded ml-1" />
          <div className="h-12 w-full bg-blue-950/20 border border-blue-500/10 rounded-xl" />
          <Shimmer />
        </div>
      ))}
      
      <div className="relative overflow-hidden h-14 w-full bg-blue-600/10 border border-blue-500/20 rounded-xl mt-2 flex items-center justify-center">
        <div className="h-3 w-32 bg-blue-400/20 rounded animate-pulse" />
        <Shimmer />
      </div>
    </div>
  );
}