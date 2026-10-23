import React, { useState } from 'react';
import { 
  WorkoutSession, 
  ExerciseLog, 
  SetLog, 
  ExerciseDefinition,
  UserProfile,
  ShiftDay,
  ShiftType 
} from '../../types';
import { EXERCISE_DATABASE } from '../../data/exerciseDatabase';
import { EquipmentTakenModal } from '../EquipmentTakenModal';
import { ScheduleTab } from './ScheduleTab';
import { RotaEngine } from '../../services/rotaEngine';
import { 
  Dumbbell, 
  Check, 
  ArrowRightLeft, 
  Plus, 
  Trash2, 
  Activity, 
  ChevronDown, 
  ChevronUp,
  RotateCcw,
  Clock,
  AlertCircle,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';

interface WorkoutTabProps {
  todayStr: string;
  workout: WorkoutSession | null;
  profile: UserProfile;
  customShifts: Record<string, ShiftDay>;
  currentFatigue: number;
  onSaveWorkout: (workout: WorkoutSession) => void;
  onStartRestTimer: (seconds: number, exerciseName: string) => void;
  onOpenFatigueModal: () => void;
  onSaveShift?: (shift: ShiftDay) => void;
  onUpdateTemplate?: (template: ShiftType[]) => void;
}

export const WorkoutTab: React.FC<WorkoutTabProps> = ({
  todayStr,
  workout,
  profile,
  customShifts,
  currentFatigue,
  onSaveWorkout,
  onStartRestTimer,
  onOpenFatigueModal,
  onSaveShift,
  onUpdateTemplate,
}) => {
  const [activeSwapExerciseIndex, setActiveSwapExerciseIndex] = useState<number | null>(null);
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<number | null>(0);
  const [completedCelebration, setCompletedCelebration] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showRotaManager, setShowRotaManager] = useState<boolean>(false);
  const [showTimingManager, setShowTimingManager] = useState<boolean>(false);

  const dayInfo = RotaEngine.getDayInfo(todayStr, profile, customShifts);

  if (!workout) {
    return (
      <div className="p-8 text-center text-neutral-500 font-sans space-y-3">
        <Dumbbell className="w-12 h-12 mx-auto text-neutral-700" />
        <h3 className="font-bold text-white text-sm">No Workout Loaded</h3>
        <p className="text-xs text-neutral-400 max-w-xs mx-auto">
          Tap "Manage Shift Rota" below to verify your 4-on / 3-off shift pattern.
        </p>
      </div>
    );
  }

  const handleToggleSetComplete = (exIdx: number, setIdx: number) => {
    soundManager.playTap();
    const updatedWorkout: WorkoutSession = JSON.parse(JSON.stringify(workout));
    const targetSet = updatedWorkout.exercises[exIdx].sets[setIdx];
    const willBeComplete = !targetSet.completed;
    targetSet.completed = willBeComplete;

    if (willBeComplete) {
      const restSecs = updatedWorkout.exercises[exIdx].restSecs || 90;
      const exName = updatedWorkout.exercises[exIdx].selectedAlternative || updatedWorkout.exercises[exIdx].exerciseName;
      onStartRestTimer(restSecs, `${exName} (Set ${setIdx + 1})`);
    }

    const allSetsComplete = updatedWorkout.exercises.every(ex => 
      ex.sets.every(s => s.completed)
    );
    if (allSetsComplete && !updatedWorkout.completed) {
      updatedWorkout.completed = true;
      setCompletedCelebration(true);
      soundManager.playCompleteChime();
    }

    onSaveWorkout(updatedWorkout);
  };

  const handleUpdateSetValue = (exIdx: number, setIdx: number, field: 'weightKg' | 'reps', value: number) => {
    const updatedWorkout: WorkoutSession = JSON.parse(JSON.stringify(workout));
    updatedWorkout.exercises[exIdx].sets[setIdx][field] = value;
    onSaveWorkout(updatedWorkout);
  };

  const handleAddSet = (exIdx: number) => {
    soundManager.playTap();
    const updatedWorkout: WorkoutSession = JSON.parse(JSON.stringify(workout));
    const ex = updatedWorkout.exercises[exIdx];
    const lastSet = ex.sets[ex.sets.length - 1];
    const newSet: SetLog = {
      setNumber: ex.sets.length + 1,
      weightKg: lastSet && lastSet.weightKg > 0 ? lastSet.weightKg : 0,
      reps: lastSet && lastSet.reps > 0 ? lastSet.reps : 0,
      completed: false,
    };
    ex.sets.push(newSet);
    onSaveWorkout(updatedWorkout);
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    soundManager.playTap();
    const updatedWorkout: WorkoutSession = JSON.parse(JSON.stringify(workout));
    const ex = updatedWorkout.exercises[exIdx];
    if (ex.sets.length > 1) {
      ex.sets.splice(setIdx, 1);
      ex.sets.forEach((s, i) => s.setNumber = i + 1);
      onSaveWorkout(updatedWorkout);
    }
  };

  const handleSelectAlternative = (altName: string) => {
    if (activeSwapExerciseIndex === null) return;
    soundManager.playTap();
    const updatedWorkout: WorkoutSession = JSON.parse(JSON.stringify(workout));
    const ex = updatedWorkout.exercises[activeSwapExerciseIndex];
    if (altName) {
      ex.selectedAlternative = altName;
      ex.equipmentTaken = true;
    } else {
      delete ex.selectedAlternative;
      ex.equipmentTaken = false;
    }
    onSaveWorkout(updatedWorkout);
    setActiveSwapExerciseIndex(null);
  };

  // Timing handlers
  const handleUpdateTiming = (
    field: 'startTime' | 'endTime' | 'actualDurationMin',
    value: any
  ) => {
    const updatedWorkout: WorkoutSession = JSON.parse(JSON.stringify(workout));
    (updatedWorkout as any)[field] = value;

    const start = field === 'startTime' ? value : updatedWorkout.startTime;
    const end = field === 'endTime' ? value : updatedWorkout.endTime;

    if (start && end && field !== 'actualDurationMin') {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
        let diff = (eh * 60 + em) - (sh * 60 + sm);
        if (diff < 0) diff += 24 * 60;
        updatedWorkout.actualDurationMin = diff;
      }
    }

    onSaveWorkout(updatedWorkout);
  };

  const handleSetTimeToNow = (field: 'startTime' | 'endTime') => {
    soundManager.playTap();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    handleUpdateTiming(field, timeStr);
  };

  const handleStartFreshWorkout = () => {
    soundManager.playTap();
    const resetWorkout: WorkoutSession = JSON.parse(JSON.stringify(workout));
    resetWorkout.completed = false;
    resetWorkout.startTime = '';
    resetWorkout.endTime = '';
    resetWorkout.actualDurationMin = undefined;
    resetWorkout.totalTonnageKg = 0;
    resetWorkout.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        s.completed = false;
      });
    });
    onSaveWorkout(resetWorkout);
    setShowResetConfirm(false);
  };

  const swapDef: ExerciseDefinition | undefined = 
    activeSwapExerciseIndex !== null 
      ? EXERCISE_DATABASE[workout.exercises[activeSwapExerciseIndex]?.exerciseId]
      : undefined;

  let currentTonnage = 0;
  let totalSetsCount = 0;
  let completedSetsCount = 0;
  workout.exercises.forEach(ex => {
    ex.sets.forEach(s => {
      totalSetsCount++;
      if (s.completed) {
        completedSetsCount++;
        currentTonnage += (s.weightKg || 0) * (s.reps || 0);
      }
    });
  });

  return (
    <div className="space-y-4 pb-28 text-left animate-fadeIn font-sans">
      {/* 1. Workout Session Header Card */}
      <div className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-300 uppercase tracking-wider">
                {workout.intensity}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {workout.category} Focus
              </span>
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              {workout.title}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Target: ~{workout.targetDurationMin || 45} mins • RPE Fatigue: {currentFatigue}/10
            </p>
          </div>

          {/* Action: Start Fresh Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white text-xs font-medium transition-all active:scale-95 shrink-0"
            title="Reset all inputs for a new session"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
            <span>Start Fresh</span>
          </button>
        </div>

        {/* Start Fresh Confirmation Dialog */}
        {showResetConfirm && (
          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-700 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs text-white font-bold">
              <AlertCircle className="w-4 h-4 text-neutral-300" />
              <span>Reset today's session to start clean?</span>
            </div>
            <p className="text-xs text-neutral-400">
              This unchecks all sets and resets timestamps so you can log from scratch.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-neutral-750 text-neutral-300 text-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartFreshWorkout}
                className="px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-neutral-200"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}

        {/* High-level progress counts */}
        <div className="pt-3 border-t border-neutral-850 grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Sets Done</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {completedSetsCount} / {totalSetsCount}
            </span>
          </div>

          <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Total Work</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {Math.round(currentTonnage).toLocaleString()} <span className="text-[10px] text-neutral-500">kg</span>
            </span>
          </div>

          <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-[10px] text-neutral-500 uppercase font-bold block">Target</span>
            <span className="text-sm font-bold text-neutral-300 mt-0.5 block">
              75–78 <span className="text-[10px] text-neutral-500">kg</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. PROGRESSIVE DISCLOSURE: Manage 2-Week Shift Calendar (Collapsed by Default) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setShowRotaManager(!showRotaManager)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white shrink-0">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Manage 2-Week Shift Rota
              </span>
              <span className="text-[11px] text-neutral-400 font-normal">
                {dayInfo.isShiftDay ? '12h Shift Day Today' : 'Off-Day Today'} • Tap to inspect or amend shift loop
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono shrink-0">
            <span>{showRotaManager ? 'Collapse' : 'Manage'}</span>
            {showRotaManager ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showRotaManager && onSaveShift && onUpdateTemplate && (
          <div className="mt-4 pt-4 border-t border-neutral-850 animate-fadeIn">
            <ScheduleTab
              todayStr={todayStr}
              profile={profile}
              customShifts={customShifts}
              onSaveShift={onSaveShift}
              onUpdateTemplate={onUpdateTemplate}
              onNavigateTab={() => {}}
            />
          </div>
        )}
      </div>

      {/* 3. PROGRESSIVE DISCLOSURE: Session Timing (Collapsed by Default) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setShowTimingManager(!showTimingManager)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white shrink-0">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Session Timing & Duration
              </span>
              <span className="text-[11px] text-neutral-400 font-normal">
                {workout.actualDurationMin 
                  ? `${workout.actualDurationMin} minutes tracked` 
                  : 'Track start and end times (optional)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono shrink-0">
            <span>{showTimingManager ? 'Hide' : 'Set Time'}</span>
            {showTimingManager ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showTimingManager && (
          <div className="mt-4 pt-4 border-t border-neutral-850 grid grid-cols-3 gap-2.5 animate-fadeIn font-mono">
            <div>
              <label className="text-[9px] uppercase font-bold text-neutral-500 block mb-1">
                Start Time
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="time"
                  value={workout.startTime || ''}
                  onChange={(e) => handleUpdateTiming('startTime', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-white"
                />
                <button
                  type="button"
                  onClick={() => handleSetTimeToNow('startTime')}
                  className="px-2 py-1.5 text-[9px] rounded-lg bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-750 active:scale-95"
                >
                  Now
                </button>
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-neutral-500 block mb-1">
                End Time
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="time"
                  value={workout.endTime || ''}
                  onChange={(e) => handleUpdateTiming('endTime', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-white"
                />
                <button
                  type="button"
                  onClick={() => handleSetTimeToNow('endTime')}
                  className="px-2 py-1.5 text-[9px] rounded-lg bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-750 active:scale-95"
                >
                  Now
                </button>
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-neutral-500 block mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={workout.actualDurationMin !== undefined && workout.actualDurationMin !== null ? workout.actualDurationMin : ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                  handleUpdateTiming('actualDurationMin', isNaN(val as number) ? undefined : val);
                }}
                placeholder="e.g. 50"
                className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-white text-center"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Empty State Guidance Banner (if 0 sets completed yet) */}
      {completedSetsCount === 0 && (
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-3">
          <Info className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-300 leading-relaxed">
            <strong className="text-white block mb-0.5">Ready to Train:</strong>
            Tap Exercise #1 below, type your weight and reps, then tap <strong className="text-white">Complete Set</strong>. The countdown rest timer will automatically guide your recovery.
          </div>
        </div>
      )}

      {/* 5. Exercises List with Obvious Action Verbs & Progressive Disclosure */}
      <div className="space-y-3">
        {workout.exercises.map((ex, exIdx) => {
          const def = EXERCISE_DATABASE[ex.exerciseId];
          const isExpanded = expandedExerciseIndex === exIdx;
          const completedCount = ex.sets.filter(s => s.completed).length;
          const isDone = completedCount === ex.sets.length && ex.sets.length > 0;
          const displayName = ex.selectedAlternative || ex.exerciseName;

          return (
            <div 
              key={exIdx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isDone 
                  ? 'bg-neutral-950 border-neutral-750' 
                  : isExpanded
                  ? 'bg-neutral-950 border-white shadow-md'
                  : 'bg-neutral-950 border-neutral-850'
              }`}
            >
              {/* Exercise Accordion Bar */}
              <div 
                className="p-4 flex items-start justify-between cursor-pointer hover:bg-neutral-900/70 transition-colors"
                onClick={() => setExpandedExerciseIndex(isExpanded ? null : exIdx)}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono mt-0.5 shrink-0 ${
                    isDone 
                      ? 'bg-white text-black' 
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}>
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : exIdx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {displayName}
                      </h3>
                      {ex.equipmentTaken && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-white text-black">
                          SWAPPED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {ex.targetMuscle} • {ex.restSecs}s Rest
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-neutral-400">
                    {completedCount}/{ex.sets.length} sets
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </div>

              {/* Expanded Set Logger */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-neutral-850 space-y-3">
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-neutral-500 font-mono truncate max-w-[180px]">
                      {def?.primaryEquipment || 'Free weights'}
                    </span>

                    {/* Swap Exercise Button (Obvious Action Verb) */}
                    <button
                      type="button"
                      onClick={() => setActiveSwapExerciseIndex(exIdx)}
                      className="px-2.5 py-1.5 rounded-lg border border-neutral-750 bg-neutral-900 hover:border-neutral-500 text-white text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-300" />
                      <span>Swap Exercise</span>
                    </button>
                  </div>

                  {def?.tips && (
                    <div className="text-xs text-neutral-300 bg-neutral-900 p-2.5 rounded-xl border border-neutral-850 leading-relaxed">
                      <strong className="text-white uppercase font-mono text-[10px] block mb-0.5">Form Cue:</strong>
                      {def.tips}
                    </div>
                  )}

                  {/* Granular Sets Table with Novice-Proof Placeholders */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-mono font-bold text-neutral-500 px-1">
                      <div className="col-span-2 text-center">Set</div>
                      <div className="col-span-4 text-center">Weight</div>
                      <div className="col-span-3 text-center">Reps</div>
                      <div className="col-span-3 text-center">Action</div>
                    </div>

                    {ex.sets.map((set, setIdx) => {
                      return (
                        <div 
                          key={setIdx}
                          className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-all ${
                            set.completed 
                              ? 'bg-neutral-900 border-neutral-700 text-white' 
                              : 'bg-neutral-950 border-neutral-850'
                          }`}
                        >
                          <div className="col-span-2 text-center">
                            <span className="font-mono text-xs font-bold text-neutral-400">
                              #{set.setNumber}
                            </span>
                          </div>

                          <div className="col-span-4">
                            <input
                              type="number"
                              step="any"
                              value={set.weightKg === 0 || set.weightKg === undefined ? '' : set.weightKg}
                              onChange={(e) => handleUpdateSetValue(exIdx, setIdx, 'weightKg', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                              placeholder="Weight (kg)"
                              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-center font-mono text-xs font-bold text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                            />
                          </div>

                          <div className="col-span-3">
                            <input
                              type="number"
                              step="1"
                              value={set.reps === 0 || set.reps === undefined ? '' : set.reps}
                              onChange={(e) => handleUpdateSetValue(exIdx, setIdx, 'reps', e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                              placeholder="Reps"
                              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-center font-mono text-xs font-bold text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                            />
                          </div>

                          <div className="col-span-3 flex justify-center">
                            {/* Obvious Plain-English Set Action Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                              className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold uppercase tracking-tight transition-all active:scale-95 flex items-center justify-center gap-1 ${
                                set.completed
                                  ? 'bg-white text-black font-black'
                                  : 'bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500'
                              }`}
                            >
                              {set.completed ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  <span className="text-[10px]">Done</span>
                                </>
                              ) : (
                                <span>Complete</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add & Remove Set Action Buttons */}
                  <div className="flex justify-between items-center pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleAddSet(exIdx)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white font-medium hover:bg-neutral-850 flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Extra Set</span>
                    </button>

                    {ex.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(exIdx, ex.sets.length - 1)}
                        className="text-neutral-500 hover:text-neutral-300 text-xs flex items-center gap-1 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Last</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {completedCelebration && (
        <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-700 text-center animate-slideUp font-sans space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-white" />
            <span>SESSION COMPLETED!</span>
          </div>
          <p className="text-xs text-neutral-400">
            Total tonnage: <strong className="text-white font-mono">{Math.round(currentTonnage).toLocaleString()} kg</strong>. Great workout!
          </p>
        </div>
      )}

      {/* Equipment Taken Alternate Modal */}
      {swapDef && activeSwapExerciseIndex !== null && (
        <EquipmentTakenModal
          exerciseDef={swapDef}
          currentSelectedAlternative={workout.exercises[activeSwapExerciseIndex]?.selectedAlternative}
          onSelectAlternative={handleSelectAlternative}
          onClose={() => setActiveSwapExerciseIndex(null)}
          isOpen={true}
        />
      )}
    </div>
  );
};
