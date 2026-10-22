import React, { useEffect, useState } from 'react';
import { Timer, Plus, Minus, X } from 'lucide-react';
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
      <div className="bg-neutral-950 border border-neutral-700 rounded-xl p-3.5 shadow-2xl relative overflow-hidden text-left">
        {/* Subtle monochrome progress line */}
        <div 
          className="absolute bottom-0 left-0 h-[2px] bg-white transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        />

        <div className="flex items-center justify-between gap-3">
          {/* Timer Display */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-750 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-black text-white">
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">REST</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono truncate max-w-[130px]">
                {exerciseName || 'Next Set Coming Up'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSub30}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 active:scale-95 transition-all text-xs font-mono"
              title="-30s"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleAdd30}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 active:scale-95 transition-all text-xs font-mono"
              title="+30s"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onCancel}
              className="p-2 rounded-lg border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white active:scale-95 transition-all"
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
