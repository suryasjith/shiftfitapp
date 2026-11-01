import React, { useState, useMemo } from 'react';
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
  Check, 
  Play, 
  Flame, 
  Droplet,
  ChevronDown,
  ChevronUp
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
  onOpenFatigueModal?: () => void;
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
  onUpdateFatigue: _onUpdateFatigue,
  onNavigateTab,
  onSaveWeight,
  onAddWater,
  onOpenFatigueModal,
}) => {
  const dayInfo = useMemo(() => {
    return RotaEngine.getDayInfo(todayStr, profile, customShifts);
  }, [todayStr, profile, customShifts]);

  // State for Morning Weight Input
  const [quickWeight, setQuickWeight] = useState<string>('');
  const [weightSavedNotice, setWeightSavedNotice] = useState<boolean>(false);

  // State for condensed fuel card expansion (progressive disclosure)
  const [isFuelDetailsExpanded, setIsFuelDetailsExpanded] = useState<boolean>(false);

  // Target Macros
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

  // Handle Primary "Start Today's Workout" tap
  const handleStartWorkoutClick = () => {
    soundManager.playTap();
    if (isWorkoutDone || isWorkoutInProgress) {
      // If workout is already completed or in progress, route directly to prevent clobbering active sets
      onNavigateTab('workout');
    } else if (onOpenFatigueModal) {
      // Trigger modal asking for 1-10 Fatigue level before routing to an unstarted session
      onOpenFatigueModal();
    } else {
      onNavigateTab('workout');
    }
  };

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

  return (
    <div className="space-y-4 pb-28 text-left animate-fadeIn font-sans">
      {/* 1. HERO "ZEN" WORKOUT CARD & PRIMARY ACTION BUTTON (iOS Frosted Glass over Off-White) */}
      <section 
        aria-labelledby="zen-workout-heading"
        className="glass-card p-5 space-y-4"
      >
        {/* Shift Badge & Rota Context */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {dayInfo.isOvertime ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 font-sans tracking-wide">
                  12H OVERTIME
                </span>
              ) : dayInfo.isShiftDay ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-orange-200 bg-orange-50 text-terracotta flex items-center gap-1 font-sans tracking-wide">
                  <Sun className="w-3 h-3 text-terracotta" aria-hidden="true" />
                  12H SHIFT DAY
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1 font-sans tracking-wide">
                  <Moon className="w-3 h-3 text-stone-500" aria-hidden="true" />
                  OFF-DAY TRAINING
                </span>
              )}
              <span className="text-xs text-stone-500 font-sans font-medium">
                {dayInfo.dayOfWeek}
              </span>
            </div>

            <h2 id="zen-workout-heading" className="text-2xl font-extrabold text-stone-900 tracking-tight font-heading">
              {todayWorkout?.title || dayInfo.workoutTitle}
            </h2>
            <p className="text-xs text-stone-600 mt-1 font-sans">
              Focus: <strong className="text-stone-900 font-semibold">{todayWorkout?.category || dayInfo.recommendedWorkoutCategory}</strong> • Target: ~{todayWorkout?.targetDurationMin || 45}m
            </p>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center shrink-0 text-terracotta shadow-xs">
            <Dumbbell className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>

        {/* Dynamic Status Strip */}
        <div className="p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/70 flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-terracotta" aria-hidden="true" />
            <span className="text-stone-500 font-medium">Current Fatigue:</span>
            <span className="text-stone-900 font-bold">{currentFatigue} / 10</span>
          </div>

          <div>
            {isWorkoutDone ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                Done
              </span>
            ) : isWorkoutInProgress ? (
              <span className="text-terracotta font-bold">
                In Progress ({completedExercisesCount}/{totalExercisesCount})
              </span>
            ) : (
              <span className="text-stone-500">
                {totalExercisesCount > 0 ? `${totalExercisesCount} exercises` : 'Rest Day'}
              </span>
            )}
          </div>
        </div>

        {/* MASSIVE PRIMARY ACTION BUTTON (Warm Terracotta iOS Capsule) */}
        <button
          onClick={handleStartWorkoutClick}
          aria-label={
            isWorkoutDone 
              ? 'View completed workout session' 
              : isWorkoutInProgress 
              ? 'Resume active workout session' 
              : "Start today's workout session"
          }
          className="min-h-[56px] w-full py-4 px-6 btn-tactile-primary text-white font-heading font-bold text-base flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          <Play className="w-5 h-5 fill-white stroke-white" aria-hidden="true" />
          <span>
            {isWorkoutDone 
              ? 'View Completed Workout' 
              : isWorkoutInProgress 
              ? 'Resume Active Workout' 
              : 'Start Today\'s Workout'}
          </span>
          <ChevronRight className="w-5 h-5 stroke-[2.5] ml-auto" aria-hidden="true" />
        </button>
      </section>

      {/* 2. CONDENSED DAILY FUEL & WATER SUMMARY (iOS Frosted Glass) */}
      <section 
        aria-labelledby="condensed-fuel-heading"
        className="glass-card p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-sans uppercase tracking-widest text-sage-700 block font-bold">
              Daily Fuel & Hydration
            </span>
            <h3 id="condensed-fuel-heading" className="text-xl font-bold text-stone-900 font-heading tracking-tight">
              Nutrition Readiness
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playTap();
              setIsFuelDetailsExpanded(!isFuelDetailsExpanded);
            }}
            aria-expanded={isFuelDetailsExpanded}
            aria-label={isFuelDetailsExpanded ? "Hide granular fuel details" : "Show granular fuel details"}
            className="min-h-[44px] px-3.5 py-1.5 btn-tactile-secondary text-xs font-sans font-semibold flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            <span>{isFuelDetailsExpanded ? 'Hide Details' : 'Show Details'}</span>
            {isFuelDetailsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Condensed Progress Bars (High-Level Percentages View) */}
        <div className="space-y-3">
          {/* Calories Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                <Flame className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
                Energy Intake
              </span>
              <span className="text-teal-300 font-bold">{caloriesPercent}%</span>
            </div>
            <div 
              role="progressbar" 
              aria-valuenow={caloriesPercent} 
              aria-valuemin={0} 
              aria-valuemax={100}
              aria-label="Daily calories consumed percentage"
              className="w-full bg-slate-950/80 h-2.5 rounded-none overflow-hidden border border-white/10"
            >
              <div 
                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-300 rounded-none"
                style={{ width: `${caloriesPercent}%` }}
              />
            </div>
          </div>

          {/* Dual Compact Rings/Bars: Protein & Water */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Protein Percentage (Mint / Emerald) */}
            <div className="p-3 rounded-none bg-slate-950/60 backdrop-blur-md border border-teal-500/25">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">Protein</span>
                <span className="text-emerald-400 font-bold">{proteinPercent}%</span>
              </div>
              <div 
                role="progressbar"
                aria-valuenow={proteinPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Daily protein target percentage"
                className="w-full bg-slate-900 h-1.5 rounded-none overflow-hidden border border-white/10"
              >
                <div 
                  className="bg-emerald-400 h-full transition-all duration-300 rounded-none"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>

            {/* Hydration Percentage (Cool Sky Blue) */}
            <div className="p-3 rounded-none bg-slate-950/60 backdrop-blur-md border border-sky-500/25">
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-sky-400" aria-hidden="true" />
                  Water
                </span>
                <span className="text-sky-300 font-bold">{waterPercent}%</span>
              </div>
              <div 
                role="progressbar"
                aria-valuenow={waterPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Daily water intake percentage"
                className="w-full bg-slate-900 h-1.5 rounded-none overflow-hidden border border-white/10"
              >
                <div 
                  className="bg-sky-400 h-full transition-all duration-300 rounded-none"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Granular Data Reveal (Only shown when tapped) */}
        {isFuelDetailsExpanded && (
          <div className="mt-3 pt-3 border-t border-teal-500/25 space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950/70 rounded-none border border-teal-500/25">
                <div className="text-[10px] uppercase font-bold text-teal-400">Protein Grams</div>
                <div className="text-sm font-bold text-slate-100 mt-0.5">
                  {currentProtein}g / {targetProtein}g
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {remainingProtein > 0 ? `${Math.round(remainingProtein)}g left` : 'Goal reached ✓'}
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-none border border-sky-500/25">
                <div className="text-[10px] uppercase font-bold text-sky-400">Hydration Volume</div>
                <div className="text-sm font-bold text-slate-100 mt-0.5">
                  {(currentWater / 1000).toFixed(1)}L / {(targetWater / 1000).toFixed(1)}L
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {remainingCals} kcal remaining
                </div>
              </div>
            </div>

            {/* Quick Water Logging Buttons */}
            <div className="flex gap-2 pt-1 font-mono">
              <button
                type="button"
                onClick={() => onAddWater(250)}
                aria-label="Quick log 250 milliliters of water"
                className="min-h-[44px] flex-1 py-1.5 rounded-xl btn-tactile-secondary text-xs font-semibold text-stone-700 text-center focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                +250ml
              </button>
              <button
                type="button"
                onClick={() => onAddWater(500)}
                aria-label="Quick log 500 milliliters of water"
                className="min-h-[44px] flex-1 py-1.5 rounded-xl btn-tactile-secondary text-xs font-semibold text-stone-700 text-center focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                +500ml
              </button>
            </div>
          </div>
        )}

        {/* Action Button: Log Meal (min 48px touch target) */}
        <button
          onClick={() => onNavigateTab('fuel')}
          aria-label="Open Fuel tab to log meals and view full macronutrient breakdown"
          className="min-h-[48px] w-full py-3 px-4 rounded-xl btn-tactile-secondary font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          <span>Open Full Fuel Diary</span>
          <ChevronRight className="w-4 h-4 text-stone-600" aria-hidden="true" />
        </button>
      </section>

      {/* 3. Minimal Morning Weigh-In Card (Warm iOS Frosted Glass) */}
      <section 
        aria-labelledby="weigh-in-heading"
        className="glass-card p-5 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-700" aria-hidden="true" />
            <h4 id="weigh-in-heading" className="text-sm font-bold text-stone-900 font-heading">
              Morning Weigh-In
            </h4>
          </div>
          {todayWeight?.weightKg && (
            <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              {todayWeight.weightKg} kg logged
            </span>
          )}
        </div>

        <form onSubmit={handleWeightSubmit} className="flex items-center gap-2 font-sans">
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
              className="w-full min-h-[44px] bg-white/80 border border-stone-200 rounded-xl px-3.5 py-2 text-stone-900 text-xs font-bold placeholder-stone-400 focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-orange-100 transition-colors"
            />
            <span className="absolute right-3.5 top-3 text-xs text-stone-400 font-medium" aria-hidden="true">kg</span>
          </div>

          <button
            type="submit"
            aria-label={weightSavedNotice ? 'Weight saved' : 'Save morning weight entry'}
            className="min-h-[44px] px-5 py-2 rounded-xl btn-tactile-primary text-white font-heading font-bold text-xs uppercase tracking-wider shrink-0 focus:outline-none focus:ring-2 focus:ring-orange-200"
          >
            {weightSavedNotice ? 'Saved ✓' : 'Save'}
          </button>
        </form>

        {todayWeight?.movingAverage7Day && (
          <p className="text-[11px] text-stone-500 font-sans">
            7-Day Moving Avg: <strong className="text-stone-800 font-semibold">{todayWeight.movingAverage7Day} kg</strong>
          </p>
        )}
      </section>
    </div>
  );
};
