import React, { useEffect, useState } from 'react';
import { Timer, Plus, Minus, ChevronDown, Play, FastForward } from 'lucide-react';
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
  onCancel,
  exerciseName,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState<number>(initialSeconds);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setTotalSeconds(initialSeconds);
    setIsMinimized(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft <= 0) {
      soundManager.playCompleteChime();
      onFinish();
      return;
    }

    if (secondsLeft <= 3 && secondsLeft > 0) {
      soundManager.playTick();
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, onFinish]);

  if (!isRunning && secondsLeft <= 0) return null;
  if (!isRunning) return null;

  const handleAdd30 = () => {
    soundManager.playTap();
    setSecondsLeft((prev) => prev + 30);
    setTotalSeconds((prev) => Math.max(prev, secondsLeft + 30));
  };

  const handleSub15 = () => {
    soundManager.playTap();
    setSecondsLeft((prev) => Math.max(0, prev - 15));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalSeconds > 0 
    ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) 
    : 0;

  // Minimized floating pill mode
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-4 z-50 animate-slideUp">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-white text-black border border-neutral-300 rounded-full px-4 py-2.5 shadow-2xl flex items-center gap-2 font-mono font-bold text-xs active:scale-95 transition-all"
        >
          <Timer className="w-4 h-4 text-black animate-pulse" />
          <span>Resting: {formatTime(secondsLeft)}</span>
        </button>
      </div>
    );
  }

  // Full Screen Takeover: Hides the noise of upcoming exercises so user can recover with zero cognitive overload
  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-6 text-center animate-fadeIn select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-[max(env(safe-area-inset-top,24px),24px)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-neutral-400">
            Active Recovery Interval
          </span>
        </div>

        <button
          onClick={() => setIsMinimized(true)}
          className="text-xs font-mono text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg border border-neutral-800 bg-neutral-900 transition-colors flex items-center gap-1"
        >
          <span>Peek Exercises</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Focus Center */}
      <div className="my-auto space-y-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-neutral-500 block">
            Completed Set on:
          </span>
          <h2 className="text-lg font-bold text-white mt-1 font-mono tracking-tight">
            {exerciseName || 'Current Movement'}
          </h2>
        </div>

        {/* Big Digital Timer Display */}
        <div className="relative py-4">
          <div className="text-7xl sm:text-8xl font-black font-mono text-white tracking-tighter">
            {formatTime(secondsLeft)}
          </div>
          <p className="text-xs text-neutral-400 mt-2 font-sans max-w-xs mx-auto">
            Breathe deeply. Your nervous system is restoring ATP for your next heavy set.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-xs mx-auto w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-800">
          <div 
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Adjustment Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleSub15}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-750 text-neutral-300 hover:text-white text-xs font-mono font-bold transition-all active:scale-95 flex items-center gap-1"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>-15s</span>
          </button>

          <button
            onClick={handleAdd30}
            className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-750 text-white text-xs font-mono font-bold transition-all active:scale-95 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+30s Rest</span>
          </button>
        </div>
      </div>

      {/* Bottom Primary Action Button */}
      <div className="pb-[max(env(safe-area-inset-bottom,20px),20px)] max-w-sm mx-auto w-full space-y-2">
        <button
          onClick={() => {
            soundManager.playTap();
            onFinish();
          }}
          className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-2"
        >
          <FastForward className="w-4 h-4 fill-black" />
          <span>Skip Rest & Start Next Set</span>
        </button>
        <p className="text-[11px] text-neutral-500 font-sans">
          Next set will be highlighted immediately upon resuming.
        </p>
      </div>
    </div>
  );
};
