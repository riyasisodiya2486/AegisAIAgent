"use client";

import React, { useRef } from "react";
import { NavBar } from "@/components/NavBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { UseCasesSection } from "@/components/landing/UseCasesSection";
import { ConclusionSection } from "@/components/landing/ConclusionSection";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#07090E] text-white font-sans overflow-x-hidden relative flex flex-col"
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

      

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <UseCasesSection />
        <ConclusionSection />
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
