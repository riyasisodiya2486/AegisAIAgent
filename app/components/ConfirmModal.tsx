"use client";

import { useState, useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>; // Added <void> for TS accuracy
  title: string;
  description: string;
  confirmWord: string; 
  confirmLabel: string;
  variant: "danger" | "warning";
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmWord,
  confirmLabel,
  variant,
}: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setInput(""); setError(""); setLoading(false); }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loading, onClose]);

  if (!open) return null;

  const isMatch = input === confirmWord;
  const accentClass = variant === "danger" 
    ? "from-red-500/20 to-red-600/20 text-red-400 border-red-500/30" 
    : "from-amber-500/20 to-amber-600/20 text-amber-400 border-amber-500/30";

  const handleConfirm = async () => {
    if (!isMatch) {
      setError(`Type "${confirmWord}" to confirm`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !loading && onClose()}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl mb-4 border ${accentClass}`}>
              {variant === "danger" ? "⚠" : "⚡"}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{description}</p>
          </div>

          {/* Body */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-1">
                Type <span className="text-white/60">"{confirmWord}"</span> to confirm
              </label>
              <input
                autoFocus
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                placeholder={confirmWord}
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm font-mono
                  focus:outline-none transition-all placeholder-white/10
                  ${isMatch
                    ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5"
                    : "border-white/10 text-white focus:border-white/20"
                  }`}
              />
              {error && (
                <p className="text-xs text-red-400 font-medium ml-1 animate-pulse">{error}</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => !loading && onClose()}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={!isMatch || loading}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all
                  ${variant === "danger" 
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]" 
                    : "bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                  }
                  disabled:opacity-20 disabled:shadow-none disabled:grayscale`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-current/20 border-t-current rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}