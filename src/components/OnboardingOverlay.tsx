import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Calendar, Dumbbell, Activity, Scale } from 'lucide-react';

interface OnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(0);

  if (!isOpen) return null;

  const slides = [
    {
      icon: Calendar,
      tag: 'THE ENGINE',
      title: '4-on / 3-off Shift Rota',
      desc: 'Workouts auto-route based on your 12-hour rota. Heavy Push, Legs, and Pull are mapped to your 3 off-days. Shift days trigger spinal decompression or shortened recovery to protect your central nervous system.',
      tip: 'Tap any day in the 4-3 Rota calendar to add overtime or swap shifts.'
    },
    {
      icon: Dumbbell,
      tag: 'GYM EXECUTION',
      title: '1-Tap Equipment Swaps',
      desc: 'Crowded gym? Tap "Equipment Taken?" on any exercise to instantly swap for a movement targeting the exact same muscle group and resistance curve without losing set logs.',
      tip: 'Rest timer starts automatically upon checking off a completed set.'
    },
    {
      icon: Activity,
      tag: 'AUTO-REGULATION',
      title: 'Daily CNS Fatigue Check',
      desc: 'Set your 1–10 Fatigue score upon opening the app. If a grueling 12h shift drains your recovery, the algorithm auto-reduces working volume by 30–50% to prevent burnout.',
      tip: 'Tap the CNS badge in the header anytime to adjust today\'s volume scale.'
    },
    {
      icon: Scale,
      tag: 'PRECISION RECOMP',
      title: '75–78kg Corridor & Desktop Sync',
      desc: 'Morning weigh-ins calculate a 7-day moving average to filter fluid swings. Weekly physique photos upload directly to Google Drive and automatically appear in your PC folder via Desktop Client.',
      tip: 'Look for discrete "?" icons across the app for quick, non-intrusive tips.'
    }
  ];

  const current = slides[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-xl bg-black border border-neutral-700 p-5 text-left relative shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-black bg-white px-2 py-0.5 rounded">
              SHIFTFIT OS
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              STEP {step + 1} OF {slides.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white p-1 transition-colors"
            aria-label="Close Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-4 gap-1.5 mt-3.5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === step ? 'bg-white' : i < step ? 'bg-neutral-600' : 'bg-neutral-850'
              }`}
            />
          ))}
        </div>

        {/* Card Body */}
        <div className="mt-5 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
            <Icon className="w-5 h-5 stroke-[1.8]" />
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              {current.tag}
            </div>
            <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
              {current.title}
            </h3>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed">
            {current.desc}
          </p>

          <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 font-mono">
            <span className="text-white font-bold">INFO:</span> {current.tip}
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="mt-6 pt-3 border-t border-neutral-850 flex items-center justify-between gap-2">
          {step > 0 ? (
            <button
              onClick={handlePrev}
              className="py-2 px-3 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white text-xs font-semibold flex items-center gap-1 active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-300 text-xs font-mono px-2"
            >
              Skip All
            </button>
          )}

          <button
            onClick={handleNext}
            className="py-2 px-4 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-bold font-mono tracking-tight flex items-center gap-1 active:scale-95"
          >
            <span>{step === slides.length - 1 ? 'Start Engine' : 'Next'}</span>
            {step === slides.length - 1 ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
