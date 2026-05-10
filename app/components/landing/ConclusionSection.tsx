"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Zap, ShieldCheck, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function ConclusionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Entrance & Reverse Animation for the main container content
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 60, filter: "blur(20px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play reverse play reverse",
        }
      }
    );

    // Stagger reveal for buttons and stats
    gsap.fromTo(".conclusion-action, .conclusion-stat",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".conclusion-action",
          start: "top 95%",
          toggleActions: "play reverse play reverse",
        }
      }
    );

    // Subtle "Breathing" Glow Logic
    gsap.to(".bg-glow", {
      opacity: 0.4,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.5
    });
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className="relative w-full max-w-[1400px] mx-auto px-4 md:px-8 py-24 md:py-48 mt-12 mb-24 z-10"
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Terminal Frame Content */}
        <div className="w-full max-w-5xl rounded-[3rem] border border-white/10 bg-[#07090E]/80 backdrop-blur-3xl p-8 md:p-20 relative overflow-hidden group shadow-2xl">
          
          {/* Internal Scanlines/Grain */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }} />
          
          {/* Subtle Corner Brackets */}
          <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-blue-500/20 rounded-tl-xl" />
          <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-blue-500/20 rounded-tr-xl" />
          <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-blue-500/20 rounded-bl-xl" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-blue-500/20 rounded-br-xl" />

          <div ref={contentRef} className="relative z-10 flex flex-col items-center text-center">
            
            {/* Logo Badge */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="w-20 h-20 mb-12 relative"
            >
              <img src="/aegis_logo.png" alt="Aegis" className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]" />
              <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 animate-pulse" />
            </motion.div>
            
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 mb-10">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">READY_FOR_DEPLOYMENT</span>
            </div>
            
            <h2 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] max-w-3xl">
              Secure the <br /> 
              <span className="italic font-serif font-light text-blue-500/80">Autonomous</span> Era.
            </h2>
            
            <p className="text-white/40 text-sm md:text-lg mb-16 font-mono max-w-2xl px-2 leading-relaxed">
              {"//"} Initialize a non-custodial smart vault. Set your daily limits. <br className="hidden md:block" />
              {"//"} Let your agents operate with <span className="text-white/80">absolute on-chain security.</span>
            </p>
            
            {/* Primary Action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
              <Link 
                href="/dashboard" 
                className="conclusion-action group relative w-full sm:w-auto px-12 py-5 bg-white text-[#050608] font-bold text-xl rounded-2xl overflow-hidden flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_60px_rgba(0,71,171,0.4)]"
              >
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  Access Platform
                </span>   
                <Zap 
                  size={24} 
                  fill="currentColor" 
                  className="relative z-10 group-hover:text-white transition-all duration-300 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0047AB] to-[#5E6AD2] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]" />
                <span className="absolute inset-0 bg-white group-hover:opacity-0 transition-opacity duration-300" />
              </Link>
              
              <button className="conclusion-action w-full sm:w-auto px-12 py-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/5 text-white/60 hover:text-white font-bold text-lg transition-all flex items-center justify-center gap-3 group">
                Technical Docs
                <ArrowRight size={20} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Technical Metadata Footer */}
            <div className="mt-20 pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 w-full opacity-40 group-hover:opacity-100 transition-opacity duration-700">
               {[
                 { label: "Runtime", val: "Solana SVM" },
                 { label: "Security", val: "Vault_v1.0.2" },
                 { label: "Latency", val: "Sub-400ms" },
                 { label: "Audit", val: "Open_Source" }
               ].map((stat, i) => (
                 <div key={i} className="conclusion-stat flex flex-col items-center md:items-start">
                    <span className="text-[9px] uppercase tracking-widest mb-1 font-black text-blue-400/60">{stat.label}</span>
                    <span className="text-xs font-mono text-white tracking-tighter">{stat.val}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Decorative Background Icon */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-1000 rotate-12">
            <img src="/aegis_logo.png" alt="" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>
    </section>
  );
}