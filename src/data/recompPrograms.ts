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
    if (EXERCISE_DATABASE[adaptation.replaceWithId]) {
      resolvedId = adaptation.replaceWithId;
      customAlternativeNote = `Beginner Scaled: ${adaptation.name}. ${adaptation.reason}`;
    } else {
      customAlternativeNote = `Beginner Guidance: Focus on controlled tempo and stability.`;
    }
  }

  const def = EXERCISE_DATABASE[resolvedId];
  if (!def) {
    throw new Error(`Exercise ${resolvedId} not found`);
  }

  const goalParams = PhysicsEngine.getGoalParameters(goal);
  const isCompound = def.mechanics === 'Compound';
  const isFemale = profile?.gender === 'female';

  const baseSets = setOverride !== undefined ? setOverride : def.defaultSets;

  // Gender Biomechanics: Muscle fiber type & metabolic clearance adaptation
  // Females possess higher Type I oxidative fibers & greater capillary density: higher rep endurance, faster recovery between sets
  // Males have higher Type II glycolytic fibers: heavier mechanical load, longer rest intervals needed for ATP re-synthesis
  let targetReps: string;
  let restSecs: number;

  if (isFemale) {
    if (isCompound) {
      targetReps = '10-12';
      restSecs = 75; // Shorter rest required due to superior muscle capillary perfusion
    } else {
      const isHighEndurance = ['cable_lateral_raise', 'thigh_abductor_machine', 'cable_glute_kickback', 'face_pull'].includes(resolvedId);
      targetReps = isHighEndurance ? '15-20' : '12-15';
      restSecs = 60;
    }
  } else {
    if (isCompound) {
      targetReps = goalParams.repRangeCompound;
      restSecs = goalParams.restSecsCompound;
    } else {
      targetReps = goalParams.repRangeAccessory;
      restSecs = goalParams.restSecsAccessory;
    }
  }

  // Calculate starting weight recommendation
  const suggestion = profile ? WeightSuggestionEngine.getSuggestedWeight(
    resolvedId,
    profile.gender || 'male',
    profile.currentWeightKg || 70,
    profile.proficiencyLevel || 'intermediate'
  ) : undefined;

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
    targetReps,
    restSecs,
    suggestedWeightKg: suggestion?.weightKg,
    suggestedWeightNote: customAlternativeNote || suggestion?.note,
    sets,
  };
}

export const BASE_WORKOUT_TEMPLATES = {
  // Off Day 1: Push / Upper Body
  offDay1_push: (date: string, fatigue: number = 3, goal: FitnessGoal = 'body_recomposition', profile?: UserProfile): WorkoutSession => {
    const setDrop = fatigue >= 8 ? 2 : fatigue >= 6 ? 1 : 0;
    const goalParams = PhysicsEngine.getGoalParameters(goal);
    const isBeginner = profile?.proficiencyLevel === 'absolute_beginner';
    const isFemale = profile?.gender === 'female';

    // Female upper body volume adaptation: higher fatigue resistance (higher rep ranges / slightly more delt accessory volume, moderate pec pressing)
    const femaleExercises = [
      createExerciseLog('incline_db_press', Math.max(2, 3 - (setDrop > 1 ? 1 : 0)), goal, profile),
      createExerciseLog('cable_lateral_raise', Math.max(3, 4 - setDrop), goal, profile),
      createExerciseLog('cable_fly', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('tricep_rope_pushdown', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('overhead_cable_extension', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('hanging_leg_raise', Math.max(2, 3 - setDrop), goal, profile),
    ];

    const maleExercises = [
      createExerciseLog('incline_db_press', Math.max(2, 4 - (setDrop > 1 ? 1 : 0)), goal, profile),
      createExerciseLog('flat_db_press', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('cable_lateral_raise', Math.max(2, 4 - setDrop), goal, profile),
      createExerciseLog('cable_fly', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('tricep_rope_pushdown', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('overhead_cable_extension', Math.max(2, 3 - setDrop), goal, profile),
    ];

    return {
      id: `push_${date}`,
      date,
      title: isBeginner 
        ? (isFemale ? 'Foundational Push & Shoulder Sculpt' : 'Foundational Push: Chest & Shoulder Mechanics')
        : (isFemale ? 'Upper Body Push: Delt Definition & Core' : 'Heavy Push: Upper Chest & Delts'),
      category: 'Push',
      intensity: isBeginner ? 'Maintenance Express' : 'Heavy Hypertrophy',
      targetDurationMin: goal === 'lean_muscle' ? 45 : 55,
      fatigueScoreAtStart: fatigue,
      autoAdjustedReason: isBeginner
        ? 'Beginner Profile: Scaled to machine-supported & dumbbell stability movements with conservative starting weights.'
        : isFemale
        ? 'Female Biomechanics Profile: Prioritized lateral delt caps, clavicular chest, and core stability with higher endurance resistance.'
        : setDrop > 0 
        ? `CNS Fatigue (${fatigue}/10) detected. Auto-reduced accessory volume by ${setDrop} set(s). Goal: ${goalParams.label}.` 
        : `Tailored for ${goalParams.label}: ${goalParams.trainingStyle}`,
      completed: false,
      exercises: isFemale ? femaleExercises : maleExercises,
    };
  },

  // Off Day 2: Legs & Lower Body
  offDay2_legs: (date: string, fatigue: number = 3, goal: FitnessGoal = 'body_recomposition', profile?: UserProfile): WorkoutSession => {
    const setDrop = fatigue >= 8 ? 2 : fatigue >= 6 ? 1 : 0;
    const goalParams = PhysicsEngine.getGoalParameters(goal);
    const isBeginner = profile?.proficiencyLevel === 'absolute_beginner';
    const isFemale = profile?.gender === 'female';

    // Female lower body specialization: Barbell Hip Thrust & Hip Abduction take precedence over purely quad-dominant axial loading
    const femaleExercises = [
      createExerciseLog('barbell_hip_thrust', Math.max(3, 4 - (setDrop > 1 ? 1 : 0)), goal, profile),
      createExerciseLog('romanian_deadlift', Math.max(3, 4 - setDrop), goal, profile),
      createExerciseLog('hack_squat', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('seated_leg_curl', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('thigh_abductor_machine', Math.max(3, 4 - setDrop), goal, profile),
      createExerciseLog('standing_calf_raise', Math.max(2, 3 - setDrop), goal, profile),
    ];

    const maleExercises = [
      createExerciseLog('hack_squat', Math.max(2, 4 - (setDrop > 1 ? 1 : 0)), goal, profile),
      createExerciseLog('romanian_deadlift', Math.max(2, 4 - setDrop), goal, profile),
      createExerciseLog('leg_extension', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('seated_leg_curl', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('standing_calf_raise', Math.max(2, 4 - setDrop), goal, profile),
      createExerciseLog('hanging_leg_raise', Math.max(2, 3 - setDrop), goal, profile),
    ];

    return {
      id: `legs_${date}`,
      date,
      title: isBeginner 
        ? (isFemale ? 'Foundational Glutes & Legs: Hip Hinge & Sled Press' : 'Foundational Legs: Quad Press & Knee Stability')
        : (isFemale ? 'Glute & Posterior Specialization: Hip Thrust & Hams' : 'Heavy Legs: Quad Sweep & Hams'),
      category: 'Legs',
      intensity: isBeginner ? 'Maintenance Express' : 'Heavy Hypertrophy',
      targetDurationMin: goal === 'lean_muscle' ? 50 : 60,
      fatigueScoreAtStart: fatigue,
      autoAdjustedReason: isBeginner
        ? 'Beginner Profile: Axial load eliminated. Guided sled and hip hinge machines selected for safe motor learning.'
        : isFemale
        ? 'Female Biomechanics Profile: Prioritized pelvic drive (Hip Thrusts), Gluteus Medius abduction, and posterior chain tension with higher mechanical tension.'
        : setDrop > 0 
        ? `CNS Fatigue (${fatigue}/10) detected. Decreased high-axial volume by ${setDrop} set(s). Goal: ${goalParams.label}.` 
        : `Tailored for ${goalParams.label}: ${goalParams.trainingStyle}`,
      completed: false,
      exercises: isFemale ? femaleExercises : maleExercises,
    };
  },

  // Off Day 3: Pull & Posterior Delts
  offDay3_pull: (date: string, fatigue: number = 3, goal: FitnessGoal = 'body_recomposition', profile?: UserProfile): WorkoutSession => {
    const setDrop = fatigue >= 8 ? 2 : fatigue >= 6 ? 1 : 0;
    const goalParams = PhysicsEngine.getGoalParameters(goal);
    const isBeginner = profile?.proficiencyLevel === 'absolute_beginner';
    const isFemale = profile?.gender === 'female';

    // Female pull specialization: V-taper lat width and rear delt posture work, plus cable glute burn finisher
    const femaleExercises = [
      createExerciseLog('lat_pulldown', Math.max(2, 4 - (setDrop > 1 ? 1 : 0)), goal, profile),
      createExerciseLog('chest_supported_row', Math.max(2, 4 - setDrop), goal, profile),
      createExerciseLog('face_pull', Math.max(3, 4 - setDrop), goal, profile),
      createExerciseLog('single_arm_cable_row', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('cable_glute_kickback', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('incline_db_curl', Math.max(2, 3 - setDrop), goal, profile),
    ];

    const maleExercises = [
      createExerciseLog('lat_pulldown', Math.max(2, 4 - (setDrop > 1 ? 1 : 0)), goal, profile),
      createExerciseLog('chest_supported_row', Math.max(2, 4 - setDrop), goal, profile),
      createExerciseLog('single_arm_cable_row', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('face_pull', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('incline_db_curl', Math.max(2, 3 - setDrop), goal, profile),
      createExerciseLog('hammer_curl', Math.max(2, 3 - setDrop), goal, profile),
    ];

    return {
      id: `pull_${date}`,
      date,
      title: isBeginner 
        ? (isFemale ? 'Foundational Back & Posture: Cable Lat & Rear Delt Control' : 'Foundational Pull: Lat Pulldown & Joint Control')
        : (isFemale ? 'Aesthetic V-Taper Pull: Lat Width, Rear Delts & Glutes' : 'Heavy Pull: Lat Width & Arms'),
      category: 'Pull',
      intensity: isBeginner ? 'Maintenance Express' : 'Heavy Hypertrophy',
      targetDurationMin: goal === 'lean_muscle' ? 45 : 55,
      fatigueScoreAtStart: fatigue,
      autoAdjustedReason: isBeginner
        ? 'Beginner Profile: Cable-guided vertical and chest-supported rows to establish scapular retraction control.'
        : isFemale
        ? 'Female Biomechanics Profile: Balanced waist-to-shoulder ratio (V-taper lat width), scapular retraction for shift posture, and unilateral glute finish.'
        : setDrop > 0 
        ? `Fatigue (${fatigue}/10) factored in. Scaled back arm/delt sets to ensure recovery before 12h shifts. Goal: ${goalParams.label}.` 
        : `Tailored for ${goalParams.label}: ${goalParams.trainingStyle}`,
      completed: false,
      exercises: isFemale ? femaleExercises : maleExercises,
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
      const isFemale = profile?.gender === 'female';
      return {
        id: `shift_maint_${date}`,
        date,
        title: isFemale ? 'Shift 2: Express Tone & Glute Activation (20m)' : 'Shift 2: Express Muscle Pump (20m)',
        category: 'Shift Maintenance',
        intensity: 'Maintenance Express',
        targetDurationMin: 20,
        completed: false,
        autoAdjustedReason: isFemale
          ? 'Low CNS impact maintenance: Promotes lymphatic circulation, lateral shoulder tone, and glute activation between 12h shifts.'
          : 'Low CNS impact session designed to sustain muscle protein synthesis and glycogen flow between 12h shifts.',
        exercises: [
          createExerciseLog('shift_pump_circuit', 2, 'body_recomposition', profile),
          createExerciseLog('cable_lateral_raise', 2, 'body_recomposition', profile),
          createExerciseLog(isFemale ? 'cable_glute_kickback' : 'seated_leg_curl', 2, 'body_recomposition', profile),
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
