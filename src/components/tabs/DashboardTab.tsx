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
      {/* 1. HERO "ZEN" WORKOUT CARD & PRIMARY ACTION BUTTON (Tactile Brutalist Frosted Glass) */}
      <section 
        aria-labelledby="zen-workout-heading"
        className="rounded-[4px] glass-card p-5 space-y-4 border border-white/10"
      >
        {/* Shift Badge & Rota Context */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {dayInfo.isOvertime ? (
                <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-black bg-[#00FF87] text-black font-mono tracking-wider">
                  12H OVERTIME
                </span>
              ) : dayInfo.isShiftDay ? (
                <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-black border border-[#00FF87]/40 bg-[#00FF87]/15 text-[#00FF87] flex items-center gap-1 font-mono tracking-wider">
                  <Sun className="w-3 h-3 text-[#00FF87]" aria-hidden="true" />
                  12H SHIFT DAY
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-[4px] text-[10px] font-black bg-[#8A2BE2]/20 text-[#A354F5] border border-[#8A2BE2]/40 flex items-center gap-1 font-mono tracking-wider">
                  <Moon className="w-3 h-3 text-[#A354F5]" aria-hidden="true" />
                  OFF-DAY TRAINING
                </span>
              )}
              <span className="text-xs text-slate-300 font-mono">
                {dayInfo.dayOfWeek}
              </span>
            </div>

            <h2 id="zen-workout-heading" className="text-3xl font-black text-white tracking-tight font-heading">
              {todayWorkout?.title || dayInfo.workoutTitle}
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-mono">
              Focus: <strong className="text-[#00FF87]">{todayWorkout?.category || dayInfo.recommendedWorkoutCategory}</strong> • Target: ~{todayWorkout?.targetDurationMin || 45}m
            </p>
          </div>

          <div className="w-11 h-11 rounded-[4px] bg-[#00FF87]/15 border border-[#00FF87]/40 flex items-center justify-center shrink-0 text-[#00FF87]">
            <Dumbbell className="w-5 h-5" aria-hidden="true" />
          </div>
        </div>

        {/* Dynamic Status Strip */}
        <div className="p-3 rounded-[4px] bg-white/[0.04] backdrop-blur-md border border-white/10 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#00FF87]" aria-hidden="true" />
            <span className="text-slate-300">Current Fatigue:</span>
            <span className="text-[#00FF87] font-bold">{currentFatigue} / 10</span>
          </div>

          <div>
            {isWorkoutDone ? (
              <span className="text-[#00FF87] font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                Done
              </span>
            ) : isWorkoutInProgress ? (
              <span className="text-[#00FF87] font-bold">
                In Progress ({completedExercisesCount}/{totalExercisesCount})
              </span>
            ) : (
              <span className="text-slate-300">
                {totalExercisesCount > 0 ? `${totalExercisesCount} exercises` : 'Rest Day'}
              </span>
            )}
          </div>
        </div>

        {/* MASSIVE PRIMARY ACTION BUTTON (Tactile Brutalist Electric Mint Solid) */}
        <button
          onClick={handleStartWorkoutClick}
          aria-label={
            isWorkoutDone 
              ? 'View completed workout session' 
              : isWorkoutInProgress 
              ? 'Resume active workout session' 
              : "Start today's workout session"
          }
          className="min-h-[58px] w-full py-4 px-6 rounded-[4px] btn-tactile-primary text-black font-heading font-black text-lg uppercase tracking-wide flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#00FF87]"
        >
          <Play className="w-5 h-5 fill-black stroke-black" aria-hidden="true" />
          <span>
            {isWorkoutDone 
              ? 'View Completed Workout' 
              : isWorkoutInProgress 
              ? 'Resume Active Workout' 
              : 'Start Today\'s Workout'}
          </span>
          <ChevronRight className="w-5 h-5 stroke-[3] ml-auto" aria-hidden="true" />
        </button>
      </section>

      {/* 2. CONDENSED DAILY FUEL & WATER SUMMARY (Tactile Glassmorphism) */}
      <section 
        aria-labelledby="condensed-fuel-heading"
        className="rounded-[4px] glass-card p-5 space-y-4 border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00FF87] block font-black">
              Daily Fuel & Hydration
            </span>
            <h3 id="condensed-fuel-heading" className="text-xl font-black text-white font-heading tracking-tight">
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
            className="min-h-[44px] px-3.5 py-1.5 rounded-[4px] btn-tactile-secondary text-xs font-heading font-bold flex items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-[#00FF87]"
          >
            <span>{isFuelDetailsExpanded ? 'Hide Grams' : 'Tap for Details'}</span>
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
                className="min-h-[44px] flex-1 py-1.5 rounded-[4px] btn-tactile-secondary text-xs font-bold text-white text-center focus:outline-none focus:ring-1 focus:ring-[#00FF87]"
              >
                +250ml
              </button>
              <button
                type="button"
                onClick={() => onAddWater(500)}
                aria-label="Quick log 500 milliliters of water"
                className="min-h-[44px] flex-1 py-1.5 rounded-[4px] btn-tactile-secondary text-xs font-bold text-white text-center focus:outline-none focus:ring-1 focus:ring-[#00FF87]"
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
          className="min-h-[48px] w-full py-3 px-4 rounded-[4px] btn-tactile-secondary font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 focus:outline-none focus:ring-1 focus:ring-[#00FF87]"
        >
          <span>Open Full Fuel Diary</span>
          <ChevronRight className="w-4 h-4 text-[#00FF87]" aria-hidden="true" />
        </button>
      </section>

      {/* 3. Minimal Morning Weigh-In Card (Tactile Frosted Glass) */}
      <section 
        aria-labelledby="weigh-in-heading"
        className="rounded-[4px] glass-card p-4 border border-white/10"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#A354F5]" aria-hidden="true" />
            <h4 id="weigh-in-heading" className="text-xs font-black text-white font-heading uppercase tracking-wider">
              Morning Weight
            </h4>
          </div>
          {todayWeight?.weightKg && (
            <span className="text-xs font-mono font-bold text-[#A354F5] bg-[#8A2BE2]/20 px-2.5 py-0.5 rounded-[4px] border border-[#8A2BE2]/40">
              {todayWeight.weightKg} kg logged
            </span>
          )}
        </div>

        <form onSubmit={handleWeightSubmit} className="flex items-center gap-2 mt-2 font-mono">
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
              className="w-full min-h-[44px] bg-white/[0.04] border border-white/15 rounded-[4px] px-3 py-2 text-white text-xs font-bold placeholder-slate-400 focus:outline-none focus:border-[#00FF87] transition-colors"
            />
            <span className="absolute right-3 top-3 text-xs text-slate-400" aria-hidden="true">kg</span>
          </div>

          <button
            type="submit"
            aria-label={weightSavedNotice ? 'Weight saved' : 'Save morning weight entry'}
            className="min-h-[44px] px-5 py-2 rounded-[4px] btn-tactile-primary text-black font-heading font-black text-xs uppercase tracking-wider shrink-0 focus:outline-none focus:ring-1 focus:ring-[#00FF87]"
          >
            {weightSavedNotice ? 'Saved ✓' : 'Save'}
          </button>
        </form>

        {todayWeight?.movingAverage7Day && (
          <p className="text-[10px] text-slate-300 mt-2 font-mono">
            7-Day Moving Avg: <strong className="text-[#A354F5]">{todayWeight.movingAverage7Day} kg</strong>
          </p>
        )}
      </section>
    </div>
  );
};
