import React from 'react';
import { UserProfile, ShiftDay } from '../types';
import { RotaEngine } from '../services/rotaEngine';
import { Activity, CloudCheck, CloudOff, Flame, Moon, Sun, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  todayStr: string;
  profile: UserProfile;
  customShifts: Record<string, ShiftDay>;
  currentFatigue: number;
  onOpenFatigueModal: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  todayStr,
  profile,
  customShifts,
  currentFatigue,
  onOpenFatigueModal,
  onOpenSettings,
}) => {
  const dayInfo = RotaEngine.getDayInfo(todayStr, profile, customShifts);

  const getFatigueColor = (score: number) => {
    if (score <= 4) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (score <= 7) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  };

  return (
    <header className="sticky top-0 z-40 bg-dark-950/90 backdrop-blur-md border-b border-dark-800 px-4 pt-safe pb-3">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-violet-600 flex items-center justify-center shadow-glow-cyan">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">ShiftFit</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono font-semibold">
                75-78kg RECOMP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2">
          {/* Fatigue / CNS Regulation Button */}
          <button
            onClick={onOpenFatigueModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${getFatigueColor(currentFatigue)}`}
            title="Adjust Today's Fatigue / CNS Auto-Regulation"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>CNS: {currentFatigue}/10</span>
          </button>

          {/* Cloud Sync Status */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-dark-900 border border-dark-800 text-slate-300 hover:text-white transition-all active:scale-95"
            title={profile.googleDriveConnected ? "Google Drive Cloud Sync Active" : "Local Vault (Tap to configure Cloud)"}
          >
            {profile.googleDriveConnected ? (
              <CloudCheck className="w-4 h-4 text-cyan-400" />
            ) : (
              <CloudOff className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Rota Shift & Focus Sub-Bar */}
      <div className="mt-2.5 flex items-center justify-between px-3 py-1.5 rounded-lg bg-dark-900/90 border border-dark-800 text-xs">
        <div className="flex items-center gap-2">
          {dayInfo.isOvertime ? (
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Overtime 12h Shift
            </span>
          ) : dayInfo.isShiftDay ? (
            <span className="flex items-center gap-1 text-cyan-300 font-medium">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              12h Shift (Day {dayInfo.shiftIndex + 1} of 4)
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-300 font-medium">
              <Moon className="w-3.5 h-3.5 text-emerald-400" />
              Off Day (Day {dayInfo.offIndex + 1} of 3)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-300">
          <span className="text-[11px] text-slate-400">Prescription:</span>
          <span className="font-semibold text-white truncate max-w-[170px] text-right">
            {dayInfo.workoutTitle.split(':')[0]}
          </span>
        </div>
      </div>
    </header>
  );
};
