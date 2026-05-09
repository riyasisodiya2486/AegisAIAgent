"use client";

import React, { useEffect, useRef } from "react";
import { Search, Globe, Power, CheckCircle2, ChevronRight, X, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { NavBar } from "@/components/NavBar";
import gsap from "gsap";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

    // Continuous rotation to simulate fluid motion
    if (sphereRef.current) {
      gsap.to(sphereRef.current, {
        rotation: 360,
        duration: 30,
        repeat: -1,
        ease: "none"
      });
    }

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#07090E] text-white font-sans overflow-hidden relative"
    >
      {/* Abstract Background Blurs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1E3A8A] opacity-20 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#4C1D95] opacity-20 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
          backgroundPosition: 'center center'
        }}
      >
        {/* Crosses on grid intersections */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at center, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '120px 120px',
          backgroundPosition: 'calc(50% - 0.5px) calc(50% - 0.5px)'
        }} />
      </div>

      {/* Navigation */}
      <div className="relative z-50">
        <NavBar />
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto min-h-[85vh] flex items-center justify-center px-8">
        
        {/* Background Sphere Container */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] z-0 pointer-events-none flex items-center justify-center mix-blend-lighten opacity-80">
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

        {/* Center Content */}
        <div className="relative z-20 flex flex-col items-center w-full mt-[-3%] pointer-events-none">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10">
              <X size={12} className="text-white" />
            </div>
            <span className="text-xs tracking-[0.2em] font-medium text-white/70">HARDSpending_VAULTS</span>
          </div>

          <div className="relative">
            <h1 className="text-[72px] md:text-[85px] leading-[1.05] font-medium text-center tracking-tight text-white mb-6" style={{ textShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
              The Autonomous <br /> Kernel
            </h1>
            
            {/* Stamp Overlay */}
            <div className="absolute right-[8%] top-[60%] w-20 h-20 border-[1.5px] border-white/30 rounded-full flex items-center justify-center rotate-12 backdrop-blur-sm bg-black/10">
              <div className="text-center transform -rotate-12">
                <div className="text-[8px] uppercase tracking-widest text-white/80">Solana PDA</div>
                <X size={10} className="mx-auto my-1 text-white/50" />
                <div className="text-[8px] uppercase tracking-widest text-white/80">Verified</div>
              </div>
            </div>
          </div>

          <div className="px-6 py-3 rounded-full border border-white/20 bg-black/20 backdrop-blur-md mb-24">
            <p className="text-sm font-mono text-white/80 tracking-wide">
              [Security_Guarantee]: PDA derivation with original_agent_key; SVM Enforcement; Safe Math
            </p>
          </div>

          {/* Bottom Center Text & Buttons */}
          <div className="text-center pointer-events-auto">
            <p className="text-xl text-white/60 font-light mb-2">Supervised Learning</p>
            <p className="text-2xl font-medium mb-8">
              Built for People, <br />
              <span className="text-[#8B5CF6]">Powered</span> by Web3 Community
            </p>
            <div className="flex items-center justify-center gap-4 mb-12">
              <Link href="/dashboard" className="px-8 py-3 rounded-full bg-[#5E6AD2] hover:bg-[#4C56B3] transition-colors text-sm font-medium">
                Access Platform
              </Link>
              <button className="px-8 py-3 rounded-full bg-[#1A1D24] border border-white/5 hover:bg-white/10 transition-colors text-sm font-medium">
                View on GitHub
              </button>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              <span className="text-xs font-medium text-white/50 tracking-widest uppercase">Mainnet_Ready</span>
            </div>
          </div>
        </div>

        {/* Left Side Widgets */}
        <div className="absolute left-[2%] xl:left-[4%] top-[15%] xl:top-[20%] flex flex-col gap-6 z-30 w-[300px]">
          {/* Cumulative Yield */}
          <div className="bg-[#0C0F16]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-medium mb-6">Cumulative Yield</h3>
            <div className="h-32 w-full relative">
              <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible preserve-3d">
                <defs>
                  <linearGradient id="yield-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,50 L0,40 C10,35 20,45 30,30 C40,15 50,25 60,10 C70,-5 80,15 90,5 L100,0 L100,50 Z" fill="url(#yield-grad)" />
                <path d="M0,40 C10,35 20,45 30,30 C40,15 50,25 60,10 C70,-5 80,15 90,5 L100,0" fill="none" stroke="#60A5FA" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] text-white/40 uppercase font-medium">
              <span>0</span>
              <span>50M</span>
              <span>150M</span>
            </div>
          </div>

          {/* Users Widget */}
          <div className="bg-[#0C0F16]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-3xl font-medium tracking-tight">+125 <span className="text-sm font-normal text-white/50">user</span></h3>
                <p className="text-[10px] text-white/40 mt-1 uppercase">Total Increment <br/> 58,0370</p>
              </div>
              <p className="text-[10px] text-white/40 text-right uppercase w-16">Extra in <br/> the month</p>
            </div>
            <div className="flex items-end justify-between h-20 gap-2">
              {[40, 30, 20, 35, 25, 45, 100].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-full">
                  <div 
                    className={`w-full rounded-full ${i === 6 ? 'bg-[#5E6AD2]' : 'bg-[#1A1D24]'}`} 
                    style={{ height: `${h}%` }} 
                  />
                  <span className="text-[8px] text-white/30 uppercase">{['Nn','Na','We','Th','Fri','Sa','Su'][i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Protocol Status */}
          <div className="bg-[#0C0F16]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
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
          </div>
        </div>

        {/* Right Side Widgets */}
        <div className="absolute right-[2%] xl:right-[4%] top-[15%] xl:top-[20%] flex flex-col gap-6 z-30 w-[300px]">
          {/* SOL Trajectory */}
          <div className="bg-[#0C0F16]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative">
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

            {/* Glowing Kill Switch Button overlapping */}
            <div className="absolute -right-12 top-1/2 w-32 h-32 rounded-full bg-[#5E6AD2] flex flex-col items-center justify-center shadow-[0_0_40px_rgba(94,106,210,0.6)] cursor-pointer group z-50">
              <div className="absolute inset-0 rounded-full border border-white/30 scale-[1.15] opacity-50 group-hover:scale-[1.2] transition-transform" />
              <div className="absolute inset-0 rounded-full border border-white/10 scale-[1.3] opacity-20 group-hover:scale-[1.4] transition-transform" />
              <span className="text-white font-medium text-xs text-center leading-tight">Revoke<br/>Access</span>
              <span className="text-[8px] text-white/60 mt-1">(Kill Switch)</span>
            </div>
          </div>

          {/* Vault Activity & Permissions */}
          <div className="bg-[#0C0F16]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-medium mb-2">Vault Activity<br/>& Permissions</h3>
            <p className="text-[10px] text-white/40 mb-6">On-chain statistics</p>
            
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "23%", type: "primary" }, { type: "empty" }, { type: "empty" }, { label: "45%", type: "border" },
                { type: "empty" }, { label: "19%", type: "border" }, { type: "pattern" }, { type: "empty" },
                { type: "empty" }, { type: "empty" }, { type: "empty" }, { type: "empty" },
                { label: "8%", type: "border" }, { type: "pattern" }, { type: "empty" }, { label: "×", type: "border" },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`aspect-square rounded-full flex items-center justify-center text-[10px] font-medium
                    ${item.type === 'primary' ? 'bg-[#5E6AD2] text-white shadow-[0_0_15px_rgba(94,106,210,0.5)]' : ''}
                    ${item.type === 'border' ? 'border border-white/20 text-white/60' : ''}
                    ${item.type === 'empty' ? 'border border-white/5 bg-[#1A1D24]/50' : ''}
                    ${item.type === 'pattern' ? 'border border-white/10 opacity-50' : ''}
                  `}
                  style={item.type === 'pattern' ? {
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
                  } : {}}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* Decorative Star/Sparkle at bottom right */}
      <div className="fixed bottom-8 right-8 w-8 h-8 opacity-50 z-0 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
          <path d="M50 0 C50 40 60 50 100 50 C60 50 50 60 50 100 C50 60 40 50 0 50 C40 50 50 40 50 0 Z" />
        </svg>
      </div>
    </div>
  );
}
