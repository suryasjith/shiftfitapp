import React, { useState, useMemo, useCallback } from 'react';
import { 
  WorkoutSession, 
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
  ChevronDown, 
  ChevronUp,
  RotateCcw,
  Clock,
  AlertCircle,
  Calendar,
  Sparkles,
  Info,
  Play
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
  onOpenFatigueModal: _onOpenFatigueModal,
  onSaveShift,
  onUpdateTemplate,
}) => {
  const [activeSwapExerciseIndex, setActiveSwapExerciseIndex] = useState<number | null>(null);
  const [expandedExerciseIndex, setExpandedExerciseIndex] = useState<number | null>(0);
  const [completedCelebration, setCompletedCelebration] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showRotaManager, setShowRotaManager] = useState<boolean>(false);
  const [showTimingManager, setShowTimingManager] = useState<boolean>(false);

  const dayInfo = useMemo(() => {
    return RotaEngine.getDayInfo(todayStr, profile, customShifts);
  }, [todayStr, profile, customShifts]);

  // Fast immutable set completion (Vercel React Best Practices - zero JSON GC lag)
  const handleToggleSetComplete = useCallback((exIdx: number, setIdx: number) => {
    if (!workout) return;
    soundManager.playTap();
    let restSecs = 90;
    let exName = '';
    let willBeComplete = false;

    const newExercises = workout.exercises.map((ex, eIdx) => {
      if (eIdx !== exIdx) return ex;
      const newSets = ex.sets.map((s, sIdx) => {
        if (sIdx !== setIdx) return s;
        willBeComplete = !s.completed;
        return { ...s, completed: willBeComplete };
      });
      restSecs = ex.restSecs || 90;
      exName = ex.selectedAlternative || ex.exerciseName;
      return { ...ex, sets: newSets };
    });

    if (willBeComplete) {
      onStartRestTimer(restSecs, `${exName} (Set ${setIdx + 1})`);
    }

    const allSetsComplete = newExercises.every(ex => ex.sets.every(s => s.completed));
    if (allSetsComplete && !workout.completed) {
      setCompletedCelebration(true);
      soundManager.playCompleteChime();
    }

    onSaveWorkout({
      ...workout,
      exercises: newExercises,
      completed: allSetsComplete ? true : workout.completed,
    });
  }, [workout, onStartRestTimer, onSaveWorkout]);

  const handleUpdateSetValue = useCallback((exIdx: number, setIdx: number, field: 'weightKg' | 'reps', value: number) => {
    if (!workout) return;
    const newExercises = workout.exercises.map((ex, eIdx) => {
      if (eIdx !== exIdx) return ex;
      const newSets = ex.sets.map((s, sIdx) => {
        if (sIdx !== setIdx) return s;
        return { ...s, [field]: value };
      });
      return { ...ex, sets: newSets };
    });
    onSaveWorkout({ ...workout, exercises: newExercises });
  }, [workout, onSaveWorkout]);

  const handleAddSet = useCallback((exIdx: number) => {
    if (!workout) return;
    soundManager.playTap();
    const newExercises = workout.exercises.map((ex, eIdx) => {
      if (eIdx !== exIdx) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: SetLog = {
        setNumber: ex.sets.length + 1,
        weightKg: lastSet && lastSet.weightKg > 0 ? lastSet.weightKg : 0,
        reps: lastSet && lastSet.reps > 0 ? lastSet.reps : 0,
        completed: false,
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    });
    onSaveWorkout({ ...workout, exercises: newExercises });
  }, [workout, onSaveWorkout]);

  const handleRemoveSet = useCallback((exIdx: number, setIdx: number) => {
    if (!workout) return;
    soundManager.playTap();
    const newExercises = workout.exercises.map((ex, eIdx) => {
      if (eIdx !== exIdx) return ex;
      if (ex.sets.length <= 1) return ex;
      const filtered = ex.sets.filter((_, sIdx) => sIdx !== setIdx).map((s, i) => ({ ...s, setNumber: i + 1 }));
      return { ...ex, sets: filtered };
    });
    onSaveWorkout({ ...workout, exercises: newExercises });
  }, [workout, onSaveWorkout]);

  const handleSelectAlternative = useCallback((altName: string) => {
    if (!workout || activeSwapExerciseIndex === null) return;
    soundManager.playTap();
    const newExercises = workout.exercises.map((ex, eIdx) => {
      if (eIdx !== activeSwapExerciseIndex) return ex;
      if (altName) {
        return { ...ex, selectedAlternative: altName, equipmentTaken: true };
      } else {
        const copy = { ...ex, equipmentTaken: false };
        delete copy.selectedAlternative;
        return copy;
      }
    });
    onSaveWorkout({ ...workout, exercises: newExercises });
    setActiveSwapExerciseIndex(null);
  }, [workout, activeSwapExerciseIndex, onSaveWorkout]);

  // Timing handlers
  const handleUpdateTiming = useCallback((
    field: 'startTime' | 'endTime' | 'actualDurationMin',
    value: any
  ) => {
    if (!workout) return;
    const updatedWorkout: WorkoutSession = { ...workout, [field]: value };

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
  }, [workout, onSaveWorkout]);

  const handleSetTimeToNow = useCallback((field: 'startTime' | 'endTime') => {
    soundManager.playTap();
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    handleUpdateTiming(field, timeStr);
  }, [handleUpdateTiming]);

  const handleStartFreshWorkout = useCallback(() => {
    if (!workout) return;
    soundManager.playTap();
    const resetWorkout: WorkoutSession = {
      ...workout,
      completed: false,
      startTime: '',
      endTime: '',
      actualDurationMin: undefined,
      totalTonnageKg: 0,
      exercises: workout.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets.map((s) => ({ ...s, completed: false })),
      })),
    };
    onSaveWorkout(resetWorkout);
    setShowResetConfirm(false);
  }, [workout, onSaveWorkout]);

  const swapDef: ExerciseDefinition | undefined = useMemo(() => {
    if (!workout || activeSwapExerciseIndex === null) return undefined;
    return EXERCISE_DATABASE[workout.exercises[activeSwapExerciseIndex]?.exerciseId];
  }, [workout, activeSwapExerciseIndex]);

  // Memoized stats calculation
  const { currentTonnage, totalSetsCount, completedSetsCount } = useMemo(() => {
    let tonnage = 0;
    let totalSets = 0;
    let completedSets = 0;
    if (workout) {
      workout.exercises.forEach((ex) => {
        ex.sets.forEach((s) => {
          totalSets++;
          if (s.completed) {
            completedSets++;
            tonnage += (s.weightKg || 0) * (s.reps || 0);
          }
        });
      });
    }
    return { currentTonnage: tonnage, totalSetsCount: totalSets, completedSetsCount: completedSets };
  }, [workout]);

  if (!workout) {
    return (
      <div 
        role="region"
        aria-label="No Workout Loaded"
        className="p-8 text-center text-neutral-400 font-sans space-y-3"
      >
        <Dumbbell className="w-12 h-12 mx-auto text-neutral-600" aria-hidden="true" />
        <h3 className="font-bold text-white text-sm">No Workout Loaded</h3>
        <p className="text-xs text-neutral-400 max-w-xs mx-auto">
          Tap "Manage Shift Rota" below to verify your 4-on / 3-off shift pattern.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 text-left animate-fadeIn font-sans">
      {/* 1. Workout Session Header Card */}
      <section 
        aria-labelledby="active-session-title"
        className="rounded-2xl bg-neutral-950 border border-neutral-800 p-5 shadow-sm space-y-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-200 uppercase tracking-wider">
                {workout.intensity}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {workout.category} Focus
              </span>
            </div>

            <h2 id="active-session-title" className="text-xl font-bold text-white tracking-tight mt-1">
              {workout.title}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Target: ~{workout.targetDurationMin || 45} mins • RPE Fatigue: {currentFatigue}/10
            </p>
          </div>

          {/* Action: Start Fresh Button (min 44px touch target) */}
          <button
            onClick={() => setShowResetConfirm(true)}
            aria-label="Reset all sets and timers to start a fresh workout session"
            className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white text-xs font-medium transition-all active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" aria-hidden="true" />
            <span>Start Fresh</span>
          </button>
        </div>

        {/* Start Fresh Confirmation Dialog */}
        {showResetConfirm && (
          <div 
            role="alertdialog"
            aria-labelledby="reset-dialog-title"
            aria-describedby="reset-dialog-desc"
            className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 space-y-2 animate-fadeIn"
          >
            <div className="flex items-center gap-2 text-xs text-white font-bold">
              <AlertCircle className="w-4 h-4 text-neutral-300" aria-hidden="true" />
              <span id="reset-dialog-title">Reset today's session to start clean?</span>
            </div>
            <p id="reset-dialog-desc" className="text-xs text-neutral-300">
              This unchecks all sets and resets timestamps so you can log from scratch.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="min-h-[44px] px-3.5 py-2 rounded-lg border border-neutral-750 text-neutral-200 text-xs hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartFreshWorkout}
                className="min-h-[44px] px-4 py-2 rounded-lg bg-white text-black font-bold text-xs hover:bg-neutral-200"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}

        {/* High-level progress counts */}
        <div className="pt-3 border-t border-neutral-850 grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">Sets Done</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {completedSetsCount} / {totalSetsCount}
            </span>
          </div>

          <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">Total Work</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {Math.round(currentTonnage).toLocaleString()} <span className="text-[10px] text-neutral-400">kg</span>
            </span>
          </div>

          <div className="bg-neutral-900 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-[10px] text-neutral-400 uppercase font-bold block">Target</span>
            <span className="text-sm font-bold text-neutral-200 mt-0.5 block">
              75–78 <span className="text-[10px] text-neutral-400">kg</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. PROGRESSIVE DISCLOSURE: Manage 2-Week Shift Calendar */}
      <section 
        aria-label="Shift Rota Management"
        className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-sm"
      >
        <button
          type="button"
          onClick={() => setShowRotaManager(!showRotaManager)}
          aria-expanded={showRotaManager}
          aria-controls="shift-rota-container"
          className="min-h-[44px] w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-white rounded-xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white shrink-0">
              <Calendar className="w-4 h-4 text-white" aria-hidden="true" />
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
            {showRotaManager ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
          </div>
        </button>

        {showRotaManager && onSaveShift && onUpdateTemplate && (
          <div id="shift-rota-container" className="mt-4 pt-4 border-t border-neutral-850 animate-fadeIn">
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
      </section>

      {/* 3. PROGRESSIVE DISCLOSURE: Session Timing */}
      <section 
        aria-label="Session Duration & Timestamps"
        className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-sm"
      >
        <button
          type="button"
          onClick={() => setShowTimingManager(!showTimingManager)}
          aria-expanded={showTimingManager}
          aria-controls="timing-container"
          className="min-h-[44px] w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-white rounded-xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-750 flex items-center justify-center text-white shrink-0">
              <Clock className="w-4 h-4 text-white" aria-hidden="true" />
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
            {showTimingManager ? <ChevronUp className="w-4 h-4" aria-hidden="true" /> : <ChevronDown className="w-4 h-4" aria-hidden="true" />}
          </div>
        </button>

        {showTimingManager && (
          <div id="timing-container" className="mt-4 pt-4 border-t border-neutral-850 grid grid-cols-3 gap-2.5 animate-fadeIn font-mono">
            <div>
              <label htmlFor="workout-start-time" className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">
                Start Time
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="workout-start-time"
                  type="time"
                  value={workout.startTime || ''}
                  onChange={(e) => handleUpdateTiming('startTime', e.target.value)}
                  className="w-full min-h-[44px] bg-neutral-900 border border-neutral-750 rounded-lg px-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-white"
                />
                <button
                  type="button"
                  onClick={() => handleSetTimeToNow('startTime')}
                  aria-label="Set workout start time to current time"
                  className="min-h-[44px] px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-neutral-850 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-750 active:scale-95"
                >
                  Now
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="workout-end-time" className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">
                End Time
              </label>
              <div className="flex items-center gap-1">
                <input
                  id="workout-end-time"
                  type="time"
                  value={workout.endTime || ''}
                  onChange={(e) => handleUpdateTiming('endTime', e.target.value)}
                  className="w-full min-h-[44px] bg-neutral-900 border border-neutral-750 rounded-lg px-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-white"
                />
                <button
                  type="button"
                  onClick={() => handleSetTimeToNow('endTime')}
                  aria-label="Set workout end time to current time"
                  className="min-h-[44px] px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-neutral-850 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-750 active:scale-95"
                >
                  Now
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="workout-duration-min" className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">
                Duration (min)
              </label>
              <input
                id="workout-duration-min"
                type="number"
                min="0"
                max="300"
                value={workout.actualDurationMin !== undefined && workout.actualDurationMin !== null ? workout.actualDurationMin : ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                  handleUpdateTiming('actualDurationMin', isNaN(val as number) ? undefined : val);
                }}
                placeholder="e.g. 50"
                className="w-full min-h-[44px] bg-neutral-900 border border-neutral-750 rounded-lg px-2 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-white text-center"
              />
            </div>
          </div>
        )}
      </section>

      {/* 4. Empty State Guidance Banner (if 0 sets completed yet) */}
      {completedSetsCount === 0 && (
        <div 
          role="note" 
          aria-label="Workout guidance"
          className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-3"
        >
          <Info className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs text-neutral-300 leading-relaxed">
            <strong className="text-white block mb-0.5">Session Overview for {todayStr}:</strong>
            {todayStr === RotaEngine.formatDate(new Date()) ? (
              <>Tap Exercise #1 below, type your weight and reps, then tap <strong className="text-white">Complete</strong>. The countdown rest timer will automatically guide your recovery.</>
            ) : (
              <>No completed sets were recorded for this date. You can review scheduled movements below or retroactively log your weights and sets.</>
            )}
          </div>
        </div>
      )}

      {/* 5. Exercises List with Obvious Action Verbs & Progressive Disclosure */}
      <div 
        role="list"
        aria-label="Scheduled Exercises"
        className="space-y-3"
      >
        {workout.exercises.map((ex, exIdx) => {
          const def = EXERCISE_DATABASE[ex.exerciseId];
          const isExpanded = expandedExerciseIndex === exIdx;
          const completedCount = ex.sets.filter(s => s.completed).length;
          const isDone = completedCount === ex.sets.length && ex.sets.length > 0;
          const displayName = ex.selectedAlternative || ex.exerciseName;

          return (
            <article 
              key={exIdx}
              role="listitem"
              aria-labelledby={`exercise-name-${exIdx}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isDone 
                  ? 'bg-neutral-950 border-neutral-750' 
                  : isExpanded
                  ? 'bg-neutral-950 border-white shadow-md'
                  : 'bg-neutral-950 border-neutral-850'
              }`}
            >
              {/* Exercise Accordion Bar (Semantic Container, No Nested Links) */}
              <div className="w-full min-h-[48px] p-4 flex items-start justify-between text-left hover:bg-neutral-900/70 transition-colors">
                <button
                  type="button"
                  id={`exercise-header-${exIdx}`}
                  aria-expanded={isExpanded}
                  aria-controls={`exercise-panel-${exIdx}`}
                  className="flex-1 flex items-start gap-3 text-left focus:outline-none focus:ring-1 focus:ring-white rounded pr-2"
                  onClick={() => setExpandedExerciseIndex(isExpanded ? null : exIdx)}
                >
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono mt-0.5 shrink-0 ${
                    isDone 
                      ? 'bg-white text-black' 
                      : 'bg-neutral-900 text-neutral-300 border border-neutral-800'
                  }`}>
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" /> : exIdx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 id={`exercise-name-${exIdx}`} className="text-sm font-bold text-white tracking-tight">
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
                </button>

                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Standalone Sibling Tutorial Action (Valid HTML, accessible touch target) */}
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(displayName + ' form tutorial')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundManager.playTap();
                    }}
                    aria-label={`Watch form tutorial video for ${displayName} on YouTube`}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-none bg-neutral-900 hover:bg-neutral-800 border border-neutral-750 text-xs font-mono text-neutral-300 hover:text-white transition-colors active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-red-500 stroke-red-500 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Form</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setExpandedExerciseIndex(isExpanded ? null : exIdx)}
                    aria-label={isExpanded ? `Collapse ${displayName}` : `Expand ${displayName}`}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xs font-mono font-bold text-neutral-300 hover:text-white"
                  >
                    <span className="mr-1">{completedCount}/{ex.sets.length}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Set Logger */}
              {isExpanded && (
                <div id={`exercise-panel-${exIdx}`} className="px-4 pb-4 pt-2 border-t border-neutral-850 space-y-3">
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-neutral-400 font-mono truncate max-w-[150px]">
                      {def?.primaryEquipment || 'Free weights'}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Secondary Quick Tutorial Action */}
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(displayName + ' form tutorial')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open YouTube form tutorial for ${displayName}`}
                        className="min-h-[44px] px-2.5 py-1.5 rounded-none border border-neutral-750 bg-neutral-900 hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-mono flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Play className="w-3 h-3 fill-red-500 stroke-red-500" aria-hidden="true" />
                        <span>Tutorial</span>
                      </a>

                      {/* Swap Exercise Button (min 44px touch target) */}
                      <button
                        type="button"
                        onClick={() => setActiveSwapExerciseIndex(exIdx)}
                        aria-label={`Swap ${displayName} with alternate equipment or movement`}
                        className="min-h-[44px] px-3 py-1.5 rounded-none border border-neutral-750 bg-neutral-900 hover:border-neutral-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 active:scale-95 transition-all focus:outline-none focus:ring-1 focus:ring-white"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-300" aria-hidden="true" />
                        <span>Swap</span>
                      </button>
                    </div>
                  </div>

                  {def?.tips && (
                    <div className="text-xs text-neutral-300 bg-neutral-900 p-2.5 rounded-xl border border-neutral-850 leading-relaxed">
                      <strong className="text-white uppercase font-mono text-[10px] block mb-0.5">Form Cue:</strong>
                      {def.tips}
                    </div>
                  )}

                  {/* Granular Sets Table with Accessible Labels */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-mono font-bold text-neutral-400 px-1">
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
                            <label htmlFor={`ex-${exIdx}-set-${setIdx}-weight`} className="sr-only">
                              Set {setIdx + 1} Weight in kg
                            </label>
                            <input
                              id={`ex-${exIdx}-set-${setIdx}-weight`}
                              type="number"
                              step="any"
                              value={set.weightKg === 0 || set.weightKg === undefined ? '' : set.weightKg}
                              onChange={(e) => handleUpdateSetValue(exIdx, setIdx, 'weightKg', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                              placeholder="Weight (kg)"
                              className="w-full min-h-[44px] bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-center font-mono text-xs font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                            />
                          </div>

                          <div className="col-span-3">
                            <label htmlFor={`ex-${exIdx}-set-${setIdx}-reps`} className="sr-only">
                              Set {setIdx + 1} Repetitions
                            </label>
                            <input
                              id={`ex-${exIdx}-set-${setIdx}-reps`}
                              type="number"
                              step="1"
                              value={set.reps === 0 || set.reps === undefined ? '' : set.reps}
                              onChange={(e) => handleUpdateSetValue(exIdx, setIdx, 'reps', e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                              placeholder="Reps"
                              className="w-full min-h-[44px] bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 text-center font-mono text-xs font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                            />
                          </div>

                          <div className="col-span-3 flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSetComplete(exIdx, setIdx)}
                              aria-label={`Mark Set ${set.setNumber} of ${displayName} as ${set.completed ? 'incomplete' : 'complete'}`}
                              className={`w-full min-h-[44px] py-1.5 px-2 rounded-lg text-xs font-bold uppercase tracking-tight transition-all active:scale-95 flex items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-white ${
                                set.completed
                                  ? 'bg-white text-black font-black'
                                  : 'bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-white hover:border-neutral-500'
                              }`}
                            >
                              {set.completed ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[3]" aria-hidden="true" />
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
                      aria-label={`Add extra set to ${displayName}`}
                      className="min-h-[44px] px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white font-medium hover:bg-neutral-850 flex items-center gap-1.5 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-white"
                    >
                      <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Add Extra Set</span>
                    </button>

                    {ex.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(exIdx, ex.sets.length - 1)}
                        aria-label={`Remove last set from ${displayName}`}
                        className="min-h-[44px] text-neutral-400 hover:text-white text-xs flex items-center gap-1 p-2 focus:outline-none focus:ring-2 focus:ring-white"
                      >
                        <Trash2 className="w-3 h-3" aria-hidden="true" />
                        <span>Remove Last</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {completedCelebration && (
        <div 
          role="status" 
          aria-live="polite"
          className="p-5 rounded-2xl bg-neutral-950 border border-neutral-700 text-center animate-slideUp font-sans space-y-1"
        >
          <div className="flex items-center justify-center gap-1.5 text-white font-bold text-sm">
            <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
            <span>SESSION COMPLETED!</span>
          </div>
          <p className="text-xs text-neutral-300">
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
