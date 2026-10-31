import React, { useState, useMemo, useCallback } from 'react';
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
  Scale, 
  ChevronRight, 
  Activity, 
  Sun, 
  Moon, 
  Check 
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
  onUpdateFatigue: (score: number) => void;
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
  onUpdateFatigue,
  onNavigateTab,
  onSaveWeight,
  onAddWater,
}) => {
  // Memoized Rota Calculation (Vercel React Best Practices)
  const dayInfo = useMemo(() => {
    return RotaEngine.getDayInfo(todayStr, profile, customShifts);
  }, [todayStr, profile, customShifts]);

  // Fully empty by default - zero hardcoded digits
  const [quickWeight, setQuickWeight] = useState<string>('');
  const [weightSavedNotice, setWeightSavedNotice] = useState<boolean>(false);

  // Memoized Fuel & Hydration Metrics
  const targetMacros = useMemo(() => {
    return dayInfo.isShiftDay ? profile.shiftDayMacros : profile.offDayMacros;
  }, [dayInfo.isShiftDay, profile.shiftDayMacros, profile.offDayMacros]);

  const currentCals = todayNutrition?.calories || 0;
  const targetCals = targetMacros.calories || 2365;
  const remainingCals = Math.max(0, targetCals - currentCals);
  const caloriesPercent = Math.min(100, Math.round((currentCals / targetCals) * 100));

  const currentProtein = todayNutrition?.proteinGrams || 0;
  const targetProtein = targetMacros.proteinGrams || 185;
  const remainingProtein = Math.max(0, targetProtein - currentProtein);
  const proteinPercent = Math.min(100, Math.round((currentProtein / targetProtein) * 100));

  const currentWater = todayHydration?.currentMl || 0;
  const targetWater = todayHydration?.targetMl || profile.dailyWaterTargetMl || 3800;
  const waterPercent = Math.min(100, Math.round((currentWater / targetWater) * 100));

  // Workout status metrics
  const exercises = todayWorkout?.exercises || [];
  const totalExercisesCount = exercises.length;
  const completedExercisesCount = exercises.filter(
    (ex) => ex.sets.length > 0 && ex.sets.every((s) => s.completed)
  ).length;
  const isWorkoutDone = todayWorkout?.completed || (totalExercisesCount > 0 && completedExercisesCount === totalExercisesCount);
  const isWorkoutInProgress = completedExercisesCount > 0 && !isWorkoutDone;

  const handleFatigueChange = useCallback((newVal: number) => {
    soundManager.playTap();
    onUpdateFatigue(newVal);
  }, [onUpdateFatigue]);

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickWeight);
    if (!isNaN(val) && val >= 30 && val <= 250) {
      soundManager.playTap();
      onSaveWeight(val);
      setQuickWeight('');
      setWeightSavedNotice(true);
      setTimeout(() => setWeightSavedNotice(false), 2500);
    }
  };

  const getFatigueLabel = (score: number) => {
    if (score <= 2) return { text: 'Fully Recovered • Maximum Volume', tone: 'text-neutral-200' };
    if (score <= 4) return { text: 'Normal Energy • Standard Training Load', tone: 'text-neutral-200' };
    if (score <= 6) return { text: 'Shift Fatigue • Volume Moderated (-1 set)', tone: 'text-neutral-300' };
    if (score <= 8) return { text: 'Heavy 12h Shift • CNS Protection Active (-30% sets)', tone: 'text-white' };
    return { text: 'Exhausted / Post-Night Shift • Mobility Deload', tone: 'text-white' };
  };

  const fatigueMeta = getFatigueLabel(currentFatigue);

  return (
    <div className="space-y-4 pb-28 text-left animate-fadeIn font-sans">
      {/* 1. TOP: The Daily 1-10 Fatigue / RPE Slider */}
      <section 
        aria-labelledby="fatigue-heading"
        className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white">
              <Activity className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-bold">
                Daily Check-In
              </span>
              <h2 id="fatigue-heading" className="text-sm font-bold text-white tracking-tight">
                How Tired Are You Today?
              </h2>
            </div>
          </div>

          <div 
            aria-label={`Current fatigue rating: ${currentFatigue} out of 10`}
            className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-750 text-right"
          >
            <span className="text-sm font-black font-mono text-white">
              {currentFatigue}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono"> / 10</span>
          </div>
        </div>

        {/* The 1-10 Range Slider (WCAG 2.2 Compliant) */}
        <div className="pt-2">
          <label htmlFor="daily-fatigue-slider" className="sr-only">
            Daily Fatigue / Energy Level from 1 (Fresh) to 10 (Exhausted)
          </label>
          <input
            id="daily-fatigue-slider"
            type="range"
            min="1"
            max="10"
            step="1"
            value={currentFatigue}
            onChange={(e) => handleFatigueChange(parseInt(e.target.value, 10))}
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={currentFatigue}
            aria-valuetext={fatigueMeta.text}
            className="w-full h-2 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none focus:ring-2 focus:ring-white"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 font-mono pt-1">
            <span>1 (Fresh)</span>
            <span>5 (Normal Shift)</span>
            <span>10 (Exhausted)</span>
          </div>
        </div>

        {/* Dynamic status feedback */}
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-850 flex items-center justify-between">
          <span className={`text-xs font-medium ${fatigueMeta.tone}`}>
            {fatigueMeta.text}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono shrink-0 ml-2">
            Auto-Adjusted
          </span>
        </div>
      </section>

      {/* 2. MIDDLE: High-Level Today's Generated Workout Summary Card */}
      <section 
        aria-labelledby="workout-summary-heading"
        className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {dayInfo.isOvertime ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-black font-mono">
                  12H OVERTIME
                </span>
              ) : dayInfo.isShiftDay ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-neutral-700 bg-neutral-900 text-neutral-200 flex items-center gap-1 font-mono">
                  <Sun className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                  12H SHIFT DAY
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-black flex items-center gap-1 font-mono">
                  <Moon className="w-3 h-3 text-black" aria-hidden="true" />
                  OFF-DAY TRAINING
                </span>
              )}
              <span className="text-xs text-neutral-400 font-mono">
                {dayInfo.dayOfWeek}
              </span>
            </div>

            <h3 id="workout-summary-heading" className="text-lg font-bold text-white tracking-tight mt-1">
              {todayWorkout?.title || dayInfo.workoutTitle}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Focus: <strong className="text-neutral-200">{todayWorkout?.category || dayInfo.recommendedWorkoutCategory}</strong> • Target Duration: ~{todayWorkout?.targetDurationMin || 45} mins
            </p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-750 flex items-center justify-center shrink-0 text-white">
            <Dumbbell className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
        </div>

        {/* Workout Progress Badge */}
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-850 flex items-center justify-between text-xs font-mono">
          <span className="text-neutral-400">Status:</span>
          {isWorkoutDone ? (
            <span className="text-white font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              Completed Today
            </span>
          ) : isWorkoutInProgress ? (
            <span className="text-white font-bold">
              In Progress ({completedExercisesCount}/{totalExercisesCount} exercises)
            </span>
          ) : (
            <span className="text-neutral-300">
              {totalExercisesCount} movements scheduled
            </span>
          )}
        </div>

        {/* Primary Action Button (min 48px touch target) */}
        <button
          onClick={() => onNavigateTab('workout')}
          aria-label={
            isWorkoutDone 
              ? 'View completed workout session' 
              : isWorkoutInProgress 
              ? 'Resume active workout session' 
              : "Start today's workout session"
          }
          className="min-h-[48px] w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-neutral-200 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <span>
            {isWorkoutDone 
              ? 'View Completed Workout' 
              : isWorkoutInProgress 
              ? 'Resume Active Workout' 
              : 'Start Today\'s Workout'}
          </span>
          <ChevronRight className="w-4 h-4 stroke-[3]" aria-hidden="true" />
        </button>
      </section>

      {/* 3. BOTTOM: High-Level Remaining Macros & Water Summary */}
      <section 
        aria-labelledby="fuel-summary-heading"
        className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block font-bold">
              Daily Nutrition & Fluid
            </span>
            <h3 id="fuel-summary-heading" className="text-base font-bold text-white tracking-tight">
              Fuel Status
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs text-neutral-400 font-mono block">Remaining</span>
            <span className="text-sm font-bold text-white font-mono">
              {remainingCals} kcal
            </span>
          </div>
        </div>

        {/* Calories Progress Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-neutral-300">Calories: <strong>{currentCals}</strong> / {targetCals} kcal</span>
            <span className="text-neutral-400 font-mono">{caloriesPercent}%</span>
          </div>
          <div 
            role="progressbar" 
            aria-valuenow={caloriesPercent} 
            aria-valuemin={0} 
            aria-valuemax={100}
            aria-label="Daily calories consumed percentage"
            className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-neutral-850"
          >
            <div 
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${caloriesPercent}%` }}
            />
          </div>
        </div>

        {/* Protein & Hydration Dual Highlights */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Protein */}
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-850 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-bold uppercase text-[10px]">Protein</span>
              <span className="text-white font-mono font-bold">{proteinPercent}%</span>
            </div>
            <div className="text-base font-bold text-white font-mono">
              {currentProtein}<span className="text-xs text-neutral-400 font-normal"> / {targetProtein}g</span>
            </div>
            <p className="text-[10px] text-neutral-400">
              {remainingProtein > 0 ? `${Math.round(remainingProtein)}g remaining` : 'Target achieved ✓'}
            </p>
          </div>

          {/* Hydration */}
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-850 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-bold uppercase text-[10px]">Water</span>
              <span className="text-white font-mono font-bold">{waterPercent}%</span>
            </div>
            <div className="text-base font-bold text-white font-mono">
              {(currentWater / 1000).toFixed(1)}<span className="text-xs text-neutral-400 font-normal"> / {(targetWater / 1000).toFixed(1)}L</span>
            </div>
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => onAddWater(250)}
                aria-label="Quick log 250 milliliters of water"
                className="min-h-[44px] flex-1 py-1 rounded-lg bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-[11px] font-bold text-white active:scale-95 transition-all text-center focus:outline-none focus:ring-2 focus:ring-white"
              >
                +250ml
              </button>
              <button
                onClick={() => onAddWater(500)}
                aria-label="Quick log 500 milliliters of water"
                className="min-h-[44px] flex-1 py-1 rounded-lg bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-[11px] font-bold text-white active:scale-95 transition-all text-center focus:outline-none focus:ring-2 focus:ring-white"
              >
                +500ml
              </button>
            </div>
          </div>
        </div>

        {/* Action Button: Log Meal (min 48px touch target) */}
        <button
          onClick={() => onNavigateTab('fuel')}
          aria-label="Open Fuel tab to log meals and view full macronutrient breakdown"
          className="min-h-[48px] w-full py-3.5 rounded-xl border border-neutral-750 bg-neutral-900 text-white font-bold text-sm uppercase tracking-wider hover:bg-neutral-850 transition-all active:scale-[0.98] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white"
        >
          <span>Log Food & View Macros</span>
          <ChevronRight className="w-4 h-4 text-neutral-400" aria-hidden="true" />
        </button>
      </section>

      {/* 4. Minimal Morning Weigh-In Card (Zero hardcoded digits) */}
      <section 
        aria-labelledby="weigh-in-heading"
        className="rounded-2xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-neutral-400" aria-hidden="true" />
            <h4 id="weigh-in-heading" className="text-xs font-bold text-white uppercase tracking-wider">
              Morning Weight
            </h4>
          </div>
          {todayWeight?.weightKg && (
            <span className="text-xs font-mono font-bold text-white bg-neutral-900 px-2.5 py-0.5 rounded-lg border border-neutral-750">
              {todayWeight.weightKg} kg logged
            </span>
          )}
        </div>

        <form onSubmit={handleWeightSubmit} className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <label htmlFor="dashboard-morning-weight" className="sr-only">
              Morning Weight in Kilograms
            </label>
            <input
              id="dashboard-morning-weight"
              type="number"
              step="0.1"
              min="30"
              max="250"
              value={quickWeight}
              onChange={(e) => setQuickWeight(e.target.value)}
              placeholder="Enter weight in kg"
              className="w-full min-h-[44px] bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white text-xs font-bold placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
            />
            <span className="absolute right-3 top-3 text-xs text-neutral-400 font-mono" aria-hidden="true">kg</span>
          </div>

          <button
            type="submit"
            aria-label={weightSavedNotice ? 'Weight saved' : 'Save morning weight entry'}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-white"
          >
            {weightSavedNotice ? 'Saved ✓' : 'Save Weight'}
          </button>
        </form>

        {todayWeight?.movingAverage7Day && (
          <p className="text-[10px] text-neutral-400 mt-2 font-mono">
            7-Day Moving Average: <strong className="text-white">{todayWeight.movingAverage7Day} kg</strong>
          </p>
        )}
      </section>
    </div>
  );
};
