// ShiftFit User Profiling & Physics Engine (BMI & Timeline Projection)
import { FitnessGoal, Gender } from '../types';

export interface BmiReport {
  currentBmi: number;
  classification: string;
  optimalBmiMin: number;
  optimalBmiMax: number;
  optimalWeightMinKg: number;
  optimalWeightMaxKg: number;
  heightCm: number;
  currentWeightKg: number;
  gender: Gender;
}

export interface TimelineProjection {
  currentWeightKg: number;
  desiredWeightKg: number;
  weightDeltaKg: number;
  mode: 'cutting' | 'bulking' | 'maintenance';
  averageWeeks: number;
  optimalWeeks: number;
  averageRateKgPerWeek: number;
  optimalRateKgPerWeek: number;
  averageTargetDate: string;
  optimalTargetDate: string;
  disciplineWarning: string;
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
   * Generate complete BMI and Optimal Weight Report based on height and gender
   */
  static getBmiReport(weightKg: number, heightCm: number, gender: Gender = 'male'): BmiReport {
    const bmi = this.calculateBmi(weightKg, heightCm);
    const heightM = heightCm / 100;

    // Athletic / Aesthetic Recomposition Optimal BMI corridor based on gender
    // Males: 21.5 - 24.5 (allows for higher muscle density)
    // Females: 20.0 - 23.5 (standard athletic lean range)
    const optimalBmiMin = gender === 'female' ? 20.0 : 21.5;
    const optimalBmiMax = gender === 'female' ? 23.5 : 24.5;

    const optimalWeightMinKg = Math.round(optimalBmiMin * heightM * heightM * 10) / 10;
    const optimalWeightMaxKg = Math.round(optimalBmiMax * heightM * heightM * 10) / 10;

    let classification = 'Optimal Recomp Zone';
    if (bmi < 18.5) classification = 'Underweight';
    else if (bmi < optimalBmiMin) classification = 'Lean / Sub-Target';
    else if (bmi <= optimalBmiMax) classification = 'Optimal Athletic Corridor';
    else if (bmi < 28.0) classification = 'Dense Muscular / Moderate Excess';
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
      gender,
    };
  }

  /**
   * Calculates Average Timeline and Very Optimal Timeline (using 0.5kg to 1.0kg biological rates)
   */
  static getTimelineProjection(
    currentWeightKg: number, 
    desiredWeightKg: number, 
    gender: Gender = 'male'
  ): TimelineProjection {
    const rawDelta = desiredWeightKg - currentWeightKg;
    const absDelta = Math.abs(rawDelta);

    const today = new Date();

    const formatDateOffset = (weeks: number): string => {
      const target = new Date(today);
      target.setDate(today.getDate() + Math.round(weeks * 7));
      return target.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const warningText = "WARNING: The optimal timeline is strictly theoretical and is only achievable with absolute discipline, zero missed sessions, and perfect macro adherence.";

    // If within 0.3kg, user is already in maintenance recomp
    if (absDelta < 0.3) {
      return {
        currentWeightKg,
        desiredWeightKg,
        weightDeltaKg: 0,
        mode: 'maintenance',
        averageWeeks: 0,
        optimalWeeks: 0,
        averageRateKgPerWeek: 0,
        optimalRateKgPerWeek: 0,
        averageTargetDate: 'Goal Achieved',
        optimalTargetDate: 'Active Maintenance',
        disciplineWarning: warningText,
      };
    }

    if (currentWeightKg > desiredWeightKg) {
      // Weight Loss / Cutting Phase
      // Biological standard rates: 0.5kg/week (Average) vs 1.0kg/week (Optimal)
      const avgRate = 0.5;
      const optRate = 1.0;
      const averageWeeks = Math.max(1, Math.round((absDelta / avgRate) * 10) / 10);
      const optimalWeeks = Math.max(1, Math.round((absDelta / optRate) * 10) / 10);

      return {
        currentWeightKg,
        desiredWeightKg,
        weightDeltaKg: Math.round(absDelta * 10) / 10,
        mode: 'cutting',
        averageWeeks,
        optimalWeeks,
        averageRateKgPerWeek: avgRate,
        optimalRateKgPerWeek: optRate,
        averageTargetDate: formatDateOffset(averageWeeks),
        optimalTargetDate: formatDateOffset(optimalWeeks),
        disciplineWarning: warningText,
      };
    } else {
      // Weight Gain / Lean Mass Accrual Phase
      // Biological natural muscle synthesis rates: 0.25-0.35kg/week (Average) vs 0.5kg/week (Optimal)
      const avgRate = gender === 'female' ? 0.25 : 0.35;
      const optRate = gender === 'female' ? 0.4 : 0.5;
      const averageWeeks = Math.max(1, Math.round((absDelta / avgRate) * 10) / 10);
      const optimalWeeks = Math.max(1, Math.round((absDelta / optRate) * 10) / 10);

      return {
        currentWeightKg,
        desiredWeightKg,
        weightDeltaKg: Math.round(absDelta * 10) / 10,
        mode: 'bulking',
        averageWeeks,
        optimalWeeks,
        averageRateKgPerWeek: avgRate,
        optimalRateKgPerWeek: optRate,
        averageTargetDate: formatDateOffset(averageWeeks),
        optimalTargetDate: formatDateOffset(optimalWeeks),
        disciplineWarning: warningText,
      };
    }
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
