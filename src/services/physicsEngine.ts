// ShiftFit User Profiling & Physics Engine (BMI & Workout Tailoring)
import { FitnessGoal } from '../types';

export interface BmiReport {
  currentBmi: number;
  classification: string;
  optimalBmiMin: number; // 22.0
  optimalBmiMax: number; // 24.5
  optimalWeightMinKg: number;
  optimalWeightMaxKg: number;
  heightCm: number;
  currentWeightKg: number;
}

export interface GoalWorkoutParameters {
  label: string;
  repRangeCompound: string;
  repRangeAccessory: string;
  restSecsCompound: number;
  restSecsAccessory: number;
  setsPerMovement: number;
  trainingStyle: string;
  calorieStrategy: string;
}

export class PhysicsEngine {
  /**
   * Calculate Body Mass Index: weight (kg) / (height (m))^2
   */
  static calculateBmi(weightKg: number, heightCm: number): number {
    if (heightCm <= 0 || weightKg <= 0) return 23.5;
    const heightM = heightCm / 100;
    const raw = weightKg / (heightM * heightM);
    return Math.round(raw * 10) / 10;
  }

  /**
   * Generate complete BMI and Optimal Weight Report based on height
   */
  static getBmiReport(weightKg: number, heightCm: number): BmiReport {
    const bmi = this.calculateBmi(weightKg, heightCm);
    const heightM = heightCm / 100;

    // Athletic / Aesthetic Recomposition Optimal BMI corridor (22.0 - 24.5)
    const optimalBmiMin = 22.0;
    const optimalBmiMax = 24.5;

    const optimalWeightMinKg = Math.round(optimalBmiMin * heightM * heightM * 10) / 10;
    const optimalWeightMaxKg = Math.round(optimalBmiMax * heightM * heightM * 10) / 10;

    let classification = 'Optimal Recomp Zone';
    if (bmi < 18.5) classification = 'Underweight';
    else if (bmi < 22.0) classification = 'Lean / Sub-Target';
    else if (bmi <= 24.5) classification = 'Optimal Athletic Corridor';
    else if (bmi < 27.5) classification = 'Heavy Muscular / Dense';
    else classification = 'Elevated Mass';

    return {
      currentBmi: bmi,
      classification,
      optimalBmiMin,
      optimalBmiMax,
      optimalWeightMinKg,
      optimalWeightMaxKg,
      heightCm,
      currentWeightKg: weightKg,
    };
  }

  /**
   * Dictates rep ranges, rest times, and volume based on selected Fitness Goal
   */
  static getGoalParameters(goal: FitnessGoal): GoalWorkoutParameters {
    switch (goal) {
      case 'muscle_mass':
        return {
          label: 'Building Muscle Mass',
          repRangeCompound: '8-10',
          repRangeAccessory: '10-12',
          restSecsCompound: 120,
          restSecsAccessory: 90,
          setsPerMovement: 4,
          trainingStyle: 'Maximal mechanical tension & progressive overload volume.',
          calorieStrategy: 'Slight caloric surplus (+150-250 kcal) to facilitate tissue synthesis.',
        };
      case 'lean_muscle':
        return {
          label: 'Lean Muscle & Density',
          repRangeCompound: '10-12',
          repRangeAccessory: '12-15',
          restSecsCompound: 75,
          restSecsAccessory: 60,
          setsPerMovement: 3,
          trainingStyle: 'High-density metabolic fatigue and strict tempo control.',
          calorieStrategy: 'Eucaloric maintenance with high protein (~2.4g/kg).',
        };
      case 'body_recomposition':
      default:
        return {
          label: 'Body Recomposition (75-78kg)',
          repRangeCompound: '6-8',
          repRangeAccessory: '10-12',
          restSecsCompound: 100,
          restSecsAccessory: 75,
          setsPerMovement: 4,
          trainingStyle: 'Heavy compound strength topsets paired with high-volume aesthetic accessories.',
          calorieStrategy: 'Calorie cycling: slight surplus on off-days, slight deficit on 12h shift days.',
        };
    }
  }
}
