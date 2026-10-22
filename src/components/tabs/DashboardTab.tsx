import React, { useState } from 'react';
import { 
  UserProfile, 
  ShiftDay, 
  WorkoutSession, 
  NutritionLog, 
  HydrationLog, 
  BodyweightEntry,
  DailyStepsEntry,
  ActivityEntry
} from '../../types';
import { RotaEngine } from '../../services/rotaEngine';
import { PhysicsEngine } from '../../services/physicsEngine';
import { ActivityEngine } from '../../services/activityEngine';
import { 
  Dumbbell, 
  Scale, 
  ChevronRight, 
  Activity, 
  Sun, 
  Moon, 
  Plus, 
  Check, 
  ArrowUpRight,
  AlertTriangle,
  Clock,
  Footprints,
  Flame,
  TrendingUp
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
  dailySteps: DailyStepsEntry | null;
  activities: ActivityEntry[];
  currentFatigue: number;
  onOpenFatigueModal: () => void;
  onNavigateTab: (tab: any) => void;
  onSaveWeight: (weight: number) => void;
  onAddWater: (amountMl: number) => void;
  onSaveSteps: (steps: DailyStepsEntry) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  todayStr,
  profile,
  customShifts,
  todayWorkout,
  todayNutrition,
  todayHydration,
  todayWeight,
  dailySteps,
  activities,
  currentFatigue,
  onOpenFatigueModal,
  onNavigateTab,
  onSaveWeight,
  onAddWater,
  onSaveSteps,
}) => {
  const dayInfo = RotaEngine.getDayInfo(todayStr, profile, customShifts);

  // Fully editable string state - zero undeletable digits or rigid masks
  const [quickWeight, setQuickWeight] = useState<string>(
    todayWeight?.weightKg ? String(todayWeight.weightKg) : ''
  );
  const [weightSaved, setWeightSaved] = useState<boolean>(false);

  // Daily Steps state - string based for backspace safety
  const currentStepCount = dailySteps?.stepCount || 0;
  const [stepInputStr, setStepInputStr] = useState<string>(
    currentStepCount > 0 ? String(currentStepCount) : ''
  );
  const [stepSavedNotice, setStepSavedNotice] = useState<boolean>(false);

  // BMI & Timeline Physics Engine
  const gender = profile.gender || 'male';
  const currentWeight = profile.currentWeightKg || 76.4;
  const desiredWeight = profile.desiredWeightKg || profile.targetWeightMinKg || 76.5;
  const heightCm = profile.heightCm || 178;

  const bmiReport = PhysicsEngine.getBmiReport(currentWeight, heightCm, gender);
  const timeline = PhysicsEngine.getTimelineProjection(currentWeight, desiredWeight, gender);
  const goalParams = PhysicsEngine.getGoalParameters(profile.fitnessGoal || 'body_recomposition');

  // Active energy expenditure calculation (Cardio + Steps)
  const stepCalc = ActivityEngine.calculateStepCalories(currentStepCount, currentWeight);
  const totalCardioBurn = activities.reduce((acc, a) => acc + (a.caloriesBurned || 0), 0);
  const totalActiveBurn = stepCalc.activeStepCalories + totalCardioBurn;

  // Dynamic macros
  const baseMacros = dayInfo.isShiftDay ? profile.shiftDayMacros : profile.offDayMacros;
  const dynamicMacros = ActivityEngine.calculateDynamicMacros(baseMacros, totalActiveBurn);
  const effectiveTargetCals = dynamicMacros.dynamicCalories;
  const effectiveTargetProtein = dynamicMacros.dynamicProtein;
  const effectiveTargetCarbs = dynamicMacros.dynamicCarbs;

  const handleQuickWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickWeight);
    if (!isNaN(val) && val > 30 && val < 250) {
      soundManager.playTap();
      onSaveWeight(val);
      setWeightSaved(true);
      setTimeout(() => setWeightSaved(false), 2000);
    }
  };

  const handleStepsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(stepInputStr, 10);
    const validCount = isNaN(count) || count < 0 ? 0 : count;

    soundManager.playTap();
    const calc = ActivityEngine.calculateStepCalories(validCount, currentWeight);
    const updated: DailyStepsEntry = {
      date: todayStr,
      stepCount: validCount,
      estimatedCaloriesBurned: calc.totalStepCalories,
      activeCaloriesBurned: calc.activeStepCalories,
      lastUpdated: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };

    onSaveSteps(updated);
    setStepSavedNotice(true);
    setTimeout(() => setStepSavedNotice(false), 2000);
  };

  const handleAddStepIncrement = (increment: number) => {
    soundManager.playTap();
    const newCount = Math.max(0, currentStepCount + increment);
    setStepInputStr(String(newCount));
    const calc = ActivityEngine.calculateStepCalories(newCount, currentWeight);
    const updated: DailyStepsEntry = {
      date: todayStr,
      stepCount: newCount,
      estimatedCaloriesBurned: calc.totalStepCalories,
      activeCaloriesBurned: calc.activeStepCalories,
      lastUpdated: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
    onSaveSteps(updated);
    setStepSavedNotice(true);
    setTimeout(() => setStepSavedNotice(false), 2000);
  };

  const handleResetSteps = () => {
    soundManager.playTap();
    setStepInputStr('');
    const updated: DailyStepsEntry = {
      date: todayStr,
      stepCount: 0,
      estimatedCaloriesBurned: 0,
      activeCaloriesBurned: 0,
      lastUpdated: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
    onSaveSteps(updated);
  };

  const handleWaterTap = (ml: number) => {
    soundManager.playTap();
    onAddWater(ml);
  };

  const currentWater = todayHydration?.currentMl || 0;
  const targetWater = todayHydration?.targetMl || profile.dailyWaterTargetMl || 3800;
  const waterPercent = Math.min(100, Math.round((currentWater / targetWater) * 100));

  const currentProtein = todayNutrition?.proteinGrams || 0;
  const proteinPercent = Math.min(100, Math.round((currentProtein / effectiveTargetProtein) * 100));

  const currentCals = todayNutrition?.calories || 0;

  let totalSets = 0;
  let completedSets = 0;
  if (todayWorkout) {
    todayWorkout.exercises.forEach(ex => {
      totalSets += ex.sets.length;
      completedSets += ex.sets.filter(s => s.completed).length;
    });
  }

  return (
    <div className="space-y-3 pb-24 text-left animate-fadeIn font-mono">
      {/* Rota Shift Hero Card - Monochrome OLED */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {dayInfo.isOvertime ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-black border border-white">
                  OVERTIME 12H
                </span>
              ) : dayInfo.isShiftDay ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium border border-neutral-700 bg-neutral-900 text-neutral-200 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-neutral-400" />
                  12H SHIFT
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-black flex items-center gap-1">
                  <Moon className="w-3 h-3 text-black" />
                  OFF-DAY
                </span>
              )}

              <span className="text-[10px] text-neutral-400">
                {dayInfo.dayOfWeek} (Wk {dayInfo.weekNumberInCycle})
              </span>

              <ContextualHelp
                title="2-Week Rolling Rota"
                content="Your 14-day shift pattern loops infinitely. High-volume heavy workouts are automatically allocated to off-days, while shift days trigger spinal decompression and recovery."
              />
            </div>

            <h2 className="mt-2 text-base font-bold text-white tracking-tight">
              {dayInfo.isShiftDay ? '12h Shift CNS Protection' : 'Aesthetic Hypertrophy Day'}
            </h2>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              {dayInfo.isShiftDay 
                ? 'Spinal decompression and central nervous system recovery between 12h shifts.' 
                : `Goal: ${goalParams.label}. High-volume off-day targeted at V-taper & quad sweep.`}
            </p>
          </div>

          <button
            onClick={onOpenFatigueModal}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-neutral-900 border border-neutral-750 hover:border-neutral-500 transition-all active:scale-95 shrink-0"
            title="Update CNS Fatigue"
          >
            <Activity className="w-3.5 h-3.5 text-neutral-300 mb-0.5" />
            <span className="text-[9px] text-neutral-500 uppercase">Fatigue</span>
            <span className="text-xs font-bold text-white">{currentFatigue}<span className="text-[10px] text-neutral-500">/10</span></span>
          </button>
        </div>

        {/* 14-Day Cycle Strip */}
        <div className="mt-3.5 pt-3 border-t border-neutral-850">
          <div className="flex justify-between items-center text-[10px] font-semibold text-neutral-400 mb-1.5">
            <span>2-WEEK ROLLING ROTA</span>
            <span className="text-white">DAY {dayInfo.cycleDayIndex + 1} OF 14</span>
          </div>
          <div className="grid grid-cols-14 gap-0.5 h-1.5">
            {Array.from({ length: 14 }).map((_, dayIdx) => {
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
                  title={`Day ${dayIdx + 1} of 14-day loop`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Physics Engine & Optimal BMI Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 shadow-sm text-left">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">BMI & Optimal Physics</span>
            <ContextualHelp
              title="Optimal BMI Engine"
              content="Calculates body mass index from your height and gender. Displays the optimal athletic BMI corridor (Males: 21.5-24.5, Females: 20.0-23.5) and target weight boundaries."
            />
          </div>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-750 text-neutral-300 uppercase">
            {gender} • {heightCm} CM
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
            <div className="text-[9px] text-neutral-500 uppercase">Current BMI</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {bmiReport.currentBmi} <span className="text-[9px] text-neutral-500 font-normal">kg/m²</span>
            </div>
            <div className="text-[9px] text-neutral-400 mt-0.5 truncate">{bmiReport.classification}</div>
          </div>

          <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
            <div className="text-[9px] text-neutral-500 uppercase">Optimal Weight</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {bmiReport.optimalWeightMinKg}–{bmiReport.optimalWeightMaxKg} <span className="text-[9px] text-neutral-500 font-normal">kg</span>
            </div>
            <div className="text-[9px] text-neutral-400 mt-0.5 truncate">BMI: {bmiReport.optimalBmiMin}–{bmiReport.optimalBmiMax}</div>
          </div>
        </div>
      </div>

      {/* Timeline Projection & Discipline Warning Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3.5 shadow-sm text-left space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-white" />
            <span className="text-[10px] font-bold text-white uppercase">Goal Timeline Projection</span>
            <ContextualHelp
              title="Timeline Projection Engine"
              content="Calculates timelines using biological rates of 0.5kg/week (Average) and 1.0kg/week (Very Optimal). Optimal progress requires strict adherence to macros and training."
            />
          </div>
          <span className="text-[9px] text-neutral-400">
            {currentWeight}kg &rarr; {desiredWeight}kg
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-left">
          {/* Average Timeline */}
          <div className="p-2.5 rounded bg-neutral-900 border border-neutral-800">
            <div className="text-[9px] text-neutral-500 uppercase font-bold">Average Timeline</div>
            <div className="text-sm font-black text-white mt-0.5">
              {timeline.mode === 'maintenance' ? '0 Weeks' : `~${timeline.averageWeeks} Wks`}
            </div>
            <div className="text-[9px] text-neutral-400 mt-0.5">
              {timeline.averageRateKgPerWeek} kg / wk
            </div>
            <div className="text-[8px] text-neutral-500 mt-1 pt-1 border-t border-neutral-800 truncate">
              {timeline.averageTargetDate}
            </div>
          </div>

          {/* Very Optimal Timeline */}
          <div className="p-2.5 rounded bg-neutral-900 border border-neutral-750">
            <div className="text-[9px] text-white uppercase font-bold flex items-center justify-between">
              <span>Very Optimal</span>
              <span className="text-[8px] bg-white text-black px-1 rounded">FAST</span>
            </div>
            <div className="text-sm font-black text-white mt-0.5">
              {timeline.mode === 'maintenance' ? '0 Weeks' : `~${timeline.optimalWeeks} Wks`}
            </div>
            <div className="text-[9px] text-neutral-300 mt-0.5">
              {timeline.optimalRateKgPerWeek} kg / wk
            </div>
            <div className="text-[8px] text-neutral-400 mt-1 pt-1 border-t border-neutral-800 truncate">
              {timeline.optimalTargetDate}
            </div>
          </div>
        </div>

        {/* PROMINENT DISCIPLINE WARNING BOX */}
        <div className="p-2.5 rounded-lg bg-black border border-neutral-700 text-left space-y-1">
          <div className="flex items-center gap-1.5 text-white font-bold text-[10px] uppercase">
            <AlertTriangle className="w-3.5 h-3.5 text-white shrink-0" />
            <span>DISCIPLINE WARNING</span>
          </div>
          <p className="text-[10px] text-neutral-300 font-sans leading-relaxed">
            WARNING: The optimal timeline is strictly theoretical and is only achievable with absolute discipline, zero missed sessions, and perfect macro adherence.
          </p>
        </div>
      </div>

      {/* Today's Prescribed Workout Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white">
              <Dumbbell className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-semibold text-neutral-400">
                  {todayWorkout?.category || dayInfo.recommendedWorkoutCategory} PROGRAM
                </span>
                <ContextualHelp
                  title="Prescribed Workout"
                  content="This workout was tailored for your goal and current shift fatigue level. Compound reps and rest intervals are auto-regulated."
                />
              </div>
              <h3 className="text-xs font-bold text-white">
                {todayWorkout?.title || dayInfo.workoutTitle}
              </h3>
            </div>
          </div>

          <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
            {todayWorkout?.completed ? 'DONE' : `${todayWorkout?.targetDurationMin || 50} MIN`}
          </span>
        </div>

        {todayWorkout?.autoAdjustedReason && (
          <div className="mt-2.5 p-2 rounded border border-neutral-800 bg-neutral-900 text-[11px] text-neutral-300">
            {todayWorkout.autoAdjustedReason}
          </div>
        )}

        {/* Exercises Preview */}
        <div className="mt-3 divide-y divide-neutral-850 bg-neutral-900 rounded-lg p-2 border border-neutral-800">
          {(todayWorkout?.exercises || []).slice(0, 3).map((ex, idx) => (
            <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-neutral-800 text-neutral-300 flex items-center justify-center text-[10px]">
                  {idx + 1}
                </span>
                <span className="text-neutral-200 text-[11px] truncate max-w-[190px]">
                  {ex.selectedAlternative || ex.exerciseName}
                </span>
              </div>
              <span className="text-neutral-500 text-[10px]">
                {ex.sets.filter(s => s.completed).length}/{ex.sets.length} sets
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onNavigateTab('workout')}
          className="mt-3 w-full py-2.5 px-4 rounded-lg bg-white text-black font-bold text-xs tracking-tight transition-all active:scale-98 flex items-center justify-center gap-1.5 hover:bg-neutral-200"
        >
          <span>{todayWorkout?.completed ? 'VIEW WORKOUT LOG' : completedSets > 0 ? 'RESUME WORKOUT' : 'START WORKOUT'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Morning Weight Prompt Card (Fully Editable Standard Input) */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm text-left">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white uppercase">Morning Weigh-In</h3>
                <ContextualHelp
                  title="75-78kg Recomp Target"
                  content="Log your weight once upon waking. The system computes a 7-day moving average to filter fluid retention and maintain your target corridor."
                />
              </div>
              <p className="text-[10px] text-neutral-400">Target: {desiredWeight} kg</p>
            </div>
          </div>
          {todayWeight?.weightKg && (
            <span className="text-[10px] font-bold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
              {todayWeight.weightKg} kg logged
            </span>
          )}
        </div>

        <form onSubmit={handleQuickWeightSubmit} className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              step="any"
              value={quickWeight}
              onChange={(e) => setQuickWeight(e.target.value)}
              placeholder="e.g. 76.4"
              className="w-full bg-neutral-900 border border-neutral-750 rounded px-3 py-1.5 text-white text-xs focus:outline-none focus:border-white transition-colors"
            />
            <span className="absolute right-3 top-1.5 text-xs text-neutral-500">kg</span>
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 rounded bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-white font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            {weightSaved ? <Check className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-white" />}
            <span>{weightSaved ? 'SAVED' : 'LOG'}</span>
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400 pt-1">
          <span>7-Day Moving Avg: <strong className="text-white">{todayWeight?.movingAverage7Day || '76.4'} kg</strong></span>
          <button 
            onClick={() => onNavigateTab('analytics')}
            className="text-neutral-300 hover:text-white flex items-center gap-0.5 uppercase font-semibold"
          >
            Trend Chart <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Manual Daily Steps Input Card (iOS PWA HealthKit Bypass) */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm text-left">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white">
              <Footprints className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white uppercase">Total Daily Steps</h3>
                <ContextualHelp
                  title="Manual Steps Override"
                  content="Since iOS PWAs cannot natively pull Apple HealthKit steps, enter your daily total steps here. Active steps above 3,500 automatically increase your daily calorie & carb budget."
                />
              </div>
              <p className="text-[10px] text-neutral-400">Pedometer manual override</p>
            </div>
          </div>

          {currentStepCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
              {currentStepCount.toLocaleString()} steps
            </span>
          )}
        </div>

        <form onSubmit={handleStepsSubmit} className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              step="100"
              min="0"
              max="100000"
              value={stepInputStr}
              onChange={(e) => setStepInputStr(e.target.value)}
              placeholder="e.g. 8500"
              className="w-full bg-neutral-900 border border-neutral-750 rounded px-3 py-1.5 text-white text-xs font-bold focus:outline-none focus:border-white transition-colors"
            />
            <span className="absolute right-3 top-1.5 text-xs text-neutral-500">steps</span>
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 rounded bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 text-white font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
          >
            {stepSavedNotice ? <Check className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-white" />}
            <span>{stepSavedNotice ? 'SAVED' : 'LOG'}</span>
          </button>
        </form>

        {/* Quick Increment Pill Buttons */}
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] text-neutral-500 uppercase font-bold mr-1">Quick Add:</span>
          <button
            type="button"
            onClick={() => handleAddStepIncrement(1000)}
            className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[10px] font-bold border border-neutral-800 active:scale-95"
          >
            +1,000
          </button>
          <button
            type="button"
            onClick={() => handleAddStepIncrement(2500)}
            className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[10px] font-bold border border-neutral-800 active:scale-95"
          >
            +2,500
          </button>
          <button
            type="button"
            onClick={() => handleAddStepIncrement(5000)}
            className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-850 text-white text-[10px] font-bold border border-neutral-800 active:scale-95"
          >
            +5,000
          </button>
          {currentStepCount > 0 && (
            <button
              type="button"
              onClick={handleResetSteps}
              className="ml-auto text-[10px] text-neutral-500 hover:text-neutral-300 font-mono"
            >
              Reset
            </button>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400 pt-1">
          <span>Active Step Burn (&gt;3.5k): <strong className="text-white">+{stepCalc.activeStepCalories} kcal</strong></span>
          <button 
            onClick={() => onNavigateTab('activity')}
            className="text-neutral-300 hover:text-white flex items-center gap-0.5 uppercase font-semibold"
          >
            Cardio Tab <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Dynamic Caloric Expenditure & Macro Adjustment Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm text-left space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold text-white uppercase">Dynamic Calorie Expenditure</h3>
            <ContextualHelp
              title="Dynamic Calorie Engine"
              content="Your base shift/off-day calorie target is dynamically updated with actual energy expended from your steps and cardio workouts."
            />
          </div>

          <span className="text-[10px] font-bold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-750">
            +{totalActiveBurn} kcal active burn
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
            <span className="text-[9px] text-neutral-500 uppercase font-bold block">Base Target</span>
            <span className="text-xs font-bold text-neutral-300 mt-0.5 block">{baseMacros.calories} kcal</span>
          </div>

          <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
            <span className="text-[9px] text-neutral-500 uppercase font-bold block">Steps + Cardio</span>
            <span className="text-xs font-bold text-white mt-0.5 block">+{totalActiveBurn} kcal</span>
          </div>

          <div className="p-2 rounded bg-neutral-900 border border-neutral-750">
            <span className="text-[9px] text-white uppercase font-bold block">Dynamic Target</span>
            <span className="text-xs font-black text-white mt-0.5 block">{effectiveTargetCals} kcal</span>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-400">
          <span>Carbs adjusted: <strong className="text-white">{effectiveTargetCarbs}g (+{dynamicMacros.extraCarbsGrams}g)</strong></span>
          <button
            onClick={() => onNavigateTab('activity')}
            className="text-neutral-300 hover:text-white flex items-center gap-1 font-semibold"
          >
            <span>Log Cardio</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Nutrition & Hydration Dual Grid */}
      <div className="grid grid-cols-2 gap-2 text-left">
        <div 
          onClick={() => onNavigateTab('nutrition')}
          className="rounded-xl bg-neutral-950 border border-neutral-800 p-3 cursor-pointer hover:border-neutral-700 transition-all active:scale-98"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-white">Protein</span>
            <span className="text-[10px] font-bold text-neutral-300">{proteinPercent}%</span>
          </div>

          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white">{currentProtein}</span>
              <span className="text-[10px] text-neutral-500">/ {effectiveTargetProtein}g</span>
            </div>
            <div className="mt-1 w-full bg-neutral-850 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${proteinPercent}%` }}
              />
            </div>
            <p className="mt-1 text-[9px] text-neutral-500">
              {currentCals} / {effectiveTargetCals} kcal
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-white">Water</span>
            <span className="text-[10px] font-bold text-neutral-300">{waterPercent}%</span>
          </div>

          <div className="mt-2">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-white">{(currentWater / 1000).toFixed(1)}</span>
              <span className="text-[10px] text-neutral-500">/ {(targetWater / 1000).toFixed(1)}L</span>
            </div>
            <div className="mt-1 w-full bg-neutral-850 rounded-full h-1 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
            <div className="mt-2 flex gap-1">
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
