"use client";

import { useState, useEffect } from "react";

export function TermsBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already accepted
    const accepted = localStorage.getItem("aegis_terms_accepted");
    if (!accepted) setShow(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("aegis_terms_accepted", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl border border-violet-500/30 bg-black/90 p-5 backdrop-blur-xl shadow-2xl shadow-violet-500/10">
        <div className="flex gap-3 mb-4">
          <div className="text-xl">⚖️</div>
          <p className="text-[13px] leading-relaxed text-white/80">
            Aegis is <span className="text-violet-400 font-semibold">experimental software</span> on Solana Localnet. 
            Not financial advice. Use at your own risk. Funds may be lost due to smart contract or agent error.
          </p>
        </div>

        <button
          onClick={handleAccept}
          className="w-full py-2.5 rounded-xl bg-violet-600 text-xs font-semibold text-white hover:bg-violet-500 active:scale-[0.98] transition-all"
        >
          I understand — Continue
        </button>
      </div>
    </div>
  );
}