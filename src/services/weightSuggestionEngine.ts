import { Gender, ProficiencyLevel } from '../types';

export interface StartingWeightRecommendation {
  weightKg: number;
  label: string;
  isBodyweight: boolean;
  note: string;
}

/**
 * Exercise Equipment Type for baseline calibration
 */
type ExerciseLoadPattern = 
  | 'dumbbell_bilateral' // E.g. Incline DB press (per hand)
  | 'dumbbell_goblet'    // E.g. Single dumbbell held at chest
  | 'dumbbell_hinge'     // E.g. Dumbbell RDL (total or per hand)
  | 'cable_compound'     // E.g. Lat pulldown
  | 'cable_isolation'    // E.g. Lateral raise, pushdown, face pull
  | 'machine_compound'   // E.g. Hack squat, chest press machine, leg press
  | 'machine_isolation'  // E.g. Leg extension, leg curl, calf raise
  | 'bodyweight_only';   // E.g. Foam roll, stretches, captain's chair leg raise

interface ExerciseConfig {
  loadPattern: ExerciseLoadPattern;
  // Multipliers relative to bodyweight for [male_beginner, female_beginner]
  baseRatio: {
    male_beginner: number;
    female_beginner: number;
  };
  minWeightKg: number;
  maxInitialKg: number;
  incrementKg: number;
  unitLabel: string;
}

const EXERCISE_CONFIGS: Record<string, ExerciseConfig> = {
  // PUSH
  'incline_db_press': {
    loadPattern: 'dumbbell_bilateral',
    baseRatio: { male_beginner: 0.16, female_beginner: 0.10 },
    minWeightKg: 4,
    maxInitialKg: 30,
    incrementKg: 2,
    unitLabel: 'per dumbbell'
  },
  'flat_db_press': {
    loadPattern: 'dumbbell_bilateral',
    baseRatio: { male_beginner: 0.18, female_beginner: 0.12 },
    minWeightKg: 4,
    maxInitialKg: 32,
    incrementKg: 2,
    unitLabel: 'per dumbbell'
  },
  'cable_lateral_raise': {
    loadPattern: 'cable_isolation',
    baseRatio: { male_beginner: 0.06, female_beginner: 0.04 },
    minWeightKg: 2.5,
    maxInitialKg: 12.5,
    incrementKg: 1.25,
    unitLabel: 'pin weight'
  },
  'cable_fly': {
    loadPattern: 'cable_isolation',
    baseRatio: { male_beginner: 0.10, female_beginner: 0.06 },
    minWeightKg: 2.5,
    maxInitialKg: 20,
    incrementKg: 2.5,
    unitLabel: 'per side'
  },
  'tricep_rope_pushdown': {
    loadPattern: 'cable_isolation',
    baseRatio: { male_beginner: 0.18, female_beginner: 0.12 },
    minWeightKg: 5,
    maxInitialKg: 35,
    incrementKg: 2.5,
    unitLabel: 'stack pin'
  },
  'overhead_cable_extension': {
    loadPattern: 'cable_isolation',
    baseRatio: { male_beginner: 0.14, female_beginner: 0.08 },
    minWeightKg: 5,
    maxInitialKg: 25,
    incrementKg: 2.5,
    unitLabel: 'stack pin'
  },

  // PULL
  'lat_pulldown': {
    loadPattern: 'cable_compound',
    baseRatio: { male_beginner: 0.45, female_beginner: 0.32 },
    minWeightKg: 15,
    maxInitialKg: 70,
    incrementKg: 5,
    unitLabel: 'stack pin'
  },
  'chest_supported_row': {
    loadPattern: 'machine_compound',
    baseRatio: { male_beginner: 0.35, female_beginner: 0.22 },
    minWeightKg: 10,
    maxInitialKg: 55,
    incrementKg: 2.5,
    unitLabel: 'total weight'
  },
  'single_arm_cable_row': {
    loadPattern: 'cable_compound',
    baseRatio: { male_beginner: 0.20, female_beginner: 0.14 },
    minWeightKg: 5,
    maxInitialKg: 35,
    incrementKg: 2.5,
    unitLabel: 'per side'
  },
  'face_pull': {
    loadPattern: 'cable_isolation',
    baseRatio: { male_beginner: 0.15, female_beginner: 0.10 },
    minWeightKg: 5,
    maxInitialKg: 25,
    incrementKg: 2.5,
    unitLabel: 'pin weight'
  },
  'incline_db_curl': {
    loadPattern: 'dumbbell_bilateral',
    baseRatio: { male_beginner: 0.10, female_beginner: 0.06 },
    minWeightKg: 3,
    maxInitialKg: 18,
    incrementKg: 1,
    unitLabel: 'per dumbbell'
  },
  'hammer_curl': {
    loadPattern: 'dumbbell_bilateral',
    baseRatio: { male_beginner: 0.12, female_beginner: 0.08 },
    minWeightKg: 4,
    maxInitialKg: 20,
    incrementKg: 1,
    unitLabel: 'per dumbbell'
  },

  // LEGS
  'hack_squat': {
    loadPattern: 'machine_compound',
    baseRatio: { male_beginner: 0.60, female_beginner: 0.40 },
    minWeightKg: 20,
    maxInitialKg: 120,
    incrementKg: 5,
    unitLabel: 'sled + plates'
  },
  'romanian_deadlift': {
    loadPattern: 'dumbbell_hinge',
    baseRatio: { male_beginner: 0.18, female_beginner: 0.12 },
    minWeightKg: 6,
    maxInitialKg: 36,
    incrementKg: 2,
    unitLabel: 'per dumbbell'
  },
  'leg_extension': {
    loadPattern: 'machine_isolation',
    baseRatio: { male_beginner: 0.30, female_beginner: 0.20 },
    minWeightKg: 10,
    maxInitialKg: 60,
    incrementKg: 2.5,
    unitLabel: 'stack pin'
  },
  'seated_leg_curl': {
    loadPattern: 'machine_isolation',
    baseRatio: { male_beginner: 0.28, female_beginner: 0.18 },
    minWeightKg: 10,
    maxInitialKg: 55,
    incrementKg: 2.5,
    unitLabel: 'stack pin'
  },
  'standing_calf_raise': {
    loadPattern: 'machine_isolation',
    baseRatio: { male_beginner: 0.35, female_beginner: 0.25 },
    minWeightKg: 15,
    maxInitialKg: 80,
    incrementKg: 5,
    unitLabel: 'stack pin'
  },

  // MOBILITY & BODYWEIGHT
  'hanging_leg_raise': {
    loadPattern: 'bodyweight_only',
    baseRatio: { male_beginner: 0, female_beginner: 0 },
    minWeightKg: 0,
    maxInitialKg: 0,
    incrementKg: 0,
    unitLabel: 'bodyweight'
  },
  'thoracic_foam_roll': {
    loadPattern: 'bodyweight_only',
    baseRatio: { male_beginner: 0, female_beginner: 0 },
    minWeightKg: 0,
    maxInitialKg: 0,
    incrementKg: 0,
    unitLabel: 'bodyweight'
  },
  'hip_flexor_stretch': {
    loadPattern: 'bodyweight_only',
    baseRatio: { male_beginner: 0, female_beginner: 0 },
    minWeightKg: 0,
    maxInitialKg: 0,
    incrementKg: 0,
    unitLabel: 'bodyweight'
  },
  'shift_pump_circuit': {
    loadPattern: 'bodyweight_only',
    baseRatio: { male_beginner: 0, female_beginner: 0 },
    minWeightKg: 0,
    maxInitialKg: 0,
    incrementKg: 0,
    unitLabel: 'bodyweight / light band'
  }
};

/**
 * Exercise replacement mapping when user is Absolute Beginner
 * Replaces high-axial / high-stabilizer demand exercises with joint-friendly motor control movements
 */
export const BEGINNER_EXERCISE_ADAPTATIONS: Record<string, {
  replaceWithId: string;
  name: string;
  equipment: string;
  reason: string;
}> = {
  // Hack squat replaced with Leg Press or Goblet Squat for safer spine control
  'hack_squat': {
    replaceWithId: 'seated_leg_press',
    name: 'Seated Leg Press Machine',
    equipment: '45° / Horizontal Leg Press',
    reason: 'Builds foundational quad strength with zero compressive axial spine load.'
  },
  // Incline DB press replaced with Chest Press Machine
  'incline_db_press': {
    replaceWithId: 'machine_chest_press',
    name: 'Seated Incline Machine Press',
    equipment: 'Selectorized Chest Machine',
    reason: 'Fixed path builds pressing confidence without risk of dumbbell instability.'
  },
  // Romanian deadlift replaced with Glute Bridge / Light DB Romanian Deadlift
  'romanian_deadlift': {
    replaceWithId: 'db_romanian_deadlift_light',
    name: 'Dumbbell Romanian Deadlift (Form Focus)',
    equipment: 'Light Dumbbells',
    reason: 'Lightweight tactile hinge to ingrain posterior chain mechanics without lower back strain.'
  }
};

export class WeightSuggestionEngine {
  /**
   * Suggests a safe, calibrated starting weight for an exercise
   */
  static getSuggestedWeight(
    exerciseId: string,
    gender: Gender,
    bodyWeightKg: number,
    proficiency: ProficiencyLevel = 'intermediate'
  ): StartingWeightRecommendation {
    const config = EXERCISE_CONFIGS[exerciseId];

    // Fallback for bodyweight or unlisted exercises
    if (!config || config.loadPattern === 'bodyweight_only') {
      return {
        weightKg: 0,
        label: 'Bodyweight',
        isBodyweight: true,
        note: 'Execute with controlled tempo (3s eccentric) using bodyweight.'
      };
    }

    // Baseline ratio for beginner
    const baseRatio = gender === 'female' 
      ? config.baseRatio.female_beginner 
      : config.baseRatio.male_beginner;

    // Proficiency multiplier:
    // Beginner: 0.85 - 1.0 (calibrated conservatively to prevent intimidation / injury)
    // Intermediate: 1.35x
    // Advanced: 1.75x
    let profMultiplier = 1.0;
    if (proficiency === 'absolute_beginner') {
      profMultiplier = 0.85;
    } else if (proficiency === 'intermediate') {
      profMultiplier = 1.35;
    } else if (proficiency === 'advanced') {
      profMultiplier = 1.75;
    }

    // Safe bound bodyweight between 40kg and 150kg to prevent wild extrapolation
    const safeBw = Math.max(40, Math.min(150, bodyWeightKg));
    const rawWeight = safeBw * baseRatio * profMultiplier;

    // Round to standard gym increment (e.g. 1kg, 2kg, 2.5kg, 5kg)
    const inc = config.incrementKg || 2.5;
    let rounded = Math.round(rawWeight / inc) * inc;

    // Hard safety clamp: Never suggest less than minWeightKg or more than maxInitialKg for day 1
    rounded = Math.max(config.minWeightKg, Math.min(config.maxInitialKg * (proficiency === 'advanced' ? 1.5 : 1.0), rounded));

    // Handle single decimal display (e.g., 2.5 or 7.5, not 7.5000000001)
    rounded = Math.round(rounded * 10) / 10;

    const note = proficiency === 'absolute_beginner'
      ? `Calibrated for Day 1: ${rounded}kg ${config.unitLabel}. Focus on full depth and tempo.`
      : `Recommended starting working weight: ${rounded}kg ${config.unitLabel}.`;

    return {
      weightKg: rounded,
      label: `${rounded} kg`,
      isBodyweight: false,
      note
    };
  }
}
