// Seed Realistic Sample Data for Aesthetic Recomp 75-78kg & 4-3 Rota
import { storage, DEFAULT_PROFILE } from './storage';
import { BodyweightEntry, NutritionLog, HydrationLog, WorkoutSession, PhysiquePhoto } from '../types';
import { RotaEngine } from './rotaEngine';
import { BASE_WORKOUT_TEMPLATES } from '../data/recompPrograms';

export async function initializeSeedDataIfEmpty(): Promise<void> {
  const existingWeight = await storage.getWeightHistory();
  if (Object.keys(existingWeight).length > 0) {
    return; // Already initialized
  }

  // Generate 14 days of realistic history leading up to 2026-10-22
  const today = new Date(2026, 9, 22); // Oct 22, 2026

  const sampleWeights: Record<string, BodyweightEntry> = {};
  const sampleNutrition: Record<string, NutritionLog> = {};
  const sampleHydration: Record<string, HydrationLog> = {};
  const sampleFatigue: Record<string, number> = {};
  const sampleWorkouts: Record<string, WorkoutSession> = {};

  // Base weight fluctuating realistically between 76.2 and 76.9 kg (Target 75-78kg)
  const weightSeq = [
    76.8, 76.7, 76.5, 76.6, 76.4, 76.3, 76.5,
    76.4, 76.6, 76.5, 76.3, 76.4, 76.2, 76.4
  ];

  for (let i = 13; i >= 0; i--) {
    const curDate = new Date(today);
    curDate.setDate(today.getDate() - i);
    const dateStr = RotaEngine.formatDate(curDate);
    const weightVal = weightSeq[13 - i] || 76.4;

    // Weight entry
    sampleWeights[dateStr] = {
      date: dateStr,
      weightKg: weightVal,
      waistCm: 80.5,
      notes: i === 0 ? 'Morning weigh-in after wake up' : undefined
    };

    // Day info in rota
    const dayInfo = RotaEngine.getDayInfo(dateStr, DEFAULT_PROFILE);
    const isShift = dayInfo.isShiftDay;

    // Daily fatigue (shifts tend to be 5-8, off days 2-4)
    const fatigue = isShift ? (5 + ((13 - i) % 4)) : (2 + ((13 - i) % 3));
    sampleFatigue[dateStr] = fatigue;

    // Macros
    const targetMacros = isShift ? DEFAULT_PROFILE.shiftDayMacros : DEFAULT_PROFILE.offDayMacros;
    sampleNutrition[dateStr] = {
      date: dateStr,
      proteinGrams: targetMacros.proteinGrams + ((i % 3 === 0) ? -8 : 4),
      fatsGrams: targetMacros.fatsGrams + ((i % 2 === 0) ? 3 : -4),
      carbsGrams: targetMacros.carbsGrams + ((i % 3 === 0) ? -15 : 10),
      calories: targetMacros.calories + ((i % 2 === 0) ? 40 : -60),
      targetProtein: targetMacros.proteinGrams,
      targetFats: targetMacros.fatsGrams,
      targetCarbs: targetMacros.carbsGrams,
      targetCalories: targetMacros.calories,
    };

    // Hydration
    sampleHydration[dateStr] = {
      date: dateStr,
      targetMl: 3800,
      currentMl: isShift ? 3500 : 3800,
      drinks: [
        { time: '08:00', amountMl: 750 },
        { time: '12:30', amountMl: 1000 },
        { time: '16:00', amountMl: 750 },
        { time: '19:30', amountMl: 1000 },
      ]
    };

    // Sample completed workouts for off days
    if (!isShift && i > 0) {
      if (dayInfo.offIndex === 0) {
        const wk = BASE_WORKOUT_TEMPLATES.offDay1_push(dateStr, fatigue);
        wk.completed = true;
        wk.exercises.forEach(ex => {
          ex.sets.forEach(s => {
            s.completed = true;
            s.weightKg = ex.exerciseId.includes('press') ? 34 : 14;
            s.reps = 10;
          });
        });
        sampleWorkouts[dateStr] = wk;
      } else if (dayInfo.offIndex === 1) {
        const wk = BASE_WORKOUT_TEMPLATES.offDay2_legs(dateStr, fatigue);
        wk.completed = true;
        wk.exercises.forEach(ex => {
          ex.sets.forEach(s => {
            s.completed = true;
            s.weightKg = ex.exerciseId.includes('squat') ? 120 : 60;
            s.reps = 10;
          });
        });
        sampleWorkouts[dateStr] = wk;
      } else if (dayInfo.offIndex === 2) {
        const wk = BASE_WORKOUT_TEMPLATES.offDay3_pull(dateStr, fatigue);
        wk.completed = true;
        wk.exercises.forEach(ex => {
          ex.sets.forEach(s => {
            s.completed = true;
            s.weightKg = ex.exerciseId.includes('pulldown') ? 75 : 16;
            s.reps = 10;
          });
        });
        sampleWorkouts[dateStr] = wk;
      }
    }
  }

  // Save all to storage
  for (const [k, v] of Object.entries(sampleWeights)) {
    await storage.saveWeightEntry(v);
  }
  for (const [k, v] of Object.entries(sampleNutrition)) {
    await storage.saveNutrition(v);
  }
  for (const [k, v] of Object.entries(sampleHydration)) {
    await storage.saveHydration(v);
  }
  for (const [k, v] of Object.entries(sampleFatigue)) {
    await storage.saveDailyFatigue(k, v);
  }
  for (const [k, v] of Object.entries(sampleWorkouts)) {
    await storage.saveWorkout(v);
  }

  // Sample physique check-ins
  const photo1: PhysiquePhoto = {
    id: 'photo_wk41',
    date: '2026-10-15',
    weekNumber: 41,
    imageDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect fill="%23111722" width="400" height="600"/><circle cx="200" cy="120" r="50" fill="%23233044"/><path d="M140,200 L260,200 L240,360 L160,360 Z" fill="%2306b6d4" opacity="0.4"/><rect x="170" y="370" width="25" height="180" rx="8" fill="%23334460"/><rect x="205" y="370" width="25" height="180" rx="8" fill="%23334460"/><text x="200" y="300" fill="%23ffffff" font-size="16" text-anchor="middle" font-family="sans-serif">Week 41 (76.6 kg)</text></svg>',
    pose: 'Front Relaxed',
    weightKgAtTime: 76.6,
    syncedToCloud: true,
    cloudProvider: 'google_drive',
    cloudUrl: 'https://drive.google.com/file/d/sample1/view',
    notes: 'Good upper chest fullness; waist tight.'
  };

  const photo2: PhysiquePhoto = {
    id: 'photo_wk42',
    date: '2026-10-22',
    weekNumber: 42,
    imageDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600"><rect fill="%23111722" width="400" height="600"/><circle cx="200" cy="120" r="50" fill="%23233044"/><path d="M135,195 L265,195 L235,360 L165,360 Z" fill="%2310b981" opacity="0.45"/><rect x="170" y="370" width="25" height="180" rx="8" fill="%23334460"/><rect x="205" y="370" width="25" height="180" rx="8" fill="%23334460"/><text x="200" y="300" fill="%23ffffff" font-size="16" text-anchor="middle" font-family="sans-serif">Week 42 (76.4 kg)</text></svg>',
    pose: 'Front Double Bicep',
    weightKgAtTime: 76.4,
    syncedToCloud: true,
    cloudProvider: 'google_drive',
    cloudUrl: 'https://drive.google.com/file/d/sample2/view',
    notes: 'Deltoid striations more prominent; maintain current macros.'
  };

  await storage.savePhysiquePhoto(photo1);
  await storage.savePhysiquePhoto(photo2);
}
