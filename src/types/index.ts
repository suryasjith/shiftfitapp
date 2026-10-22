// ShiftFit Core Type Definitions

export type ShiftType = 
  | 'day_12h'        // 12-Hour Day Shift (e.g. 07:00 - 19:00)
  | 'night_12h'      // 12-Hour Night Shift (e.g. 19:00 - 07:00)
  | 'overtime_day'   // Overtime 12-Hour Day Shift
  | 'overtime_night' // Overtime 12-Hour Night Shift
  | 'off'            // Scheduled Off Day
  | 'custom_shift';  // Custom shift

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
  cnsLoad: 'High' | 'Moderate' | 'Low';
  defaultSets: number;
  defaultReps: string;
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

export interface LoggedFoodItem {
  id: string;
  name: string;
  brand?: string;
  servingGrams: number;
  calories: number;
  proteinGrams: number;
  fatsGrams: number;
  carbsGrams: number;
  timeLogged: string;
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
  foods?: LoggedFoodItem[];
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

export type FitnessGoal = 
  | 'body_recomposition' // Maintain 75-78kg, strength compounds + hypertrophy backoffs
  | 'muscle_mass'        // Building Muscle Mass: surplus calories, 8-12 reps, 90-120s rest
  | 'lean_muscle';       // Lean Muscle: high-density hypertrophy, 10-15 reps, 60-75s rest

export type Gender = 'male' | 'female';

export interface UserProfile {
  name: string;
  // User Profiling & Physics Engine
  gender: Gender;
  heightCm: number;
  currentWeightKg: number;
  desiredWeightKg: number;
  targetWeightMinKg: number; // 75
  targetWeightMaxKg: number; // 78
  fitnessGoal: FitnessGoal;
  dailyWaterTargetMl: number;
  
  // Dynamic 2-Week Rolling Rota Configuration
  rotaStartDate: string; // Anchor date when Day 1 of the 14-day cycle begins
  shiftDurationHours: number; // 12
  shiftStartTime: string; // "07:00"
  twoWeekTemplate: ShiftType[]; // 14 days pattern that loops infinitely
  
  // Macros
  offDayMacros: MacroGoals;
  shiftDayMacros: MacroGoals;
  
  // Cloud sync
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
