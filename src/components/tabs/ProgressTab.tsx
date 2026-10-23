import React, { useState } from 'react';
import { 
  UserProfile, 
  BodyweightEntry, 
  NutritionLog, 
  WorkoutSession, 
  ShiftDay, 
  WeeklyAnalyticsReport,
  ActivityEntry,
  DailyStepsEntry,
  ActivityType
} from '../../types';
import { AnalyticsEngine } from '../../services/analyticsEngine';
import { PhysicsEngine } from '../../services/physicsEngine';
import { ACTIVITY_MET_TABLE, ActivityEngine, ActivityMeta } from '../../services/activityEngine';
import { 
  Scale, 
  Flame, 
  Dumbbell, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Footprints,
  Plus,
  Trash2,
  Database,
  RotateCcw,
  Waves,
  Bike,
  Zap,
  Activity as ActivityIcon,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';

interface ProgressTabProps {
  todayStr: string;
  profile: UserProfile;
  weights: Record<string, BodyweightEntry>;
  nutritions: Record<string, NutritionLog>;
  workouts: Record<string, WorkoutSession>;
  shifts: Record<string, ShiftDay>;
  fatigueLogs: Record<string, number>;
  activities: ActivityEntry[];
  dailySteps: DailyStepsEntry | null;
  todayWeight: BodyweightEntry | null;
  onSaveWeight: (entry: BodyweightEntry) => void;
  onSaveActivity: (activity: ActivityEntry) => void;
  onDeleteActivity: (id: string) => void;
  onClearActivities: () => void;
  onSaveSteps: (steps: DailyStepsEntry) => void;
  onExportBackup: () => void;
  onOpenGuide: () => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  todayStr,
  profile,
  weights,
  nutritions,
  workouts,
  shifts,
  fatigueLogs,
  activities,
  dailySteps,
  todayWeight,
  onSaveWeight,
  onSaveActivity,
  onDeleteActivity,
  onClearActivities,
  onSaveSteps,
  onExportBackup,
  onOpenGuide,
}) => {
  // Sub-navigation: Progressive disclosure
  const [activeSection, setActiveSection] = useState<'trends' | 'cardio' | 'settings'>('trends');

  // Input states - Completely empty by default with placeholders
  const [newWeightInput, setNewWeightInput] = useState<string>('');
  const [weightSavedNotice, setWeightSavedNotice] = useState<boolean>(false);

  // Cardio Form states (empty by default)
  const [selectedType, setSelectedType] = useState<ActivityType>('swimming_moderate');
  const [durationStr, setDurationStr] = useState<string>('');
  const [distanceStr, setDistanceStr] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Step Input state (empty by default)
  const currentStepCount = dailySteps?.stepCount || 0;
  const [stepInputStr, setStepInputStr] = useState<string>('');
  const [stepSavedNotice, setStepSavedNotice] = useState<boolean>(false);

  const currentEffectiveWeight = todayWeight?.weightKg || profile.currentWeightKg || 76.4;
  const desiredWeight = profile.desiredWeightKg || profile.targetWeightMinKg || 76.5;
  const gender = profile.gender || 'male';
  const heightCm = profile.heightCm || 178;

  // Analytics & Physics Reports
  const computedWeights = AnalyticsEngine.compute7DayMovingAverages(weights);
  const timeline = PhysicsEngine.getTimelineProjection(currentEffectiveWeight, desiredWeight, gender);
  const bmiReport = PhysicsEngine.getBmiReport(currentEffectiveWeight, heightCm, gender);
  const report: WeeklyAnalyticsReport = AnalyticsEngine.generateWeeklyReport(
    todayStr,
    profile,
    computedWeights,
    nutritions,
    workouts,
    shifts,
    fatigueLogs
  );

  // Cardio & Steps MET Calculations
  const currentMeta: ActivityMeta = ACTIVITY_MET_TABLE[selectedType] || ACTIVITY_MET_TABLE.swimming_moderate;
  const parsedDuration = parseInt(durationStr, 10) || 0;
  const parsedDistance = parseFloat(distanceStr) || 0;
  const liveBurnEstimate = ActivityEngine.calculateMetCalories(
    currentMeta.met,
    currentEffectiveWeight,
    parsedDuration
  );

  const stepCalc = ActivityEngine.calculateStepCalories(currentStepCount, currentEffectiveWeight);
  const totalCardioBurn = activities.reduce((acc, a) => acc + (a.caloriesBurned || 0), 0);
  const totalCardioMinutes = activities.reduce((acc, a) => acc + (a.durationMinutes || 0), 0);
  const totalActiveBurn = totalCardioBurn + stepCalc.activeStepCalories;

  // Handlers
  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeightInput);
    if (!isNaN(val) && val >= 30 && val <= 250) {
      soundManager.playTap();
      onSaveWeight({
        date: todayStr,
        weightKg: val,
      });
      setNewWeightInput('');
      setWeightSavedNotice(true);
      setTimeout(() => setWeightSavedNotice(false), 2000);
    }
  };

  const handleLogCardioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedDuration <= 0) return;

    soundManager.playTap();
    const newActivity: ActivityEntry = {
      id: `act_${Date.now()}`,
      date: todayStr,
      activityType: selectedType,
      title: currentMeta.label,
      category: currentMeta.category,
      met: currentMeta.met,
      durationMinutes: parsedDuration,
      caloriesBurned: liveBurnEstimate,
      distanceKm: currentMeta.supportsDistance && parsedDistance > 0 ? parsedDistance : undefined,
      timeLogged: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };

    onSaveActivity(newActivity);
    setDurationStr('');
    setDistanceStr('');
  };

  const handleSaveStepsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(stepInputStr, 10);
    const validCount = isNaN(count) || count < 0 ? 0 : count;

    soundManager.playTap();
    const calc = ActivityEngine.calculateStepCalories(validCount, currentEffectiveWeight);
    const updated: DailyStepsEntry = {
      date: todayStr,
      stepCount: validCount,
      estimatedCaloriesBurned: calc.totalStepCalories,
      activeCaloriesBurned: calc.activeStepCalories,
      lastUpdated: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };

    onSaveSteps(updated);
    setStepInputStr('');
    setStepSavedNotice(true);
    setTimeout(() => setStepSavedNotice(false), 2000);
  };

  const handleAddStepIncrement = (increment: number) => {
    soundManager.playTap();
    const newCount = Math.max(0, currentStepCount + increment);
    const calc = ActivityEngine.calculateStepCalories(newCount, currentEffectiveWeight);
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

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'Running':
      case 'Walking':
        return <Footprints className="w-4 h-4 text-white" />;
      case 'Swimming':
        return <Waves className="w-4 h-4 text-white" />;
      case 'Cycling':
        return <Bike className="w-4 h-4 text-white" />;
      case 'HIIT':
        return <Zap className="w-4 h-4 text-white" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-white" />;
    }
  };

  // Sorted weight entries for SVG trend line
  const sortedDates = Object.keys(computedWeights).sort();
  const recent7Dates = sortedDates.slice(-7);
  const recent7Weights = recent7Dates.map(d => computedWeights[d]);

  return (
    <div className="space-y-4 pb-28 text-left animate-fadeIn font-sans">
      {/* Sub-Section Segmented Control (Progressive Disclosure) */}
      <div className="bg-neutral-950 border border-neutral-800 p-1.5 rounded-2xl grid grid-cols-3 gap-1 shadow-sm">
        <button
          onClick={() => setActiveSection('trends')}
          className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
            activeSection === 'trends'
              ? 'bg-white text-black shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Weekly Trends
        </button>
        <button
          onClick={() => setActiveSection('cardio')}
          className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
            activeSection === 'cardio'
              ? 'bg-white text-black shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Cardio & Steps
        </button>
        <button
          onClick={() => setActiveSection('settings')}
          className={`py-2 px-1 text-xs font-bold rounded-xl transition-all ${
            activeSection === 'settings'
              ? 'bg-white text-black shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Data & Backup
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: WEEKLY TRENDS & BODYWEIGHT ANALYTICS */}
      {/* ========================================================================= */}
      {activeSection === 'trends' && (
        <div className="space-y-4 animate-fadeIn">
          {/* 7-Day Moving Average & Weight Chart */}
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block">
                  Aesthetic Recomposition
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
                  Weight Progression
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Target Corridor: <strong className="text-white font-mono">75.0 – 78.0 kg</strong>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-750 text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">7-Day Avg</span>
                <span className="text-base font-black font-mono text-white">
                  {report.averageWeightKg} <span className="text-xs text-neutral-500">kg</span>
                </span>
              </div>
            </div>

            {/* SVG Trend Graph (Monochrome Grayscale) */}
            {recent7Weights.length > 1 ? (
              <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-850">
                <div className="h-28 w-full flex items-end justify-between gap-1 pt-4 pb-2 px-2">
                  {recent7Weights.map((w, idx) => {
                    const minW = 74.0;
                    const maxW = 79.0;
                    const pct = Math.max(10, Math.min(100, ((w.weightKg - minW) / (maxW - minW)) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[9px] font-mono text-neutral-400">{w.weightKg}</span>
                        <div 
                          className="w-full max-w-[24px] bg-white rounded-t transition-all duration-300"
                          style={{ height: `${pct}%` }}
                        />
                        <span className="text-[9px] font-mono text-neutral-500">D{idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400">
                Log your weight daily to generate your 7-day moving average trend curve.
              </div>
            )}

            {/* Log Weight Form (Empty with Placeholder) */}
            <form onSubmit={handleWeightSubmit} className="pt-2 flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                value={newWeightInput}
                onChange={(e) => setNewWeightInput(e.target.value)}
                placeholder="Enter weight in kg"
                className="flex-1 bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2.5 text-xs font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all active:scale-95 shrink-0"
              >
                {weightSavedNotice ? 'Saved ✓' : 'Save Weight'}
              </button>
            </form>
          </div>

          {/* Goal Timeline Projection & Discipline Warning */}
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Timeline Projection Engine
                </h4>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                {currentEffectiveWeight}kg &rarr; {desiredWeight}kg
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase font-bold block">Average Timeline</span>
                <span className="text-sm font-black text-white font-mono mt-0.5 block">
                  {timeline.mode === 'maintenance' ? '0 Weeks' : `~${timeline.averageWeeks} Wks`}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono block">
                  {timeline.averageRateKgPerWeek} kg/wk
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-750">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white uppercase font-bold">Optimal Rate</span>
                  <span className="text-[8px] bg-white text-black font-bold px-1 rounded">FAST</span>
                </div>
                <span className="text-sm font-black text-white font-mono mt-0.5 block">
                  {timeline.mode === 'maintenance' ? '0 Weeks' : `~${timeline.optimalWeeks} Wks`}
                </span>
                <span className="text-[10px] text-neutral-300 font-mono block">
                  {timeline.optimalRateKgPerWeek} kg/wk
                </span>
              </div>
            </div>

            {/* Discipline Warning */}
            <div className="p-3 rounded-xl bg-black border border-neutral-750 space-y-1">
              <div className="flex items-center gap-1.5 text-white font-bold text-[10px] uppercase">
                <AlertTriangle className="w-3.5 h-3.5 text-white" />
                <span>Discipline Warning</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                WARNING: The optimal timeline is strictly theoretical and is only achievable with absolute discipline, zero missed sessions, and perfect macro adherence.
              </p>
            </div>
          </div>

          {/* Actionable Weekly Insights */}
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Actionable Weekly Review
              </h4>
            </div>

            <div className="space-y-2">
              {report.actionableInsights.map((insight, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-neutral-900 border border-neutral-850 text-xs text-neutral-300 leading-relaxed">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CARDIO TRACKING & DAILY STEPS (MET ENGINE) */}
      {/* ========================================================================= */}
      {activeSection === 'cardio' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Manual Daily Steps (iOS HealthKit Bypass) */}
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white">
                  <Footprints className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Total Daily Steps
                  </h4>
                  <p className="text-[11px] text-neutral-400">Manual pedometer log for iOS Safari PWA</p>
                </div>
              </div>

              {currentStepCount > 0 && (
                <span className="text-xs font-bold text-white font-mono bg-neutral-900 px-2.5 py-1 rounded-xl border border-neutral-750">
                  {currentStepCount.toLocaleString()} steps
                </span>
              )}
            </div>

            <form onSubmit={handleSaveStepsSubmit} className="flex items-center gap-2 mt-2">
              <input
                type="number"
                step="100"
                min="0"
                max="100000"
                value={stepInputStr}
                onChange={(e) => setStepInputStr(e.target.value)}
                placeholder="Enter step count (e.g. 8500)"
                className="flex-1 bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2.5 text-xs font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all active:scale-95 shrink-0"
              >
                {stepSavedNotice ? 'Saved ✓' : 'Save Steps'}
              </button>
            </form>

            {/* Quick Increment Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-neutral-500 uppercase font-bold mr-1">Quick Add:</span>
              <button
                type="button"
                onClick={() => handleAddStepIncrement(1000)}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-bold border border-neutral-800"
              >
                +1,000
              </button>
              <button
                type="button"
                onClick={() => handleAddStepIncrement(2500)}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-bold border border-neutral-800"
              >
                +2,500
              </button>
              <button
                type="button"
                onClick={() => handleAddStepIncrement(5000)}
                className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-bold border border-neutral-800"
              >
                +5,000
              </button>
            </div>

            <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span>Total Steps Burn: <strong className="text-white">{stepCalc.totalStepCalories} kcal</strong></span>
              <span>Active Burn (&gt;3.5k): <strong className="text-white">+{stepCalc.activeStepCalories} kcal</strong></span>
            </div>
          </div>

          {/* Log Cardio Movement Form (MET Engine) */}
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-white" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Log Cardio Movement
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-400">
                MET {currentMeta.met.toFixed(1)}
              </span>
            </div>

            <form onSubmit={handleLogCardioSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  Movement Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    const t = e.target.value as ActivityType;
                    setSelectedType(t);
                    setDurationStr('');
                  }}
                  className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-white"
                >
                  {Object.values(ACTIVITY_MET_TABLE).map((item) => (
                    <option key={item.type} value={item.type}>
                      {item.label} (MET {item.met})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="360"
                    value={durationStr}
                    onChange={(e) => setDurationStr(e.target.value)}
                    placeholder="Minutes (e.g. 30)"
                    className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-white text-center"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={distanceStr}
                    onChange={(e) => setDistanceStr(e.target.value)}
                    placeholder="km (optional)"
                    disabled={!currentMeta.supportsDistance}
                    className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-neutral-500 disabled:opacity-30 focus:outline-none focus:border-white text-center"
                  />
                </div>
              </div>

              {/* Calculated Calories Live Preview */}
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between font-mono">
                <span className="text-xs text-neutral-400">
                  {currentMeta.met} MET × {currentEffectiveWeight}kg × ({parsedDuration}/60h)
                </span>
                <span className="text-sm font-bold text-white">
                  ~{liveBurnEstimate} kcal
                </span>
              </div>

              <button
                type="submit"
                disabled={parsedDuration <= 0}
                className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Log Cardio Session</span>
              </button>
            </form>
          </div>

          {/* Today's Logged Cardio Sessions */}
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Today's Cardio Diary
              </h4>
              {activities.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-mono"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Start Fresh</span>
                </button>
              )}
            </div>

            {showClearConfirm && (
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-700 space-y-2 animate-fadeIn font-sans">
                <p className="text-xs text-white font-bold">Clear all cardio logged today?</p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-1 rounded-lg border border-neutral-750 text-xs text-neutral-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onClearActivities();
                      setShowClearConfirm(false);
                    }}
                    className="px-3 py-1 rounded-lg bg-white text-black font-bold text-xs"
                  >
                    Confirm Clear
                  </button>
                </div>
              </div>
            )}

            {activities.length === 0 ? (
              <div className="p-6 text-center text-neutral-500 font-sans border border-dashed border-neutral-800 rounded-xl space-y-2">
                <Flame className="w-8 h-8 mx-auto text-neutral-700" />
                <p className="text-xs font-bold text-neutral-300">No Cardio Logged Today</p>
                <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                  Select an activity above (Swimming, Running, Incline Treadmill) to calculate MET burn.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-850">
                {activities.map((act) => (
                  <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0">
                        {getActivityIcon(act.category)}
                      </div>
                      <div>
                        <span className="text-white font-bold block">{act.title}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {act.durationMinutes} min {act.distanceKm ? `• ${act.distanceKm} km` : ''} • {act.timeLogged}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono font-bold text-white">
                        +{act.caloriesBurned} kcal
                      </span>
                      <button
                        onClick={() => onDeleteActivity(act.id)}
                        className="text-neutral-600 hover:text-white p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: DATA BACKUP & SETTINGS */}
      {/* ========================================================================= */}
      {activeSection === 'settings' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Offline Database Export */}
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-white" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Offline Database Management
              </h4>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              All your workout logs, 14-day shift schedules, nutrition items, and bodyweight history are stored locally in your device's IndexedDB. Download a complete backup anytime.
            </p>

            <button
              onClick={onExportBackup}
              className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>Download Offline Backup (JSON)</span>
            </button>
          </div>

          {/* Profile Metrics Summary */}
          <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-3 font-mono">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
              User Profile Metrics
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase block">Gender & Height</span>
                <span className="text-white font-bold block mt-0.5">{profile.gender} • {profile.heightCm} cm</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] text-neutral-500 uppercase block">Target Corridor</span>
                <span className="text-white font-bold block mt-0.5">{profile.targetWeightMinKg}–{profile.targetWeightMaxKg} kg</span>
              </div>
            </div>

            <button
              onClick={onOpenGuide}
              className="w-full py-3 rounded-xl border border-neutral-750 bg-neutral-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-neutral-850 transition-all flex items-center justify-center gap-2 font-sans"
            >
              <Info className="w-4 h-4" />
              <span>Open Profile Setup Guide</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
