import React from 'react';
import { X, Sparkles, Moon, Droplets, Sun, RotateCcw } from 'lucide-react';
import { CyclePhase } from '../types';
import { soundManager } from '../services/audioTimer';

interface CyclePhaseModalProps {
  isOpen: boolean;
  currentPhase: CyclePhase;
  isOverride: boolean;
  onSelectPhase: (phase?: CyclePhase) => void;
  onClose: () => void;
}

export const CyclePhaseModal: React.FC<CyclePhaseModalProps> = ({
  isOpen,
  currentPhase,
  isOverride,
  onSelectPhase,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleChoose = (phase?: CyclePhase) => {
    soundManager.playTap();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(40); } catch { /* ignore */ }
    }
    onSelectPhase(phase);
    onClose();
  };

  const phases: { phase: CyclePhase; title: string; subtitle: string; icon: any; colorClass: string }[] = [
    {
      phase: 'ovulatory',
      title: '⚡ Ovulatory / Peak Strength',
      subtitle: 'Estrogen peak. Highest force production & recovery. Prime PR window.',
      icon: Sparkles,
      colorClass: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
    },
    {
      phase: 'follicular',
      title: 'Follicular Phase',
      subtitle: 'Rising energy, optimal glycogen storage & tissue remodeling.',
      icon: Sun,
      colorClass: 'border-sky-500/50 bg-sky-950/40 text-sky-300',
    },
    {
      phase: 'luteal',
      title: 'Luteal Phase',
      subtitle: 'High progesterone: core temp +0.4°C. Hydration target boosted (+400ml).',
      icon: Droplets,
      colorClass: 'border-purple-500/50 bg-purple-950/40 text-purple-300',
    },
    {
      phase: 'menstrual',
      title: 'Menstrual Phase',
      subtitle: 'Decompression & mobility focus. Extra rest between heavy sets.',
      icon: Moon,
      colorClass: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cycle-modal-title"
    >
      <div className="w-full max-w-sm rounded-3xl bg-[#0A0A0A] border border-white/15 p-5 shadow-2xl text-white space-y-4 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 id="cycle-modal-title" className="text-sm font-bold tracking-tight">
              Cycle Phase Override
            </h3>
            <p className="text-[11px] text-stone-400 font-mono">
              1-Tap Physiological Tuning
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close phase modal"
            className="w-8 h-8 rounded-full bg-stone-900 border border-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phase List */}
        <div className="space-y-2 text-xs">
          {phases.map((p) => {
            const isCurrent = currentPhase === p.phase;
            const Icon = p.icon;
            return (
              <button
                key={p.phase}
                type="button"
                onClick={() => handleChoose(p.phase)}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start gap-3 active:scale-95 ${
                  isCurrent 
                    ? `${p.colorClass} ring-2 ring-orange-500/60` 
                    : 'bg-stone-900/80 border-white/10 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div className="w-7 h-7 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>{p.title}</span>
                    {isCurrent && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-orange-500 text-white uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                    {p.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Auto Projection Reset */}
        {isOverride && (
          <button
            type="button"
            onClick={() => handleChoose(undefined)}
            className="w-full py-2.5 rounded-2xl border border-stone-800 bg-stone-950 hover:bg-stone-900 text-stone-400 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset to Auto-Projected Phase</span>
          </button>
        )}
      </div>
    </div>
  );
};
