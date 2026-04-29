"use client";

import { useState, useEffect } from "react";
import { TxButton } from "@/components/TxButton";
import { VaultState } from "@aegis/sdk";

interface Props {
  vault:           VaultState | null;
  onUpdateLimit:   (newLimitSol: number) => Promise<string>;
  onSuccess:       () => void;
}

export function LimitSlider({ vault, onUpdateLimit, onSuccess }: Props) {
  const currentLimit = vault?.dailyLimitSol ?? 0.1;
  const [value,    setValue]    = useState(currentLimit);
  const [inputVal, setInputVal] = useState(String(currentLimit));

  // Sync with vault state when it loads
  useEffect(() => {
    if (vault) {
      setValue(vault.dailyLimitSol);
      setInputVal(vault.dailyLimitSol.toFixed(4));
    }
  }, [vault?.dailyLimitSol]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setValue(v);
    setInputVal(v.toFixed(3));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    const v = parseFloat(e.target.value);
    if (!isNaN(v) && v > 0) setValue(v);
  };

  const isDirty = Math.abs(value - currentLimit) > 0.00001;

  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-6 space-y-5">
      <div>
        <h3 className="font-semibold text-sm">Daily Spending Limit</h3>
        <p className="text-xs text-white/35 mt-0.5">
          The agent cannot spend more than this per 24-hour window.
        </p>
      </div>

      {/* Current vs new */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/35">Current limit</p>
          <p className="text-2xl font-bold mt-0.5">
            {currentLimit.toFixed(3)}
            <span className="text-sm text-white/40 ml-1.5">SOL</span>
          </p>
        </div>
        {isDirty && (
          <div className="text-right">
            <p className="text-xs text-white/35">New limit</p>
            <p className="text-2xl font-bold mt-0.5 text-violet-400">
              {value.toFixed(3)}
              <span className="text-sm text-violet-400/60 ml-1.5">SOL</span>
            </p>
          </div>
        )}
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min="0.01"
          max="10"
          step="0.01"
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 rounded-full appearance-none cursor-pointer
            bg-white/8
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-violet-500
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-violet-500/40
            [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #7c3aed ${(value / 10) * 100}%, rgba(255,255,255,0.08) ${(value / 10) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-white/20">
          <span>0.01 SOL</span>
          <span>10 SOL</span>
        </div>
      </div>

      {/* Manual input */}
      <div className="relative">
        <input
          type="number"
          min="0.001"
          max="100"
          step="0.001"
          value={inputVal}
          onChange={handleInputChange}
          className="w-full bg-white/4 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">SOL / day</span>
      </div>

      <TxButton
        label={isDirty ? `Set limit to ${value.toFixed(3)} SOL` : "No changes"}
        loadingLabel="Updating limit..."
        onClick={async () => {
          const sig = await onUpdateLimit(value);
          onSuccess();
          return sig;
        }}
        disabled={!isDirty || value <= 0}
        className="w-full"
      />
    </div>
  );
}
