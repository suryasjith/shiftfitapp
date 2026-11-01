import { EXERCISE_DATABASE } from '../src/data/exerciseDatabase';
import { BASE_WORKOUT_TEMPLATES } from '../src/data/recompPrograms';
import { PhysicsEngine } from '../src/services/physicsEngine';
import { WeightSuggestionEngine, BEGINNER_EXERCISE_ADAPTATIONS } from '../src/services/weightSuggestionEngine';
import { RotaEngine } from '../src/services/rotaEngine';
import { UserProfile, FitnessGoal, ShiftType, Gender, ProficiencyLevel } from '../src/types';

interface TestUser {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  proficiency: ProficiencyLevel;
  goal: FitnessGoal;
  shiftPattern: ShiftType[];
  initialFatigue: number;
}

export const TEST_USERS: TestUser[] = [
  // Agent 1: Biometric Edge Cases (Users 1-5)
  { id: 'u1', name: 'Elena Rostova', gender: 'female', age: 21, heightCm: 148, weightKg: 41, proficiency: 'absolute_beginner', goal: 'lean_muscle', shiftPattern: ['night', 'night', 'off', 'off'], initialFatigue: 8 },
  { id: 'u2', name: 'Marcus Vance', gender: 'male', age: 34, heightCm: 204, weightKg: 155, proficiency: 'advanced', goal: 'fat_loss_focus', shiftPattern: ['day', 'day', 'night', 'night', 'off', 'off'], initialFatigue: 3 },
  { id: 'u3', name: 'Priya Sharma', gender: 'female', age: 29, heightCm: 162, weightKg: 52, proficiency: 'intermediate', goal: 'body_recomposition', shiftPattern: ['day', 'night', 'off', 'off'], initialFatigue: 6 },
  { id: 'u4', name: 'Arthur Pendelton', gender: 'male', age: 64, heightCm: 172, weightKg: 68, proficiency: 'absolute_beginner', goal: 'body_recomposition', shiftPattern: ['off', 'off', 'day', 'day'], initialFatigue: 7 },
  { id: 'u5', name: 'Zoe Deschanel', gender: 'female', age: 24, heightCm: 178, weightKg: 46, proficiency: 'absolute_beginner', goal: 'lean_muscle', shiftPattern: ['night', 'off', 'night', 'off'], initialFatigue: 9 },

  // Agent 2: Chrono Shift Patterns (Users 6-10)
  { id: 'u6', name: 'David Kim', gender: 'male', age: 28, heightCm: 175, weightKg: 78, proficiency: 'intermediate', goal: 'lean_muscle', shiftPattern: ['night', 'night', 'night', 'night', 'off', 'off', 'off', 'off'], initialFatigue: 9 },
  { id: 'u7', name: 'Sarah O\'Connor', gender: 'female', age: 38, heightCm: 168, weightKg: 64, proficiency: 'intermediate', goal: 'fat_loss_focus', shiftPattern: ['night', 'night', 'night', 'night', 'night', 'night', 'night'], initialFatigue: 10 },
  { id: 'u8', name: 'Tariq Al-Mansoor', gender: 'male', age: 41, heightCm: 182, weightKg: 92, proficiency: 'advanced', goal: 'body_recomposition', shiftPattern: ['day', 'day', 'day', 'day', 'off', 'off'], initialFatigue: 2 },
  { id: 'u9', name: 'Chloe Dubois', gender: 'female', age: 31, heightCm: 158, weightKg: 59, proficiency: 'absolute_beginner', goal: 'body_recomposition', shiftPattern: ['day', 'night', 'day', 'night', 'off', 'off'], initialFatigue: 8 },
  { id: 'u10', name: 'Liam Gallagher', gender: 'male', age: 26, heightCm: 188, weightKg: 84, proficiency: 'intermediate', goal: 'lean_muscle', shiftPattern: ['night', 'off', 'day', 'off', 'night', 'off'], initialFatigue: 5 },

  // Agent 3: Biomechanical Adaptations & Injury/Fatigue (Users 11-15)
  { id: 'u11', name: 'Mia Tanaka', gender: 'female', age: 27, heightCm: 153, weightKg: 47, proficiency: 'absolute_beginner', goal: 'body_recomposition', shiftPattern: ['off', 'day', 'day', 'off'], initialFatigue: 4 },
  { id: 'u12', name: 'Big Mike Henderson', gender: 'male', age: 45, heightCm: 191, weightKg: 138, proficiency: 'intermediate', goal: 'fat_loss_focus', shiftPattern: ['night', 'night', 'off', 'off'], initialFatigue: 8 },
  { id: 'u13', name: 'Aisha Bello', gender: 'female', age: 33, heightCm: 170, weightKg: 73, proficiency: 'advanced', goal: 'lean_muscle', shiftPattern: ['day', 'day', 'off', 'off'], initialFatigue: 1 },
  { id: 'u14', name: 'Kenji Sato', gender: 'male', age: 52, heightCm: 165, weightKg: 62, proficiency: 'absolute_beginner', goal: 'body_recomposition', shiftPattern: ['night', 'off', 'night', 'off'], initialFatigue: 7 },
  { id: 'u15', name: 'Emma Watson-Smith', gender: 'female', age: 22, heightCm: 164, weightKg: 54, proficiency: 'absolute_beginner', goal: 'lean_muscle', shiftPattern: ['off', 'off', 'day', 'day'], initialFatigue: 5 },

  // Agent 4: Extreme Goal Discrepancies & BMI Boundaries (Users 16-20)
  { id: 'u16', name: 'Thorsten Berg', gender: 'male', age: 39, heightCm: 198, weightKg: 162, proficiency: 'advanced', goal: 'fat_loss_focus', shiftPattern: ['night', 'night', 'off', 'off'], initialFatigue: 6 },
  { id: 'u17', name: 'Lila Patel', gender: 'female', age: 19, heightCm: 145, weightKg: 39, proficiency: 'absolute_beginner', goal: 'lean_muscle', shiftPattern: ['day', 'day', 'off', 'off'], initialFatigue: 3 },
  { id: 'u18', name: 'Carlos Mendez', gender: 'male', age: 36, heightCm: 173, weightKg: 108, proficiency: 'intermediate', goal: 'body_recomposition', shiftPattern: ['night', 'night', 'night', 'off'], initialFatigue: 9 },
  { id: 'u19', name: 'Fatima Zahra', gender: 'female', age: 42, heightCm: 167, weightKg: 88, proficiency: 'intermediate', goal: 'fat_loss_focus', shiftPattern: ['day', 'night', 'off', 'off'], initialFatigue: 7 },
  { id: 'u20', name: 'Oskar Lindqvist', gender: 'male', age: 25, heightCm: 185, weightKg: 70, proficiency: 'absolute_beginner', goal: 'lean_muscle', shiftPattern: ['off', 'night', 'night', 'off'], initialFatigue: 4 },

  // Agent 5: High CNS / High Volume Stressors (Users 21-25)
  { id: 'u21', name: 'Jordan Rivera', gender: 'female', age: 30, heightCm: 160, weightKg: 58, proficiency: 'advanced', goal: 'lean_muscle', shiftPattern: ['day', 'day', 'day', 'off', 'off'], initialFatigue: 2 },
  { id: 'u22', name: 'Dmitri Volkov', gender: 'male', age: 48, heightCm: 180, weightKg: 95, proficiency: 'intermediate', goal: 'body_recomposition', shiftPattern: ['night', 'night', 'night', 'night', 'off'], initialFatigue: 9 },
  { id: 'u23', name: 'Sunita Rao', gender: 'female', age: 35, heightCm: 156, weightKg: 67, proficiency: 'absolute_beginner', goal: 'fat_loss_focus', shiftPattern: ['off', 'off', 'night', 'night'], initialFatigue: 8 },
  { id: 'u24', name: 'Lucas Rossi', gender: 'male', age: 29, heightCm: 178, weightKg: 82, proficiency: 'advanced', goal: 'body_recomposition', shiftPattern: ['day', 'night', 'off', 'off'], initialFatigue: 5 },
  { id: 'u25', name: 'Hannah Schmidt', gender: 'female', age: 26, heightCm: 172, weightKg: 61, proficiency: 'intermediate', goal: 'lean_muscle', shiftPattern: ['night', 'off', 'day', 'off'], initialFatigue: 6 },
];

export interface BugReport {
  bugId: string;
  category: 'VISUAL_INSTRUCTION' | 'ADAPTATION_CRASH' | 'WEIGHT_ALGORITHM' | 'ROTA_CIRCADIAN' | 'METABOLIC_MATH' | 'UI_CONTRAST';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  reproduction: string;
  affectedUsers: string[];
}

export function runStressSuite(): { bugs: BugReport[]; summary: any } {
  const bugs: BugReport[] = [];
  const exerciseUrls = new Map<string, string[]>();

  // 1. Audit Exercise Database Visual URLs
  for (const [id, def] of Object.entries(EXERCISE_DATABASE)) {
    const url = def.visualGifUrl || '';
    if (!exerciseUrls.has(url)) {
      exerciseUrls.set(url, []);
    }
    exerciseUrls.get(url)!.push(id);
  }

  // Detect duplicated Unsplash stock images
  for (const [url, ids] of exerciseUrls.entries()) {
    if (ids.length > 1) {
      bugs.push({
        bugId: `BUG-VISUAL-DUP-${ids.join('-')}`,
        category: 'VISUAL_INSTRUCTION',
        severity: 'HIGH',
        description: `Mismatched Visual Instructions: Multiple distinct exercises share the exact same generic stock image URL. User performing "${EXERCISE_DATABASE[ids[0]].name}" sees the same photo as "${EXERCISE_DATABASE[ids[1]].name}".`,
        reproduction: `Inspect EXERCISE_DATABASE['${ids[0]}'].visualGifUrl vs EXERCISE_DATABASE['${ids[1]}'].visualGifUrl. Both point to ${url}.`,
        affectedUsers: ['All 25 Users']
      });
    }
  }

  // 2. Audit Beginner Exercise Adaptations
  for (const [origId, adapt] of Object.entries(BEGINNER_EXERCISE_ADAPTATIONS)) {
    const targetId = adapt.replaceWithId;
    if (!EXERCISE_DATABASE[targetId]) {
      bugs.push({
        bugId: `BUG-ADAPT-MISSING-${origId}`,
        category: 'ADAPTATION_CRASH',
        severity: 'CRITICAL',
        description: `Adaptive Exercise Replacement Failure: Beginner adaptation for "${origId}" points to target ID "${targetId}", which does not exist in EXERCISE_DATABASE. To prevent a runtime throw, the engine secretly reverts to the intimidating exercise (${origId})!`,
        reproduction: `Create workout for absolute beginner user. Exercise "${origId}" should adapt to "${targetId}", but targetId is missing in EXERCISE_DATABASE.`,
        affectedUsers: TEST_USERS.filter(u => u.proficiency === 'absolute_beginner').map(u => u.name)
      });
    }
  }

  // 3. Test 25 Users Through Workout Generation & Weight Suggestion
  for (const user of TEST_USERS) {
    const profile: UserProfile = {
      name: user.name,
      age: user.age,
      gender: user.gender,
      heightCm: user.heightCm,
      currentWeightKg: user.weightKg,
      targetWeightKg: user.weightKg - 5,
      fitnessGoal: user.goal,
      experienceLevel: user.proficiency === 'absolute_beginner' ? 'beginner' : user.proficiency,
      proficiencyLevel: user.proficiency,
      shiftPattern: user.shiftPattern,
      trainingDaysPerWeek: 4,
      workoutDurationMin: 45,
      equipmentAccess: 'commercial_gym',
      equipmentPreferences: [],
      targetDeficitSurplus: 300,
      onboardingCompleted: true,
      lastActiveDate: new Date().toISOString()
    };

    // Test workout generation on offDay1 and offDay2
    try {
      const workout1 = BASE_WORKOUT_TEMPLATES.offDay1_push('2026-11-01', user.initialFatigue, user.goal, profile);
      const workout2 = BASE_WORKOUT_TEMPLATES.offDay2_legs('2026-11-02', user.initialFatigue, user.goal, profile);

      // Check exercises inside workout
      for (const ex of [...workout1.exercises, ...workout2.exercises]) {
        // Check starting weight sanity
        if (user.proficiency === 'absolute_beginner' && user.gender === 'female' && user.weightKg <= 45) {
          if (ex.suggestedWeightKg && ex.suggestedWeightKg > 15 && ex.exerciseId.includes('db_press')) {
            bugs.push({
              bugId: `BUG-WEIGHT-EXCESSIVE-${user.id}-${ex.exerciseId}`,
              category: 'WEIGHT_ALGORITHM',
              severity: 'HIGH',
              description: `Dangerous Starting Weight: For lightweight beginner female ${user.name} (${user.weightKg}kg), suggested dumbbell press weight of ${ex.suggestedWeightKg}kg is excessive for day 1.`,
              reproduction: `Run WeightSuggestionEngine with gender='female', weight=${user.weightKg}, proficiency='absolute_beginner' on ${ex.exerciseId}`,
              affectedUsers: [user.name]
            });
          }
        }

        // Check if exercise name in beginner note mismatches active exercise
        if (user.proficiency === 'absolute_beginner' && ex.suggestedWeightNote?.includes('Beginner Adaptation:')) {
          if (ex.exerciseId === 'incline_db_press' && ex.exerciseName.includes('Dumbbell')) {
            bugs.push({
              bugId: `BUG-ADAPT-MISMATCH-${user.id}`,
              category: 'ADAPTATION_CRASH',
              severity: 'HIGH',
              description: `Deceptive UI state: Log notes state "Seated Incline Machine Press recommended", but the active logged exercise is still "${ex.exerciseName}". User is prompted to log dumbbells instead of machine weights.`,
              reproduction: `Inspect exerciseLog.exerciseName vs exerciseLog.suggestedWeightNote for beginner`,
              affectedUsers: [user.name]
            });
          }
        }
      }
    } catch (err: any) {
      bugs.push({
        bugId: `BUG-CRASH-WORKOUT-${user.id}`,
        category: 'ADAPTATION_CRASH',
        severity: 'CRITICAL',
        description: `Crash during workout template generation: ${err.message}`,
        reproduction: `Generate workout with user profile ${user.id}`,
        affectedUsers: [user.name]
      });
    }

    // Test Metabolic calculations
    try {
      const bmiReport = PhysicsEngine.getBmiReport(user.weightKg, user.heightCm, user.gender);
      if (bmiReport.currentBmi <= 0 || isNaN(bmiReport.currentBmi)) {
        bugs.push({
          bugId: `BUG-METABOLIC-NAN-${user.id}`,
          category: 'METABOLIC_MATH',
          severity: 'CRITICAL',
          description: `NaN/Invalid BMI calculated for ${user.name}`,
          reproduction: `PhysicsEngine.getBmiReport with ${user.name}`,
          affectedUsers: [user.name]
        });
      }
    } catch (err: any) {
      bugs.push({
        bugId: `BUG-CRASH-METABOLIC-${user.id}`,
        category: 'METABOLIC_MATH',
        severity: 'CRITICAL',
        description: `Metabolic Engine exception: ${err.message}`,
        reproduction: `PhysicsEngine calculation with ${user.name}`,
        affectedUsers: [user.name]
      });
    }

    // Test Rota chronobiology math
    try {
      const dayInfo = RotaEngine.getDayInfo('2026-11-01', profile, {});
      if (!dayInfo.shiftType || !dayInfo.recommendedWorkoutCategory) {
        bugs.push({
          bugId: `BUG-ROTA-DATA-${user.id}`,
          category: 'ROTA_CIRCADIAN',
          severity: 'HIGH',
          description: `Incomplete day info generation for ${user.name}`,
          reproduction: `RotaEngine.getDayInfo with pattern ${user.shiftPattern.join(',')}`,
          affectedUsers: [user.name]
        });
      }
    } catch (err: any) {
      bugs.push({
        bugId: `BUG-CRASH-ROTA-${user.id}`,
        category: 'ROTA_CIRCADIAN',
        severity: 'CRITICAL',
        description: `Rota Engine exception: ${err.message}`,
        reproduction: `RotaEngine with user ${user.id}`,
        affectedUsers: [user.name]
      });
    }
  }

  // Deduplicate bugs by bugId
  const uniqueBugs = Array.from(new Map(bugs.map(b => [b.bugId, b])).values());

  return {
    bugs: uniqueBugs,
    summary: {
      totalUsersTested: TEST_USERS.length,
      totalBugsFound: uniqueBugs.length,
      criticalBugs: uniqueBugs.filter(b => b.severity === 'CRITICAL').length,
      highBugs: uniqueBugs.filter(b => b.severity === 'HIGH').length,
      mediumBugs: uniqueBugs.filter(b => b.severity === 'MEDIUM').length,
    }
  };
}

const result = runStressSuite();
console.log(JSON.stringify(result, null, 2));

