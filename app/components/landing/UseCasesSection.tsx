"use client";

import React, { useRef } from "react";
import { Bot, LineChart, Network, Terminal } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

gsap.registerPlugin(ScrollTrigger);

export function UseCasesSection() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play reverse play reverse"
        }
      }
    );

    gsap.fromTo(
      ".bento-item",
      { opacity: 0, scale: 0.9, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: ".bento-grid",
          start: "top 85%",
          toggleActions: "play reverse play reverse"
        }
      }
    );

    // Text reveal for use cases headline
    gsap.fromTo(".use-cases-headline", 
      { opacity: 0, y: 30, filter: "blur(10px)" },
      { 
        opacity: 1, 
        y: 0, 
        filter: "blur(0px)",
        duration: 1.2, 
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".use-cases-headline",
          start: "top 90%",
          toggleActions: "play reverse play reverse"
        }
      }
    );

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full max-w-[1200px] mx-auto min-h-screen flex flex-col items-center justify-center px-4 xl:px-8 py-24 z-10 mt-12">
      <div className="w-full mb-16 relative text-center flex flex-col items-center">
        <h2 className="use-cases-headline text-3xl md:text-6xl font-medium text-white/90 tracking-tight mb-6">
          Built for the autonomous <br className="hidden md:block" /> agent economy
        </h2>
        <p className="text-base md:text-lg text-white/50 font-light max-w-2xl px-4">
          Designed from the ground up to support the complex, high-velocity transactions of AI fleets and DeFi bots.
        </p>
      </div>

      <div className="bento-grid grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4 md:px-0">
        
        {/* Card 1: Wide */}
        <SpotlightCard className="bento-item col-span-1 md:col-span-2 flex flex-col justify-end p-6 md:p-8 min-h-[250px] md:min-h-[300px]">
          <div className="absolute top-8 right-8">
            <Bot size={120} className="text-[#3B82F6] opacity-10" />
          </div>
          <div className="inline-flex px-2 py-1 bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-mono mb-6 w-fit border border-[#3B82F6]/20 relative z-10 rounded-sm">
            USE_CASE: INFERENCE
          </div>
          <Bot size={28} className="text-[#3B82F6] mb-4 relative z-10" />
          <h3 className="text-2xl font-medium text-white mb-3 tracking-tight relative z-10">Autonomous API payments</h3>
          <p className="text-sm text-white/50 leading-relaxed font-mono relative z-10 max-w-md">
            Your AI agent needs to call paid inference APIs, data feeds, or compute services. Give it a daily budget of 0.01 SOL and let it operate independently. It handles 402 responses automatically.
          </p>
        </SpotlightCard>

        {/* Card 2: Tall */}
        <SpotlightCard className="bento-item col-span-1 md:col-span-1 row-span-2 flex flex-col p-6 md:p-8 min-h-[250px] md:min-h-full">
          <div className="inline-flex px-2 py-1 bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-mono mb-6 w-fit border border-[#3B82F6]/20 relative z-10 rounded-sm">
            USE_CASE: DEFI
          </div>
          <LineChart size={28} className="text-[#3B82F6] mb-4 relative z-10" />
          <h3 className="text-2xl font-medium text-white mb-3 tracking-tight relative z-10">DeFi strategy execution</h3>
          <p className="text-sm text-white/50 leading-relaxed font-mono relative z-10">
            An AI agent monitoring on-chain conditions and executing trades or yield moves. The daily limit caps your downside. The kill switch stops it instantly if strategy goes wrong.
          </p>
          <div className="mt-auto pt-8">
            <div className="h-32 w-full border border-white/5 bg-[#0C0F16]/50 rounded-xl relative overflow-hidden flex items-end">
               {/* Abstract chart */}
               <div className="w-full h-full absolute inset-0 opacity-20" style={{ background: 'linear-gradient(to top, rgba(59,130,246,0.5), transparent)' }} />
               <svg viewBox="0 0 100 50" className="w-full h-full relative z-10 preserve-3d" preserveAspectRatio="none">
                 <path d="M0,50 L0,30 C20,40 30,10 50,20 C70,30 80,5 100,10 L100,50 Z" fill="rgba(59,130,246,0.3)" />
                 <path d="M0,30 C20,40 30,10 50,20 C70,30 80,5 100,10" fill="none" stroke="#3B82F6" strokeWidth="2" />
               </svg>
            </div>
          </div>
        </SpotlightCard>

        {/* Card 3: Square */}
        <SpotlightCard className="bento-item col-span-1 md:col-span-1 flex flex-col p-6 md:p-8 min-h-[250px] md:min-h-[300px]">
          <div className="inline-flex px-2 py-1 bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-mono mb-6 w-fit border border-[#3B82F6]/20 relative z-10 rounded-sm">
            USE_CASE: FLEETS
          </div>
          <Network size={28} className="text-[#3B82F6] mb-4 relative z-10" />
          <h3 className="text-xl font-medium text-white mb-3 tracking-tight relative z-10">Multi-agent treasury</h3>
          <p className="text-xs text-white/50 leading-relaxed font-mono relative z-10">
            A parent agent that manages a fleet of sub-agents, each with their own vault and daily limit. Freeze any sub-agent independently.
          </p>
        </SpotlightCard>

        {/* Card 4: Square */}
        <SpotlightCard className="bento-item col-span-1 md:col-span-1 flex flex-col p-6 md:p-8 min-h-[250px] md:min-h-[300px]">
          <div className="inline-flex px-2 py-1 bg-[#3B82F6]/10 text-[#3B82F6] text-[10px] font-mono mb-6 w-fit border border-[#3B82F6]/20 relative z-10 rounded-sm">
            USE_CASE: DEVNET
          </div>
          <Terminal size={28} className="text-[#3B82F6] mb-4 relative z-10" />
          <h3 className="text-xl font-medium text-white mb-3 tracking-tight relative z-10">Agent dev sandbox</h3>
          <p className="text-xs text-white/50 leading-relaxed font-mono relative z-10">
            Test your agent's payment behavior safely on devnet. Real transactions, real state, zero capital at risk.
          </p>
        </SpotlightCard>

      </div>
    </section>
  );
}
