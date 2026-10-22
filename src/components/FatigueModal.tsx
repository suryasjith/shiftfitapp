import React, { useState } from 'react';
import { Activity, X, Check } from 'lucide-react';
import { soundManager } from '../services/audioTimer';

interface FatigueModalProps {
  initialScore: number;
  onSave: (score: number) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const FatigueModal: React.FC<FatigueModalProps> = ({
  initialScore,
  onSave,
  onClose,
  isOpen,
}) => {
  const [score, setScore] = useState<number>(initialScore || 3);

  if (!isOpen) return null;

  const getReadinessLevel = (val: number) => {
    if (val <= 4) {
      return {
        tier: 'Optimal CNS Readiness',
        badge: 'FULL VOLUME PRESCRIBED',
        desc: 'Nervous system recovered. Ready for top-end weight loads (RPE 8-9) and 4 working sets per exercise.',
        action: 'Prescribes 100% full programmed volume & top sets.',
      };
    } else if (val <= 7) {
      return {
        tier: 'Moderate Shift Fatigue',
        badge: 'AUTO-SCALED (-1 SET)',
        desc: 'Elevated work or sleep strain. Preserves top heavy sets while dropping 1 accessory set to manage recovery.',
        action: 'Drops 1 working set from secondary movements.',
      };
    } else {
      return {
        tier: 'High Fatigue / CNS Strain',
        badge: 'DELOAD & CNS PROTECTION (-40-50%)',
        desc: 'Severe 12-hour shift exhaustion. Caps volume at 2 working sets, bypasses heavy spinal axial loading, and prioritizes joint decompression.',
        action: 'Auto-cuts volume by 40-50% and switches to joint-safe machine alternatives.',
      };
    }
  };

  const readiness = getReadinessLevel(score);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setScore(val);
    soundManager.playTap();
  };

  const handleConfirm = () => {
    soundManager.playCompleteChime();
    onSave(score);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-xl bg-black border border-neutral-700 shadow-2xl p-5 text-left relative">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-750 text-white">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-tight">Daily CNS Fatigue</h3>
              <p className="text-[11px] text-neutral-400 font-mono">Auto-Regulation Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Score Display */}
        <div className="mt-5 text-center">
          <div className="flex items-baseline justify-center gap-1.5 font-mono">
            <span className="text-5xl font-black text-white">{score}</span>
            <span className="text-xl text-neutral-500 font-bold">/ 10</span>
          </div>
          <span className="inline-block mt-2 px-3 py-0.5 rounded text-[10px] font-mono font-bold border border-neutral-700 bg-neutral-900 text-neutral-200">
            {readiness.badge}
          </span>
        </div>

        {/* Tactile Grayscale Slider */}
        <div className="mt-6 px-1">
          <div className="flex justify-between text-[10px] font-mono text-neutral-400 mb-2">
            <span>1: RESTED</span>
            <span>5: SHIFT DRAIN</span>
            <span>10: EXHAUSTED</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={score}
            onChange={handleSliderChange}
            className="w-full h-2 bg-neutral-850 rounded appearance-none cursor-pointer accent-white focus:outline-none"
          />
          <div className="flex justify-between px-1 mt-1.5 text-[10px] text-neutral-500 font-mono">
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
          </div>
        </div>

        {/* Impact Card */}
        <div className="mt-5 p-3.5 rounded-lg bg-neutral-950 border border-neutral-800 transition-all">
          <div className="text-xs font-bold uppercase tracking-wider text-white font-mono mb-1">
            {readiness.tier}
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            {readiness.desc}
          </p>
          <div className="mt-2 pt-2 border-t border-neutral-850 flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
            <Check className="w-3.5 h-3.5 text-white" />
            <span>Scale Rule: {readiness.action}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-lg border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white text-xs font-mono transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-bold font-mono tracking-tight transition-all active:scale-95"
          >
            Apply Rule
          </button>
        </div>
      </div>
    </div>
  );
};
