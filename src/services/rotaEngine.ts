// ShiftFit 2-Week Rolling Rota & CNS Workout Allocation Engine
import { ShiftType, ShiftDay, WorkoutSession, UserProfile, FitnessGoal } from '../types';
import { BASE_WORKOUT_TEMPLATES } from '../data/recompPrograms';

export interface RotaDayInfo {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Mon, Tue, etc.
  dayNumber: number; // 1-31
  isCurrentDay: boolean;
  cycleDayIndex: number; // 0 to 13 in the 14-day 2-week loop
  weekNumberInCycle: 1 | 2; // Week 1 or Week 2
  isShiftDay: boolean;
  shiftType: ShiftType;
  isOvertime: boolean;
  shiftLabel: string;
  recommendedWorkoutCategory: 'Push' | 'Pull' | 'Legs' | 'Shift Maintenance' | 'Mobility' | 'Rest';
  workoutTitle: string;
}

export const ROTA_PRESETS = {
  // Standard 4-on / 3-off repeating 14-day cycle
  fourOnThreeOff: [
    'day_12h', 'day_12h', 'day_12h', 'day_12h', 'off', 'off', 'off', // Week 1: Mon-Thu On, Fri-Sun Off
    'day_12h', 'day_12h', 'day_12h', 'day_12h', 'off', 'off', 'off', // Week 2: Mon-Thu On, Fri-Sun Off
  ] as ShiftType[],

  // Alternating 4-3 and 3-4 (popular healthcare/nursing rota)
  alternatingFourThree: [
    'day_12h', 'day_12h', 'day_12h', 'day_12h', 'off', 'off', 'off', // Week 1: 4 on, 3 off
    'day_12h', 'day_12h', 'day_12h', 'off', 'off', 'off', 'off',     // Week 2: 3 on, 4 off
  ] as ShiftType[],

  // Continental / Panama 2-2-3 (14-day cycle)
  panama223: [
    'day_12h', 'day_12h', 'off', 'off', 'day_12h', 'day_12h', 'day_12h', // Week 1: 2 on, 2 off, 3 on
    'off', 'off', 'day_12h', 'day_12h', 'off', 'off', 'off',             // Week 2: 2 off, 2 on, 3 off
  ] as ShiftType[],
};

export class RotaEngine {
  static formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static parseDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }

  /**
   * Infinitely loops the 14-day (2-week) pattern forward and backward from anchor date
   */
  static getCyclePosition(targetDateStr: string, anchorDateStr: string): number {
    const target = this.parseDate(targetDateStr);
    const anchor = this.parseDate(anchorDateStr);
    
    const diffTime = target.getTime() - anchor.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    const cycleLength = 14;
    let cyclePos = diffDays % cycleLength;
    if (cyclePos < 0) {
      cyclePos += cycleLength;
    }
    return cyclePos;
  }

  /**
   * Resolves complete Day Info, honoring 14-day infinite loop & specific manual shift overrides
   */
  static getDayInfo(
    dateStr: string, 
    profile: UserProfile, 
    customShifts: Record<string, ShiftDay> = {},
    todayStr: string = this.formatDate(new Date())
  ): RotaDayInfo {
    const d = this.parseDate(dateStr);
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = daysOfWeek[d.getDay()];
    const dayNumber = d.getDate();
    const isCurrentDay = dateStr === todayStr;

    // 14-Day Cycle Position
    const cyclePos = this.getCyclePosition(dateStr, profile.rotaStartDate || '2026-10-19');
    const weekNumberInCycle: 1 | 2 = cyclePos < 7 ? 1 : 2;

    // Check 2-week template default
    const template = profile.twoWeekTemplate || ROTA_PRESETS.fourOnThreeOff;
    const baseShiftType = template[cyclePos] || 'off';

    // Check manual override for this specific calendar date
    const custom = customShifts[dateStr];

    let shiftType: ShiftType;
    let isOvertime = false;

    if (custom) {
      shiftType = custom.shiftType;
      isOvertime = custom.isOvertime;
    } else {
      shiftType = baseShiftType;
      isOvertime = shiftType.startsWith('overtime');
    }

    const isShift = shiftType !== 'off';

    let shiftLabel = 'Off Day';
    if (shiftType === 'day_12h') shiftLabel = '12h Day Shift';
    else if (shiftType === 'night_12h') shiftLabel = '12h Night Shift';
    else if (shiftType === 'overtime_day') shiftLabel = 'Overtime 12h Day';
    else if (shiftType === 'overtime_night') shiftLabel = 'Overtime 12h Night';
    else if (shiftType === 'custom_shift') shiftLabel = 'Custom Shift';

    // Workout category assignment based on off-day sequence or shift sequence
    let recommendedWorkoutCategory: RotaDayInfo['recommendedWorkoutCategory'];
    let workoutTitle: string;

    if (isOvertime) {
      recommendedWorkoutCategory = 'Shift Maintenance';
      workoutTitle = 'Overtime Express (25m)';
    } else if (!isShift) {
      // Determine which off-day in current cluster (0, 1, or 2)
      // Look back to see how many consecutive off-days preceded this date
      let consecutiveOffs = 0;
      for (let lookback = 1; lookback <= 4; lookback++) {
        const prevD = new Date(d);
        prevD.setDate(d.getDate() - lookback);
        const prevDs = this.formatDate(prevD);
        const prevCustom = customShifts[prevDs];
        const prevCyclePos = this.getCyclePosition(prevDs, profile.rotaStartDate || '2026-10-19');
        const prevType = prevCustom ? prevCustom.shiftType : template[prevCyclePos];
        if (prevType === 'off') {
          consecutiveOffs++;
        } else {
          break;
        }
      }

      const offIndex = consecutiveOffs % 3;
      if (offIndex === 0) {
        recommendedWorkoutCategory = 'Push';
        workoutTitle = 'Heavy Push: Upper Chest & Delts';
      } else if (offIndex === 1) {
        recommendedWorkoutCategory = 'Legs';
        workoutTitle = 'Heavy Legs: Quad Sweep & Hams';
      } else {
        recommendedWorkoutCategory = 'Pull';
        workoutTitle = 'Heavy Pull: Lat Width & Arms';
      }
    } else {
      // Determine consecutive shift day
      let consecutiveShifts = 0;
      for (let lookback = 1; lookback <= 5; lookback++) {
        const prevD = new Date(d);
        prevD.setDate(d.getDate() - lookback);
        const prevDs = this.formatDate(prevD);
        const prevCustom = customShifts[prevDs];
        const prevCyclePos = this.getCyclePosition(prevDs, profile.rotaStartDate || '2026-10-19');
        const prevType = prevCustom ? prevCustom.shiftType : template[prevCyclePos];
        if (prevType !== 'off') {
          consecutiveShifts++;
        } else {
          break;
        }
      }

      if (consecutiveShifts === 0) {
        recommendedWorkoutCategory = 'Mobility';
        workoutTitle = 'Shift 1: Spine Decompress & Mobility';
      } else if (consecutiveShifts === 1) {
        recommendedWorkoutCategory = 'Shift Maintenance';
        workoutTitle = 'Shift 2: Express Muscle Pump (20m)';
      } else {
        recommendedWorkoutCategory = 'Rest';
        workoutTitle = `Shift ${consecutiveShifts + 1}: Deep CNS Recovery`;
      }
    }

    return {
      date: dateStr,
      dayOfWeek,
      dayNumber,
      isCurrentDay,
      cycleDayIndex: cyclePos,
      weekNumberInCycle,
      isShiftDay: isShift,
      shiftType,
      isOvertime,
      shiftLabel,
      recommendedWorkoutCategory,
      workoutTitle,
    };
  }

  /**
   * Generates workout session factoring in 2-week rota, fatigue, and selected Fitness Goal
   */
  static generateWorkoutForDate(
    dateStr: string,
    profile: UserProfile,
    customShifts: Record<string, ShiftDay> = {},
    fatigueScore: number = 3
  ): WorkoutSession {
    const dayInfo = this.getDayInfo(dateStr, profile, customShifts);
    const goal: FitnessGoal = profile.fitnessGoal || 'body_recomposition';

    if (dayInfo.isOvertime) {
      return BASE_WORKOUT_TEMPLATES.overtime_express(dateStr, goal);
    }

    if (!dayInfo.isShiftDay) {
      if (dayInfo.recommendedWorkoutCategory === 'Push') {
        return BASE_WORKOUT_TEMPLATES.offDay1_push(dateStr, fatigueScore, goal);
      } else if (dayInfo.recommendedWorkoutCategory === 'Legs') {
        return BASE_WORKOUT_TEMPLATES.offDay2_legs(dateStr, fatigueScore, goal);
      } else {
        return BASE_WORKOUT_TEMPLATES.offDay3_pull(dateStr, fatigueScore, goal);
      }
    } else {
      const shiftNum = dayInfo.workoutTitle.includes('Shift 1') ? 0 : dayInfo.workoutTitle.includes('Shift 2') ? 1 : 2;
      return BASE_WORKOUT_TEMPLATES.shiftDay_maintenance(dateStr, shiftNum);
    }
  }

  static getMonthDays(year: number, monthZeroBased: number, profile: UserProfile, customShifts: Record<string, ShiftDay>): RotaDayInfo[] {
    const result: RotaDayInfo[] = [];
    const firstDayOfMonth = new Date(year, monthZeroBased, 1);
    const lastDayOfMonth = new Date(year, monthZeroBased + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay();
    const mondayBasedStart = (startDayOfWeek + 6) % 7;

    for (let p = mondayBasedStart; p > 0; p--) {
      const padDate = new Date(year, monthZeroBased, 1 - p);
      result.push(this.getDayInfo(this.formatDate(padDate), profile, customShifts));
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const curDate = new Date(year, monthZeroBased, day);
      result.push(this.getDayInfo(this.formatDate(curDate), profile, customShifts));
    }

    const remaining = (7 - (result.length % 7)) % 7;
    for (let t = 1; t <= remaining; t++) {
      const padDate = new Date(year, monthZeroBased + 1, t);
      result.push(this.getDayInfo(this.formatDate(padDate), profile, customShifts));
    }

    return result;
  }
}
