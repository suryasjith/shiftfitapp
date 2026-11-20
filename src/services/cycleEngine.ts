// ShiftFit Cycle-Aware Periodization Engine
// Integrates date-fns for cycle math, physiological phase projections & workout auto-adaptations
import { differenceInCalendarDays, parseISO, format, isValid } from 'date-fns';
import { CyclePhase, CycleSettings, Gender } from '../types';

export interface CyclePhaseInfo {
  isActive: boolean;
  phase: CyclePhase;
  phaseTitle: string;
  shortLabel: string;
  cycleDay: number;
  totalCycleDays: number;
  hydrationBumpMl: number;
  isPeakStrength: boolean;
  isHighProgesterone: boolean;
  physiologicalCue: string;
  badgeColor: {
    bg: string;
    border: string;
    text: string;
    iconText: string;
  };
}

export class CycleEngine {
  /**
   * Evaluates the active cycle phase and physiological parameters for a given date
   */
  static getPhaseInfo(
    targetDateStr: string,
    cycleSettings?: CycleSettings,
    gender: Gender = 'female'
  ): CyclePhaseInfo {
    // Only applies to female profiles with cycle periodization enabled
    if (gender !== 'female' || !cycleSettings?.enabled) {
      return {
        isActive: false,
        phase: 'follicular',
        phaseTitle: 'Standard Periodization',
        shortLabel: 'Baseline',
        cycleDay: 1,
        totalCycleDays: 28,
        hydrationBumpMl: 0,
        isPeakStrength: false,
        isHighProgesterone: false,
        physiologicalCue: 'Standard physiological mechanics active.',
        badgeColor: {
          bg: 'bg-stone-100 dark:bg-stone-900',
          border: 'border-stone-200 dark:border-white/10',
          text: 'text-stone-700 dark:text-stone-300',
          iconText: 'text-stone-500',
        },
      };
    }

    const cycleLen = Math.max(21, Math.min(35, cycleSettings.cycleLengthDays || 28));

    // Check if user set a manual override for today
    if (cycleSettings.phaseOverride && cycleSettings.overrideDate === targetDateStr) {
      return this.buildPhaseDetails(cycleSettings.phaseOverride, 1, cycleLen, true);
    }

    // Default anchor to 14 days ago if not configured
    let startDateStr = cycleSettings.lastPeriodStartDate;
    if (!startDateStr || !isValid(parseISO(startDateStr))) {
      startDateStr = format(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    }

    const targetDate = parseISO(targetDateStr);
    const startDate = parseISO(startDateStr);
    
    const diffDays = differenceInCalendarDays(targetDate, startDate);
    const cycleDay = (((diffDays % cycleLen) + cycleLen) % cycleLen) + 1;

    let calculatedPhase: CyclePhase = 'follicular';

    if (cycleDay <= 5) {
      calculatedPhase = 'menstrual';
    } else if (cycleDay <= 12) {
      calculatedPhase = 'follicular';
    } else if (cycleDay <= 16) {
      calculatedPhase = 'ovulatory';
    } else {
      calculatedPhase = 'luteal';
    }

    return this.buildPhaseDetails(calculatedPhase, cycleDay, cycleLen, false);
  }

  private static buildPhaseDetails(
    phase: CyclePhase,
    cycleDay: number,
    totalCycleDays: number,
    isManualOverride: boolean
  ): CyclePhaseInfo {
    switch (phase) {
      case 'menstrual':
        return {
          isActive: true,
          phase: 'menstrual',
          phaseTitle: isManualOverride ? 'Menstrual Phase (Override)' : `Menstrual Phase (Day ${cycleDay}/${totalCycleDays})`,
          shortLabel: 'Menstrual',
          cycleDay,
          totalCycleDays,
          hydrationBumpMl: 200,
          isPeakStrength: false,
          isHighProgesterone: false,
          physiologicalCue: 'Uterine contraction window: prioritize mobility, deep breathing, and lower back decompression. Take extra rest between sets if needed.',
          badgeColor: {
            bg: 'bg-rose-950/40',
            border: 'border-rose-500/40',
            text: 'text-rose-400',
            iconText: 'text-rose-400',
          },
        };

      case 'follicular':
        return {
          isActive: true,
          phase: 'follicular',
          phaseTitle: isManualOverride ? 'Follicular Phase (Override)' : `Follicular Phase (Day ${cycleDay}/${totalCycleDays})`,
          shortLabel: 'Follicular',
          cycleDay,
          totalCycleDays,
          hydrationBumpMl: 0,
          isPeakStrength: false,
          isHighProgesterone: false,
          physiologicalCue: 'Estrogen rising. High carbohydrate utilization and optimal tissue remodeling. Excellent window for volume progression.',
          badgeColor: {
            bg: 'bg-sky-950/40',
            border: 'border-sky-500/40',
            text: 'text-sky-400',
            iconText: 'text-sky-400',
          },
        };

      case 'ovulatory':
        return {
          isActive: true,
          phase: 'ovulatory',
          phaseTitle: isManualOverride ? '⚡ Peak Strength Window (Override)' : `⚡ Peak Strength Window (Day ${cycleDay}/${totalCycleDays})`,
          shortLabel: 'Peak Strength',
          cycleDay,
          totalCycleDays,
          hydrationBumpMl: 250,
          isPeakStrength: true,
          isHighProgesterone: false,
          physiologicalCue: 'Estrogen peak & highest neuromuscular efficiency of the cycle. Prime opportunity for progressive overload and PR attempts on primary compounds.',
          badgeColor: {
            bg: 'bg-amber-950/40',
            border: 'border-amber-500/50',
            text: 'text-amber-400',
            iconText: 'text-amber-400',
          },
        };

      case 'luteal':
      default:
        return {
          isActive: true,
          phase: 'luteal',
          phaseTitle: isManualOverride ? 'Luteal Phase (Override)' : `Luteal Phase (Day ${cycleDay}/${totalCycleDays})`,
          shortLabel: 'Luteal (Recovery Bias)',
          cycleDay,
          totalCycleDays,
          hydrationBumpMl: 400,
          isPeakStrength: false,
          isHighProgesterone: true,
          physiologicalCue: 'High progesterone phase: resting core temperature elevated ~0.4°C. Hydration target boosted (+400ml). Prioritize steady hydration and cooling.',
          badgeColor: {
            bg: 'bg-purple-950/40',
            border: 'border-purple-500/40',
            text: 'text-purple-400',
            iconText: 'text-purple-400',
          },
        };
    }
  }
}
