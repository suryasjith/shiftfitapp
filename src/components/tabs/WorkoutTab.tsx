import React, { useState } from 'react';
import { 
  WorkoutSession, 
  ExerciseLog, 
  SetLog, 
  ExerciseDefinition,
  UserProfile,
  ShiftDay 
} from '../../types';
import { EXERCISE_DATABASE } from '../../data/exerciseDatabase';
import { EquipmentTakenModal } from '../EquipmentTakenModal';
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
  AlertCircle
} from 'lucide-react';
import { soundManager } from '../../services/audioTimer';
import { ContextualHelp } from '../ContextualHelp';

interface WorkoutTabProps {
  todayStr: string;
  workout: WorkoutSession | null;
  profile: UserProfile;
  customShifts: Record<string, ShiftDay>;
  currentFatigue: number;
  onSaveWorkout: (workout: WorkoutSession) => void;
  onStartRestTimer: (seconds: number, exerciseName: string) => void;
  onOpenFatigueModal: () => void;
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
}) => {
  const [activeSwapExerciseIndex, setActiveSwapExerciseIndex] = useState<number | null>(null);
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<number | null>(0);
  const [completedCelebration, setCompletedCelebration] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  if (!workout) {
    return (
      <div className="p-8 text-center text-neutral-500 font-mono">
        <Dumbbell className="w-10 h-10 mx-auto text-neutral-700 mb-2" />
        <p className="font-bold text-white text-xs">NO WORKOUT LOADED</p>
        <p className="text-[11px] text-neutral-500 mt-1">Check the 4-3 Rota calendar.</p>
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
      onStartRestTimer(restSecs, exName);
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
      weightKg: lastSet ? lastSet.weightKg : 20,
      reps: lastSet ? lastSet.reps : 10,
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
  };

  // Timing inputs
  const handleUpdateTiming = (
    field: 'startTime' | 'endTime' | 'actualDurationMin',
    value: any
  ) => {
    const updatedWorkout: WorkoutSession = JSON.parse(JSON.stringify(workout));
    (updatedWorkout as any)[field] = value;

    // Auto-calculate duration if both start and end time are present
    const start = field === 'startTime' ? value : updatedWorkout.startTime;
    const end = field === 'endTime' ? value : updatedWorkout.endTime;

    if (start && end && field !== 'actualDurationMin') {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
        let diff = (eh * 60 + em) - (sh * 60 + sm);
        if (diff < 0) diff += 24 * 60; // crossed midnight
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

  // Start fresh - reset session
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
    <div className="space-y-3.5 pb-28 text-left animate-fadeIn">
      {/* Workout Header Bar */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 uppercase tracking-wider">
                {workout.intensity}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {workout.category} Focus
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-1 font-mono">
              {workout.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Start Fresh Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white text-xs font-mono transition-all active:scale-95"
              title="Reset all inputs for a new session"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
              <span>Start Fresh</span>
            </button>
            <ContextualHelp
              title="Start Fresh Session"
              content="Clears all completed checkmarks, resets session timestamps, and zeroes out logs so you can run a completely clean session."
            />

            {/* Fatigue auto-regulation badge */}
            <button
              onClick={onOpenFatigueModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-750 bg-neutral-900 text-xs font-mono font-medium text-white hover:border-neutral-500 transition-all active:scale-95 ml-1"
              title="Auto-Regulate Volume"
            >
              <Activity className="w-3.5 h-3.5 text-neutral-400" />
              <span>RPE {currentFatigue}/10</span>
            </button>
          </div>
        </div>

        {/* Start Fresh Confirmation Banner */}
        {showResetConfirm && (
          <div className="mt-3 p-3 rounded-lg bg-neutral-900 border border-neutral-700 space-y-2 animate-fadeIn font-mono">
            <div className="flex items-center gap-1.5 text-xs text-white font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-neutral-300" />
              <span>Reset today's workout to start fresh?</span>
            </div>
            <p className="text-[10px] text-neutral-400 font-sans">
              This will uncheck all completed sets and clear session start/end timestamps.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1 rounded border border-neutral-750 text-neutral-300 text-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartFreshWorkout}
                className="px-3 py-1 rounded bg-white text-black font-bold text-xs hover:bg-neutral-200"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}

        {workout.autoAdjustedReason && (
          <div className="mt-2.5 p-2 rounded border border-neutral-800 bg-neutral-900 text-xs text-neutral-300 font-mono">
            {workout.autoAdjustedReason}
          </div>
        )}

        {/* Progress & Total Tonnage Bar */}
        <div className="mt-3.5 pt-3 border-t border-neutral-850 grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
            <div className="text-[9px] text-neutral-500 uppercase font-bold">Sets Done</div>
            <div className="text-xs font-bold text-white mt-0.5">
              {completedSetsCount} / {totalSetsCount}
            </div>
          </div>
          <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-center gap-1">
              <span className="text-[9px] text-neutral-500 uppercase font-bold">Tonnage</span>
              <ContextualHelp
                title="Tonnage Volume"
                content="Total work calculated as sets × reps × weight (kg). Progressive overload is tracked by weekly tonnage progression."
              />
            </div>
            <div className="text-xs font-bold text-white mt-0.5">
              {Math.round(currentTonnage).toLocaleString()} <span className="text-[9px] text-neutral-500">kg</span>
            </div>
          </div>
          <div className="bg-neutral-900 p-2 rounded-lg border border-neutral-800">
            <div className="text-[9px] text-neutral-500 uppercase font-bold">Corridor</div>
            <div className="text-xs font-bold text-neutral-300 mt-0.5">
              75–78 <span className="text-[9px] text-neutral-500">kg</span>
            </div>
          </div>
        </div>

        {/* Workout Timestamp & Duration Logger */}
        <div className="mt-3.5 pt-3 border-t border-neutral-850">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
              <Clock className="w-3.5 h-3.5 text-white" />
              <span className="uppercase">Session Timing & Duration</span>
              <ContextualHelp
                title="Session Timing"
                content="Track exact start and end times and total session duration for training density insights."
              />
            </div>
            {workout.actualDurationMin ? (
              <span className="text-[10px] font-mono text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-750">
                {workout.actualDurationMin} min logged
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] uppercase font-mono font-bold text-neutral-500 block mb-1">
                Start Time
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="time"
                  value={workout.startTime || ''}
                  onChange={(e) => handleUpdateTiming('startTime', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-750 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-white"
                />
                <button
                  type="button"
                  onClick={() => handleSetTimeToNow('startTime')}
                  className="px-1.5 py-1 text-[9px] font-mono rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-750 active:scale-95 shrink-0"
                  title="Set to current time"
                >
                  Now
                </button>
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase font-mono font-bold text-neutral-500 block mb-1">
                End Time
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="time"
                  value={workout.endTime || ''}
                  onChange={(e) => handleUpdateTiming('endTime', e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-750 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-white"
                />
                <button
                  type="button"
                  onClick={() => handleSetTimeToNow('endTime')}
                  className="px-1.5 py-1 text-[9px] font-mono rounded bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-750 active:scale-95 shrink-0"
                  title="Set to current time"
                >
                  Now
                </button>
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase font-mono font-bold text-neutral-500 block mb-1">
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
                placeholder="e.g. 55"
                className="w-full bg-neutral-900 border border-neutral-750 rounded px-2 py-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-2.5">
        {workout.exercises.map((ex, exIdx) => {
          const def = EXERCISE_DATABASE[ex.exerciseId];
          const isExpanded = expandedExerciseIndex === exIdx;
          const completedCount = ex.sets.filter(s => s.completed).length;
          const isDone = completedCount === ex.sets.length && ex.sets.length > 0;
          const displayName = ex.selectedAlternative || ex.exerciseName;

          return (
            <div 
              key={exIdx}
              className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                isDone 
                  ? 'bg-neutral-950 border-neutral-750' 
                  : isExpanded
                  ? 'bg-neutral-950 border-white shadow-sm'
                  : 'bg-neutral-950 border-neutral-850'
              }`}
            >
              {/* Exercise Header Accordion */}
              <div 
                className="p-3 flex items-start justify-between cursor-pointer hover:bg-neutral-900 transition-colors"
                onClick={() => setExpandedExerciseIndex(isExpanded ? null : exIdx)}
              >
                <div className="flex items-start gap-2.5">
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold font-mono mt-0.5 shrink-0 ${
                    isDone 
                      ? 'bg-white text-black' 
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}>
                    {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : exIdx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs font-bold text-white font-mono tracking-tight">
                        {displayName}
                      </h3>
                      {ex.equipmentTaken && (
                        <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-white text-black">
                          SWAPPED
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                      {ex.targetMuscle} • {ex.restSecs}s Rest
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-neutral-400">
                    {completedCount}/{ex.sets.length}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  )}
                </div>
              </div>

              {/* Expanded Set Logger */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-neutral-850 space-y-2.5">
                  <div className="flex items-center justify-between gap-2 pt-1 font-mono">
                    <span className="text-[10px] text-neutral-500 truncate max-w-[180px]">
                      {def?.primaryEquipment}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveSwapExerciseIndex(exIdx)}
                        className="px-2 py-0.5 rounded border border-neutral-750 bg-neutral-900 hover:border-neutral-600 text-white text-[10px] font-mono flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-neutral-400" />
                        <span>Equipment Taken?</span>
                      </button>
                      <ContextualHelp
                        title="Equipment Taken"
                        content="Busy gym? Tap to substitute this exercise with an alternative matching the exact same muscle fibers and resistance curve without losing your set logs."
                      />
                    </div>
                  </div>

                  {def?.tips && (
                    <p className="text-[11px] text-neutral-300 bg-neutral-900 p-2 rounded border border-neutral-850 leading-relaxed font-sans">
                      <span className="font-bold text-white font-mono text-[10px] uppercase">Form:</span> {def.tips}
                    </p>
                  )}

                  {/* Granular Sets Table */}
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-12 gap-2 text-[9px] uppercase font-mono font-bold text-neutral-500 px-1">
                      <div className="col-span-2 text-center">Set</div>
                      <div className="col-span-4 text-center">Weight (kg)</div>
                      <div className="col-span-4 text-center">Reps</div>
                      <div className="col-span-2 text-center">Done</div>
                    </div>

                    {ex.sets.map((set, setIdx) => {
                      return (
                        <div 
                          key={setIdx}
                          className={`grid grid-cols-12 gap-2 items-center p-1 rounded-lg border transition-all ${
                            set.completed 
                              ? 'bg-neutral-900 border-neutral-700 text-white' 
                              : 'bg-neutral-950 border-neutral-850'
                          }`}
                        >
                          <div className="col-span-2 text-center">
                            <span className="font-mono text-xs font-bold text-neutral-400">
                              {set.setNumber}
                            </span>
                          </div>

                          <div className="col-span-4">
                            <input
                              type="number"
                              step="any"
                              value={set.weightKg === 0 ? '' : set.weightKg}
                              onChange={(e) => handleUpdateSetValue(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                              placeholder="32"
                              className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-center font-mono text-xs font-bold text-white focus:outline-none focus:border-white transition-colors"
                            />
                          </div>

                          <div className="col-span-4">
                            <input
                              type="number"
                              step="1"
                              value={set.reps === 0 ? '' : set.reps}
                              onChange={(e) => handleUpdateSetValue(exIdx, setIdx, 'reps', parseInt(e.target.value, 10) || 0)}
                              placeholder="10"
                              className="w-full bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-center font-mono text-xs font-bold text-white focus:outline-none focus:border-white transition-colors"
                            />
                          </div>

                          <div className="col-span-2 flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                              className={`w-7 h-7 rounded flex items-center justify-center transition-all active:scale-90 ${
                                set.completed
                                  ? 'bg-white text-black font-black'
                                  : 'bg-neutral-900 border border-neutral-750 text-neutral-500 hover:text-white hover:border-neutral-500'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-1 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => handleAddSet(exIdx)}
                      className="text-neutral-300 hover:text-white font-semibold flex items-center gap-1 active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Set</span>
                    </button>

                    {ex.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(exIdx, ex.sets.length - 1)}
                        className="text-neutral-600 hover:text-neutral-400 text-[10px] flex items-center gap-1"
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
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-700 text-center animate-slideUp font-mono">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Session Completed</h4>
          <p className="text-[11px] text-neutral-400 mt-1 font-sans">
            Total tonnage: <strong className="text-white font-mono">{Math.round(currentTonnage).toLocaleString()} kg</strong>. Workout logged and saved to device memory.
          </p>
        </div>
      )}

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
