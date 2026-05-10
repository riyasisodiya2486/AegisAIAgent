"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState, WalletName } from "@solana/wallet-adapter-base";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, LogOut, ChevronDown, Monitor, Download, X, ShieldCheck } from "lucide-react";

export function WalletButton({ className }: { className?: string }) {
  const {
    connected,
    connecting,
    disconnecting,
    disconnect,
    select,
    connect,
    publicKey,
    wallets,
    wallet,
  } = useWallet();

  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showWalletList, setShowWalletList] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (wallet && !connected && !connecting) {
      connect().catch(() => {});
    }
  }, [wallet, connected, connecting, connect]);

  const handleMainClick = useCallback(() => {
    if (connected) setShowDropdown(prev => !prev);
    else setShowWalletList(true);
  }, [connected]);

  const handleSelectWallet = useCallback((walletName: WalletName) => {
    select(walletName);
    setShowWalletList(false);
  }, [select]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    setShowDropdown(false);
  }, [disconnect]);

  if (!mounted) return <div className={`h-10 w-36 rounded-xl bg-blue-500/5 animate-pulse ${className ?? ""}`} />;

  const truncated = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}···${publicKey.toBase58().slice(-4)}`
    : null;

  const isLoading = connecting || disconnecting;
  const installedWallets = wallets.filter(w => w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable);
  const otherWallets = wallets.filter(w => w.readyState !== WalletReadyState.Installed && w.readyState !== WalletReadyState.Loadable);

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* ── Main Connect Button ── */}
      <button
        onClick={handleMainClick}
        disabled={isLoading}
        className={`
          flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]
          transition-all duration-500 select-none group border
          ${connected 
            ? "bg-blue-500/5 border-blue-500/20 text-blue-100 hover:bg-blue-500/10 hover:border-blue-500/40" 
            : "bg-blue-600 border-blue-400 text-white shadow-[0_0_25px_rgba(37,99,235,0.3)] hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] hover:scale-[1.02]"}
          ${isLoading ? "opacity-50 cursor-wait" : "cursor-pointer"}
        `}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Processing</span>
          </div>
        ) : connected ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] animate-pulse" />
            <span className="font-mono text-xs">{truncated}</span>
            <ChevronDown size={14} className={`text-blue-400/50 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
          </>
        ) : (
          <>
            <Wallet size={14} className="group-hover:rotate-12 transition-transform" />
            Initialize_Handshake
          </>
        )}
      </button>

      {/* ── Connected Dropdown ── */}
      <AnimatePresence>
        {connected && showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-4 z-50 w-64 rounded-2xl border border-blue-500/20 bg-[#050505]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-blue-500/10 bg-blue-500/[0.03]">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1.5">Secure_Session_Active</p>
                <p className="text-[10px] font-mono text-blue-100/60 break-all leading-relaxed">{publicKey?.toBase58()}</p>
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-red-500/10 flex items-center justify-between group transition-all"
              >
                Terminate_Connection
                <LogOut size={14} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Wallet Selection Modal ── */}
      {mounted && typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {showWalletList && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md" 
                onClick={() => setShowWalletList(false)} 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: "-45%", x: "-50%" }}
                animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                exit={{ opacity: 0, scale: 0.9, y: "-45%", x: "-50%" }}
                className="fixed left-1/2 top-1/2 z-[1010] w-full max-w-md px-4"
              >
                <div className="rounded-[2.5rem] border border-blue-500/20 bg-[#070707] shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
                  <div className="px-10 py-8 border-b border-blue-500/10 flex items-center justify-between bg-gradient-to-b from-blue-500/[0.02] to-transparent">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
                        Select <span className="text-blue-500">Terminal</span>
                      </h2>
                      <p className="text-[9px] text-blue-400/40 uppercase tracking-[0.4em] mt-2 font-black">Authorized_Access_Only</p>
                    </div>
                    <button onClick={() => setShowWalletList(false)} className="p-2.5 rounded-xl hover:bg-blue-500/10 text-white/20 hover:text-blue-400 transition-all">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-5 max-h-[55vh] overflow-y-auto scrollbar-hide">
                    {wallets.length === 0 ? (
                      <div className="py-14 text-center">
                        <div className="w-20 h-20 rounded-[2rem] bg-blue-500/5 flex items-center justify-center mx-auto mb-5 border border-blue-500/10">
                          <Wallet className="text-blue-500/20" size={32} />
                        </div>
                        <p className="text-sm text-blue-200/40 font-medium">No Providers Detected</p>
                        <a href="https://phantom.app" target="_blank" className="mt-5 inline-block text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 hover:text-blue-400 underline-offset-8 hover:underline">Download_Phantom →</a>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {installedWallets.length > 0 && (
                          <div className="space-y-3">
                            <p className="px-4 text-[9px] font-black text-blue-400/30 uppercase tracking-[0.3em]">Hardware_Verified</p>
                            {installedWallets.map(w => (
                              <WalletOption key={w.adapter.name} name={w.adapter.name} icon={w.adapter.icon} status="Ready" onClick={() => handleSelectWallet(w.adapter.name)} />
                            ))}
                          </div>
                        )}
                        {otherWallets.length > 0 && (
                          <div className="space-y-3">
                            <p className="px-4 text-[9px] font-black text-white/10 uppercase tracking-[0.3em] pt-4">External_Protocols</p>
                            {otherWallets.map(w => (
                              <WalletOption key={w.adapter.name} name={w.adapter.name} icon={w.adapter.icon} status="Setup" onClick={() => handleSelectWallet(w.adapter.name)} isOther />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="px-8 py-5 bg-blue-500/[0.02] flex items-center justify-center gap-3 border-t border-blue-500/5">
                    <ShieldCheck size={12} className="text-blue-500/40" />
                    <p className="text-[8px] text-blue-500/20 uppercase tracking-[0.5em] font-black">Secure_Handshake_Active</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function WalletOption({ name, icon, status, onClick, isOther }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 rounded-2xl hover:bg-blue-500/[0.04] border border-blue-500/5 hover:border-blue-500/20 transition-all group"
    >
      <div className="flex items-center gap-5">
        <div className="w-11 h-11 rounded-xl bg-blue-500/[0.03] border border-blue-500/10 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-500">
          {icon ? <img src={icon} alt={name} className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" /> : <Wallet size={20} className="text-blue-500/20" />}
        </div>
        <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors tracking-wide">{name}</span>
      </div>
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-500 ${isOther ? 'bg-blue-900/10 border-blue-900/20 text-blue-900/50' : 'bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white'}`}>
        {isOther ? <Download size={11} /> : <Monitor size={11} />}
        <span className="text-[9px] font-black uppercase tracking-tighter">{status}</span>
      </div>
    </button>
  );
}