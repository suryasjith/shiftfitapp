import React from 'react';
import { UserProfile, ShiftDay } from '../types';
import { Activity, Database, HelpCircle } from 'lucide-react';
import { ContextualHelp } from './ContextualHelp';

interface HeaderProps {
  todayStr: string;
  profile: UserProfile;
  customShifts: Record<string, ShiftDay>;
  currentFatigue: number;
  onOpenFatigueModal: () => void;
  onExportBackup: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  todayStr,
  profile,
  currentFatigue,
  onOpenFatigueModal,
  onExportBackup,
  onOpenGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-neutral-800 px-4 pt-[max(env(safe-area-inset-top,48px),48px)] pb-3">
      <div className="flex items-center justify-between">
        {/* Brand & Date */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-750 flex items-center justify-center font-black font-mono text-xs text-white">
            SF
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white font-mono">SHIFTFIT</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded border border-neutral-750 bg-neutral-900 text-neutral-300 font-mono font-medium">
                {profile.targetWeightMinKg}–{profile.targetWeightMaxKg}kg
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono">
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Guide / Onboarding Trigger */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 px-2 py-1 rounded border border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-white hover:border-neutral-600 text-[11px] font-mono transition-all active:scale-95"
            title="Open Architecture & Profile Setup Guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guide</span>
          </button>

          {/* CNS Fatigue Badge with discrete ? */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenFatigueModal}
              className="flex items-center gap-1 px-2 py-1 rounded border border-neutral-750 bg-neutral-900 text-white text-[11px] font-mono font-medium hover:border-neutral-500 transition-all active:scale-95"
              title="Adjust Daily Fatigue / CNS Scale"
            >
              <Activity className="w-3.5 h-3.5 text-neutral-400" />
              <span>CNS: {currentFatigue}/10</span>
            </button>
            <ContextualHelp
              title="Daily CNS Fatigue"
              content="Rates your central nervous system fatigue on a 1-10 scale. If fatigue is high (8-10), the engine automatically cuts working volume by 30-50% and replaces high-axial spinal loads with safe alternatives."
              placement="bottom"
            />
          </div>

          {/* Offline IndexedDB Engine Status & Backup */}
          <div className="flex items-center gap-1">
            <button
              onClick={onExportBackup}
              className="flex items-center gap-1 px-2 py-1 rounded border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700 text-[11px] font-mono transition-all active:scale-95"
              title="100% Offline IndexedDB Engine Active. Tap to Export Local Backup."
            >
              <Database className="w-3.5 h-3.5 text-neutral-300" />
              <span className="text-[10px]">Offline DB</span>
            </button>
            <ContextualHelp
              title="Offline IndexedDB Database"
              content="All workout history, nutrition logs, steps, and bodyweight metrics are aggressively saved to the device's local IndexedDB with redundant LocalStorage sync. 100% offline access."
              placement="bottom"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
