"use client";

export function DisclaimerFooter() {
  return (
    <footer className="w-full border-t border-white/5 bg-black/20 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium tracking-wide">
          
          <div className="text-white/40 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 animate-pulse" />
            © 2026 Aegis Protocol · Experimental software on Solana Localnet
          </div>

          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-white/20 uppercase">
            <span className="hover:text-white/40 transition-colors">Not financial advice</span>
            <span className="hidden md:inline text-white/5">•</span>
            <span className="hover:text-white/40 transition-colors">Funds at risk</span>
            <span className="hidden md:inline text-white/5">•</span>
            <span className="hover:text-white/40 transition-colors">Use at your own discretion</span>
          </div>
          
        </div>
        
        <p className="mt-4 text-center text-[10px] text-white/10 max-w-2xl mx-auto leading-relaxed text-balance">
          Aegis is a non-custodial smart contract protocol. Users retain control of their keys. 
          By interacting with the protocol, you acknowledge the risks of smart contract 
          vulnerabilities and permanent loss of capital.
        </p>
      </div>
    </footer>
  );
}