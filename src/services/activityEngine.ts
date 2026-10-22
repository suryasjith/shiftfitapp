import { ActivityType, ActivityEntry, MacroGoals } from '../types';

export interface ActivityMeta {
  type: ActivityType;
  label: string;
  category: 'Running' | 'Walking' | 'Swimming' | 'Cycling' | 'Treadmill' | 'Rowing' | 'HIIT';
  met: number;
  description: string;
  defaultDurationMin: number;
  supportsDistance: boolean;
}

export const ACTIVITY_MET_TABLE: Record<ActivityType, ActivityMeta> = {
  running_moderate: {
    type: 'running_moderate',
    label: 'Running (Moderate, ~8.5 km/h)',
    category: 'Running',
    met: 8.3,
    description: 'Steady aerobic running pace (~6:00/km or 9:40/mile).',
    defaultDurationMin: 30,
    supportsDistance: true,
  },
  running_vigorous: {
    type: 'running_vigorous',
    label: 'Running (Vigorous, ~10.5 km/h)',
    category: 'Running',
    met: 11.0,
    description: 'High-speed tempo run or interval threshold (~5:40/km).',
    defaultDurationMin: 20,
    supportsDistance: true,
  },
  walking_moderate: {
    type: 'walking_moderate',
    label: 'Walking (Casual, ~5.0 km/h)',
    category: 'Walking',
    met: 3.5,
    description: 'Casual level-surface walking pace (~12 min/km).',
    defaultDurationMin: 45,
    supportsDistance: true,
  },
  walking_brisk: {
    type: 'walking_brisk',
    label: 'Walking (Brisk, ~6.0 km/h)',
    category: 'Walking',
    met: 4.8,
    description: 'Fast-paced intentional commute walk (~10 min/km).',
    defaultDurationMin: 30,
    supportsDistance: true,
  },
  treadmill_incline: {
    type: 'treadmill_incline',
    label: 'Incline Treadmill (12% Incline, 3 mph)',
    category: 'Treadmill',
    met: 6.0,
    description: '12-3-30 protocol. Low joint impact, maximum posterior chain activation.',
    defaultDurationMin: 30,
    supportsDistance: true,
  },
  swimming_moderate: {
    type: 'swimming_moderate',
    label: 'Swimming (Lap Freestyle, Moderate)',
    category: 'Swimming',
    met: 7.0,
    description: 'Continuous freestyle laps with moderate respiratory exertion.',
    defaultDurationMin: 30,
    supportsDistance: false,
  },
  swimming_vigorous: {
    type: 'swimming_vigorous',
    label: 'Swimming (Vigorous Laps / Intervals)',
    category: 'Swimming',
    met: 9.8,
    description: 'Sprint intervals, butterfly or fast crawl sets.',
    defaultDurationMin: 25,
    supportsDistance: false,
  },
  cycling_moderate: {
    type: 'cycling_moderate',
    label: 'Cycling (Stationary / Outdoor, ~20 km/h)',
    category: 'Cycling',
    met: 7.5,
    description: 'Moderate cadence cycling (~12-14 mph) with light resistance.',
    defaultDurationMin: 30,
    supportsDistance: true,
  },
  rowing_machine: {
    type: 'rowing_machine',
    label: 'Rowing Machine (Moderate Effort)',
    category: 'Rowing',
    met: 7.0,
    description: 'Concept2 or water rower at ~2:05-2:15 / 500m split.',
    defaultDurationMin: 20,
    supportsDistance: true,
  },
  hiit_circuit: {
    type: 'hiit_circuit',
    label: 'HIIT / Functional Circuit',
    category: 'HIIT',
    met: 8.0,
    description: 'High intensity interval training with minimal rest between rounds.',
    defaultDurationMin: 25,
    supportsDistance: false,
  },
};

export class ActivityEngine {
  /**
   * Standard MET Caloric Expenditure Formula:
   * Calories = MET * Weight(kg) * (Minutes / 60)
   */
  static calculateMetCalories(met: number, weightKg: number, durationMinutes: number): number {
    const validWeight = weightKg > 30 ? weightKg : 76.4;
    const validDuration = Math.max(0, durationMinutes);
    const calories = met * validWeight * (validDuration / 60);
    return Math.round(calories);
  }

  /**
   * Calculates step calories.
   * Assumes ~0.04 kcal per step for a 75kg person.
   * Baseline non-exercise steps: 3,500 steps (part of standard sedentary NEAT).
   */
  static calculateStepCalories(steps: number, weightKg: number): {
    totalStepCalories: number;
    activeStepCalories: number;
  } {
    const validWeight = weightKg > 30 ? weightKg : 76.4;
    const validSteps = Math.max(0, steps);
    const weightFactor = validWeight / 75.0;

    const totalStepCalories = Math.round(validSteps * 0.04 * weightFactor);
    const activeSteps = Math.max(0, validSteps - 3500);
    const activeStepCalories = Math.round(activeSteps * 0.04 * weightFactor);

    return {
      totalStepCalories,
      activeStepCalories,
    };
  }

  /**
   * Dynamically adjusts macro targets based on daily cardio & step expenditure.
   * - Protein remains intact (e.g. 185g) for muscle tissue preservation.
   * - Active burn is partitioned: 70% to Carbs (glycogen replenishment) and 30% to Fats.
   */
  static calculateDynamicMacros(
    baseMacros: MacroGoals,
    totalActiveBurnCalories: number
  ): {
    dynamicCalories: number;
    dynamicProtein: number;
    dynamicFats: number;
    dynamicCarbs: number;
    extraCarbsGrams: number;
    extraFatsGrams: number;
  } {
    const burn = Math.max(0, Math.round(totalActiveBurnCalories));
    
    // 70% of active burn to carbohydrates (4 kcal/g)
    const extraCarbsGrams = Math.round((burn * 0.70) / 4);
    // 30% of active burn to dietary fats (9 kcal/g)
    const extraFatsGrams = Math.round((burn * 0.30) / 9);

    const dynamicCalories = baseMacros.calories + burn;
    const dynamicProtein = baseMacros.proteinGrams;
    const dynamicCarbs = baseMacros.carbsGrams + extraCarbsGrams;
    const dynamicFats = baseMacros.fatsGrams + extraFatsGrams;

    return {
      dynamicCalories,
      dynamicProtein,
      dynamicFats,
      dynamicCarbs,
      extraCarbsGrams,
      extraFatsGrams,
    };
  }

  /**
   * Calculates dynamic water requirement based on sweat rate from activities & steps.
   */
  static calculateDynamicWaterTarget(
    baseWaterMl: number,
    totalActiveMinutes: number,
    steps: number
  ): number {
    let extraWater = 0;
    // ~350ml per 30 minutes of cardio
    if (totalActiveMinutes > 0) {
      extraWater += Math.round((totalActiveMinutes / 30) * 350);
    }
    // ~250ml per 5,000 steps above 5,000
    if (steps > 5000) {
      extraWater += Math.round(((steps - 5000) / 5000) * 250);
    }

    return baseWaterMl + extraWater;
  }
}
