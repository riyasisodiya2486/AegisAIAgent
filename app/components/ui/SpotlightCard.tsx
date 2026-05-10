"use client";

import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({ 
  children, 
  className = "", 
  spotlightColor = "rgba(59, 130, 246, 0.15)" // Default blue glow
}: SpotlightCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useTransform(
    [mouseX, mouseY],
    ([x, y]: any) => `radial-gradient(600px circle at ${x}px ${y}px, ${spotlightColor}, transparent 40%)`
  );

  return (
    <motion.div
      onMouseMove={onMouseMove}
      className={`group relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#0C0F16]/80 backdrop-blur-xl transition-all hover:border-white/10 ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300 z-0"
        style={{ background }}
      />
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
