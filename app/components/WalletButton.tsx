"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletReadyState, WalletName } from "@solana/wallet-adapter-base";

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

  // Auto-connect after wallet is selected
  useEffect(() => {
    if (wallet && !connected && !connecting) {
      connect().catch(() => {
        // User cancelled or wallet not available
      });
    }
  }, [wallet, connected, connecting, connect]);

  const handleMainClick = useCallback(() => {
    if (connected) {
      setShowDropdown(prev => !prev);
    } else {
      setShowWalletList(true);
    }
  }, [connected]);

  const handleSelectWallet = useCallback(
    (walletName: WalletName) => {
      select(walletName);
      setShowWalletList(false);
    },
    [select]
  );

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    setShowDropdown(false);
  }, [disconnect]);

  if (!mounted) {
    return (
      <div
        className={`h-9 w-32 rounded-xl bg-violet-600/25 animate-pulse ${className ?? ""}`}
      />
    );
  }

  const truncated = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}···${publicKey.toBase58().slice(-4)}`
    : null;

  const isLoading = connecting || disconnecting;

  // Separate installed vs not-installed wallets
  const installedWallets = wallets.filter(
    w => w.readyState === WalletReadyState.Installed ||
         w.readyState === WalletReadyState.Loadable
  );
  const otherWallets = wallets.filter(
    w => w.readyState !== WalletReadyState.Installed &&
         w.readyState !== WalletReadyState.Loadable
  );

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* ── Main button ── */}
      <button
        onClick={handleMainClick}
        disabled={isLoading}
        className={[
          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
          "transition-all duration-150 select-none cursor-pointer",
          connected
            ? "bg-white/6 border border-white/8 text-white/75 hover:bg-white/10 hover:text-white"
            : "bg-gradient-to-r from-violet-600 to-violet-700 text-white hover:from-violet-500 hover:to-violet-600 shadow-lg shadow-violet-500/20",
          isLoading ? "opacity-60 cursor-wait" : "",
        ].join(" ")}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {connecting ? "Connecting..." : "Disconnecting..."}
          </>
        ) : connected ? (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 shrink-0" />
            {truncated}
            <svg className={`w-3 h-3 text-white/35 shrink-0 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        ) : (
          "Connect Wallet"
        )}
      </button>

      {/* ── Connected dropdown ── */}
      {connected && showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl border border-white/8 bg-[#12121e] shadow-2xl shadow-black/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/6">
              <p className="text-[11px] text-white/30 uppercase tracking-wide">Connected</p>
              <p className="text-xs font-mono text-white/55 mt-0.5">{truncated}</p>
              {wallet && (
                <p className="text-[11px] text-white/30 mt-0.5">{wallet.adapter.name}</p>
              )}
            </div>
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/8 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </>
      )}

      {/* ── Wallet selection modal ── */}
      {showWalletList && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowWalletList(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-4">
            <div className="rounded-2xl border border-white/8 bg-[#0f0f1a] shadow-2xl shadow-black/80 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
                <h2 className="font-semibold text-sm">Select a wallet</h2>
                <button
                  onClick={() => setShowWalletList(false)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 max-h-[60vh] overflow-y-auto">
                {wallets.length === 0 ? (
                  <div className="py-10 text-center space-y-3">
                    <div className="text-3xl">👻</div>
                    <div>
                      <p className="text-sm font-medium text-white/70">No wallets detected</p>
                      <p className="text-xs text-white/30 mt-1">Install Phantom to get started</p>
                    </div>
                    <a
                      href="https://phantom.app"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-1 px-4 py-2 rounded-xl bg-violet-600 text-xs text-white hover:bg-violet-500 transition-colors"
                    >
                      Install Phantom →
                    </a>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {installedWallets.length > 0 && (
                      <>
                        <p className="px-2 py-1 text-[11px] text-white/25 uppercase tracking-wide">Detected</p>
                        {installedWallets.map(w => (
                          <WalletOption
                            key={w.adapter.name}
                            name={w.adapter.name}
                            icon={w.adapter.icon}
                            badge="Ready"
                            badgeColor="emerald"
                            onClick={() => handleSelectWallet(w.adapter.name)}
                          />
                        ))}
                      </>
                    )}

                    {otherWallets.length > 0 && (
                      <>
                        <p className="px-2 pt-3 pb-1 text-[11px] text-white/25 uppercase tracking-wide">Not installed</p>
                        {otherWallets.map(w => (
                          <WalletOption
                            key={w.adapter.name}
                            name={w.adapter.name}
                            icon={w.adapter.icon}
                            badge="Install"
                            badgeColor="slate"
                            onClick={() => handleSelectWallet(w.adapter.name)}
                          />
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="px-5 py-3 border-t border-white/5">
                <p className="text-[11px] text-white/20 text-center">
                  Wallet connects via Wallet Standard protocol
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-component ──────────────────────────────────────────────────────────
function WalletOption({
  name,
  icon,
  badge,
  badgeColor,
  onClick,
}: {
  name: string;
  icon?: string;
  badge: string;
  badgeColor: "emerald" | "slate";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 active:bg-white/8 transition-colors group"
    >
      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/6 flex items-center justify-center shrink-0 overflow-hidden">
        {icon ? (
          <img src={icon} alt={name} className="w-6 h-6 rounded-lg" />
        ) : (
          <span className="text-lg">👛</span>
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
      </div>
      <span className={[
        "text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0",
        badgeColor === "emerald"
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
          : "bg-white/5 text-white/30 border border-white/8",
      ].join(" ")}>
        {badge}
      </span>
    </button>
  );
}