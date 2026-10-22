// IndexedDB & LocalStorage Robust Offline Data Service
import { 
  UserProfile, 
  ShiftDay, 
  WorkoutSession, 
  NutritionLog, 
  HydrationLog, 
  BodyweightEntry, 
  ActivityEntry,
  DailyStepsEntry
} from '../types';

const DB_NAME = 'ShiftFit_DB_v2';
const DB_VERSION = 2;

import { ROTA_PRESETS } from './rotaEngine';

interface StorageSchema {
  profile: UserProfile;
  shifts: Record<string, ShiftDay>; // keyed by YYYY-MM-DD
  workouts: Record<string, WorkoutSession>; // keyed by date YYYY-MM-DD
  nutrition: Record<string, NutritionLog>; // keyed by date YYYY-MM-DD
  hydration: Record<string, HydrationLog>; // keyed by date YYYY-MM-DD
  weight: Record<string, BodyweightEntry>; // keyed by date YYYY-MM-DD
  dailyFatigue: Record<string, number>; // date -> 1-10
  activities: Record<string, ActivityEntry[]>; // keyed by date YYYY-MM-DD
  steps: Record<string, DailyStepsEntry>; // keyed by date YYYY-MM-DD
}

// Default initial user profile (target 75-78kg recomp)
export const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex',
  gender: 'male',
  targetWeightMinKg: 75.0,
  targetWeightMaxKg: 78.0,
  currentWeightKg: 76.4,
  desiredWeightKg: 76.5,
  heightCm: 178,
  fitnessGoal: 'body_recomposition',
  dailyWaterTargetMl: 3800,
  // 2-Week Rolling Rota Configuration (14 days sequence)
  rotaStartDate: '2026-10-19', // Monday anchor
  shiftDurationHours: 12,
  shiftStartTime: '07:00',
  twoWeekTemplate: ROTA_PRESETS.fourOnThreeOff,
  // Base Macros
  offDayMacros: {
    proteinGrams: 185,
    fatsGrams: 65,
    carbsGrams: 260,
    calories: 2365,
  },
  shiftDayMacros: {
    proteinGrams: 185,
    fatsGrams: 70,
    carbsGrams: 200,
    calories: 2170,
  },
};

class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported, falling back to LocalStorage');
        resolve();
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        const stores = [
          'profile', 
          'shifts', 
          'workouts', 
          'nutrition', 
          'hydration', 
          'weight', 
          'dailyFatigue', 
          'activities', 
          'steps'
        ];
        for (const store of stores) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store);
          }
        }
      };

      request.onsuccess = (event: any) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = () => {
        console.warn('IndexedDB failed to open, using LocalStorage fallback');
        resolve();
      };
    });
  }

  // Generic getter
  async get<T>(storeName: string, key: string, fallbackDefault?: T): Promise<T | null> {
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const transaction = this.db!.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.get(key);
          request.onsuccess = () => {
            resolve(request.result !== undefined ? request.result : (fallbackDefault ?? null));
          };
          request.onerror = () => {
            resolve(this.getFromLocalStorage(storeName, key, fallbackDefault));
          };
        } catch (e) {
          resolve(this.getFromLocalStorage(storeName, key, fallbackDefault));
        }
      });
    }
    return this.getFromLocalStorage(storeName, key, fallbackDefault);
  }

  // Generic setter with dual-write to LocalStorage for bulletproof offline redundancy
  async set<T>(storeName: string, key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(`shiftfit_${storeName}_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage write failed', e);
    }

    if (this.db) {
      return new Promise((resolve) => {
        try {
          const transaction = this.db!.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.put(value, key);
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    }
  }

  // Generic delete
  async delete(storeName: string, key: string): Promise<void> {
    try {
      localStorage.removeItem(`shiftfit_${storeName}_${key}`);
    } catch {}

    if (this.db) {
      return new Promise((resolve) => {
        try {
          const transaction = this.db!.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.delete(key);
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
        } catch (e) {
          resolve();
        }
      });
    }
  }

  // Get all items in a store
  async getAll<T>(storeName: string): Promise<Record<string, T>> {
    if (this.db) {
      return new Promise((resolve) => {
        try {
          const transaction = this.db!.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const results: Record<string, T> = {};
          const cursorReq = store.openCursor();
          cursorReq.onsuccess = (event: any) => {
            const cursor = event.target.result;
            if (cursor) {
              results[cursor.key as string] = cursor.value;
              cursor.continue();
            } else {
              // Combine with localStorage in case of extra keys
              const lsItems = this.getAllFromLocalStorage<T>(storeName);
              resolve({ ...lsItems, ...results });
            }
          };
          cursorReq.onerror = () => resolve(this.getAllFromLocalStorage<T>(storeName));
        } catch (e) {
          resolve(this.getAllFromLocalStorage<T>(storeName));
        }
      });
    }
    return this.getAllFromLocalStorage<T>(storeName);
  }

  private getFromLocalStorage<T>(storeName: string, key: string, fallbackDefault?: T): T | null {
    try {
      const item = localStorage.getItem(`shiftfit_${storeName}_${key}`);
      return item ? JSON.parse(item) : (fallbackDefault ?? null);
    } catch {
      return fallbackDefault ?? null;
    }
  }

  private getAllFromLocalStorage<T>(storeName: string): Record<string, T> {
    const results: Record<string, T> = {};
    const prefix = `shiftfit_${storeName}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const actualKey = key.slice(prefix.length);
          results[actualKey] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {}
      }
    }
    return results;
  }

  // Convenience typed methods
  async getProfile(): Promise<UserProfile> {
    const profile = await this.get<UserProfile>('profile', 'user_profile');
    if (!profile) {
      await this.set('profile', 'user_profile', DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    return { ...DEFAULT_PROFILE, ...profile };
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await this.set('profile', 'user_profile', profile);
  }

  async getShifts(): Promise<Record<string, ShiftDay>> {
    return this.getAll<ShiftDay>('shifts');
  }

  async saveShift(shift: ShiftDay): Promise<void> {
    await this.set('shifts', shift.date, shift);
  }

  async getWorkouts(): Promise<Record<string, WorkoutSession>> {
    return this.getAll<WorkoutSession>('workouts');
  }

  async getWorkoutByDate(date: string): Promise<WorkoutSession | null> {
    return this.get<WorkoutSession>('workouts', date);
  }

  async saveWorkout(workout: WorkoutSession): Promise<void> {
    await this.set('workouts', workout.date, workout);
  }

  async getNutrition(): Promise<Record<string, NutritionLog>> {
    return this.getAll<NutritionLog>('nutrition');
  }

  async getNutritionByDate(date: string): Promise<NutritionLog | null> {
    return this.get<NutritionLog>('nutrition', date);
  }

  async saveNutrition(log: NutritionLog): Promise<void> {
    await this.set('nutrition', log.date, log);
  }

  async getHydrationByDate(date: string): Promise<HydrationLog | null> {
    return this.get<HydrationLog>('hydration', date);
  }

  async saveHydration(log: HydrationLog): Promise<void> {
    await this.set('hydration', log.date, log);
  }

  async getWeightHistory(): Promise<Record<string, BodyweightEntry>> {
    return this.getAll<BodyweightEntry>('weight');
  }

  async saveWeightEntry(entry: BodyweightEntry): Promise<void> {
    await this.set('weight', entry.date, entry);
  }

  async getDailyFatigue(date: string): Promise<number | null> {
    return this.get<number>('dailyFatigue', date);
  }

  async saveDailyFatigue(date: string, score: number): Promise<void> {
    await this.set('dailyFatigue', date, score);
  }

  // Activity & Cardio Storage
  async getActivitiesByDate(date: string): Promise<ActivityEntry[]> {
    const list = await this.get<ActivityEntry[]>('activities', date);
    return list || [];
  }

  async saveActivity(activity: ActivityEntry): Promise<ActivityEntry[]> {
    const current = await this.getActivitiesByDate(activity.date);
    const updated = [...current.filter(a => a.id !== activity.id), activity];
    await this.set('activities', activity.date, updated);
    return updated;
  }

  async deleteActivity(id: string, date: string): Promise<ActivityEntry[]> {
    const current = await this.getActivitiesByDate(date);
    const updated = current.filter(a => a.id !== id);
    await this.set('activities', date, updated);
    return updated;
  }

  async clearActivitiesForDate(date: string): Promise<void> {
    await this.set('activities', date, []);
  }

  async getAllActivities(): Promise<Record<string, ActivityEntry[]>> {
    return this.getAll<ActivityEntry[]>('activities');
  }

  // Daily Steps Storage
  async getStepsByDate(date: string): Promise<DailyStepsEntry | null> {
    return this.get<DailyStepsEntry>('steps', date);
  }

  async saveSteps(entry: DailyStepsEntry): Promise<void> {
    await this.set('steps', entry.date, entry);
  }

  async getAllSteps(): Promise<Record<string, DailyStepsEntry>> {
    return this.getAll<DailyStepsEntry>('steps');
  }

  // Export full JSON offline backup
  async exportFullData(): Promise<string> {
    const profile = await this.getProfile();
    const shifts = await this.getShifts();
    const workouts = await this.getWorkouts();
    const nutrition = await this.getNutrition();
    const weight = await this.getWeightHistory();
    const fatigue = await this.getAll<number>('dailyFatigue');
    const activities = await this.getAllActivities();
    const steps = await this.getAllSteps();

    const backup = {
      version: 2,
      database: 'ShiftFit_DB_v2',
      exportedAt: new Date().toISOString(),
      profile,
      shifts,
      workouts,
      nutrition,
      weight,
      fatigue,
      activities,
      steps,
    };
    return JSON.stringify(backup, null, 2);
  }

  // Import JSON backup
  async importFullData(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) await this.saveProfile(data.profile);
      if (data.shifts) {
        for (const [k, v] of Object.entries(data.shifts)) await this.set('shifts', k, v);
      }
      if (data.workouts) {
        for (const [k, v] of Object.entries(data.workouts)) await this.set('workouts', k, v);
      }
      if (data.nutrition) {
        for (const [k, v] of Object.entries(data.nutrition)) await this.set('nutrition', k, v);
      }
      if (data.weight) {
        for (const [k, v] of Object.entries(data.weight)) await this.set('weight', k, v);
      }
      if (data.activities) {
        for (const [k, v] of Object.entries(data.activities)) await this.set('activities', k, v);
      }
      if (data.steps) {
        for (const [k, v] of Object.entries(data.steps)) await this.set('steps', k, v);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
}

export const storage = new StorageService();
