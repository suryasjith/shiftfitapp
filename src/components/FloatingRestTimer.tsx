import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Timer, Plus, Minus, ChevronDown, FastForward } from 'lucide-react';
import { soundManager } from '../services/audioTimer';

interface FloatingRestTimerProps {
  initialSeconds: number;
  isRunning: boolean;
  onFinish: () => void;
  onCancel: () => void;
  exerciseName?: string;
}

export const FloatingRestTimer: React.FC<FloatingRestTimerProps> = ({
  initialSeconds,
  isRunning,
  onFinish,
  onCancel: _onCancel,
  exerciseName,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Sync initial seconds when triggered
  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setTotalSeconds(initialSeconds);
    setIsMinimized(false);
  }, [initialSeconds]);

  // High-performance single interval timer (Vercel React Best Practices)
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          soundManager.playCompleteChime();
          onFinishRef.current();
          return 0;
        }
        if (prev <= 4 && prev > 1) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleAdd30 = useCallback(() => {
    soundManager.playTap();
    setSecondsLeft((prev) => {
      const next = prev + 30;
      setTotalSeconds((tot) => Math.max(tot, next));
      return next;
    });
  }, []);

  const handleSub15 = useCallback(() => {
    soundManager.playTap();
    setSecondsLeft((prev) => Math.max(0, prev - 15));
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalSeconds > 0 
    ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) 
    : 0;

  if (!isRunning && secondsLeft <= 0) return null;
  if (!isRunning) return null;

  // Minimized floating pill mode
  if (isMinimized) {
    return (
      <aside 
        aria-label="Active Rest Timer" 
        className="fixed bottom-24 right-4 z-50 animate-slideUp"
      >
        <button
          onClick={() => setIsMinimized(false)}
          aria-label={`Resting: ${formatTime(secondsLeft)}. Click to expand timer full screen.`}
          className="min-h-[44px] bg-white text-black border border-neutral-300 rounded-full px-4 py-2.5 shadow-2xl flex items-center gap-2 font-mono font-bold text-xs active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-white"
        >
          <Timer className="w-4 h-4 text-black animate-pulse" aria-hidden="true" />
          <span role="timer" aria-live="polite">Resting: {formatTime(secondsLeft)}</span>
        </button>
      </aside>
    );
  }

  // Full Screen Takeover: Hides upcoming exercises so user recovers with zero cognitive overload
  return (
    <section 
      aria-modal="true"
      role="dialog"
      aria-label="Active Recovery Interval"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-6 text-center animate-fadeIn select-none"
    >
      {/* Top Header Bar */}
      <header className="flex items-center justify-between pt-[max(env(safe-area-inset-top,24px),24px)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-neutral-300">
            Active Recovery Interval
          </span>
        </div>

        <button
          onClick={() => setIsMinimized(true)}
          aria-label="Minimize timer to peek at workout exercises"
          className="min-h-[44px] text-xs font-mono text-neutral-300 hover:text-white px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-900 transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-neutral-400"
        >
          <span>Peek Exercises</span>
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </header>

      {/* Main Focus Center */}
      <div className="my-auto space-y-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block font-medium">
            Completed Set on:
          </span>
          <h2 className="text-lg font-bold text-white mt-1 font-mono tracking-tight">
            {exerciseName || 'Current Movement'}
          </h2>
        </div>

        {/* Big Digital Timer Display with WCAG AA Live Region */}
        <div className="relative py-4">
          <div 
            role="timer"
            aria-live="polite"
            aria-atomic="true"
            className="text-7xl sm:text-8xl font-black font-mono text-white tracking-tighter"
          >
            {formatTime(secondsLeft)}
          </div>
          <p className="text-xs text-neutral-300 mt-2 font-sans max-w-xs mx-auto">
            Breathe deeply. Your nervous system is restoring ATP for your next heavy set.
          </p>
        </div>

        {/* Progress Bar */}
        <div 
          role="progressbar" 
          aria-valuenow={Math.round(progressPercent)} 
          aria-valuemin={0} 
          aria-valuemax={100}
          aria-label="Rest interval progress"
          className="max-w-xs mx-auto w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800"
        >
          <div 
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Adjustment Buttons with 44px min touch size */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleSub15}
            aria-label="Subtract 15 seconds from rest time"
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-750 text-neutral-200 hover:text-white text-xs font-mono font-bold transition-all active:scale-95 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
            <span>-15s</span>
          </button>

          <button
            onClick={handleAdd30}
            aria-label="Add 30 seconds to rest time"
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-750 text-white text-xs font-mono font-bold transition-all active:scale-95 flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>+30s Rest</span>
          </button>
        </div>
      </div>

      {/* Bottom Primary Action Button */}
      <footer className="pb-[max(env(safe-area-inset-bottom,20px),20px)] max-w-sm mx-auto w-full space-y-2">
        <button
          onClick={() => {
            soundManager.playTap();
            onFinish();
          }}
          aria-label="Skip remaining rest interval and start next set immediately"
          className="min-h-[52px] w-full py-4 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <FastForward className="w-4 h-4 fill-black" aria-hidden="true" />
          <span>Skip Rest & Start Next Set</span>
        </button>
        <p className="text-[11px] text-neutral-400 font-sans">
          Next set will be highlighted immediately upon resuming.
        </p>
      </footer>
    </section>
  );
};
