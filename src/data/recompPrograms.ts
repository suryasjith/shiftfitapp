import { WorkoutSession, ExerciseLog, FitnessGoal } from '../types';
import { EXERCISE_DATABASE } from './exerciseDatabase';
import { PhysicsEngine } from '../services/physicsEngine';

function createExerciseLog(
  exerciseId: string, 
  setOverride?: number, 
  goal: FitnessGoal = 'body_recomposition'
): ExerciseLog {
  const def = EXERCISE_DATABASE[exerciseId];
  if (!def) {
    throw new Error(`Exercise ${exerciseId} not found`);
  }

  const goalParams = PhysicsEngine.getGoalParameters(goal);
  const isCompound = def.mechanics === 'Compound';

  const baseSets = setOverride !== undefined ? setOverride : def.defaultSets;
  const restSecs = isCompound ? goalParams.restSecsCompound : goalParams.restSecsAccessory;

  const sets = Array.from({ length: baseSets }, (_, i) => ({
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
    prescribedSets: baseSets,
    restSecs,
    sets,
  };
}

export const BASE_WORKOUT_TEMPLATES = {
  // Off Day 1: Heavy Push & Delts
  offDay1_push: (date: string, fatigue: number = 3, goal: FitnessGoal = 'body_recomposition'): WorkoutSession => {
    const setDrop = fatigue >= 8 ? 2 : fatigue >= 6 ? 1 : 0;
    const goalParams = PhysicsEngine.getGoalParameters(goal);

    return {
      id: `push_${date}`,
      date,
      title: 'Heavy Push: Upper Chest & Delts',
      category: 'Push',
      intensity: 'Heavy Hypertrophy',
      targetDurationMin: goal === 'lean_muscle' ? 45 : 55,
      fatigueScoreAtStart: fatigue,
      autoAdjustedReason: setDrop > 0 
        ? `CNS Fatigue (${fatigue}/10) detected. Auto-reduced accessory volume by ${setDrop} set(s). Goal: ${goalParams.label}.` 
        : `Tailored for ${goalParams.label}: ${goalParams.trainingStyle}`,
      completed: false,
      exercises: [
        createExerciseLog('incline_db_press', Math.max(2, 4 - (setDrop > 1 ? 1 : 0)), goal),
        createExerciseLog('flat_db_press', Math.max(2, 3 - setDrop), goal),
        createExerciseLog('cable_lateral_raise', Math.max(2, 4 - setDrop), goal),
        createExerciseLog('cable_fly', Math.max(2, 3 - setDrop), goal),
        createExerciseLog('tricep_rope_pushdown', Math.max(2, 3 - setDrop), goal),
        createExerciseLog('overhead_cable_extension', Math.max(2, 3 - setDrop), goal),
      ]
    };
  },

  // Off Day 2: Heavy Legs & Posterior Chain
  offDay2_legs: (date: string, fatigue: number = 3, goal: FitnessGoal = 'body_recomposition'): WorkoutSession => {
    const setDrop = fatigue >= 8 ? 2 : fatigue >= 6 ? 1 : 0;
    const goalParams = PhysicsEngine.getGoalParameters(goal);

    return {
      id: `legs_${date}`,
      date,
      title: 'Heavy Legs: Quad Sweep & Hams',
      category: 'Legs',
      intensity: 'Heavy Hypertrophy',
      targetDurationMin: goal === 'lean_muscle' ? 50 : 60,
      fatigueScoreAtStart: fatigue,
      autoAdjustedReason: setDrop > 0 
        ? `CNS Fatigue (${fatigue}/10) detected. Decreased high-axial volume by ${setDrop} set(s). Goal: ${goalParams.label}.` 
        : `Tailored for ${goalParams.label}: ${goalParams.trainingStyle}`,
      completed: false,
      exercises: [
        createExerciseLog('hack_squat', Math.max(2, 4 - (setDrop > 1 ? 1 : 0)), goal),
        createExerciseLog('romanian_deadlift', Math.max(2, 4 - setDrop), goal),
        createExerciseLog('leg_extension', Math.max(2, 3 - setDrop), goal),
        createExerciseLog('seated_leg_curl', Math.max(2, 3 - setDrop), goal),
        createExerciseLog('standing_calf_raise', Math.max(2, 4 - setDrop), goal),
        createExerciseLog('hanging_leg_raise', Math.max(2, 3 - setDrop), goal),
      ]
    };
  },

  // Off Day 3: Heavy Pull & Arms
  offDay3_pull: (date: string, fatigue: number = 3, goal: FitnessGoal = 'body_recomposition'): WorkoutSession => {
    const setDrop = fatigue >= 8 ? 2 : fatigue >= 6 ? 1 : 0;
    const goalParams = PhysicsEngine.getGoalParameters(goal);

    return {
      id: `pull_${date}`,
      date,
      title: 'Heavy Pull: Lat Width & Arms',
      category: 'Pull',
      intensity: 'Heavy Hypertrophy',
      targetDurationMin: goal === 'lean_muscle' ? 45 : 55,
      fatigueScoreAtStart: fatigue,
      autoAdjustedReason: setDrop > 0 
        ? `Fatigue (${fatigue}/10) factored in. Scaled back arm/delt sets to ensure recovery before 12h shifts. Goal: ${goalParams.label}.` 
        : `Tailored for ${goalParams.label}: ${goalParams.trainingStyle}`,
      completed: false,
      exercises: [
        createExerciseLog('lat_pulldown', Math.max(2, 4 - (setDrop > 1 ? 1 : 0)), goal),
        createExerciseLog('chest_supported_row', Math.max(2, 4 - setDrop), goal),
        createExerciseLog('single_arm_cable_row', Math.max(2, 3 - setDrop), goal),
        createExerciseLog('face_pull', Math.max(2, 3 - setDrop), goal),
        createExerciseLog('incline_db_curl', Math.max(2, 3 - setDrop), goal),
        createExerciseLog('hammer_curl', Math.max(2, 3 - setDrop), goal),
      ]
    };
  },

  // Shift Day Maintenance / Recovery
  shiftDay_maintenance: (date: string, shiftIndex: number): WorkoutSession => {
    if (shiftIndex === 0) {
      return {
        id: `shift_decomp_${date}`,
        date,
        title: 'Shift 1: Spine Decompress & Mobility',
        category: 'Mobility',
        intensity: 'CNS Mobility & Recovery',
        targetDurationMin: 15,
        completed: false,
        autoAdjustedReason: '12-Hour Shift: Decompressing lumbar spine and restoring hip flexor length after long standing/sitting.',
        exercises: [
          createExerciseLog('thoracic_foam_roll', 2),
          createExerciseLog('hip_flexor_stretch', 2),
          createExerciseLog('hanging_leg_raise', 2),
        ]
      };
    } else if (shiftIndex === 1) {
      return {
        id: `shift_maint_${date}`,
        date,
        title: 'Shift 2: Express Muscle Pump (20m)',
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
      return {
        id: `shift_rest_${date}`,
        date,
        title: `Shift ${shiftIndex + 1}: Deep CNS Recovery`,
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

  // Overtime Override Session
  overtime_express: (date: string, goal: FitnessGoal = 'body_recomposition'): WorkoutSession => {
    return {
      id: `ot_express_${date}`,
      date,
      title: '⚠️ Overtime Shift: Express Session (25m)',
      category: 'Shift Maintenance',
      intensity: 'Maintenance Express',
      targetDurationMin: 25,
      completed: false,
      autoAdjustedReason: 'Overtime shift detected. Scaled to high-density 25-minute workout to preserve systemic CNS reserve.',
      exercises: [
        createExerciseLog('incline_db_press', 2, goal),
        createExerciseLog('chest_supported_row', 2, goal),
        createExerciseLog('cable_lateral_raise', 2, goal),
        createExerciseLog('hanging_leg_raise', 2, goal),
      ]
    };
  }
};
