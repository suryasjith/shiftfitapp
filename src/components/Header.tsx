import React from 'react';
import { UserProfile, ShiftDay } from '../types';
import { RotaEngine } from '../services/rotaEngine';
import { Activity, CloudCheck, CloudOff, Sun, Moon, HelpCircle } from 'lucide-react';
import { ContextualHelp } from './ContextualHelp';

interface HeaderProps {
  todayStr: string;
  profile: UserProfile;
  customShifts: Record<string, ShiftDay>;
  currentFatigue: number;
  onOpenFatigueModal: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  todayStr,
  profile,
  customShifts,
  currentFatigue,
  onOpenFatigueModal,
  onOpenSettings,
  onOpenGuide,
}) => {
  const dayInfo = RotaEngine.getDayInfo(todayStr, profile, customShifts);

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-neutral-800 px-4 pt-safe pb-3">
      <div className="flex items-center justify-between">
        {/* Brand & Date */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center font-black font-mono text-sm text-white">
            SF
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white font-mono">SHIFTFIT</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 font-mono">
                75–78kg
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Guide / Onboarding Trigger */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-300 hover:text-white hover:border-neutral-600 text-xs font-mono transition-all active:scale-95"
            title="Open ShiftFit Architecture Guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="text-[11px]">Guide</span>
          </button>

          {/* CNS Fatigue Badge with discrete ? */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenFatigueModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-white text-xs font-mono font-medium hover:border-neutral-500 transition-all active:scale-95"
              title="Adjust Daily Fatigue / CNS Scale"
            >
              <Activity className="w-3.5 h-3.5 text-neutral-300" />
              <span>CNS: {currentFatigue}/10</span>
            </button>
            <ContextualHelp
              title="Daily CNS Fatigue"
              content="Rates your central nervous system fatigue on a 1-10 scale. If fatigue is high (8-10), the engine automatically cuts working volume by 30-50% and replaces high-axial spinal loads with safe alternatives."
              placement="bottom"
            />
          </div>

          {/* Cloud Sync Status */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all active:scale-95"
            title={profile.googleDriveConnected ? "Google Drive Synced" : "Local Vault (Tap for Cloud Setup)"}
          >
            {profile.googleDriveConnected ? (
              <CloudCheck className="w-4 h-4 text-white" />
            ) : (
              <CloudOff className="w-4 h-4 text-neutral-500" />
            )}
          </button>
        </div>
      </div>

      {/* Sub-Bar: Rota Shift Status */}
      <div className="mt-2.5 flex items-center justify-between px-3 py-1.5 rounded-lg border border-neutral-850 bg-neutral-950 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          {dayInfo.isOvertime ? (
            <span className="text-white font-bold flex items-center gap-1">
              [!] 12H OVERTIME
            </span>
          ) : dayInfo.isShiftDay ? (
            <span className="text-neutral-300 flex items-center gap-1">
              <Sun className="w-3 h-3 text-neutral-400" />
              SHIFT ({dayInfo.shiftIndex + 1}/4)
            </span>
          ) : (
            <span className="text-white font-semibold flex items-center gap-1">
              <Moon className="w-3 h-3 text-neutral-300" />
              OFF-DAY ({dayInfo.offIndex + 1}/3)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-neutral-400">
          <span className="text-white font-semibold truncate max-w-[170px] text-right">
            {dayInfo.workoutTitle.split(':')[0]}
          </span>
        </div>
      </div>
    </header>
  );
};
