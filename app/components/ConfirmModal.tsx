"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Zap, X, Fingerprint, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
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

  const isMatch = input === confirmWord;

  const handleConfirm = async () => {
    if (!isMatch) {
      setError(`Sequence mismatch: enter "${confirmWord}"`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Protocol execution failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* Backdrop with custom blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !loading && onClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#080808] p-1 shadow-2xl"
          >
            {/* Subtle Gradient Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="relative p-8 space-y-8">
              {/* Header: Identity & Icon */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`relative p-4 rounded-2xl border ${
                  variant === 'danger' 
                    ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                }`}>
                  {variant === "danger" ? <ShieldAlert size={32} /> : <Zap size={32} />}
                  <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-2 blur-xl bg-current opacity-20" 
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-medium tracking-tight text-white">{title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed max-w-[280px] mx-auto">
                    {description}
                  </p>
                </div>
              </div>

              {/* Input Area: Biometric/Sequence Match */}
              <div className="space-y-4">
                <div className="relative">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 ml-1">
                    <Fingerprint size={12} /> Verification Sequence
                  </label>
                  
                  <input
                    autoFocus
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                    placeholder={`Type "${confirmWord}"`}
                    className={`w-full bg-white/[0.03] border rounded-2xl px-5 py-4 text-sm font-mono transition-all duration-500 placeholder-white/5 outline-none
                      ${isMatch 
                        ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                        : "border-white/5 text-white focus:border-white/20 focus:bg-white/[0.05]"
                      }`}
                  />
                  
                  <AnimatePresence>
                    {error && (
                      <motion.p 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] font-bold uppercase tracking-wider text-red-500 mt-3 ml-1"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => !loading && onClose()}
                  disabled={loading}
                  className="flex-1 px-6 py-4 rounded-2xl border border-white/5 bg-white/5 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
                >
                  Abort
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={!isMatch || loading}
                  className={`relative flex-[1.5] group overflow-hidden px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                    ${variant === "danger" 
                      ? "text-white" 
                      : "text-black"
                    }
                    disabled:opacity-20 disabled:grayscale`}
                >
                  <div className={`absolute inset-0 transition-transform duration-500 group-hover:scale-110 ${
                    variant === 'danger' ? 'bg-red-600' : 'bg-emerald-400'
                  }`} />
                  
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      confirmLabel
                    )}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}