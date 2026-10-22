import React, { useState } from 'react';
import { 
  UserProfile, 
  ShiftDay, 
  WorkoutSession, 
  NutritionLog, 
  HydrationLog, 
  BodyweightEntry 
} from '../../types';
import { RotaEngine } from '../../services/rotaEngine';
import { 
  Dumbbell, 
  Flame, 
  Droplet, 
  Scale, 
  Calendar, 
  ChevronRight, 
  Activity, 
  Sun, 
  Moon, 
  AlertTriangle, 
  Plus, 
  Check, 
  ArrowUpRight 
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';

interface DashboardTabProps {
  todayStr: string;
  profile: UserProfile;
  customShifts: Record<string, ShiftDay>;
  todayWorkout: WorkoutSession | null;
  todayNutrition: NutritionLog | null;
  todayHydration: HydrationLog | null;
  todayWeight: BodyweightEntry | null;
  currentFatigue: number;
  onOpenFatigueModal: () => void;
  onNavigateTab: (tab: any) => void;
  onSaveWeight: (weight: number) => void;
  onAddWater: (amountMl: number) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  todayStr,
  profile,
  customShifts,
  todayWorkout,
  todayNutrition,
  todayHydration,
  todayWeight,
  currentFatigue,
  onOpenFatigueModal,
  onNavigateTab,
  onSaveWeight,
  onAddWater,
}) => {
  const dayInfo = RotaEngine.getDayInfo(todayStr, profile, customShifts);
  const [quickWeight, setQuickWeight] = useState<string>(todayWeight?.weightKg ? String(todayWeight.weightKg) : '76.4');
  const [weightSaved, setWeightSaved] = useState<boolean>(false);

  const handleQuickWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickWeight);
    if (!isNaN(val) && val > 40 && val < 150) {
      soundManager.playTap();
      onSaveWeight(val);
      setWeightSaved(true);
      setTimeout(() => setWeightSaved(false), 2000);
    }
  };

  const handleWaterTap = (ml: number) => {
    soundManager.playTap();
    onAddWater(ml);
  };

  // Water calculation
  const currentWater = todayHydration?.currentMl || 0;
  const targetWater = todayHydration?.targetMl || profile.dailyWaterTargetMl || 3800;
  const waterPercent = Math.min(100, Math.round((currentWater / targetWater) * 100));

  // Nutrition calculation
  const targetMacros = dayInfo.isShiftDay ? profile.shiftDayMacros : profile.offDayMacros;
  const currentProtein = todayNutrition?.proteinGrams || 0;
  const targetProtein = targetMacros.proteinGrams;
  const proteinPercent = Math.min(100, Math.round((currentProtein / targetProtein) * 100));

  const currentCals = todayNutrition?.calories || 0;
  const targetCals = targetMacros.calories;

  // Completed workout sets count
  let totalSets = 0;
  let completedSets = 0;
  if (todayWorkout) {
    todayWorkout.exercises.forEach(ex => {
      totalSets += ex.sets.length;
      completedSets += ex.sets.filter(s => s.completed).length;
    });
  }

  return (
    <div className="space-y-4 pb-24 text-left animate-fadeIn">
      {/* Rota Shift Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-900 via-dark-850 to-dark-900 border border-dark-700/80 p-4 shadow-xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              {dayInfo.isOvertime ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  OVERTIME 12H SHIFT
                </span>
              ) : dayInfo.isShiftDay ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" />
                  12-HOUR SHIFT ({dayInfo.shiftIndex + 1} OF 4)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Moon className="w-3 h-3 text-emerald-400" />
                  OFF DAY ({dayInfo.offIndex + 1} OF 3)
                </span>
              )}

              <span className="text-[11px] text-slate-400 font-mono">
                {dayInfo.dayOfWeek}
              </span>
            </div>

            <h2 className="mt-2 text-xl font-black text-white tracking-tight">
              {dayInfo.isShiftDay ? '12h Shift CNS Protection' : 'Aesthetic Hypertrophy Day'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {dayInfo.isShiftDay 
                ? 'Managing spinal and central nervous system fatigue between long shifts.' 
                : 'High-volume off-day targeted at V-taper clavicular & quad sweep.'}
            </p>
          </div>

          <button
            onClick={onOpenFatigueModal}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-dark-800/90 border border-dark-700 hover:border-cyan-500/50 transition-all active:scale-95 shrink-0"
            title="Update CNS Fatigue"
          >
            <Activity className="w-4 h-4 text-cyan-400 mb-0.5" />
            <span className="text-[10px] text-slate-400">Fatigue</span>
            <span className="text-sm font-bold text-white">{currentFatigue}<span className="text-[10px] text-slate-400">/10</span></span>
          </button>
        </div>

        {/* 4-on / 3-off Cycle Progress bar */}
        <div className="mt-4 pt-3 border-t border-dark-800">
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mb-1.5">
            <span>4-On / 3-Off Rota Progress</span>
            <span className="text-cyan-400">Day {dayInfo.cycleDayIndex + 1} of 7</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 h-2">
            {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
              const isPastOrCurrent = dayIdx <= dayInfo.cycleDayIndex;
              const isShift = dayIdx < 4;
              return (
                <div
                  key={dayIdx}
                  className={`rounded-full transition-all ${
                    dayIdx === dayInfo.cycleDayIndex
                      ? 'bg-cyan-400 shadow-glow-cyan h-2.5 -translate-y-0.5'
                      : isPastOrCurrent
                      ? isShift ? 'bg-amber-500/60' : 'bg-emerald-500/60'
                      : 'bg-dark-750'
                  }`}
                  title={dayIdx < 4 ? `Shift Day ${dayIdx + 1}` : `Off Day ${dayIdx - 3}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono uppercase">
            <span>4 Days Shift (12h)</span>
            <span>3 Days Off (Lifting)</span>
          </div>
        </div>
      </div>

      {/* Today's Prescribed Workout Card */}
      <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-lg text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                {todayWorkout?.category || dayInfo.recommendedWorkoutCategory} Program
              </span>
              <h3 className="text-base font-bold text-white">
                {todayWorkout?.title || dayInfo.workoutTitle}
              </h3>
            </div>
          </div>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            todayWorkout?.completed 
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
              : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
          }`}>
            {todayWorkout?.completed ? 'COMPLETED' : `${todayWorkout?.targetDurationMin || 50} MIN`}
          </span>
        </div>

        {todayWorkout?.autoAdjustedReason && (
          <div className="mt-2.5 p-2 rounded-lg bg-dark-850 border border-cyan-900/50 text-[11px] text-cyan-300">
            ⚡ {todayWorkout.autoAdjustedReason}
          </div>
        )}

        {/* Exercises Preview */}
        <div className="mt-3 divide-y divide-dark-800/80 bg-dark-850/60 rounded-xl p-2.5 border border-dark-800">
          {(todayWorkout?.exercises || []).slice(0, 3).map((ex, idx) => (
            <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-dark-700 text-slate-300 flex items-center justify-center text-[10px] font-mono">
                  {idx + 1}
                </span>
                <span className="text-slate-200 font-medium truncate max-w-[190px]">
                  {ex.selectedAlternative || ex.exerciseName}
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                {ex.sets.filter(s => s.completed).length}/{ex.sets.length} sets
              </span>
            </div>
          ))}
          {(todayWorkout?.exercises.length || 0) > 3 && (
            <div className="pt-1.5 text-center text-[11px] text-slate-400 font-medium">
              +{(todayWorkout?.exercises.length || 0) - 3} more movements
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onNavigateTab('workout')}
          className="mt-3 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-glow-cyan transition-all active:scale-98 flex items-center justify-center gap-2"
        >
          <span>{todayWorkout?.completed ? 'View Workout Log' : completedSets > 0 ? 'Resume Active Workout' : 'Start Today\'s Workout'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Morning Weight Prompt Card (Target: 75-78kg) */}
      <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-lg text-left">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-violet/10 flex items-center justify-center text-brand-violet">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Morning Weight Check-In</h3>
              <p className="text-[11px] text-slate-400">Aesthetic Recomp Target: 75.0 - 78.0 kg</p>
            </div>
          </div>
          {todayWeight?.weightKg && (
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
              {todayWeight.weightKg} kg logged
            </span>
          )}
        </div>

        <form onSubmit={handleQuickWeightSubmit} className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              step="0.1"
              value={quickWeight}
              onChange={(e) => setQuickWeight(e.target.value)}
              placeholder="76.4"
              className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">kg</span>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 text-cyan-300 font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            {weightSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{weightSaved ? 'Saved!' : 'Log Weigh-In'}</span>
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>7-Day Moving Average: <strong className="text-white font-mono">{todayWeight?.movingAverage7Day || '76.4'} kg</strong></span>
          <button 
            onClick={() => onNavigateTab('analytics')}
            className="text-cyan-400 hover:underline flex items-center gap-0.5"
          >
            Trend Chart <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Nutrition & Hydration Dual Grid */}
      <div className="grid grid-cols-2 gap-3 text-left">
        {/* Macros Card */}
        <div 
          onClick={() => onNavigateTab('nutrition')}
          className="rounded-2xl bg-dark-900 border border-dark-800 p-3.5 cursor-pointer hover:border-dark-700 transition-all active:scale-98"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-brand-orange" />
              <span className="text-xs font-bold text-white">Daily Protein</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-brand-orange">{proteinPercent}%</span>
          </div>

          <div className="mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-xl font-black text-white">{currentProtein}</span>
              <span className="text-xs text-slate-400 font-mono">/ {targetProtein}g</span>
            </div>
            <div className="mt-1.5 w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-brand-orange h-full rounded-full transition-all duration-500"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400">
              {currentCals} / {targetCals} kcal
            </p>
          </div>
        </div>

        {/* Hydration Card */}
        <div className="rounded-2xl bg-dark-900 border border-dark-800 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Droplet className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">Hydration</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-400">{waterPercent}%</span>
          </div>

          <div className="mt-2.5">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-xl font-black text-white">{(currentWater / 1000).toFixed(1)}</span>
              <span className="text-xs text-slate-400 font-mono">/ {(targetWater / 1000).toFixed(1)}L</span>
            </div>
            <div className="mt-1.5 w-full bg-dark-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-cyan-400 h-full rounded-full transition-all duration-500 shadow-glow-cyan"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
            {/* Quick Add Water Buttons */}
            <div className="mt-2 flex gap-1.5">
              <button
                onClick={() => handleWaterTap(250)}
                className="flex-1 py-1 rounded-md bg-dark-800 hover:bg-dark-700 text-cyan-300 text-[10px] font-bold active:scale-95 border border-dark-700"
              >
                +250ml
              </button>
              <button
                onClick={() => handleWaterTap(500)}
                className="flex-1 py-1 rounded-md bg-dark-800 hover:bg-dark-700 text-cyan-300 text-[10px] font-bold active:scale-95 border border-dark-700"
              >
                +500ml
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
