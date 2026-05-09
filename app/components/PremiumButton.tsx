"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function PremiumButton({ href, children, variant = "primary", onClick, className = "" }: any) {
  const baseStyles = "relative group overflow-hidden px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-500 active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    // Primary: High-contrast Electric Blue
    primary: "text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]",
    // Secondary: Subtle Glass effect
    secondary: "text-white/70 hover:text-white border border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/30"
  };

  const content = (
    <>
      {/* Background Layer */}
      {variant === "primary" ? (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 bg-[length:200%_100%] group-hover:bg-[100%_0%] transition-all duration-700" />
      ) : (
        <div className="absolute inset-0 bg-transparent transition-all duration-500" />
      )}

      {/* Glossy Overlay for Primary */}
      {variant === "primary" && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
      )}

      {/* Shine/Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-blue-400/20 blur-xl pointer-events-none" />

      {/* Actual Label */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </>
  );

  const combinedStyles = `${baseStyles} ${variants[variant as keyof typeof variants]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={combinedStyles}>
      {content}
    </button>
  );
}