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
  Droplet, 
  Scale, 
  ChevronRight, 
  Activity, 
  Sun, 
  Moon, 
  Plus, 
  Check, 
  ArrowUpRight 
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';
import { ContextualHelp } from '../ContextualHelp';

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

  let totalSets = 0;
  let completedSets = 0;
  if (todayWorkout) {
    todayWorkout.exercises.forEach(ex => {
      totalSets += ex.sets.length;
      completedSets += ex.sets.filter(s => s.completed).length;
    });
  }

  return (
    <div className="space-y-3.5 pb-24 text-left animate-fadeIn">
      {/* Rota Shift Hero Card - Monochrome OLED */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              {dayInfo.isOvertime ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-black border border-white">
                  OVERTIME 12H
                </span>
              ) : dayInfo.isShiftDay ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-neutral-700 bg-neutral-900 text-neutral-200 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-neutral-400" />
                  12H SHIFT ({dayInfo.shiftIndex + 1}/4)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white text-black flex items-center gap-1">
                  <Moon className="w-3 h-3 text-black" />
                  OFF-DAY ({dayInfo.offIndex + 1}/3)
                </span>
              )}

              <span className="text-[11px] text-neutral-400 font-mono">
                {dayInfo.dayOfWeek}
              </span>

              <ContextualHelp
                title="4-On / 3-Off Schedule"
                content="Your base shift rota cycles through 4 working days (12-hour shifts) followed by 3 recovery off-days. High-volume heavy workouts are automatically allocated to off-days, while shift days receive spinal decompression and CNS rest."
              />
            </div>

            <h2 className="mt-2 text-lg font-bold text-white tracking-tight font-mono">
              {dayInfo.isShiftDay ? '12h Shift CNS Protection' : 'Aesthetic Hypertrophy Day'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {dayInfo.isShiftDay 
                ? 'Managing spinal and central nervous system fatigue between long shifts.' 
                : 'High-volume off-day targeted at V-taper clavicular & quad sweep.'}
            </p>
          </div>

          <button
            onClick={onOpenFatigueModal}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-900 border border-neutral-750 hover:border-neutral-500 transition-all active:scale-95 shrink-0"
            title="Update CNS Fatigue"
          >
            <Activity className="w-3.5 h-3.5 text-neutral-300 mb-0.5" />
            <span className="text-[9px] text-neutral-500 font-mono uppercase">Fatigue</span>
            <span className="text-xs font-bold font-mono text-white">{currentFatigue}<span className="text-[10px] text-neutral-500">/10</span></span>
          </button>
        </div>

        {/* 4-on / 3-off Cycle Progress bar */}
        <div className="mt-4 pt-3 border-t border-neutral-850">
          <div className="flex justify-between items-center text-[10px] font-mono font-semibold text-neutral-400 mb-1.5">
            <span>4-ON / 3-OFF CYCLE</span>
            <span className="text-white">DAY {dayInfo.cycleDayIndex + 1} OF 7</span>
          </div>
          <div className="grid grid-cols-7 gap-1 h-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
              const isPastOrCurrent = dayIdx <= dayInfo.cycleDayIndex;
              const isCurrent = dayIdx === dayInfo.cycleDayIndex;
              return (
                <div
                  key={dayIdx}
                  className={`rounded-sm transition-all ${
                    isCurrent
                      ? 'bg-white'
                      : isPastOrCurrent
                      ? 'bg-neutral-600'
                      : 'bg-neutral-900 border border-neutral-850'
                  }`}
                  title={dayIdx < 4 ? `Shift Day ${dayIdx + 1}` : `Off Day ${dayIdx - 3}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[9px] text-neutral-500 mt-1 font-mono uppercase">
            <span>4 Shifts (12h)</span>
            <span>3 Off Days</span>
          </div>
        </div>
      </div>

      {/* Today's Prescribed Workout Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono font-semibold text-neutral-400">
                  {todayWorkout?.category || dayInfo.recommendedWorkoutCategory} PROGRAM
                </span>
                <ContextualHelp
                  title="Prescribed Workout"
                  content="This workout was algorithmically selected based on your rota position and daily fatigue rating. Off-days receive heavy push, legs, or pull hypertrophy; shift days receive low-CNS mobility flushes."
                />
              </div>
              <h3 className="text-sm font-bold text-white font-mono">
                {todayWorkout?.title || dayInfo.workoutTitle}
              </h3>
            </div>
          </div>

          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
            {todayWorkout?.completed ? 'DONE' : `${todayWorkout?.targetDurationMin || 50} MIN`}
          </span>
        </div>

        {todayWorkout?.autoAdjustedReason && (
          <div className="mt-2.5 p-2 rounded border border-neutral-800 bg-neutral-900 text-[11px] text-neutral-300 font-mono">
            {todayWorkout.autoAdjustedReason}
          </div>
        )}

        {/* Exercises Preview */}
        <div className="mt-3 divide-y divide-neutral-850 bg-neutral-900 rounded-lg p-2 border border-neutral-800">
          {(todayWorkout?.exercises || []).slice(0, 3).map((ex, idx) => (
            <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-neutral-800 text-neutral-300 flex items-center justify-center text-[10px] font-mono">
                  {idx + 1}
                </span>
                <span className="text-neutral-200 font-mono text-[11px] truncate max-w-[190px]">
                  {ex.selectedAlternative || ex.exerciseName}
                </span>
              </div>
              <span className="text-neutral-500 font-mono text-[10px]">
                {ex.sets.filter(s => s.completed).length}/{ex.sets.length} sets
              </span>
            </div>
          ))}
          {(todayWorkout?.exercises.length || 0) > 3 && (
            <div className="pt-1.5 text-center text-[10px] text-neutral-500 font-mono">
              +{(todayWorkout?.exercises.length || 0) - 3} MORE MOVEMENTS
            </div>
          )}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onNavigateTab('workout')}
          className="mt-3 w-full py-2.5 px-4 rounded-lg bg-white text-black font-mono font-bold text-xs tracking-tight transition-all active:scale-98 flex items-center justify-center gap-1.5 hover:bg-neutral-200"
        >
          <span>{todayWorkout?.completed ? 'VIEW WORKOUT LOG' : completedSets > 0 ? 'RESUME ACTIVE WORKOUT' : 'START WORKOUT'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Morning Weight Prompt Card (Target: 75-78kg) */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm text-left">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white font-mono uppercase">Morning Weigh-In</h3>
                <ContextualHelp
                  title="75-78kg Recomp Target"
                  content="Log your weight once upon waking. The system computes a 7-day moving average to filter out dehydration or shift-related fluid retention, accurately holding your 75.0-78.0kg aesthetic maintenance target."
                />
              </div>
              <p className="text-[10px] text-neutral-400 font-mono">Target: 75.0 – 78.0 kg</p>
            </div>
          </div>
          {todayWeight?.weightKg && (
            <span className="text-[10px] font-mono font-bold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
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
              className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-white transition-colors"
            />
            <span className="absolute right-3 top-2 text-xs text-neutral-500 font-mono">kg</span>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 text-white font-mono font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            {weightSaved ? <Check className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-white" />}
            <span>{weightSaved ? 'SAVED' : 'LOG'}</span>
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400 font-mono pt-1">
          <span>7-Day Moving Avg: <strong className="text-white">{todayWeight?.movingAverage7Day || '76.4'} kg</strong></span>
          <button 
            onClick={() => onNavigateTab('analytics')}
            className="text-neutral-300 hover:text-white flex items-center gap-0.5 uppercase font-semibold"
          >
            Trend Chart <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Nutrition & Hydration Dual Grid */}
      <div className="grid grid-cols-2 gap-2.5 text-left">
        {/* Macros Card */}
        <div 
          onClick={() => onNavigateTab('nutrition')}
          className="rounded-xl bg-neutral-950 border border-neutral-800 p-3 cursor-pointer hover:border-neutral-700 transition-all active:scale-98"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono font-bold uppercase text-white">Protein</span>
              <ContextualHelp
                title="Macro Target"
                content="Preset to ~2.3g protein per kg of bodyweight to preserve lean contractile tissue during shift stress."
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-neutral-300">{proteinPercent}%</span>
          </div>

          <div className="mt-2">
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-lg font-black text-white">{currentProtein}</span>
              <span className="text-[10px] text-neutral-500">/ {targetProtein}g</span>
            </div>
            <div className="mt-1 w-full bg-neutral-850 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
            <p className="mt-1 text-[9px] font-mono text-neutral-500">
              {currentCals} / {targetCals} kcal
            </p>
          </div>
        </div>

        {/* Hydration Card */}
        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono font-bold uppercase text-white">Water</span>
              <ContextualHelp
                title="Hydration Target"
                content="Shift workers lose extra fluid in dry hospital and work sites. Timed water goals prevent fatigue and headaches."
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-neutral-300">{waterPercent}%</span>
          </div>

          <div className="mt-2">
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-lg font-black text-white">{(currentWater / 1000).toFixed(1)}</span>
              <span className="text-[10px] text-neutral-500">/ {(targetWater / 1000).toFixed(1)}L</span>
            </div>
            <div className="mt-1 w-full bg-neutral-850 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
            <div className="mt-2 flex gap-1 font-mono">
              <button
                onClick={() => handleWaterTap(250)}
                className="flex-1 py-1 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[9px] font-bold border border-neutral-800"
              >
                +250ml
              </button>
              <button
                onClick={() => handleWaterTap(500)}
                className="flex-1 py-1 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[9px] font-bold border border-neutral-800"
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
