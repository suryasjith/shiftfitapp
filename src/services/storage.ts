// IndexedDB & LocalStorage Robust Offline Data Service
import { 
  UserProfile, 
  ShiftDay, 
  WorkoutSession, 
  NutritionLog, 
  HydrationLog, 
  BodyweightEntry, 
  PhysiquePhoto 
} from '../types';

const DB_NAME = 'ShiftFit_DB_v1';
const DB_VERSION = 1;

interface StorageSchema {
  profile: UserProfile;
  shifts: Record<string, ShiftDay>; // keyed by YYYY-MM-DD
  workouts: Record<string, WorkoutSession>; // keyed by date YYYY-MM-DD
  nutrition: Record<string, NutritionLog>; // keyed by date YYYY-MM-DD
  hydration: Record<string, HydrationLog>; // keyed by date YYYY-MM-DD
  weight: Record<string, BodyweightEntry>; // keyed by date YYYY-MM-DD
  physique: Record<string, PhysiquePhoto>; // keyed by photo ID
  dailyFatigue: Record<string, number>; // date -> 1-10
}

// Default initial user profile (target 75-78kg recomp)
export const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex',
  targetWeightMinKg: 75.0,
  targetWeightMaxKg: 78.0,
  currentWeightKg: 76.4,
  heightCm: 178,
  dailyWaterTargetMl: 3800,
  // Rota configuration: 4-on / 3-off 12-hour shifts
  // Anchor date: 4 days on starting Monday of current cycle
  rotaStartDate: '2026-10-19', // Monday
  shiftDurationHours: 12,
  shiftStartTime: '07:00',
  shiftPatternDays: 7,
  onDaysCount: 4,
  offDaysCount: 3,
  // Macros
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
  // Cloud sync
  googleDriveConnected: false,
  googleDriveFolderId: '',
  supabaseConnected: false,
};

class StorageService {
  private db: IDBDatabase | null = null;
  private memoryCache: Partial<StorageSchema> = {};

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
        const stores = ['profile', 'shifts', 'workouts', 'nutrition', 'hydration', 'weight', 'physique', 'dailyFatigue'];
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

  // Generic setter
  async set<T>(storeName: string, key: string, value: T): Promise<void> {
    // Save to localStorage as quick sync
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

  async getPhysiquePhotos(): Promise<Record<string, PhysiquePhoto>> {
    return this.getAll<PhysiquePhoto>('physique');
  }

  async savePhysiquePhoto(photo: PhysiquePhoto): Promise<void> {
    await this.set('physique', photo.id, photo);
  }

  async getDailyFatigue(date: string): Promise<number | null> {
    return this.get<number>('dailyFatigue', date);
  }

  async saveDailyFatigue(date: string, score: number): Promise<void> {
    await this.set('dailyFatigue', date, score);
  }

  // Export full JSON backup
  async exportFullData(): Promise<string> {
    const profile = await this.getProfile();
    const shifts = await this.getShifts();
    const workouts = await this.getWorkouts();
    const nutrition = await this.getNutrition();
    const weight = await this.getWeightHistory();
    const photos = await this.getPhysiquePhotos();
    const fatigue = await this.getAll<number>('dailyFatigue');

    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile,
      shifts,
      workouts,
      nutrition,
      weight,
      photos,
      fatigue,
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
      if (data.photos) {
        for (const [k, v] of Object.entries(data.photos)) await this.set('physique', k, v);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }
}

export const storage = new StorageService();
