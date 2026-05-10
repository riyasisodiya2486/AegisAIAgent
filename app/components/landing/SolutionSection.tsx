"use client";

import React, { useRef } from "react";
import { Lock, Zap, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

gsap.registerPlugin(ScrollTrigger);

export function SolutionSection() {
  const containerRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  // Cobalt color definition: #0047AB
  const cobaltColor = "#0047AB";

  useGSAP(() => {
    if (!containerRef.current) return;
    
    // Animate central timeline
    gsap.fromTo(lineRef.current,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: "none",
        transformOrigin: "top center",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          end: "bottom 80%",
          scrub: true
        }
      }
    );

    // Animate timeline nodes
    gsap.utils.toArray(".timeline-node").forEach((node: any, i) => {
      const isLeft = i % 2 === 0;
      
      // Node entrance and exit (reverse)
      gsap.fromTo(
        node,
        { opacity: 0, x: isLeft ? -50 : 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: node,
            start: "top 85%",
            // play on enter, reverse on leave back, play on enter back, reverse on leave
            toggleActions: "play reverse play reverse", 
          }
        }
      );
      
      // Animate the dot on the line with reversal
      const dot = node.querySelector(".timeline-dot");
      if (dot) {
        gsap.fromTo(dot, 
          { scale: 0, opacity: 0 },
          { 
            scale: 1, 
            opacity: 1, 
            duration: 0.5, 
            ease: "back.out(2)", 
            scrollTrigger: { 
              trigger: node, 
              start: "top 85%",
              toggleActions: "play reverse play reverse"
            } 
          }
        );
      }
    });
    // Text reveal for solution headline
    gsap.fromTo(".solution-headline", 
      { opacity: 0, y: 30, filter: "blur(10px)" },
      { 
        opacity: 1, 
        y: 0, 
        filter: "blur(0px)",
        duration: 1.2, 
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".solution-headline",
          start: "top 90%",
          toggleActions: "play reverse play reverse"
        }
      }
    );

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full max-w-[1200px] mx-auto min-h-screen px-4 xl:px-8 py-32 z-10 mt-12 overflow-hidden">
      
      <div className="w-full mb-32 relative text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0047AB]/5 border border-[#0047AB]/20 text-[10px] text-[#0047AB] uppercase tracking-widest rounded-full mb-6">
          Architectural Guarantees
        </div>
        <h2 className="solution-headline text-3xl md:text-6xl font-medium text-white/90 tracking-tight mb-6">
          A smart contract between <br className="hidden md:block" /> your agent and your money
        </h2>
        <p className="text-base md:text-lg text-[#0047AB]/70 font-mono max-w-2xl px-4">
          {`>>`} Three on-chain guarantees that no amount of prompt engineering can bypass
        </p>
      </div>

      <div className="relative w-full">
        {/* Central Vertical Line (Base) */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-white/5 -translate-x-1/2" />
        
        {/* Central Vertical Line (Animated Glow) */}
        <div 
          ref={lineRef} 
          className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#0047AB] via-[#0047AB]/50 to-transparent -translate-x-1/2 shadow-[0_0_15px_#0047AB]" 
        />

        {/* Timeline Event 1 */}
        <div className="timeline-node relative w-full flex flex-col md:flex-row items-center justify-between mb-20 md:mb-32 px-4 md:px-0">
          <div className="timeline-dot absolute left-4 md:left-1/2 top-1/2 w-4 h-4 rounded-full bg-[#0047AB] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_#0047AB] border-2 border-[#0A0D14] z-20" />
          
          <div className="w-full md:w-5/12 pl-12 md:pl-0 md:pr-12 md:text-right flex flex-col md:items-end justify-center">
            <Lock size={32} className="text-[#0047AB] mb-4" />
            <h3 className="text-2xl font-medium text-white mb-4">Hard Daily Limit</h3>
            <p className="text-sm text-white/50 leading-relaxed font-mono">
              Set the maximum SOL the agent can spend in any 24-hour window. The smart contract enforces this at the transaction level. Even if the agent is compromised, it cannot spend more than the limit.
            </p>
          </div>

          <div className="w-full md:w-5/12 pl-12 md:pl-12 mt-8 md:mt-0">
            <SpotlightCard className="p-6" spotlightColor="rgba(0, 71, 171, 0.15)">
              <div className="flex gap-1.5 mb-4 opacity-50">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <div className="w-2 h-2 rounded-full bg-white/20" />
              </div>
              <div className="font-mono text-xs text-white/70 space-y-3">
                <div className="flex justify-between"><span>Daily limit:</span><span className="text-white">0.1000 SOL</span></div>
                <div className="flex justify-between"><span>Spent today:</span><span className="text-white">0.0270 SOL</span></div>
                <div className="w-full h-px bg-white/10" />
                <div className="flex justify-between"><span>Remaining:</span><span className="text-[#0047AB]">0.0730 SOL</span></div>
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* Timeline Event 2 */}
        <div className="timeline-node relative w-full flex flex-col md:flex-row-reverse items-center justify-between mb-20 md:mb-32 px-4 md:px-0">
          <div className="timeline-dot absolute left-4 md:left-1/2 top-1/2 w-4 h-4 rounded-full bg-[#0047AB] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_#0047AB] border-2 border-[#0A0D14] z-20" />
          
          <div className="w-full md:w-5/12 pl-12 md:pr-0 flex flex-col items-start justify-center">
            <Zap size={32} className="text-[#0047AB] mb-4" />
            <h3 className="text-2xl font-medium text-white mb-4">Instant Freeze</h3>
            <p className="text-sm text-white/50 leading-relaxed font-mono">
              Freeze the vault in real-time. The smart contract revokes the agent's key unilaterally, preventing any further transactions until the human intervenes.
            </p>
          </div>

          <div className="w-full md:w-5/12 pl-12 md:pl-0 md:pr-12 mt-8 md:mt-0">
            <SpotlightCard className="p-6 overflow-hidden" spotlightColor="rgba(0, 71, 171, 0.15)">
              <div className="flex justify-center items-center h-24">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[#0047AB]/10 flex items-center justify-center border border-[#0047AB]/30">
                    <Zap size={14} className="text-[#0047AB]" />
                  </div>
                  <span className="text-lg font-medium text-white">Vault frozen</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0047AB] shadow-[0_0_10px_#0047AB]" />
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* Timeline Event 3 */}
        <div className="timeline-node relative w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-0">
          <div className="timeline-dot absolute left-4 md:left-1/2 top-1/2 w-4 h-4 rounded-full bg-[#0047AB] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_#0047AB] border-2 border-[#0A0D14] z-20" />
          
          <div className="w-full md:w-5/12 pl-12 md:pl-0 md:pr-12 md:text-right flex flex-col md:items-end justify-center">
            <TrendingUp size={32} className="text-[#0047AB] mb-4" />
            <h3 className="text-2xl font-medium text-white mb-4">Programmable Yield</h3>
            <p className="text-sm text-white/50 leading-relaxed font-mono">
              Define which yield protocols and risk parameters your funds can be allocated to. The smart contract strictly enforces your desired yield strategies.
            </p>
          </div>

          <div className="w-full md:w-5/12 pl-12 md:pl-12 mt-8 md:mt-0">
            <SpotlightCard className="p-6" spotlightColor="rgba(0, 71, 171, 0.15)">
              <div className="font-mono text-xs text-white/70 space-y-3">
                <div className="flex justify-between"><span>Vault balance:</span><span className="text-white">5.3000 SOL</span></div>
                <div className="flex justify-between"><span>Yield strategy:</span><span className="text-[#0047AB]">Optimized APY</span></div>
                <div className="w-full h-px bg-white/10" />
                <div className="flex justify-between"><span>Avg. APY:</span><span className="text-white">6.83%</span></div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}