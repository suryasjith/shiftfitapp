// ShiftFit Rota & CNS Workout Allocation Engine
import { ShiftType, ShiftDay, WorkoutSession, UserProfile } from '../types';
import { BASE_WORKOUT_TEMPLATES } from '../data/recompPrograms';

export interface RotaDayInfo {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Mon, Tue, etc.
  dayNumber: number; // 1-31
  isCurrentDay: boolean;
  cycleDayIndex: number; // 0 to 6 in a 7-day 4-on/3-off block
  isShiftDay: boolean;
  shiftIndex: number; // 0, 1, 2, 3 if shift day; or -1
  offIndex: number; // 0, 1, 2 if off day; or -1
  shiftType: ShiftType;
  isOvertime: boolean;
  shiftLabel: string;
  recommendedWorkoutCategory: 'Push' | 'Pull' | 'Legs' | 'Shift Maintenance' | 'Mobility' | 'Rest';
  workoutTitle: string;
}

export class RotaEngine {
  /**
   * Helper to format a Date object as YYYY-MM-DD local string
   */
  static formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Helper to parse YYYY-MM-DD string to Date at midnight local
   */
  static parseDate(dateStr: string): Date {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }

  /**
   * Calculates the cycle position for any date given the anchor start date.
   * Default: 4-on / 3-off (7 day cycle)
   * Days 0, 1, 2, 3 = 12-hour Shift Days
   * Days 4, 5, 6 = Off Days (Workout Days!)
   */
  static getCyclePosition(targetDateStr: string, anchorDateStr: string, onDays: number = 4, offDays: number = 3): number {
    const target = this.parseDate(targetDateStr);
    const anchor = this.parseDate(anchorDateStr);
    
    // Difference in whole days
    const diffTime = target.getTime() - anchor.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    const cycleLength = onDays + offDays;
    let cyclePos = diffDays % cycleLength;
    if (cyclePos < 0) {
      cyclePos += cycleLength;
    }
    return cyclePos;
  }

  /**
   * Returns complete rota information for a given date, factoring in custom overrides and overtime
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

    // Check custom shift overrides first (e.g. user manually marked overtime or swap)
    const custom = customShifts[dateStr];

    const cyclePos = this.getCyclePosition(dateStr, profile.rotaStartDate, profile.onDaysCount, profile.offDaysCount);
    const baseIsShiftDay = cyclePos < profile.onDaysCount;

    let shiftType: ShiftType;
    let isOvertime = false;

    if (custom) {
      shiftType = custom.shiftType;
      isOvertime = custom.isOvertime;
    } else {
      if (baseIsShiftDay) {
        shiftType = 'day_12h'; // Base 12-hour shift
      } else {
        shiftType = 'off';
      }
    }

    const isShift = shiftType !== 'off';
    const shiftIndex = baseIsShiftDay ? cyclePos : -1;
    const offIndex = !baseIsShiftDay ? (cyclePos - profile.onDaysCount) : -1;

    let shiftLabel = 'Off Day';
    if (shiftType === 'day_12h') shiftLabel = '☀️ 12h Day Shift';
    else if (shiftType === 'night_12h') shiftLabel = '🌙 12h Night Shift';
    else if (shiftType === 'overtime_day') shiftLabel = '⚠️ Overtime 12h Day';
    else if (shiftType === 'overtime_night') shiftLabel = '⚠️ Overtime 12h Night';
    else if (shiftType === 'custom_shift') shiftLabel = '⚡ Custom Shift';

    // Determine workout allocation
    let recommendedWorkoutCategory: RotaDayInfo['recommendedWorkoutCategory'];
    let workoutTitle: string;

    if (isOvertime) {
      // Overtime on scheduled off-day or extra day
      recommendedWorkoutCategory = 'Shift Maintenance';
      workoutTitle = 'Overtime CNS-Sparing Express (25m)';
    } else if (!isShift) {
      // Off days: Heavy aesthetic recomp workouts
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
      // Shift days: CNS protection
      if (shiftIndex === 0) {
        recommendedWorkoutCategory = 'Mobility';
        workoutTitle = 'Shift 1: Spine Decompress & Mobility';
      } else if (shiftIndex === 1) {
        recommendedWorkoutCategory = 'Shift Maintenance';
        workoutTitle = 'Shift 2: Express Muscle Pump (20m)';
      } else if (shiftIndex === 2) {
        recommendedWorkoutCategory = 'Rest';
        workoutTitle = 'Shift 3: Deep CNS Recovery';
      } else {
        recommendedWorkoutCategory = 'Rest';
        workoutTitle = 'Shift 4: Pre-Off Priming & Rest';
      }
    }

    return {
      date: dateStr,
      dayOfWeek,
      dayNumber,
      isCurrentDay,
      cycleDayIndex: cyclePos,
      isShiftDay: isShift,
      shiftIndex,
      offIndex,
      shiftType,
      isOvertime,
      shiftLabel,
      recommendedWorkoutCategory,
      workoutTitle,
    };
  }

  /**
   * Generates or retrieves the dynamically adjusted workout for a given date
   */
  static generateWorkoutForDate(
    dateStr: string,
    profile: UserProfile,
    customShifts: Record<string, ShiftDay> = {},
    fatigueScore: number = 3
  ): WorkoutSession {
    const dayInfo = this.getDayInfo(dateStr, profile, customShifts);

    if (dayInfo.isOvertime) {
      return BASE_WORKOUT_TEMPLATES.overtime_express(dateStr);
    }

    if (!dayInfo.isShiftDay) {
      if (dayInfo.offIndex === 0) {
        return BASE_WORKOUT_TEMPLATES.offDay1_push(dateStr, fatigueScore);
      } else if (dayInfo.offIndex === 1) {
        return BASE_WORKOUT_TEMPLATES.offDay2_legs(dateStr, fatigueScore);
      } else {
        return BASE_WORKOUT_TEMPLATES.offDay3_pull(dateStr, fatigueScore);
      }
    } else {
      return BASE_WORKOUT_TEMPLATES.shiftDay_maintenance(dateStr, Math.max(0, dayInfo.shiftIndex));
    }
  }

  /**
   * Generates days for a calendar month view
   */
  static getMonthDays(year: number, monthZeroBased: number, profile: UserProfile, customShifts: Record<string, ShiftDay>): RotaDayInfo[] {
    const result: RotaDayInfo[] = [];
    const firstDayOfMonth = new Date(year, monthZeroBased, 1);
    const lastDayOfMonth = new Date(year, monthZeroBased + 1, 0);

    // Padding for starting day of week (Monday as day 0 in standard European/fitness rota)
    let startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    // Convert so Monday is 0, Sunday is 6
    const mondayBasedStart = (startDayOfWeek + 6) % 7;

    for (let p = mondayBasedStart; p > 0; p--) {
      const padDate = new Date(year, monthZeroBased, 1 - p);
      result.push(this.getDayInfo(this.formatDate(padDate), profile, customShifts));
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const curDate = new Date(year, monthZeroBased, day);
      result.push(this.getDayInfo(this.formatDate(curDate), profile, customShifts));
    }

    // Trailing padding to fill out 35 or 42 grid cells
    const remaining = (7 - (result.length % 7)) % 7;
    for (let t = 1; t <= remaining; t++) {
      const padDate = new Date(year, monthZeroBased + 1, t);
      result.push(this.getDayInfo(this.formatDate(padDate), profile, customShifts));
    }

    return result;
  }
}
