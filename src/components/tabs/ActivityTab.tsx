import React, { useState } from 'react';
import { 
  UserProfile, 
  ActivityEntry, 
  ActivityType, 
  DailyStepsEntry, 
  BodyweightEntry 
} from '../../types';
import { 
  ACTIVITY_MET_TABLE, 
  ActivityEngine, 
  ActivityMeta 
} from '../../services/activityEngine';
import { 
  Flame, 
  Plus, 
  Trash2, 
  Footprints, 
  RotateCcw, 
  Check, 
  Clock, 
  TrendingUp, 
  Waves, 
  Bike, 
  Zap, 
  Activity, 
  AlertCircle 
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';
import { ContextualHelp } from '../ContextualHelp';

interface ActivityTabProps {
  todayStr: string;
  profile: UserProfile;
  todayWeight: BodyweightEntry | null;
  activities: ActivityEntry[];
  dailySteps: DailyStepsEntry | null;
  onSaveActivity: (activity: ActivityEntry) => void;
  onDeleteActivity: (id: string) => void;
  onClearActivities: () => void;
  onSaveSteps: (steps: DailyStepsEntry) => void;
}

export const ActivityTab: React.FC<ActivityTabProps> = ({
  todayStr,
  profile,
  todayWeight,
  activities,
  dailySteps,
  onSaveActivity,
  onDeleteActivity,
  onClearActivities,
  onSaveSteps,
}) => {
  // Current effective body weight for MET formula
  const currentWeightKg = todayWeight?.weightKg || profile.currentWeightKg || 76.4;

  // New Activity Form State
  const [selectedType, setSelectedType] = useState<ActivityType>('swimming_moderate');
  const [durationStr, setDurationStr] = useState<string>('30');
  const [distanceStr, setDistanceStr] = useState<string>('');
  const [activityNotes, setActivityNotes] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Steps Input State - string for backspace/deletion safety
  const currentStepCount = dailySteps?.stepCount || 0;
  const [stepInputStr, setStepInputStr] = useState<string>(
    currentStepCount > 0 ? String(currentStepCount) : ''
  );
  const [stepSavedNotice, setStepSavedNotice] = useState<boolean>(false);

  const currentMeta: ActivityMeta = ACTIVITY_MET_TABLE[selectedType] || ACTIVITY_MET_TABLE.swimming_moderate;
  const parsedDuration = parseInt(durationStr, 10) || 0;
  const parsedDistance = parseFloat(distanceStr) || 0;

  // Real-time live MET calculation
  const liveBurnEstimate = ActivityEngine.calculateMetCalories(
    currentMeta.met,
    currentWeightKg,
    parsedDuration
  );

  // Daily totals
  const totalCardioMinutes = activities.reduce((acc, a) => acc + (a.durationMinutes || 0), 0);
  const totalCardioBurn = activities.reduce((acc, a) => acc + (a.caloriesBurned || 0), 0);
  
  const stepCalc = ActivityEngine.calculateStepCalories(currentStepCount, currentWeightKg);
  const totalActiveBurn = totalCardioBurn + stepCalc.activeStepCalories;

  const dynamicMacroImpact = ActivityEngine.calculateDynamicMacros(
    profile.offDayMacros, // base reference
    totalActiveBurn
  );

  // Handlers
  const handleLogActivity = (e: React.FormEvent) => {
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
      notes: activityNotes.trim() ? activityNotes.trim() : undefined,
    };

    onSaveActivity(newActivity);
    setActivityNotes('');
    setDistanceStr('');
  };

  const handleQuickDuration = (min: number) => {
    soundManager.playTap();
    setDurationStr(String(min));
  };

  const handleSaveStepsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(stepInputStr, 10);
    const validCount = isNaN(count) || count < 0 ? 0 : count;

    soundManager.playTap();
    const calc = ActivityEngine.calculateStepCalories(validCount, currentWeightKg);
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
    const calc = ActivityEngine.calculateStepCalories(newCount, currentWeightKg);
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

  const getActivityCategoryIcon = (category: string) => {
    switch (category) {
      case 'Running':
      case 'Walking':
        return <Footprints className="w-4 h-4 text-white" />;
      case 'Swimming':
        return <Waves className="w-4 h-4 text-white" />;
      case 'Cycling':
        return <Bike className="w-4 h-4 text-white" />;
      case 'Treadmill':
        return <TrendingUp className="w-4 h-4 text-white" />;
      case 'HIIT':
        return <Zap className="w-4 h-4 text-white" />;
      default:
        return <Activity className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="space-y-3.5 pb-28 text-left animate-fadeIn font-mono">
      {/* Header Banner */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 uppercase tracking-wider">
                MET Physics Engine
              </span>
              <ContextualHelp
                title="MET & Calorie Expenditure"
                content="The Metabolic Equivalent of Task (MET) formula dynamically computes energy expenditure against your current bodyweight: Calories = MET × Weight(kg) × (Duration/60). Steps & cardio expand your daily calorie budget."
              />
            </div>
            <h2 className="text-base font-bold text-white mt-1 uppercase tracking-tight">
              Cardio & Activity Tracker
            </h2>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              Targeted conditioning: swimming, incline walks, and manual step tracking.
            </p>
          </div>

          <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-right shrink-0">
            <span className="text-[9px] text-neutral-500 uppercase font-semibold">Weight Anchor</span>
            <div className="text-xs font-bold text-white mt-0.5">
              {currentWeightKg} <span className="text-[9px] text-neutral-500">kg</span>
            </div>
          </div>
        </div>

        {/* Daily Summary Cards */}
        <div className="mt-3.5 pt-3 border-t border-neutral-850 grid grid-cols-3 gap-2 text-center">
          <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
            <div className="text-[9px] text-neutral-500 uppercase font-bold">Cardio Time</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {totalCardioMinutes} <span className="text-[9px] text-neutral-500">min</span>
            </div>
          </div>

          <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
            <div className="text-[9px] text-neutral-500 uppercase font-bold">Cardio Burn</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {totalCardioBurn} <span className="text-[9px] text-neutral-500">kcal</span>
            </div>
          </div>

          <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
            <div className="text-[9px] text-neutral-500 uppercase font-bold">Active Steps</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {stepCalc.activeStepCalories} <span className="text-[9px] text-neutral-500">kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Daily Steps Input (iOS PWA HealthKit Bypass) */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white">
              <Footprints className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white uppercase">Daily Step Count (Manual Override)</h3>
                <ContextualHelp
                  title="iOS PWA Step Logging"
                  content="Safari PWAs cannot query Apple HealthKit in the background. Enter your daily pedometer reading here to dynamically adjust your calorie expenditure and carbohydrate budget."
                />
              </div>
              <p className="text-[10px] text-neutral-400">Baseline NEAT: 3,500 steps (excess burns active kcal)</p>
            </div>
          </div>

          {currentStepCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">
              {currentStepCount.toLocaleString()} steps
            </span>
          )}
        </div>

        <form onSubmit={handleSaveStepsSubmit} className="mt-2 flex items-center gap-2">
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

        {/* Step Calorie Calculation Breakdown */}
        <div className="mt-2.5 pt-2 border-t border-neutral-850 flex items-center justify-between text-[10px] text-neutral-400">
          <span>Total Step Burn: <strong className="text-white">{stepCalc.totalStepCalories} kcal</strong></span>
          <span>Active Step Burn (&gt;3.5k): <strong className="text-white">+{stepCalc.activeStepCalories} kcal</strong></span>
        </div>
      </div>

      {/* Log Activity Form */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold text-white uppercase">Log Cardio Movement</h3>
          </div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase">
            MET {currentMeta.met.toFixed(1)}
          </span>
        </div>

        <form onSubmit={handleLogActivity} className="space-y-3">
          {/* Activity Type Selection */}
          <div>
            <label className="text-[9px] uppercase font-bold text-neutral-500 block mb-1">
              Activity Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                const t = e.target.value as ActivityType;
                setSelectedType(t);
                setDurationStr(String(ACTIVITY_MET_TABLE[t]?.defaultDurationMin || 30));
              }}
              className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-white transition-colors"
            >
              {Object.values(ACTIVITY_MET_TABLE).map((item) => (
                <option key={item.type} value={item.type}>
                  {item.label} (MET {item.met})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-neutral-400 mt-1 font-sans">
              {currentMeta.description}
            </p>
          </div>

          {/* Duration & Distance Dual Row */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] uppercase font-bold text-neutral-500 block mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="360"
                value={durationStr}
                onChange={(e) => setDurationStr(e.target.value)}
                placeholder="30"
                className="w-full bg-neutral-900 border border-neutral-750 rounded px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-white"
                required
              />
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-neutral-500 block mb-1">
                Distance (km) {currentMeta.supportsDistance ? '' : '(N/A)'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={distanceStr}
                onChange={(e) => setDistanceStr(e.target.value)}
                placeholder={currentMeta.supportsDistance ? "e.g. 5.0" : "Optional"}
                disabled={!currentMeta.supportsDistance}
                className="w-full bg-neutral-900 border border-neutral-750 rounded px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40 focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-neutral-500 uppercase font-bold mr-1">Presets:</span>
            {[15, 20, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleQuickDuration(mins)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                  parsedDuration === mins
                    ? 'bg-white text-black border-white'
                    : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          {/* Live MET & Calorie Burn Calculation Preview */}
          <div className="p-3 rounded-lg bg-black border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-750 flex items-center justify-center">
                {getActivityCategoryIcon(currentMeta.category)}
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-neutral-500">
                  Calculated Energy Burn
                </span>
                <div className="text-xs text-neutral-300">
                  {currentMeta.met} MET × {currentWeightKg}kg × ({parsedDuration}/60h)
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-base font-black text-white">
                ~{liveBurnEstimate} <span className="text-[10px] text-neutral-500">kcal</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={parsedDuration <= 0}
            className="w-full py-2.5 rounded-lg bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all active:scale-98 disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Cardio Session</span>
          </button>
        </form>
      </div>

      {/* Today's Logged Activities List */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold text-white uppercase">Today's Logged Activities</h3>
          </div>

          {activities.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white text-[10px] font-mono flex items-center gap-1 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3 h-3 text-neutral-400" />
                <span>Start Fresh</span>
              </button>
              <ContextualHelp
                title="Start Fresh"
                content="Clears all cardio activities logged for today so you can start a new session."
              />
            </div>
          )}
        </div>

        {/* Start Fresh Confirmation Overlay */}
        {showClearConfirm && (
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-700 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-xs text-white font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-neutral-300" />
              <span>Clear all logged cardio activities for today?</span>
            </div>
            <p className="text-[10px] text-neutral-400 font-sans">
              This will reset today's active burn and cardio tally to zero.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 rounded border border-neutral-750 text-neutral-300 text-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playTap();
                  onClearActivities();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1 rounded bg-white text-black font-bold text-xs hover:bg-neutral-200"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        )}

        {activities.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 font-mono border border-dashed border-neutral-850 rounded-lg">
            <Flame className="w-8 h-8 mx-auto text-neutral-700 mb-2" />
            <p className="text-xs font-bold text-neutral-300">NO CARDIO LOGGED TODAY</p>
            <p className="text-[10px] text-neutral-500 mt-1">
              Select swimming, incline walking, or running above to compute MET burn.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-850">
            {activities.map((act) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getActivityCategoryIcon(act.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white">{act.title}</span>
                      <span className="text-[9px] px-1.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                        {act.timeLogged}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {act.durationMinutes} min {act.distanceKm ? `• ${act.distanceKm} km` : ''} • MET {act.met}
                    </p>
                    {act.notes && (
                      <p className="text-[10px] text-neutral-500 font-sans mt-0.5 italic">
                        "{act.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-white font-mono">
                      +{act.caloriesBurned}
                    </span>
                    <span className="text-[9px] text-neutral-500 block">kcal</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundManager.playTap();
                      onDeleteActivity(act.id);
                    }}
                    className="p-1.5 rounded text-neutral-600 hover:text-white transition-colors"
                    title="Delete activity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Macro Allocation Impact Card */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
            <h3 className="text-xs font-bold text-white uppercase">Dynamic Macro Budget Impact</h3>
          </div>
          <span className="text-[10px] font-bold text-white">
            +{totalActiveBurn} kcal unlocked
          </span>
        </div>

        <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
          Active burn from steps & cardio fuels muscle glycogen without compromising the 75–78kg aesthetic corridor:
        </p>

        <div className="grid grid-cols-2 gap-2 text-center pt-1 font-mono">
          <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
            <span className="text-[9px] text-neutral-500 uppercase font-bold">Extra Carbohydrates</span>
            <div className="text-sm font-black text-white mt-0.5">
              +{dynamicMacroImpact.extraCarbsGrams} <span className="text-[10px] text-neutral-500">g</span>
            </div>
            <span className="text-[8px] text-neutral-500 block mt-0.5">70% Glycogen Refuel</span>
          </div>

          <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
            <span className="text-[9px] text-neutral-500 uppercase font-bold">Extra Dietary Fats</span>
            <div className="text-sm font-black text-white mt-0.5">
              +{dynamicMacroImpact.extraFatsGrams} <span className="text-[10px] text-neutral-500">g</span>
            </div>
            <span className="text-[8px] text-neutral-500 block mt-0.5">30% Substrate Partition</span>
          </div>
        </div>
      </div>
    </div>
  );
};
