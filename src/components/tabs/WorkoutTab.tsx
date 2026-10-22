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
  RotateCcw, 
  ArrowRightLeft, 
  Sparkles, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Activity, 
  ChevronDown, 
  ChevronUp,
  Award
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
  // Modal for swapping equipment
  const [activeSwapExerciseIndex, setActiveSwapExerciseIndex] = useState<number | null>(null);
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<number | null>(0);
  const [completedCelebration, setCompletedCelebration] = useState<boolean>(false);

  if (!workout) {
    return (
      <div className="p-8 text-center text-slate-400">
        <Dumbbell className="w-12 h-12 mx-auto text-slate-600 mb-2 animate-bounce" />
        <p className="font-semibold text-white">No workout loaded for today</p>
        <p className="text-xs text-slate-400 mt-1">Check the 4-3 Rota calendar or initialize today's session.</p>
      </div>
    );
  }

  // Handle set completion check
  const handleToggleSetComplete = (exIdx: number, setIdx: number) => {
    soundManager.playTap();
    const updatedWorkout: WorkoutSession = JSON.parse(JSON.stringify(workout));
    const targetSet = updatedWorkout.exercises[exIdx].sets[setIdx];
    const willBeComplete = !targetSet.completed;
    targetSet.completed = willBeComplete;

    // If marked complete, auto-start countdown rest timer!
    if (willBeComplete) {
      const restSecs = updatedWorkout.exercises[exIdx].restSecs || 90;
      const exName = updatedWorkout.exercises[exIdx].selectedAlternative || updatedWorkout.exercises[exIdx].exerciseName;
      onStartRestTimer(restSecs, exName);
    }

    // Check if entire workout is completed
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

  // Update weight or reps
  const handleUpdateSetValue = (exIdx: number, setIdx: number, field: 'weightKg' | 'reps', value: number) => {
    const updatedWorkout: WorkoutSession = JSON.parse(JSON.stringify(workout));
    updatedWorkout.exercises[exIdx].sets[setIdx][field] = value;
    onSaveWorkout(updatedWorkout);
  };

  // Add new set
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

  // Remove set
  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    soundManager.playTap();
    const updatedWorkout: WorkoutSession = JSON.parse(JSON.stringify(workout));
    const ex = updatedWorkout.exercises[exIdx];
    if (ex.sets.length > 1) {
      ex.sets.splice(setIdx, 1);
      // Re-number
      ex.sets.forEach((s, i) => s.setNumber = i + 1);
      onSaveWorkout(updatedWorkout);
    }
  };

  // Swap alternative
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

  // Active swapping def
  const swapDef: ExerciseDefinition | undefined = 
    activeSwapExerciseIndex !== null 
      ? EXERCISE_DATABASE[workout.exercises[activeSwapExerciseIndex]?.exerciseId]
      : undefined;

  // Calculate total volume tonnage
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
    <div className="space-y-4 pb-28 text-left animate-fadeIn">
      {/* Workout Header Bar */}
      <div className="rounded-2xl bg-dark-900 border border-dark-800 p-4 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                {workout.intensity}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {workout.category} Focus
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              {workout.title}
            </h2>
          </div>

          <button
            onClick={onOpenFatigueModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-dark-800 border border-dark-700 text-xs font-semibold text-slate-200 hover:border-cyan-400 transition-all active:scale-95"
            title="Auto-Regulate Volume"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>RPE {currentFatigue}/10</span>
          </button>
        </div>

        {/* Auto-Adjusted volume banner if fatigue was scaled */}
        {workout.autoAdjustedReason && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{workout.autoAdjustedReason}</span>
          </div>
        )}

        {/* Progress & Total Tonnage Bar */}
        <div className="mt-4 pt-3 border-t border-dark-800 grid grid-cols-3 gap-2 text-center">
          <div className="bg-dark-850 p-2 rounded-xl border border-dark-750">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Sets Done</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {completedSetsCount} / {totalSetsCount}
            </div>
          </div>
          <div className="bg-dark-850 p-2 rounded-xl border border-dark-750">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Tonnage</div>
            <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
              {Math.round(currentTonnage).toLocaleString()} <span className="text-[10px] text-slate-400">kg</span>
            </div>
          </div>
          <div className="bg-dark-850 p-2 rounded-xl border border-dark-750">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Target Corridor</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              75-78 <span className="text-[10px] text-slate-400">kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises List */}
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
                  ? 'bg-dark-900/90 border-emerald-500/40' 
                  : isExpanded
                  ? 'bg-dark-900 border-cyan-500/60 shadow-lg'
                  : 'bg-dark-900/80 border-dark-800'
              }`}
            >
              {/* Exercise Header Accordion */}
              <div 
                className="p-3.5 flex items-start justify-between cursor-pointer hover:bg-dark-850/60 transition-colors"
                onClick={() => setExpandedExerciseIndex(isExpanded ? null : exIdx)}
              >
                <div className="flex items-start gap-2.5">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono mt-0.5 shrink-0 ${
                    isDone 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-dark-800 text-slate-300 border border-dark-700'
                  }`}>
                    {isDone ? <Check className="w-3.5 h-3.5" /> : exIdx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {displayName}
                      </h3>
                      {ex.equipmentTaken && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          SWAPPED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-cyan-400 font-medium">
                      {ex.targetMuscle} • {ex.restSecs}s Rest
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {completedCount}/{ex.sets.length}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Set Logger */}
              {isExpanded && (
                <div className="px-3.5 pb-4 pt-1 border-t border-dark-800/80 space-y-3">
                  {/* Equipment Taken / Swap Trigger & Tips */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                      {def?.primaryEquipment}
                    </span>

                    <button
                      type="button"
                      onClick={() => setActiveSwapExerciseIndex(exIdx)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-amber-400" />
                      <span>Equipment Taken?</span>
                    </button>
                  </div>

                  {def?.tips && (
                    <p className="text-[11px] text-slate-400 bg-dark-850 p-2 rounded-lg border border-dark-800 leading-relaxed">
                      💡 <strong className="text-slate-300">Form Cue:</strong> {def.tips}
                    </p>
                  )}

                  {/* Granular Sets Table */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-bold text-slate-400 px-1">
                      <div className="col-span-2 text-center">Set</div>
                      <div className="col-span-4 text-center">Weight (kg)</div>
                      <div className="col-span-4 text-center">Reps</div>
                      <div className="col-span-2 text-center">Log</div>
                    </div>

                    {ex.sets.map((set, setIdx) => {
                      return (
                        <div 
                          key={setIdx}
                          className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-xl border transition-all ${
                            set.completed 
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' 
                              : 'bg-dark-850 border-dark-750'
                          }`}
                        >
                          {/* Set number */}
                          <div className="col-span-2 text-center">
                            <span className="font-mono text-xs font-bold text-slate-300">
                              {set.setNumber}
                            </span>
                          </div>

                          {/* Weight input */}
                          <div className="col-span-4">
                            <div className="relative">
                              <input
                                type="number"
                                step="0.5"
                                value={set.weightKg === 0 ? '' : set.weightKg}
                                onChange={(e) => handleUpdateSetValue(exIdx, setIdx, 'weightKg', parseFloat(e.target.value) || 0)}
                                placeholder="32"
                                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-2 py-1.5 text-center font-mono text-xs font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors"
                              />
                            </div>
                          </div>

                          {/* Reps input */}
                          <div className="col-span-4">
                            <div className="relative">
                              <input
                                type="number"
                                step="1"
                                value={set.reps === 0 ? '' : set.reps}
                                onChange={(e) => handleUpdateSetValue(exIdx, setIdx, 'reps', parseInt(e.target.value, 10) || 0)}
                                placeholder="10"
                                className="w-full bg-dark-800 border border-dark-700 rounded-lg px-2 py-1.5 text-center font-mono text-xs font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors"
                              />
                            </div>
                          </div>

                          {/* Complete Checkbox Button */}
                          <div className="col-span-2 flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                                set.completed
                                  ? 'bg-emerald-500 text-black font-extrabold shadow-glow-emerald'
                                  : 'bg-dark-750 border border-dark-600 text-slate-400 hover:border-cyan-400 hover:text-white'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add / Remove Set Row */}
                  <div className="flex justify-between items-center pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleAddSet(exIdx)}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Extra Set</span>
                    </button>

                    {ex.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(exIdx, ex.sets.length - 1)}
                        className="text-slate-500 hover:text-rose-400 text-[11px] font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Last Set</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {completedCelebration && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-dark-900 border border-emerald-500/50 shadow-glow-emerald text-center animate-slideUp">
          <Award className="w-8 h-8 text-emerald-400 mx-auto mb-1 animate-bounce" />
          <h4 className="text-base font-extrabold text-white">Session Completed!</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Total tonnage logged: <strong className="text-emerald-400 font-mono">{Math.round(currentTonnage).toLocaleString()} kg</strong>. CNS fatigue tracked. Great job staying on track for 75-78kg recomp!
          </p>
        </div>
      )}

      {/* Equipment Taken Modal */}
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
