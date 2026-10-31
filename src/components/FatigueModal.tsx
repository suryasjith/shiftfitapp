import React, { useState, useEffect, useRef } from 'react';
import { Activity, X, Check } from 'lucide-react';
import { soundManager } from '../services/audioTimer';

interface FatigueModalProps {
  initialScore: number;
  onSave: (score: number) => void;
  onClose: () => void;
  isOpen: boolean;
  onConfirmSuccess?: () => void;
}

export const FatigueModal: React.FC<FatigueModalProps> = ({
  initialScore,
  onSave,
  onClose,
  isOpen,
  onConfirmSuccess,
}) => {
  const [score, setScore] = useState<number>(initialScore || 3);
  const modalRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  // Sync initial score when opened
  useEffect(() => {
    if (isOpen) {
      setScore(initialScore || 3);
      // Auto-focus slider on open for immediate tactile interaction
      setTimeout(() => {
        sliderRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialScore]);

  // Keyboard navigation & Focus management (Escape key & Tab loop)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getReadinessLevel = (val: number) => {
    if (val <= 4) {
      return {
        tier: 'Optimal CNS Readiness',
        badge: 'FULL VOLUME PRESCRIBED',
        desc: 'Nervous system recovered. Ready for top-end weight loads (RPE 8-9) and standard working sets.',
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
        desc: 'Severe 12-hour shift exhaustion. Caps volume at 2 working sets and switches to joint-safe alternatives.',
        action: 'Auto-cuts volume by 40-50% to protect recovery.',
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
    if (onConfirmSuccess) {
      onConfirmSuccess();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fatigue-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-none bg-black border border-neutral-700 shadow-2xl p-6 text-left relative"
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-none bg-neutral-900 border border-neutral-700 text-white">
              <Activity className="w-4 h-4 text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <h3 id="fatigue-modal-title" className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Pre-Workout Check-In
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">Rate fatigue (1-10) to scale volume</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-white"
            aria-label="Close pre-workout fatigue modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Current Score Display */}
        <div className="mt-6 text-center">
          <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400 mb-1">
            Current Fatigue Rating
          </div>
          <div className="flex items-baseline justify-center gap-1.5 font-mono">
            <span className="text-6xl font-black text-white">{score}</span>
            <span className="text-2xl text-neutral-500 font-bold">/ 10</span>
          </div>
          <span className="inline-block mt-3 px-3 py-1 rounded-none text-[11px] font-mono font-bold border border-neutral-700 bg-neutral-900 text-emerald-400">
            {readiness.badge}
          </span>
        </div>

        {/* Tactile Grayscale Slider with Touch Padding */}
        <div className="mt-6 px-1">
          <div className="flex justify-between text-[10px] font-mono font-bold text-neutral-400 mb-2">
            <span>1: FRESH</span>
            <span>5: SHIFT FATIGUE</span>
            <span>10: EXHAUSTED</span>
          </div>
          <div className="py-2">
            <input
              ref={sliderRef}
              id="modal-fatigue-slider"
              type="range"
              min="1"
              max="10"
              step="1"
              value={score}
              onChange={handleSliderChange}
              aria-label="Pre-workout fatigue level from 1 fresh to 10 exhausted"
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={score}
              aria-valuetext={`${score} out of 10, ${readiness.tier}`}
              className="w-full h-3 bg-neutral-850 rounded-none appearance-none cursor-pointer accent-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            />
          </div>
          <div className="flex justify-between px-1 mt-1 text-[10px] text-neutral-400 font-mono">
            <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
          </div>
        </div>

        {/* Impact Card */}
        <div className="mt-5 p-4 rounded-none bg-neutral-950 border border-neutral-800 transition-all">
          <div className="text-xs font-bold uppercase tracking-wider text-white font-mono mb-1">
            {readiness.tier}
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            {readiness.desc}
          </p>
          <div className="mt-2.5 pt-2.5 border-t border-neutral-850 flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Rule: {readiness.action}</span>
          </div>
        </div>

        {/* Actions with min 48px touch targets */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] flex-1 py-3 px-4 rounded-none border border-neutral-750 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all active:translate-y-[1px] focus:outline-none focus:ring-1 focus:ring-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="min-h-[48px] flex-1 py-3 px-4 rounded-none bg-white hover:bg-neutral-200 text-black text-xs font-bold font-mono uppercase tracking-wider transition-all active:translate-y-[1px] shadow-sm flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <span>Confirm & Start</span>
          </button>
        </div>
      </div>
    </div>
  );
};
