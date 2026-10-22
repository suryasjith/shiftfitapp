import React, { useEffect, useState } from 'react';
import { Timer, Plus, Minus, X, Bell } from 'lucide-react';
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

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    setTotalSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft <= 0) {
      soundManager.playCompleteChime();
      onFinish();
      return;
    }

    // Audio tick on 3, 2, 1
    if (secondsLeft <= 3 && secondsLeft > 0) {
      soundManager.playTick();
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, onFinish]);

  if (!isRunning && secondsLeft <= 0) return null;

  const handleAdd30 = () => {
    soundManager.playTap();
    setSecondsLeft((prev) => prev + 30);
    setTotalSeconds((prev) => Math.max(prev, secondsLeft + 30));
  };

  const handleSub30 = () => {
    soundManager.playTap();
    setSecondsLeft((prev) => Math.max(0, prev - 30));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalSeconds > 0 ? Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)) : 0;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto animate-slideUp">
      <div className="bg-dark-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-3.5 shadow-2xl shadow-cyan-950/60 relative overflow-hidden">
        {/* Progress bar background fill */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-cyan-900/20 to-transparent transition-all duration-1000 -z-0"
          style={{ width: `${progressPercent}%` }}
        />

        <div className="relative z-10 flex items-center justify-between gap-3">
          {/* Timer Display */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Timer className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-2xl font-black tracking-tight text-white">
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">REST</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[130px]">
                {exerciseName || 'Next Set Coming Up'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSub30}
              className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 active:scale-95 transition-all text-xs font-semibold"
              title="-30s"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleAdd30}
              className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 active:scale-95 transition-all text-xs font-semibold"
              title="+30s"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onCancel}
              className="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 active:scale-95 transition-all"
              title="Skip Rest"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
