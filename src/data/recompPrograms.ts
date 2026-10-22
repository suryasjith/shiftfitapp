import { WorkoutSession, ExerciseLog } from '../types';
import { EXERCISE_DATABASE } from './exerciseDatabase';

function createExerciseLog(exerciseId: string, setOverride?: number): ExerciseLog {
  const def = EXERCISE_DATABASE[exerciseId];
  if (!def) {
    throw new Error(`Exercise ${exerciseId} not found`);
  }
  const setCount = setOverride !== undefined ? setOverride : def.defaultSets;
  const sets = Array.from({ length: setCount }, (_, i) => ({
    setNumber: i + 1,
    weightKg: 0,
    reps: 0,
    completed: false,
    isWarmup: i === 0 && def.cnsLoad === 'High',
  }));

  return {
    exerciseId: def.id,
    exerciseName: def.name,
    targetMuscle: def.targetMuscle,
    equipmentTaken: false,
    prescribedSets: setCount,
    restSecs: def.defaultRestSecs,
    sets,
  };
}

export const BASE_WORKOUT_TEMPLATES = {
  // Off Day 1: Heavy Push & Delts
  offDay1_push: (date: string, fatigue: number = 3): WorkoutSession => {
    // If fatigue >= 7, reduce sets by 1-2
    const setDrop = fatigue >= 8 ? 2 : fatigue >= 6 ? 1 : 0;
    return {
      id: `push_${date}`,
      date,
      title: 'Heavy Push: Upper Chest & Side Delts',
      category: 'Push',
      intensity: 'Heavy Hypertrophy',
      targetDurationMin: 55,
      fatigueScoreAtStart: fatigue,
      autoAdjustedReason: setDrop > 0 ? `CNS Fatigue score (${fatigue}/10) detected. Auto-reduced accessory volume by ${setDrop} set(s) to optimize recovery.` : undefined,
      completed: false,
      exercises: [
        createExerciseLog('incline_db_press', Math.max(2, 4 - (setDrop > 1 ? 1 : 0))),
        createExerciseLog('flat_db_press', Math.max(2, 3 - setDrop)),
        createExerciseLog('cable_lateral_raise', Math.max(2, 4 - setDrop)),
        createExerciseLog('cable_fly', Math.max(2, 3 - setDrop)),
        createExerciseLog('tricep_rope_pushdown', Math.max(2, 3 - setDrop)),
        createExerciseLog('overhead_cable_extension', Math.max(2, 3 - setDrop)),
      ]
    };
  },

  // Off Day 2: Heavy Legs & Posterior Chain
  offDay2_legs: (date: string, fatigue: number = 3): WorkoutSession => {
    const setDrop = fatigue >= 8 ? 2 : fatigue >= 6 ? 1 : 0;
    return {
      id: `legs_${date}`,
      date,
      title: 'Heavy Legs: Quad Sweep & Hamstring Density',
      category: 'Legs',
      intensity: 'Heavy Hypertrophy',
      targetDurationMin: 60,
      fatigueScoreAtStart: fatigue,
      autoAdjustedReason: setDrop > 0 ? `CNS Fatigue score (${fatigue}/10) detected. Decreased high-axial volume by ${setDrop} set(s) to protect lower back and nervous system.` : undefined,
      completed: false,
      exercises: [
        createExerciseLog('hack_squat', Math.max(2, 4 - (setDrop > 1 ? 1 : 0))),
        createExerciseLog('romanian_deadlift', Math.max(2, 4 - setDrop)),
        createExerciseLog('leg_extension', Math.max(2, 3 - setDrop)),
        createExerciseLog('seated_leg_curl', Math.max(2, 3 - setDrop)),
        createExerciseLog('standing_calf_raise', Math.max(2, 4 - setDrop)),
        createExerciseLog('hanging_leg_raise', Math.max(2, 3 - setDrop)),
      ]
    };
  },

  // Off Day 3: Heavy Pull & Arms
  offDay3_pull: (date: string, fatigue: number = 3): WorkoutSession => {
    const setDrop = fatigue >= 8 ? 2 : fatigue >= 6 ? 1 : 0;
    return {
      id: `pull_${date}`,
      date,
      title: 'Heavy Pull: Lat Width, Upper Thickness & Arms',
      category: 'Pull',
      intensity: 'Heavy Hypertrophy',
      targetDurationMin: 55,
      fatigueScoreAtStart: fatigue,
      autoAdjustedReason: setDrop > 0 ? `Fatigue level (${fatigue}/10) factored in. Scaled back accessory arm/delt sets to ensure recovery before 12h shift cycle.` : undefined,
      completed: false,
      exercises: [
        createExerciseLog('lat_pulldown', Math.max(2, 4 - (setDrop > 1 ? 1 : 0))),
        createExerciseLog('chest_supported_row', Math.max(2, 4 - setDrop)),
        createExerciseLog('single_arm_cable_row', Math.max(2, 3 - setDrop)),
        createExerciseLog('face_pull', Math.max(2, 3 - setDrop)),
        createExerciseLog('incline_db_curl', Math.max(2, 3 - setDrop)),
        createExerciseLog('hammer_curl', Math.max(2, 3 - setDrop)),
      ]
    };
  },

  // Shift Day Maintenance / Recovery
  shiftDay_maintenance: (date: string, shiftIndex: number): WorkoutSession => {
    if (shiftIndex === 0) {
      // Shift 1: Spinal Decompression & Deep Mobility
      return {
        id: `shift_decomp_${date}`,
        date,
        title: 'Shift 1: Spinal Decompression & Mobility',
        category: 'Mobility',
        intensity: 'CNS Mobility & Recovery',
        targetDurationMin: 15,
        completed: false,
        autoAdjustedReason: '12-Hour Shift Day: Central nervous system prioritized. Decompressing spine and restoring hip mobility.',
        exercises: [
          createExerciseLog('thoracic_foam_roll', 2),
          createExerciseLog('hip_flexor_stretch', 2),
          createExerciseLog('hanging_leg_raise', 2),
        ]
      };
    } else if (shiftIndex === 1) {
      // Shift 2: 20-min Maintenance Flush
      return {
        id: `shift_maint_${date}`,
        date,
        title: 'Shift 2: Express Muscle Protein Flush (20 Min)',
        category: 'Shift Maintenance',
        intensity: 'Maintenance Express',
        targetDurationMin: 20,
        completed: false,
        autoAdjustedReason: 'Low CNS impact session designed to sustain muscle protein synthesis and glycogen flow between 12h shifts.',
        exercises: [
          createExerciseLog('shift_pump_circuit', 2),
          createExerciseLog('cable_lateral_raise', 2),
          createExerciseLog('seated_leg_curl', 2),
        ]
      };
    } else {
      // Shift 3 & 4: Rest / Recovery
      return {
        id: `shift_rest_${date}`,
        date,
        title: shiftIndex === 3 ? 'Shift 4: Pre-Off Rest & CNS Priming' : 'Shift 3: Deep CNS Sleep & Rest Day',
        category: 'Rest',
        intensity: 'Rest / Deload',
        targetDurationMin: 10,
        completed: false,
        autoAdjustedReason: 'High work fatigue window. Complete rest recommended to prepare for high-volume off-day lifting block.',
        exercises: [
          createExerciseLog('thoracic_foam_roll', 2),
          createExerciseLog('hip_flexor_stretch', 2),
        ]
      };
    }
  },

  // Overtime Override Session (when user picks up OT on an off-day)
  overtime_express: (date: string): WorkoutSession => {
    return {
      id: `ot_express_${date}`,
      date,
      title: '⚠️ Overtime Shift: CNS-Sparing Express Session',
      category: 'Shift Maintenance',
      intensity: 'Maintenance Express',
      targetDurationMin: 25,
      completed: false,
      autoAdjustedReason: 'Overtime shift detected on scheduled off-day. Algorithm auto-converted heavy session to high-density 25-min express to prevent CNS crash.',
      exercises: [
        createExerciseLog('incline_db_press', 2),
        createExerciseLog('chest_supported_row', 2),
        createExerciseLog('cable_lateral_raise', 2),
        createExerciseLog('hanging_leg_raise', 2),
      ]
    };
  }
};
