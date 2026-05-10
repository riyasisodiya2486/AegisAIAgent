"use client";

import React, { useRef } from "react";
import { Power, Zap, CheckCircle2, X, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

export function HeroSection() {
  const sphereRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sphereRef.current) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 40;
      const y = (clientY / window.innerHeight - 0.5) * 40;
      
      gsap.to(sphereRef.current, {
        x,
        y,
        duration: 1,
        ease: "power2.out"
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    if (sphereRef.current) {
      gsap.to(sphereRef.current, {
        rotation: 360,
        duration: 30,
        repeat: -1,
        ease: "none"
      });
    }

    // Text reveal animation for headline
    gsap.fromTo(".hero-title",
      { opacity: 0, y: 30, filter: "blur(10px)" },
      { 
        opacity: 1, 
        y: 0, 
        filter: "blur(0px)",
        duration: 1, 
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".hero-title",
          start: "top 90%",
          toggleActions: "play reverse play reverse"
        }
      }
    );

    gsap.fromTo(".hero-subtext",
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        delay: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".hero-subtext",
          start: "top 90%",
          toggleActions: "play reverse play reverse"
        }
      }
    );

    // Add entry animations for widgets with ScrollTrigger
    gsap.fromTo(".hero-widget", 
      { opacity: 0, scale: 0.9, y: 20 },
      { 
        opacity: 1, 
        scale: 1,
        y: 0, 
        duration: 0.8, 
        stagger: 0.1, 
        ease: "back.out(1.2)", 
        scrollTrigger: {
          trigger: ".hero-widget",
          start: "top 95%",
          toggleActions: "play reverse play reverse"
        }
      }
    );

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section className="relative w-full max-w-[1600px] mx-auto min-h-[calc(100vh-100px)] flex flex-col xl:flex-row items-center justify-center xl:justify-between px-4 xl:px-8 py-12 gap-12 xl:gap-8">
      {/* Center Content Wrapper */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full order-1 xl:order-2 z-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[550px] md:h-[550px] z-0 pointer-events-none flex items-center justify-center mix-blend-lighten opacity-40">
          <div 
            ref={sphereRef}
            className="w-full h-full rounded-full transition-transform duration-100 ease-out"
            style={{
              backgroundImage: 'url(/sphere.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 0 100px rgba(59, 130, 246, 0.2)',
              WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
              maskImage: 'radial-gradient(circle, black 40%, transparent 70%)'
            }}
          />
        </div>

        <div className="relative z-20 flex flex-col items-center w-full pointer-events-none">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10">
              <X size={12} className="text-white" />
            </div>
            <span className="text-xs tracking-[0.2em] font-medium text-white/70">HARDSpending_VAULTS</span>
          </div>

          <div className="relative text-center z-30 px-4">
            <h1 className="hero-title text-4xl md:text-6xl lg:text-[70px] leading-[1.1] font-medium tracking-tight text-white mb-6 max-w-5xl mx-auto" style={{ textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
              Your AI agent needs a bank account. <br className="hidden md:block" /> Not a full wallet. 
            </h1>
            
          
            <div className="absolute right-[-5%] lg:right-[-15%] top-[40%] w-16 h-16 md:w-20 md:h-20 border-[1.5px] border-white/30 rounded-full flex items-center justify-center rotate-12 backdrop-blur-sm bg-black/10 hidden md:flex">
              <div className="text-center transform -rotate-12">
                <div className="text-[7px] md:text-[8px] uppercase tracking-widest text-white/80">Solana PDA</div>
                <X size={10} className="mx-auto my-1 text-white/50" />
                <div className="text-[7px] md:text-[8px] uppercase tracking-widest text-white/80">Verified</div>
              </div>
            </div>
          </div>

          <div className="hero-subtext px-6 py-3 rounded-2xl md:rounded-full border border-white/20 bg-black/40 backdrop-blur-md mb-12 md:mb-16 max-w-2xl mx-auto">
            <p className="text-xs md:text-sm font-mono text-white/80 tracking-wide text-center">
              Aegis: On-chain smart vaults for AI agents—enforcing daily budgets, idle yield, and instant kill switches
            </p>
          </div>

          <div className="text-center pointer-events-auto w-full px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/dashboard"
                className="group relative w-full sm:w-auto px-8 py-4 bg-[#0047AB] text-white text-sm font-medium rounded-full overflow-hidden flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(0,71,171,0.4)]"
              >
                <span className="relative z-10">Access Platform</span>
                <Zap size={16} className="relative z-10 fill-white" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-[#5E6AD2] opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#1A1D24] border border-white/5 hover:bg-white/10 transition-colors text-sm font-medium">
                View on GitHub
              </button>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              <span className="text-xs font-medium text-white/50 tracking-widest uppercase">Mainnet_Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Left Side Widgets */}
      <div className="flex flex-col gap-6 z-30 w-full max-w-[350px] xl:w-[300px] order-2 xl:order-1 mx-auto xl:mx-0">
        <SpotlightCard className="hero-widget p-6">
          <h3 className="text-lg font-medium mb-6">Yield on staked funds</h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-medium tracking-tight text-[#14F195]">8%</span>
            <span className="text-sm text-white/50 uppercase">APY</span>
          </div>
          <div className="h-20 w-full relative">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible preserve-3d">
              <defs>
                <linearGradient id="yield-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14F195" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#14F195" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,50 L0,40 C10,35 20,45 30,30 C40,15 50,25 60,10 C70,-5 80,15 90,5 L100,0 L100,50 Z" fill="url(#yield-grad)" />
              <path d="M0,40 C10,35 20,45 30,30 C40,15 50,25 60,10 C70,-5 80,15 90,5 L100,0" fill="none" stroke="#14F195" strokeWidth="1.5" />
            </svg>
          </div>
        </SpotlightCard>

        <SpotlightCard className="hero-widget p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium tracking-tight text-white mb-1">Kill switch latency</h3>
              <p className="text-[10px] text-white/40 uppercase">Global response time</p>
            </div>
            <div className="p-2 bg-red-500/10 rounded border border-red-500/20 text-red-500">
              <Power size={14} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-medium tracking-tight text-white">~400</span>
            <span className="text-sm text-white/50 uppercase">ms</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
             <div className="w-[15%] h-full bg-red-500 shadow-[0_0_10px_#ef4444]" />
          </div>
          <p className="text-[9px] text-white/30 uppercase mt-2 text-right">{"<"} 1 Solana Block</p>
        </SpotlightCard>

        <SpotlightCard className="hero-widget p-6">
          <div className="absolute right-4 top-4 w-6 h-6 rounded bg-[#14F195]/20 flex items-center justify-center">
            <div className="w-3 h-3 bg-[#14F195] mask-solana" style={{ maskImage: 'url(/solana-logo.svg)', WebkitMaskImage: 'url(/solana-logo.svg)', maskSize: 'contain' }} />
          </div>
          <h3 className="text-xl font-medium mb-2">Protocol Status</h3>
          <p className="text-[11px] text-white/50 leading-relaxed mb-4">
            Deployed on Solana Devnet.<br/>Program verified · Open source
          </p>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-[#14F195]" />
            <span className="text-xs font-medium text-white/80">Verified program ID</span>
          </div>
          <p className="text-[9px] text-[#14F195]/70 font-mono truncate w-full break-all">
            https://aegis.solanaio.io-<br/>202072823433385587:8567328...
          </p>
        </SpotlightCard>
      </div>

      {/* Right Side Widgets */}
      <div className="flex flex-col gap-6 z-30 w-full max-w-[350px] xl:w-[300px] order-3 xl:order-3 mx-auto xl:mx-0">
        <SpotlightCard className="hero-widget p-6 overflow-visible">
          <h3 className="text-lg font-medium mb-1">SOL Trajectory</h3>
          <h3 className="text-lg font-medium mb-4">& Kill Switch</h3>
          <p className="text-[10px] text-white/40 mb-4">Yield over-time</p>
          
          <div className="h-24 w-full relative mb-6">
             <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="traj-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14F195" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#14F195" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,50 L0,45 C15,45 25,35 40,30 C55,25 70,20 80,15 L100,5 L100,50 Z" fill="url(#traj-grad)" />
              <path d="M0,45 C15,45 25,35 40,30 C55,25 70,20 80,15 L100,5" fill="none" stroke="#14F195" strokeWidth="1.5" />
            </svg>
            <div className="absolute right-0 top-0 text-[8px] text-white/40 flex flex-col gap-3">
              <span>200M</span>
              <span>150M</span>
              <span>100M</span>
              <span>50M</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><Power size={10} /></div>
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><Lock size={10} /></div>
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><ShieldCheck size={10} /></div>
          </div>

          <div className="absolute right-4 top-4 w-24 h-24 rounded-full bg-[#0047AB] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,71,171,0.6)] cursor-pointer group z-50 transition-all active:scale-90">
            <div className="absolute inset-0 rounded-full border border-[#0047AB]/40 scale-[1.15] opacity-50 group-hover:scale-[1.25] transition-all duration-500" />
            <div className="absolute inset-0 rounded-full border border-[#0047AB]/20 scale-[1.35] opacity-20 group-hover:scale-[1.5] transition-all duration-700" />  
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-white font-bold text-[10px] text-center leading-tight tracking-wide relative z-10">
              Revoke<br/>Access
            </span>
            <span className="text-[7px] text-white/70 mt-1 uppercase tracking-[0.1em] font-mono relative z-10">
              (Kill Switch)
            </span>
            <div className="absolute w-full h-full rounded-full bg-[#0047AB] animate-ping opacity-20 pointer-events-none" />
          </div>
        </SpotlightCard>

        <SpotlightCard className="hero-widget p-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-lg font-medium mb-2">Zero Trust Architecture</h3>
            <p className="text-[10px] text-white/40 mb-6">Required from the agent</p>
          </div>
          
          <div className="flex items-center justify-center py-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 border border-[#5E6AD2]/30 rounded-full animate-ping opacity-20" />
              <div className="w-24 h-24 rounded-full border border-[#5E6AD2]/50 bg-[#5E6AD2]/10 flex flex-col items-center justify-center backdrop-blur-md relative z-10">
                <span className="text-3xl font-medium text-white mb-1">0</span>
                <span className="text-[8px] uppercase tracking-[0.2em] text-[#5E6AD2]">Trust</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-auto border-t border-white/5 pt-4">
            <ShieldCheck size={14} className="text-[#5E6AD2]" />
            <span className="text-[9px] text-white/60 font-mono">100% On-chain enforcement</span>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
