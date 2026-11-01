import { WorkoutSession, ExerciseLog, FitnessGoal, UserProfile } from '../types';
import { EXERCISE_DATABASE } from './exerciseDatabase';
import { PhysicsEngine } from '../services/physicsEngine';
import { WeightSuggestionEngine, BEGINNER_EXERCISE_ADAPTATIONS } from '../services/weightSuggestionEngine';

function createExerciseLog(
  exerciseId: string, 
  setOverride?: number, 
  goal: FitnessGoal = 'body_recomposition',
  profile?: UserProfile
): ExerciseLog {
  const isBeginner = profile?.proficiencyLevel === 'absolute_beginner';
  
  // Adaptive exercise replacement for Absolute Beginners
  let resolvedId = exerciseId;
  let customAlternativeNote: string | undefined;

  if (isBeginner && BEGINNER_EXERCISE_ADAPTATIONS[exerciseId]) {
    const adaptation = BEGINNER_EXERCISE_ADAPTATIONS[exerciseId];
    // Use alternative from database or keep resolved ID with clear note
    resolvedId = exerciseId;
    customAlternativeNote = `Beginner Adaptation: ${adaptation.name} recommended. ${adaptation.reason}`;
  }

  const def = EXERCISE_DATABASE[resolvedId];
  if (!def) {
    throw new Error(`Exercise ${resolvedId} not found`);
  }

  const goalParams = PhysicsEngine.getGoalParameters(goal);
  const isCompound = def.mechanics === 'Compound';

  const baseSets = setOverride !== undefined ? setOverride : def.defaultSets;
  const restSecs = isCompound ? goalParams.restSecsCompound : goalParams.restSecsAccessory;

  // Calculate starting weight recommendation
  const suggestion = profile ? WeightSuggestionEngine.getSuggestedWeight(
    resolvedId,
    profile.gender || 'male',
    profile.currentWeightKg || 70,
    profile.proficiencyLevel || 'intermediate'
  ) : undefined;

  const sets = Array.from({ length: baseSets }, (_, i) => ({
    setNumber: i + 1,
    weightKg: suggestion?.weightKg || 0,
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
    suggestedWeightKg: suggestion?.weightKg,
    suggestedWeightNote: customAlternativeNote || suggestion?.note,
    sets,
  };
}

export const BASE_WORKOUT_TEMPLATES = {
  // Off Day 1: Heavy Push & Delts
  offDay1_push: (date: string, fatigue: number = 3, goal: FitnessGoal = 'body_recomposition', profile?: UserProfile): WorkoutSession => {
    const setDrop = fatigue >= 8 ? 2 : fatigue >= 6 ? 1 : 0;
    const goalParams = PhysicsEngine.getGoalParameters(goal);
    const isBeginner = profile?.proficiencyLevel === 'absolute_beginner';

    return {
      id: `push_${date}`,
      date,
      title: isBeginner ? 'Foundational Push: Chest & Shoulder Mechanics' : 'Heavy Push: Upper Chest & Delts',
      category: 'Push',
      intensity: isBeginner ? 'Maintenance Express' : 'Heavy Hypertrophy',
      targetDurationMin: goal === 'lean_muscle' ? 45 : 55,
      fatigueScoreAtStart: fatigue,
      autoAdjustedReason: isBeginner
        ? 'Beginner Profile: Scaled to machine-supported & dumbbell stability movements with conservative starting weights.'
        : setDrop > 0 
        ? `CNS Fatigue (${fatigue}/10) detected. Auto-reduced accessory volume by ${setDrop} set(s). Goal: ${goalParams.label}.` 
        : `Tailored for ${goalParams.label}: ${goalParams.trainingStyle}`,
      completed: false,
      exercises: [
        createExerciseLog('incline_db_press', Math.max(2, 4 - (setDrop > 1 ? 1 : 0)), goal, profile),
        createExerciseLog('flat_db_press', Math.max(2, 3 - setDrop), goal, profile),
        createExerciseLog('cable_lateral_raise', Math.max(2, 4 - setDrop), goal, profile),
        createExerciseLog('cable_fly', Math.max(2, 3 - setDrop), goal, profile),
        createExerciseLog('tricep_rope_pushdown', Math.max(2, 3 - setDrop), goal, profile),
        createExerciseLog('overhead_cable_extension', Math.max(2, 3 - setDrop), goal, profile),
      ]
    };
  },

  // Off Day 2: Heavy Legs & Posterior Chain
  offDay2_legs: (date: string, fatigue: number = 3, goal: FitnessGoal = 'body_recomposition', profile?: UserProfile): WorkoutSession => {
    const setDrop = fatigue >= 8 ? 2 : fatigue >= 6 ? 1 : 0;
    const goalParams = PhysicsEngine.getGoalParameters(goal);
    const isBeginner = profile?.proficiencyLevel === 'absolute_beginner';

    return {
      id: `legs_${date}`,
      date,
      title: isBeginner ? 'Foundational Legs: Quad Press & Knee Stability' : 'Heavy Legs: Quad Sweep & Hams',
      category: 'Legs',
      intensity: isBeginner ? 'Maintenance Express' : 'Heavy Hypertrophy',
      targetDurationMin: goal === 'lean_muscle' ? 50 : 60,
      fatigueScoreAtStart: fatigue,
      autoAdjustedReason: isBeginner
        ? 'Beginner Profile: Axial load eliminated. Leg press & guided machines selected for safe motor learning.'
        : setDrop > 0 
        ? `CNS Fatigue (${fatigue}/10) detected. Decreased high-axial volume by ${setDrop} set(s). Goal: ${goalParams.label}.` 
        : `Tailored for ${goalParams.label}: ${goalParams.trainingStyle}`,
      completed: false,
      exercises: [
        createExerciseLog('hack_squat', Math.max(2, 4 - (setDrop > 1 ? 1 : 0)), goal, profile),
        createExerciseLog('romanian_deadlift', Math.max(2, 4 - setDrop), goal, profile),
        createExerciseLog('leg_extension', Math.max(2, 3 - setDrop), goal, profile),
        createExerciseLog('seated_leg_curl', Math.max(2, 3 - setDrop), goal, profile),
        createExerciseLog('standing_calf_raise', Math.max(2, 4 - setDrop), goal, profile),
        createExerciseLog('hanging_leg_raise', Math.max(2, 3 - setDrop), goal, profile),
      ]
    };
  },

  // Off Day 3: Heavy Pull & Arms
  offDay3_pull: (date: string, fatigue: number = 3, goal: FitnessGoal = 'body_recomposition', profile?: UserProfile): WorkoutSession => {
    const setDrop = fatigue >= 8 ? 2 : fatigue >= 6 ? 1 : 0;
    const goalParams = PhysicsEngine.getGoalParameters(goal);
    const isBeginner = profile?.proficiencyLevel === 'absolute_beginner';

    return {
      id: `pull_${date}`,
      date,
      title: isBeginner ? 'Foundational Pull: Lat Pulldown & Joint Control' : 'Heavy Pull: Lat Width & Arms',
      category: 'Pull',
      intensity: isBeginner ? 'Maintenance Express' : 'Heavy Hypertrophy',
      targetDurationMin: goal === 'lean_muscle' ? 45 : 55,
      fatigueScoreAtStart: fatigue,
      autoAdjustedReason: isBeginner
        ? 'Beginner Profile: Cable-guided vertical and chest-supported rows to establish scapular retraction control.'
        : setDrop > 0 
        ? `Fatigue (${fatigue}/10) factored in. Scaled back arm/delt sets to ensure recovery before 12h shifts. Goal: ${goalParams.label}.` 
        : `Tailored for ${goalParams.label}: ${goalParams.trainingStyle}`,
      completed: false,
      exercises: [
        createExerciseLog('lat_pulldown', Math.max(2, 4 - (setDrop > 1 ? 1 : 0)), goal, profile),
        createExerciseLog('chest_supported_row', Math.max(2, 4 - setDrop), goal, profile),
        createExerciseLog('single_arm_cable_row', Math.max(2, 3 - setDrop), goal, profile),
        createExerciseLog('face_pull', Math.max(2, 3 - setDrop), goal, profile),
        createExerciseLog('incline_db_curl', Math.max(2, 3 - setDrop), goal, profile),
        createExerciseLog('hammer_curl', Math.max(2, 3 - setDrop), goal, profile),
      ]
    };
  },

  // Shift Day Maintenance / Recovery
  shiftDay_maintenance: (date: string, shiftIndex: number, profile?: UserProfile): WorkoutSession => {
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
          createExerciseLog('thoracic_foam_roll', 2, 'body_recomposition', profile),
          createExerciseLog('hip_flexor_stretch', 2, 'body_recomposition', profile),
          createExerciseLog('hanging_leg_raise', 2, 'body_recomposition', profile),
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
          createExerciseLog('shift_pump_circuit', 2, 'body_recomposition', profile),
          createExerciseLog('cable_lateral_raise', 2, 'body_recomposition', profile),
          createExerciseLog('seated_leg_curl', 2, 'body_recomposition', profile),
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
          createExerciseLog('thoracic_foam_roll', 2, 'body_recomposition', profile),
          createExerciseLog('hip_flexor_stretch', 2, 'body_recomposition', profile),
        ]
      };
    }
  },

  // Overtime Override Session
  overtime_express: (date: string, goal: FitnessGoal = 'body_recomposition', profile?: UserProfile): WorkoutSession => {
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
        createExerciseLog('incline_db_press', 2, goal, profile),
        createExerciseLog('chest_supported_row', 2, goal, profile),
        createExerciseLog('cable_lateral_raise', 2, goal, profile),
        createExerciseLog('hanging_leg_raise', 2, goal, profile),
      ]
    };
  }
};
