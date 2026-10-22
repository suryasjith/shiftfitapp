// ShiftFit Core Type Definitions

export type ShiftType = 
  | 'day_12h'      // 12-Hour Day Shift (e.g. 07:00 - 19:00)
  | 'night_12h'    // 12-Hour Night Shift (e.g. 19:00 - 07:00)
  | 'overtime_day' // Overtime 12-Hour Day Shift
  | 'overtime_night' // Overtime 12-Hour Night Shift
  | 'off'          // Scheduled Off Day
  | 'custom_shift'; // Custom shift

export interface ShiftDay {
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  isOvertime: boolean;
  notes?: string;
  hoursWorked?: number;
}

export type MuscleGroup = 
  | 'Chest (Upper Clavicular)'
  | 'Chest (Mid/Lower Sternal)'
  | 'Back (Lats Width)'
  | 'Back (Upper Thickness & Traps)'
  | 'Shoulders (Side Delts)'
  | 'Shoulders (Front Delts)'
  | 'Shoulders (Rear Delts)'
  | 'Arms (Biceps & Brachialis)'
  | 'Arms (Triceps Long/Lateral)'
  | 'Quads (Knee Extension)'
  | 'Hamstrings & Glutes (Hips & Posterior)'
  | 'Calves & Core';

export interface ExerciseAlternative {
  name: string;
  equipment: string;
  cue: string;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  primaryEquipment: string;
  mechanics: 'Compound' | 'Isolation';
  cnsLoad: 'High' | 'Moderate' | 'Low'; // For fatigue scaling
  defaultSets: number;
  defaultReps: string; // e.g. "8-10" or "10-12"
  defaultRestSecs: number;
  tips: string;
  alternatives: ExerciseAlternative[];
}

export interface SetLog {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  isWarmup?: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  targetMuscle: MuscleGroup;
  selectedAlternative?: string;
  equipmentTaken: boolean;
  prescribedSets: number;
  restSecs: number;
  sets: SetLog[];
  notes?: string;
}

export type WorkoutIntensity = 'Heavy Hypertrophy' | 'Maintenance Express' | 'CNS Mobility & Recovery' | 'Rest / Deload';

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'Push' | 'Pull' | 'Legs' | 'Shift Maintenance' | 'Mobility' | 'Rest';
  intensity: WorkoutIntensity;
  targetDurationMin: number;
  fatigueScoreAtStart?: number; // 1-10
  autoAdjustedReason?: string;
  exercises: ExerciseLog[];
  completed: boolean;
  startTime?: string;
  endTime?: string;
  totalTonnageKg?: number;
}

export interface MacroGoals {
  proteinGrams: number;
  fatsGrams: number;
  carbsGrams: number;
  calories: number;
}

export interface NutritionLog {
  date: string; // YYYY-MM-DD
  proteinGrams: number;
  fatsGrams: number;
  carbsGrams: number;
  calories: number;
  targetProtein: number;
  targetFats: number;
  targetCarbs: number;
  targetCalories: number;
  notes?: string;
}

export interface HydrationLog {
  date: string; // YYYY-MM-DD
  targetMl: number;
  currentMl: number;
  drinks: { time: string; amountMl: number }[];
}

export interface BodyweightEntry {
  date: string; // YYYY-MM-DD
  weightKg: number;
  movingAverage7Day?: number;
  waistCm?: number;
  notes?: string;
}

export interface PhysiquePhoto {
  id: string;
  date: string; // YYYY-MM-DD
  weekNumber: number;
  imageDataUrl: string; // local preview
  thumbnailUrl?: string;
  pose: 'Front Relaxed' | 'Front Double Bicep' | 'Side Chest' | 'Back Lat Spread' | 'Waist/Abs';
  weightKgAtTime?: number;
  syncedToCloud: boolean;
  cloudUrl?: string;
  cloudProvider?: 'google_drive' | 'supabase';
  notes?: string;
}

export interface UserProfile {
  name: string;
  targetWeightMinKg: number; // 75
  targetWeightMaxKg: number; // 78
  currentWeightKg: number;
  heightCm: number;
  dailyWaterTargetMl: number;
  // Rota configuration
  rotaStartDate: string; // Anchor date when the 4-on/3-off cycle begins
  shiftDurationHours: number; // 12
  shiftStartTime: string; // "07:00"
  shiftPatternDays: number; // 7 (4 on, 3 off)
  onDaysCount: number; // 4
  offDaysCount: number; // 3
  // Macro configuration
  offDayMacros: MacroGoals;
  shiftDayMacros: MacroGoals;
  // Cloud sync config
  googleDriveFolderId?: string;
  googleDriveAccessToken?: string;
  googleDriveConnected: boolean;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseConnected: boolean;
}

export interface WeeklyAnalyticsReport {
  weekStartDate: string;
  weekEndDate: string;
  averageWeightKg: number;
  weightDeltaKg: number;
  macroAdherenceRatePercent: number;
  totalVolumeTonnageKg: number;
  tonnageProgressionPercent: number;
  avgFatigueScore: number;
  shiftsWorkedCount: number;
  overtimeHoursWorked: number;
  actionableInsights: string[];
}
