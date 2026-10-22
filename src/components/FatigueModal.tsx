import React, { useState } from 'react';
import { Activity, X, Zap, ShieldAlert, Sparkles, Check } from 'lucide-react';
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
        color: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgColor: 'bg-emerald-500/10',
        badge: '🟢 Full Volume Prescribed',
        desc: 'Nervous system is recovered. Ready for top-end weight loads (RPE 8-9) and 4 sets per exercise.',
        action: 'Prescribes 100% full programmed volume & top sets.',
        icon: Zap
      };
    } else if (val <= 7) {
      return {
        tier: 'Moderate Shift Fatigue',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/40',
        bgColor: 'bg-amber-500/10',
        badge: '🟡 Auto-Scaled Volume (-1 Set)',
        desc: 'Elevated work or sleep strain. The engine preserves top heavy sets while dropping 1 accessory set to manage recovery.',
        action: 'Drops 1 working set from secondary movements to prevent overtraining.',
        icon: Sparkles
      };
    } else {
      return {
        tier: 'High Fatigue / CNS Drain',
        color: 'text-rose-400',
        borderColor: 'border-rose-500/40',
        bgColor: 'bg-rose-500/10',
        badge: '🔴 Deload & CNS Protection (-40-50%)',
        desc: 'Severe 12-hour shift exhaustion. Engine caps volume at 2 working sets, bypasses heavy spinal axial loading, and prioritizes joint decompression.',
        action: 'Auto-cuts volume by 40-50% and switches to joint-safe machine alternatives.',
        icon: ShieldAlert
      };
    }
  };

  const readiness = getReadinessLevel(score);
  const Icon = readiness.icon;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl bg-dark-900 border border-dark-700 shadow-2xl p-5 text-left relative overflow-hidden">
        {/* Glow backdrop */}
        <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-20 ${readiness.bgColor}`} />

        <div className="flex items-center justify-between pb-3 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Daily Fatigue & CNS Check</h3>
              <p className="text-xs text-slate-400">Shift Worker Auto-Regulation Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Score Display */}
        <div className="mt-5 text-center">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className={`text-5xl font-extrabold tracking-tight ${readiness.color}`}>{score}</span>
            <span className="text-xl text-slate-400 font-semibold">/ 10</span>
          </div>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${readiness.borderColor} ${readiness.bgColor} ${readiness.color}`}>
            {readiness.badge}
          </span>
        </div>

        {/* Tactile Slider */}
        <div className="mt-6 px-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-2">
            <span className="text-emerald-400">1: Fully Rested</span>
            <span className="text-amber-400">5: Shift Drain</span>
            <span className="text-rose-400">10: Exhausted</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={score}
            onChange={handleSliderChange}
            className="w-full h-3 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
          <div className="flex justify-between px-1 mt-1 text-[10px] text-slate-400 font-mono">
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
          </div>
        </div>

        {/* Auto-Regulation Impact Card */}
        <div className={`mt-5 p-3.5 rounded-xl border ${readiness.borderColor} ${readiness.bgColor} transition-all`}>
          <div className="flex items-center gap-2 mb-1.5">
            <Icon className={`w-4 h-4 ${readiness.color}`} />
            <span className={`text-xs font-bold uppercase tracking-wide ${readiness.color}`}>
              {readiness.tier}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {readiness.desc}
          </p>
          <div className="mt-2 pt-2 border-t border-dark-700/50 flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium">
            <Check className="w-3.5 h-3.5 text-cyan-400" />
            <span>Algorithm Adjustment: {readiness.action}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 text-xs font-semibold transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-glow-cyan transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>Apply Engine Rules</span>
          </button>
        </div>
      </div>
    </div>
  );
};
