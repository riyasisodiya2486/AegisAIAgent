"use client";

import React, { useRef } from "react";
import { AlertTriangle, EyeOff, Unplug } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function ProblemSection() {
  const containerRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    if (!containerRef.current) return;
    
    // Animate the left side sticky text fading in
    gsap.fromTo(
      leftColRef.current,
      { opacity: 0, x: -30, filter: "blur(10px)" },
      {
        opacity: 1,
        x: 0,
        filter: "blur(0px)",
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          toggleActions: "play reverse play reverse"
        }
      }
    );

    // Animate the problem cards individually as they scroll up
    gsap.utils.toArray(".problem-card").forEach((card: any) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play reverse play reverse"
          }
        }
      );
    });

    // Reveal headline text
    gsap.fromTo(".problem-headline", 
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        stagger: 0.1, 
        scrollTrigger: {
          trigger: ".problem-headline",
          start: "top 80%",
          toggleActions: "play reverse play reverse"
        }
      }
    );

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative w-full max-w-[1400px] mx-auto min-h-screen px-4 xl:px-8 py-24 z-10 mt-12">
      <div className="flex flex-col lg:flex-row relative items-start gap-16 lg:gap-8">
        
        {/* Left Side: Sticky Headline */}
        <div ref={leftColRef} className="w-full lg:w-1/2 lg:sticky lg:top-40 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/5 border border-red-500/20 text-[10px] text-red-400 uppercase tracking-widest w-fit rounded-full">
            Critical Vulnerability
          </div>
          
          <h2 className="problem-headline text-4xl md:text-5xl lg:text-[70px] font-medium text-white/90 tracking-tight leading-[1.1]">
            Giving an AI agent your wallet <br className="hidden lg:block" /> 
            <span className="text-white/40 italic font-serif">is a disaster waiting to happen.</span>
          </h2>
          
          <p className="text-lg text-white/50 font-light max-w-md mt-4">
            Current solutions rely on off-chain prompt engineering. If the model hallucinates or is injected, your funds are completely exposed.
          </p>

          <div className="hidden lg:block mt-12 w-32 h-[1px] bg-red-500/30" />
        </div>

        {/* Right Side: Scrolling Problem Blocks */}
        <div className="w-full lg:w-1/2 flex flex-col gap-12 lg:pt-24 lg:pb-48">
          
          {/* Problem Block 1 */}
          <div className="problem-card flex flex-col p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-[#0C0F16]/50 border border-white/5 hover:border-red-500/20 transition-colors backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
                <AlertTriangle size={24} />
              </div>
              <span className="text-[10px] font-mono text-red-500/50 uppercase tracking-widest">Risk_01</span>
            </div>
            <h3 className="text-3xl font-medium text-white mb-6 tracking-tight relative z-10">Uncapped spending</h3>
            <p className="text-sm text-white/60 leading-relaxed font-mono relative z-10">
              A single hallucinated transaction or prompt injection can drain your entire wallet. There is no on-chain mechanism to stop it. You only find out after the funds are gone.
            </p>
          </div>

          {/* Problem Block 2 */}
          <div className="problem-card flex flex-col p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-[#0C0F16]/50 border border-white/5 hover:border-red-500/20 transition-colors backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
                <EyeOff size={24} />
              </div>
              <span className="text-[10px] font-mono text-red-500/50 uppercase tracking-widest">Risk_02</span>
            </div>
            <h3 className="text-3xl font-medium text-white mb-6 tracking-tight relative z-10">Zero transparency</h3>
            <p className="text-sm text-white/60 leading-relaxed font-mono relative z-10">
              You have no real-time view of what your agent is spending, what it is paying for, or whether it is behaving as expected. Logs are just text files you check after the fact.
            </p>
          </div>

          {/* Problem Block 3 */}
          <div className="problem-card flex flex-col p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] bg-[#0C0F16]/50 border border-white/5 hover:border-red-500/20 transition-colors backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-500">
                <Unplug size={24} />
              </div>
              <span className="text-[10px] font-mono text-red-500/50 uppercase tracking-widest">Risk_03</span>
            </div>
            <h3 className="text-3xl font-medium text-white mb-6 tracking-tight relative z-10">No kill switch</h3>
            <p className="text-sm text-white/60 leading-relaxed font-mono relative z-10">
              Once your agent has wallet access there is no instant way to revoke it. Changing private keys takes time. By then the damage is done.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
